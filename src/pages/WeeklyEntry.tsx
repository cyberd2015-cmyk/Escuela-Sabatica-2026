import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useCard } from '@/hooks/useData'
import { useWeekDetail, useWeeklyData } from '@/hooks/useWeeklyData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    ArrowLeft,
    Calendar,
    Check,
    X,
    Save,
    ChevronLeft,
    ChevronRight,
    Users,
    BookOpen,
    Target
} from 'lucide-react'

export default function WeeklyEntryPage() {
    const { id: cardId } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const weekParam = searchParams.get('week')
    const weekNumber = weekParam ? parseInt(weekParam) : 1

    const { card, students: cardStudents } = useCard(cardId)
    const { weeks, createWeek } = useWeeklyData(cardId)
    const { week, attendance, results, setStudentAttendance, saveResults, refetch } = useWeekDetail(cardId, weekNumber)

    const [resultsForm, setResultsForm] = useState({
        lessons_studied_count: 0,
        small_group_participation_count: 0,
        bible_studies_given_count: 0,
        missionary_contacts_count: 0
    })
    const [saving, setSaving] = useState(false)
    const [weekDate, setWeekDate] = useState(new Date().toISOString().split('T')[0])

    // Initialize form when results load
    useEffect(() => {
        if (results) {
            setResultsForm({
                lessons_studied_count: results.lessons_studied_count,
                small_group_participation_count: results.small_group_participation_count,
                bible_studies_given_count: results.bible_studies_given_count,
                missionary_contacts_count: results.missionary_contacts_count
            })
        }
    }, [results])

    const handleInitWeek = async () => {
        await createWeek(weekNumber, weekDate)
        refetch()
    }

    const handleAttendanceChange = async (studentId: string, present: boolean) => {
        await setStudentAttendance(studentId, present)
    }

    const handleSaveResults = async () => {
        setSaving(true)
        const success = await saveResults(resultsForm)
        setSaving(false)
        if (success) {
            alert('¡Resultados guardados correctamente!')
        }
    }

    const goToWeek = (num: number) => {
        if (num >= 1 && num <= 13) {
            setSearchParams({ week: String(num) })
        }
    }

    const getAttendanceForStudent = (studentId: string) => {
        return attendance.find(a => a.student_id === studentId)?.present ?? false
    }

    const presentCount = attendance.filter(a => a.present).length
    const totalCount = cardStudents.length

    if (!card) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Tarjeta no encontrada</p>
                <Button onClick={() => navigate('/cards')} variant="outline" className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </Button>
            </div>
        )
    }

    const isClosed = card.status === 'closed'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/cards/${cardId}`)} className="-ml-2 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Tarjeta
                    </Button>
                    <h1 className="text-2xl font-bold">Registro Semanal</h1>
                    <p className="text-muted-foreground">{card.class_name} - Q{card.trimester} {card.year}</p>
                </div>
            </div>

            {/* Week Navigation */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => goToWeek(weekNumber - 1)}
                            disabled={weekNumber <= 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">Semana {weekNumber}</h2>
                            <p className="text-sm text-muted-foreground">de 13 semanas</p>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => goToWeek(weekNumber + 1)}
                            disabled={weekNumber >= 13}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Week Pills */}
                    <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
                        {Array.from({ length: 13 }, (_, i) => i + 1).map(num => {
                            const hasData = weeks.some(w => w.week_number === num)
                            return (
                                <button
                                    key={num}
                                    onClick={() => goToWeek(num)}
                                    className={`min-w-8 h-8 rounded-full text-sm font-medium transition-colors ${num === weekNumber
                                        ? 'bg-primary text-white'
                                        : hasData
                                            ? 'bg-gold/20 text-gold-700 dark:text-gold-300'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {num}
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Initialize Week or Show Data */}
            {!week ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">Semana {weekNumber} sin registrar</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Ingresa la fecha del sábado para iniciar el registro
                        </p>
                        {!isClosed && (
                            <div className="flex items-center justify-center gap-4">
                                <div className="space-y-1">
                                    <Label>Fecha del Sábado</Label>
                                    <Input
                                        type="date"
                                        value={weekDate}
                                        onChange={(e) => setWeekDate(e.target.value)}
                                        className="w-48"
                                    />
                                </div>
                                <Button onClick={handleInitWeek} className="mt-6">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Iniciar Semana
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Attendance Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Asistencia
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {presentCount} de {totalCount} presentes
                                </p>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                                {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
                            </div>
                        </CardHeader>
                        <CardContent>
                            {cardStudents.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                    No hay alumnos asignados a esta tarjeta
                                </p>
                            ) : (
                                <div className="divide-y">
                                    {cardStudents.map(({ student_id, student }) => {
                                        const isPresent = getAttendanceForStudent(student_id)
                                        return (
                                            <div key={student_id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium">{student.name}</span>
                                                </div>
                                                {!isClosed ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant={isPresent ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleAttendanceChange(student_id, true)}
                                                            className={isPresent ? 'bg-green-600 hover:bg-green-700' : ''}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant={!isPresent ? 'destructive' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleAttendanceChange(student_id, false)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded text-sm ${isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {isPresent ? 'Presente' : 'Ausente'}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Weekly Results Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Resultados de la Semana
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Lecciones Estudiadas
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={resultsForm.lessons_studied_count}
                                        onChange={(e) => setResultsForm({ ...resultsForm, lessons_studied_count: parseInt(e.target.value) || 0 })}
                                        disabled={isClosed}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Participación en Grupo Pequeño</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={resultsForm.small_group_participation_count}
                                        onChange={(e) => setResultsForm({ ...resultsForm, small_group_participation_count: parseInt(e.target.value) || 0 })}
                                        disabled={isClosed}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estudios Bíblicos Dados</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={resultsForm.bible_studies_given_count}
                                        onChange={(e) => setResultsForm({ ...resultsForm, bible_studies_given_count: parseInt(e.target.value) || 0 })}
                                        disabled={isClosed}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contactos Misioneros</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={resultsForm.missionary_contacts_count}
                                        onChange={(e) => setResultsForm({ ...resultsForm, missionary_contacts_count: parseInt(e.target.value) || 0 })}
                                        disabled={isClosed}
                                    />
                                </div>
                            </div>
                            {!isClosed && (
                                <Button onClick={handleSaveResults} disabled={saving} className="w-full">
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Guardando...' : 'Guardar Resultados'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
