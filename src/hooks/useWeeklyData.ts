import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockStore } from '@/lib/mockStore'
import type { Week, Attendance, WeeklyResults, QuarterGoals, Student } from '@/types/database'

// Weekly Data Hook
export function useWeeklyData(cardId: string | undefined) {
    const [weeks, setWeeks] = useState<Week[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchWeeks = useCallback(async () => {
        if (!cardId) return
        setLoading(true)
        try {
            if (!isSupabaseConfigured) {
                setWeeks(mockStore.getWeeks(cardId))
            } else {
                const { data, error } = await supabase
                    .from('weeks')
                    .select('*')
                    .eq('card_id', cardId)
                    .order('week_number', { ascending: true })
                if (error) throw error
                setWeeks(data)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar semanas')
        } finally {
            setLoading(false)
        }
    }, [cardId])

    useEffect(() => {
        fetchWeeks()
    }, [fetchWeeks])

    const createWeek = async (weekNumber: number, date: string) => {
        if (!cardId) return null
        try {
            if (!isSupabaseConfigured) {
                const week = mockStore.createOrGetWeek(cardId, weekNumber, date)
                setWeeks(mockStore.getWeeks(cardId))
                return week
            }

            // Check if exists first
            const { data: existing } = await supabase
                .from('weeks')
                .select('*')
                .eq('card_id', cardId)
                .eq('week_number', weekNumber)
                .single()

            if (existing) return existing

            const { data, error } = await supabase
                .from('weeks')
                .insert({ card_id: cardId, week_number: weekNumber, date })
                .select()
                .single()

            if (error) throw error

            // Auto-initialize attendance for all students in this card
            if (data) {
                const { data: cardStudents } = await supabase
                    .from('card_students')
                    .select('student_id')
                    .eq('card_id', cardId)

                if (cardStudents && cardStudents.length > 0) {
                    const attendanceRecords = cardStudents.map(cs => ({
                        week_id: data.id,
                        student_id: cs.student_id,
                        present: false
                    }))
                    await supabase.from('attendance').insert(attendanceRecords)
                }

                // Auto-initialize empty weekly results
                await supabase.from('weekly_results').insert({
                    week_id: data.id,
                    lessons_studied_count: 0,
                    small_group_participation_count: 0,
                    bible_studies_given_count: 0,
                    missionary_contacts_count: 0
                })
            }

            await fetchWeeks()
            return data
        } catch (err: any) {
            console.error('Error creating week:', err)
            setError(err.message || JSON.stringify(err))
            return null
        }
    }

    return { weeks, loading, error, refetch: fetchWeeks, createWeek }
}

// Week Detail Hook (attendance + results)
export function useWeekDetail(cardId: string | undefined, weekNumber: number | undefined) {
    const [week, setWeek] = useState<Week | null>(null)
    const [attendance, setAttendance] = useState<(Attendance & { student: Student })[]>([])
    const [results, setResults] = useState<WeeklyResults | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        if (!cardId || !weekNumber) return
        setLoading(true)
        try {
            if (!isSupabaseConfigured) {
                const weekData = mockStore.getWeek(cardId, weekNumber)
                setWeek(weekData || null)
                if (weekData) {
                    setAttendance(mockStore.getAttendance(weekData.id))
                    setResults(mockStore.getWeeklyResults(weekData.id) || null)
                }
            } else {
                // Fetch Week
                const { data: weekData, error: weekError } = await supabase
                    .from('weeks')
                    .select('*')
                    .eq('card_id', cardId)
                    .eq('week_number', weekNumber)
                    .single()

                if (weekError && weekError.code !== 'PGRST116') throw weekError // PGRST116 is "not found"
                setWeek(weekData)

                if (weekData) {
                    // Fetch Attendance with Student details
                    // We need to join with students. 
                    // Note: In Supabase/PostgREST, we use select('*, student:students(*)')
                    const { data: attData, error: attError } = await supabase
                        .from('attendance')
                        .select('*, student:students(*)')
                        .eq('week_id', weekData.id)

                    if (attError) throw attError
                    // Force casting because Supabase types might be tricky with joins
                    setAttendance(attData as unknown as (Attendance & { student: Student })[])

                    // Fetch Results
                    const { data: resData, error: resError } = await supabase
                        .from('weekly_results')
                        .select('*')
                        .eq('week_id', weekData.id)
                        .single()

                    if (resError && resError.code !== 'PGRST116') throw resError
                    setResults(resData)
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar semana')
        } finally {
            setLoading(false)
        }
    }, [cardId, weekNumber])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const setStudentAttendance = async (studentId: string, present: boolean) => {
        if (!week) return false
        try {
            if (!isSupabaseConfigured) {
                mockStore.setAttendance(week.id, studentId, present)
                setAttendance(mockStore.getAttendance(week.id))
                return true
            }

            // Upsert attendance
            const { error } = await supabase
                .from('attendance')
                .upsert({ week_id: week.id, student_id: studentId, present }, { onConflict: 'week_id,student_id' })

            if (error) throw error
            await fetchData() // Reload to get fresh state
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar asistencia')
            return false
        }
    }

    const saveResults = async (data: Omit<WeeklyResults, 'id' | 'week_id'>) => {
        if (!week) return false
        try {
            if (!isSupabaseConfigured) {
                mockStore.setWeeklyResults(week.id, data)
                setResults(mockStore.getWeeklyResults(week.id) || null)
                return true
            }

            const { error } = await supabase
                .from('weekly_results')
                .upsert({ week_id: week.id, ...data }, { onConflict: 'week_id' })

            if (error) throw error

            // Update the card's weeks_completed and progress
            if (cardId) {
                const { data: allWeeks } = await supabase
                    .from('weeks')
                    .select('id')
                    .eq('card_id', cardId)

                const weeksCompleted = allWeeks?.length || 0
                const progress = Math.round((weeksCompleted / 13) * 100)

                await supabase
                    .from('cards')
                    .update({ weeks_completed: weeksCompleted, progress })
                    .eq('id', cardId)
            }

            await fetchData()
            return true
        } catch (err: any) {
            console.error('Error saving results:', err)
            setError(err.message || JSON.stringify(err))
            return false
        }
    }

    return { week, attendance, results, loading, error, refetch: fetchData, setStudentAttendance, saveResults }
}

// Card Totals Hook
export function useCardTotals(cardId: string | undefined) {
    const [totals, setTotals] = useState({
        totalLessons: 0,
        totalSmallGroup: 0,
        totalBibleStudies: 0,
        totalContacts: 0,
        attendanceRate: 0
    })

    const fetchTotals = useCallback(async () => {
        if (!cardId) return
        if (!isSupabaseConfigured) {
            setTotals(mockStore.getCardTotals(cardId))
            return
        }

        try {
            // Calculate totals from raw data
            // 1. Get all weeks
            const { data: weeks } = await supabase.from('weeks').select('id').eq('card_id', cardId)
            if (!weeks || weeks.length === 0) return

            const weekIds = weeks.map(w => w.id)

            // 2. Get Results
            const { data: weeklyResults } = await supabase
                .from('weekly_results')
                .select('lessons_studied_count, small_group_participation_count, bible_studies_given_count, missionary_contacts_count')
                .in('week_id', weekIds)

            let totalLessons = 0
            let totalSmallGroup = 0
            let totalBibleStudies = 0
            let totalContacts = 0

            weeklyResults?.forEach(r => {
                totalLessons += r.lessons_studied_count || 0
                totalSmallGroup += r.small_group_participation_count || 0
                totalBibleStudies += r.bible_studies_given_count || 0
                totalContacts += r.missionary_contacts_count || 0
            })

            // 3. Attendance Rate
            // Total assignments (Present + Absent)
            // Total assignments (Present + Absent)
            const { count: totalAttendanceRecords, error: _attError } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .in('week_id', weekIds)

            const { count: presentCount } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .in('week_id', weekIds)
                .eq('present', true)

            const attendanceRate = totalAttendanceRecords ? Math.round(((presentCount || 0) / totalAttendanceRecords) * 100) : 0

            setTotals({
                totalLessons,
                totalSmallGroup,
                totalBibleStudies,
                totalContacts,
                attendanceRate
            })

        } catch (error) {
            console.error('Error calculating totals:', error)
        }
    }, [cardId])

    useEffect(() => {
        fetchTotals()
    }, [fetchTotals])

    return { totals, refetch: fetchTotals }
}

// Quarter Goals Hook
export function useQuarterGoals(cardId: string | undefined) {
    const [goals, setGoals] = useState<QuarterGoals | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchGoals = useCallback(async () => {
        if (!cardId) return
        setLoading(true)
        try {
            if (!isSupabaseConfigured) {
                setGoals(mockStore.getQuarterGoals(cardId) || null)
            } else {
                const { data, error } = await supabase
                    .from('quarter_goals')
                    .select('*')
                    .eq('card_id', cardId)
                    .single()

                if (error && error.code !== 'PGRST116') throw error
                setGoals(data)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar metas')
        } finally {
            setLoading(false)
        }
    }, [cardId])

    useEffect(() => {
        fetchGoals()
    }, [fetchGoals])

    const saveGoals = async (data: Omit<QuarterGoals, 'id' | 'card_id'>) => {
        if (!cardId) return false
        try {
            if (!isSupabaseConfigured) {
                mockStore.setQuarterGoals(cardId, data)
                setGoals(mockStore.getQuarterGoals(cardId) || null)
                return true
            }

            const { error } = await supabase
                .from('quarter_goals')
                .upsert({ card_id: cardId, ...data }, { onConflict: 'card_id' })

            if (error) throw error
            await fetchGoals()
            return true

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar metas')
            return false
        }
    }

    return { goals, loading, error, refetch: fetchGoals, saveGoals }
}

// Final Evaluation Hook
export function useFinalEvaluation(cardId: string | undefined) {
    const [evaluation, setEvaluation] = useState<{ id: string; card_id: string; summary_text: string; created_at: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEvaluation = useCallback(async () => {
        if (!cardId) return
        setLoading(true)
        try {
            if (!isSupabaseConfigured) {
                setEvaluation(mockStore.getFinalEvaluation(cardId) || null)
            } else {
                const { data, error } = await supabase
                    .from('final_evaluation')
                    .select('*')
                    .eq('card_id', cardId)
                    .single()

                if (error && error.code !== 'PGRST116') throw error
                setEvaluation(data)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar evaluación')
        } finally {
            setLoading(false)
        }
    }, [cardId])

    useEffect(() => {
        fetchEvaluation()
    }, [fetchEvaluation])

    const saveEvaluation = async (summaryText: string) => {
        if (!cardId) return false
        try {
            if (!isSupabaseConfigured) {
                mockStore.setFinalEvaluation(cardId, summaryText)
                setEvaluation(mockStore.getFinalEvaluation(cardId) || null)
                return true
            }

            const { error } = await supabase
                .from('final_evaluation')
                .upsert({ card_id: cardId, summary_text: summaryText }, { onConflict: 'card_id' })

            if (error) throw error
            await fetchEvaluation()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar evaluación')
            return false
        }
    }

    return { evaluation, loading, error, refetch: fetchEvaluation, saveEvaluation }
}

// Department Goals Type
export interface DepartmentGoals {
    id: string
    year: number
    trimester: number
    bible_studies_goal: number
    missionary_contacts_goal: number
    attendance_goal: number
    new_members_goal: number
    other_goals?: string
    created_by?: string
    created_at: string
    updated_at: string
}

// Department Goals Hook (Admin only)
export function useDepartmentGoals(year: number, trimester: number) {
    const [goals, setGoals] = useState<DepartmentGoals | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchGoals = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            if (!isSupabaseConfigured) {
                setGoals(null)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('department_goals')
                .select('*')
                .eq('year', year)
                .eq('trimester', trimester)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            setGoals(data)
        } catch (err: any) {
            console.error('Error fetching department goals:', err)
            setError(err.message || JSON.stringify(err))
        } finally {
            setLoading(false)
        }
    }, [year, trimester])

    useEffect(() => {
        fetchGoals()
    }, [fetchGoals])

    const saveGoals = async (data: {
        bible_studies_goal: number
        missionary_contacts_goal: number
        attendance_goal: number
        new_members_goal: number
        other_goals?: string
    }) => {
        try {
            const { error } = await supabase
                .from('department_goals')
                .upsert({
                    year,
                    trimester,
                    ...data,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'year,trimester' })

            if (error) throw error
            await fetchGoals()
            return true
        } catch (err: any) {
            console.error('Error saving department goals:', err)
            setError(err.message || JSON.stringify(err))
            return false
        }
    }

    return { goals, loading, error, refetch: fetchGoals, saveGoals }
}
