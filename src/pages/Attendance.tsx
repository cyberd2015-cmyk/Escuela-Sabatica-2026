import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { mockStore } from '@/lib/mockStore'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
    Users,
    ChevronLeft,
    CheckCircle2,
    Loader2,
    AlertCircle,
    UserCheck,
    UserMinus
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sub-component for performance optimization (SRE Auto-fix)
const StudentItem = React.memo(({
    student,
    isPresent,
    isSaving,
    onToggle
}: {
    student: any,
    isPresent: boolean,
    isSaving: boolean,
    onToggle: (id: string, val: boolean) => void
}) => {
    return (
        <Card
            className={cn(
                "border-institutional-gold/5 rounded-xl transition-all duration-300",
                isPresent ? "bg-white shadow-md scale-[1.01]" : "bg-gray-50/50 shadow-none grayscale-[0.5]"
            )}
        >
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                        isPresent
                            ? "bg-institutional-gold/10 border-institutional-gold text-institutional-blue"
                            : "bg-gray-100 border-transparent text-gray-400"
                    )}>
                        {isPresent ? <UserCheck className="w-5 h-5" /> : <UserMinus className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div>
                        <p className={cn(
                            "text-xs font-black uppercase tracking-widest leading-none mb-1",
                            isPresent ? "text-institutional-blue" : "text-gray-500"
                        )}>
                            {student.name}
                        </p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {isPresent ? 'Sábado de Crecimiento' : 'Registro Pendiente'}
                        </p>
                    </div>
                </div>

                <div className="relative flex items-center justify-center w-12 h-12">
                    {isSaving ? (
                        <Loader2 className="w-5 h-5 text-institutional-gold animate-spin" />
                    ) : (
                        <Switch
                            checked={isPresent}
                            onCheckedChange={(checked) => onToggle(student.id, checked)}
                            className="data-[state=checked]:bg-institutional-gold"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
})

StudentItem.displayName = 'StudentItem'

export default function Attendance() {
    const { classId } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [students, setStudents] = useState<any[]>([])
    const [attendance, setAttendance] = useState<Record<string, boolean>>({})
    const [activeWeek, setActiveWeek] = useState<any>(null)
    const [activeCard, setActiveCard] = useState<any>(null)
    const [saving, setSaving] = useState<string | null>(null)

    const today = useMemo(() => new Date().toISOString().split('T')[0], [])
    const formattedDate = useMemo(() => new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }), [])

    const fetchData = useCallback(async () => {
        if (!classId) return
        setLoading(true)
        setError(null)

        try {
            if (!isSupabaseConfigured) {
                const cards = mockStore.getCards().filter(c => c.class_id === classId && c.status === 'in_progress')
                if (cards.length === 0) {
                    setError('No hay una tarjeta activa para esta clase.')
                    setLoading(false)
                    return
                }
                const card = cards[0]
                setActiveCard(card)

                const week = mockStore.createOrGetWeek(card.id, 1, today)
                setActiveWeek(week)

                const cardStudents = mockStore.getCardStudents(card.id)
                setStudents(cardStudents.map(cs => cs.student))

                const attRecords = mockStore.getAttendance(week.id)
                const attMap: Record<string, boolean> = {}
                attRecords.forEach(a => {
                    attMap[a.student_id] = a.present
                })
                setAttendance(attMap)
            } else {
                const { data: cardData, error: cardError } = await supabase
                    .from('cards')
                    .select('*, class:classes(name)')
                    .eq('class_id', classId)
                    .eq('status', 'in_progress')
                    .maybeSingle()

                if (cardError) throw cardError
                if (!cardData) {
                    setError('No hay una tarjeta activa para esta clase.')
                    setLoading(false)
                    return
                }
                setActiveCard(cardData)

                // Get or create week for today
                let { data: weekData, error: weekSearchError } = await supabase
                    .from('weeks')
                    .select('*')
                    .eq('card_id', cardData.id)
                    .eq('date', today)
                    .maybeSingle()

                if (weekSearchError) throw weekSearchError
                if (!weekData) {
                    const { data: latestWeeks } = await supabase
                        .from('weeks')
                        .select('week_number')
                        .eq('card_id', cardData.id)
                        .order('week_number', { ascending: false })
                        .limit(1)

                    const nextWeekNum = (latestWeeks?.[0]?.week_number || 0) + 1
                    const { data: newWeek, error: createError } = await supabase
                        .from('weeks')
                        .insert({ card_id: cardData.id, week_number: nextWeekNum, date: today })
                        .select().single()

                    if (createError) throw createError
                    weekData = newWeek
                }
                setActiveWeek(weekData)

                const { data: cardStudents, error: studentsError } = await supabase
                    .from('card_students')
                    .select('student:students(*)')
                    .eq('card_id', cardData.id)

                if (studentsError) throw studentsError
                setStudents(cardStudents?.map(cs => cs.student) || [])

                const { data: attData, error: attError } = await supabase
                    .from('attendance')
                    .select('*')
                    .eq('week_id', weekData?.id)

                if (attError) throw attError
                const attMap: Record<string, boolean> = {}
                attData?.forEach(a => {
                    attMap[a.student_id] = a.present
                })
                setAttendance(attMap)
            }
        } catch (err: any) {
            console.error('Error fetching attendance data:', err)
            setError(err.message || 'Error al sincronizar con el servidor')
        } finally {
            setLoading(false)
        }
    }, [classId, today])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleToggle = useCallback(async (studentId: string, present: boolean) => {
        if (!activeWeek) return

        setSaving(studentId)
        try {
            if (!isSupabaseConfigured) {
                mockStore.setAttendance(activeWeek.id, studentId, present)
                setAttendance(prev => ({ ...prev, [studentId]: present }))
            } else {
                const { error } = await supabase
                    .from('attendance')
                    .upsert({
                        week_id: activeWeek.id,
                        student_id: studentId,
                        present: present
                    }, { onConflict: 'week_id,student_id' })

                if (error) throw error
                setAttendance(prev => ({ ...prev, [studentId]: present }))
            }
        } catch (err) {
            console.error('Error saving attendance:', err)
        } finally {
            setSaving(null)
        }
    }, [activeWeek])

    const presentCount = useMemo(() => Object.values(attendance).filter(v => v === true).length, [attendance])
    const totalCount = students.length

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-institutional-gold animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-institutional-blue/60">Optimizando Rendimiento 1853...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-institutional-blue">Atención Requerida</h3>
                <p className="text-muted-foreground text-sm">{error}</p>
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="rounded-xl border-institutional-blue uppercase tracking-widest text-[10px] font-bold">
                    Volver al Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            <header className="space-y-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="p-0 h-auto hover:bg-transparent group">
                        <ChevronLeft className="w-4 h-4 text-institutional-gold group-hover:-translate-x-1 transition-transform" />
                    </Button>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-institutional-gold">Control de Asistencia</span>
                </div>

                <Card className="border-institutional-gold/20 rounded-xl bg-institutional-blue text-white overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 bg-hero-gradient opacity-30" />
                    <CardContent className="p-6 relative z-10 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{formattedDate}</p>
                            <h2 className="text-2xl font-black uppercase tracking-[0.1em]">{activeCard?.class_name || 'Mi Clase'}</h2>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black tabular-nums">{presentCount}<span className="text-white/40 text-sm font-normal mx-1">/</span>{totalCount}</div>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-institutional-gold">Presentes Hoy</p>
                        </div>
                    </CardContent>
                </Card>
            </header>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-institutional-blue/40">Alumnos Inscritos</h3>
                    <Users className="w-4 h-4 text-institutional-blue/20" />
                </div>

                <div className="grid gap-3">
                    {students.map((student) => (
                        <StudentItem
                            key={student.id}
                            student={student}
                            isPresent={attendance[student.id] || false}
                            isSaving={saving === student.id}
                            onToggle={handleToggle}
                        />
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-institutional-white via-institutional-white to-transparent md:relative md:p-0 md:bg-none">
                <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full rounded-xl border border-institutional-gold bg-institutional-blue hover:bg-institutional-blue/90 text-white font-black uppercase tracking-[0.2em] text-[10px] py-8 transition-all active:scale-[0.98] shadow-2xl shadow-institutional-blue/20"
                >
                    <CheckCircle2 className="w-4 h-4 mr-3 text-institutional-gold" />
                    Finalizar Jornada
                </Button>
            </div>
        </div>
    )
}
