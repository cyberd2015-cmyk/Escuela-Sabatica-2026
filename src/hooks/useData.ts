// Data hooks for APPES
// Uses mock store in demo mode, Supabase when configured

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockStore } from '@/lib/mockStore'
import { useAuth } from '@/contexts/AuthContext'
import type { Class, Student, Card, CardStudent } from '@/types/database'

// Classes Hook
export function useClasses() {
    const [classes, setClasses] = useState<Class[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchClasses = useCallback(async () => {
        setLoading(true)
        try {
            if (!isSupabaseConfigured) {
                let all = mockStore.getClasses()
                const userClassId = user?.user_metadata?.class_id
                if (userClassId) {
                    all = all.filter(c => c.id === userClassId)
                }
                setClasses(all)
            } else {
                const { data, error } = await supabase
                    .from('classes')
                    .select('*')
                if (error) throw error
                setClasses(data)
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message || JSON.stringify(err))
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchClasses()
    }, [fetchClasses])

    const createClass = async (data: Omit<Class, 'id' | 'created_at' | 'created_by'>) => {
        if (!isSupabaseConfigured) {
            const newClass = mockStore.createClass(data)
            await fetchClasses()
            return newClass
        }
        const { data: newClass, error } = await supabase
            .from('classes')
            .insert({ ...data, created_by: user?.id })
            .select()
            .single()
        if (error) throw error
        await fetchClasses()
        return newClass
    }

    const updateClass = async (id: string, data: Partial<Class>) => {
        if (!isSupabaseConfigured) {
            mockStore.updateClass(id, data)
            await fetchClasses()
            return true
        }
        const { error } = await supabase
            .from('classes')
            .update(data)
            .eq('id', id)
        if (error) throw error
        await fetchClasses()
        return true
    }

    const deleteClass = async (id: string) => {
        if (!isSupabaseConfigured) {
            mockStore.deleteClass(id)
            await fetchClasses()
            return true
        }
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id)
        if (error) throw error
        await fetchClasses()
        return true
    }

    return { classes, loading, error, refetch: fetchClasses, createClass, updateClass, deleteClass }
}

// Students Hook
export function useStudents() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchStudents = useCallback(async () => {
        setLoading(true)
        try {
            if (!isSupabaseConfigured) {
                setStudents(mockStore.getStudents())
            } else {
                const { data, error } = await supabase
                    .from('students')
                    .select('*, class:classes(name)')
                if (error) throw error
                // Flatten class name
                const studentsWithClass = data.map((s: any) => ({
                    ...s,
                    class_name: s.class?.name
                }))
                setStudents(studentsWithClass)
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message || JSON.stringify(err))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    const createStudent = async (data: Omit<Student, 'id' | 'created_at' | 'created_by'>, classId?: string) => {
        if (!isSupabaseConfigured) {
            const newStudent = mockStore.createStudent(data)
            if (classId) {
                mockStore.addStudentToClass(newStudent.id, classId)
            }
            await fetchStudents()
            return newStudent
        }

        const { data: newStudent, error } = await supabase
            .from('students')
            .insert({ ...data, class_id: classId, created_by: user?.id })
            .select()
            .single()

        if (error) throw error

        if (classId && newStudent) {
            // Find active card for class
            const { data: activeCard } = await supabase
                .from('cards')
                .select('id')
                .eq('class_id', classId)
                .eq('status', 'in_progress')
                .single()

            if (activeCard) {
                await supabase
                    .from('card_students')
                    .insert({ card_id: activeCard.id, student_id: newStudent.id })
            }
        }

        await fetchStudents()
        return newStudent
    }

    const updateStudent = async (id: string, data: Partial<Student>) => {
        if (!isSupabaseConfigured) {
            mockStore.updateStudent(id, data)
            await fetchStudents()
            return true
        }
        // If updating class_id, we might need to handle card transfer? 
        // For MVP, just update the student record.
        const { error } = await supabase.from('students').update(data).eq('id', id)
        if (error) throw error
        await fetchStudents()
        return true
    }

    const deleteStudent = async (id: string) => {
        if (!isSupabaseConfigured) {
            mockStore.deleteStudent(id)
            await fetchStudents()
            return true
        }
        const { error } = await supabase.from('students').delete().eq('id', id)
        if (error) throw error
        await fetchStudents()
        return true
    }

    return { students, loading, error, refetch: fetchStudents, createStudent, updateStudent, deleteStudent }
}

// Cards Hook
export function useCards() {
    const [cards, setCards] = useState<Card[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchCards = useCallback(async () => {
        setLoading(true)
        try {
            if (!isSupabaseConfigured) {
                let all = mockStore.getCards()
                const userClassId = user?.user_metadata?.class_id
                if (userClassId) {
                    all = all.filter(c => c.class_id === userClassId)
                }
                setCards(all)
            } else {
                const { data, error } = await supabase
                    .from('cards')
                    .select('*, class:classes(name)')
                if (error) throw error
                // Flatten class name
                const cardsWithClass = data.map((c: any) => ({
                    ...c,
                    class_name: c.class?.name
                }))
                setCards(cardsWithClass)
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message || JSON.stringify(err))
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchCards()
    }, [fetchCards])

    const createCard = async (data: { class_id: string; year: number; trimester: 1 | 2 | 3 | 4 }) => {
        if (!isSupabaseConfigured) {
            const newCard = mockStore.createCard(data)
            await fetchCards()
            return newCard
        }

        // 1. Create Card
        const { data: newCard, error } = await supabase
            .from('cards')
            .insert({
                class_id: data.class_id,
                year: data.year,
                trimester: data.trimester,
                created_by: user?.id,
                status: 'in_progress'
            })
            .select('*, class:classes(name)')
            .single()

        if (error) throw error

        // 2. Auto-add existing students from the class
        if (newCard) {
            const { data: classStudents } = await supabase
                .from('students')
                .select('id')
                .eq('class_id', data.class_id)

            if (classStudents && classStudents.length > 0) {
                const cardStudents = classStudents.map(s => ({
                    card_id: newCard.id,
                    student_id: s.id
                }))

                await supabase.from('card_students').insert(cardStudents)
            }
        }

        await fetchCards()
        return newCard
    }

    const closeCard = async (id: string) => {
        try {
            if (!isSupabaseConfigured) {
                mockStore.closeCard(id)
                await fetchCards()
                return true
            }
            const { error } = await supabase
                .from('cards')
                .update({ status: 'closed' })
                .eq('id', id)
            if (error) throw error
            await fetchCards()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cerrar tarjeta')
            return false
        }
    }

    const deleteCard = async (id: string) => {
        if (!isSupabaseConfigured) {
            mockStore.deleteCard(id)
            await fetchCards()
            return true
        }
        const { error } = await supabase.from('cards').delete().eq('id', id)
        if (error) throw error
        await fetchCards()
        return true
    }

    return { cards, loading, error, refetch: fetchCards, createCard, closeCard, deleteCard }
}

// Single Card Hook
export function useCard(cardId: string | undefined) {
    const [card, setCard] = useState<Card | null>(null)
    const [students, setStudents] = useState<(CardStudent & { student: Student })[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCard = useCallback(async () => {
        if (!cardId) return
        setLoading(true)
        try {
            if (!isSupabaseConfigured) {
                const cardData = mockStore.getCard(cardId)
                setCard(cardData || null)
                setStudents(mockStore.getCardStudents(cardId))
            } else {
                // Fetch Card
                const { data: cardData, error: cardError } = await supabase
                    .from('cards')
                    .select('*, class:classes(name)') // Join to get class name
                    .eq('id', cardId)
                    .single()

                if (cardError) throw cardError

                // Transform class name if needed or ensure it matches type
                if (cardData.class) {
                    (cardData as any).class_name = cardData.class.name
                }

                setCard(cardData)

                // Fetch Students
                const { data: studentsData, error: studentsError } = await supabase
                    .from('card_students')
                    .select('*, student:students(*)')
                    .eq('card_id', cardId)

                if (studentsError) throw studentsError
                setStudents(studentsData as any)
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message || JSON.stringify(err))
        } finally {
            setLoading(false)
        }
    }, [cardId])

    useEffect(() => {
        fetchCard()
    }, [fetchCard])

    const addStudent = async (studentId: string) => {
        if (!cardId) return false
        try {
            if (!isSupabaseConfigured) {
                mockStore.addStudentToCard(cardId, studentId)
                setStudents(mockStore.getCardStudents(cardId))
                setCard(mockStore.getCard(cardId) || null)
                return true
            }

            const { error } = await supabase
                .from('card_students')
                .insert({ card_id: cardId, student_id: studentId })

            if (error) throw error
            await fetchCard()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al agregar alumno')
            return false
        }
    }

    const removeStudent = async (studentId: string) => {
        if (!cardId) return false
        try {
            if (!isSupabaseConfigured) {
                mockStore.removeStudentFromCard(cardId, studentId)
                setStudents(mockStore.getCardStudents(cardId))
                setCard(mockStore.getCard(cardId) || null)
                return true
            }

            const { error } = await supabase
                .from('card_students')
                .delete()
                .eq('card_id', cardId)
                .eq('student_id', studentId)

            if (error) throw error
            await fetchCard()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar alumno')
            return false
        }
    }

    return { card, students, loading, error, refetch: fetchCard, addStudent, removeStudent }
}
