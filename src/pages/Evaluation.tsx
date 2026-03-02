import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCard, useCards } from '@/hooks/useData'
import { useCardTotals, useQuarterGoals, useFinalEvaluation } from '@/hooks/useWeeklyData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    ArrowLeft,
    FileText,
    Save,
    BookOpen,
    Users,
    Target,
    TrendingUp,
    Lock,
    AlertTriangle,
    Check
} from 'lucide-react'

const TRIMESTER_NAMES: Record<number, string> = {
    1: 'Primer Trimestre',
    2: 'Segundo Trimestre',
    3: 'Tercer Trimestre',
    4: 'Cuarto Trimestre'
}

export default function EvaluationPage() {
    const { id: cardId } = useParams()
    const navigate = useNavigate()
    const { card, students: cardStudents } = useCard(cardId)
    const { closeCard } = useCards()
    const { totals } = useCardTotals(cardId)
    const { goals } = useQuarterGoals(cardId)
    const { evaluation, saveEvaluation, loading } = useFinalEvaluation(cardId)

    const [summaryText, setSummaryText] = useState('')
    const [saving, setSaving] = useState(false)
    const [showCloseConfirm, setShowCloseConfirm] = useState(false)

    useEffect(() => {
        if (evaluation) {
            setSummaryText(evaluation.summary_text)
        }
    }, [evaluation])

    const handleSave = async () => {
        setSaving(true)
        await saveEvaluation(summaryText)
        setSaving(false)
    }

    const bibleStudiesProgress = goals?.bible_studies_goal && goals.bible_studies_goal > 0
        ? Math.min(100, Math.round((totals.totalBibleStudies / goals.bible_studies_goal) * 100))
        : 0

    const contactsProgress = goals?.missionary_contacts_goal && goals.missionary_contacts_goal > 0
        ? Math.min(100, Math.round((totals.totalContacts / goals.missionary_contacts_goal) * 100))
        : 0

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-primary">Cargando evaluación...</div>
            </div>
        )
    }

    if (!card) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Tarjeta no encontrada</h2>
                <Button onClick={() => navigate('/cards')} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Tarjetas
                </Button>
            </div>
        )
    }

    const isClosed = card.status === 'closed'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => navigate(`/cards/${cardId}`)} className="-ml-2 mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Tarjeta
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Evaluación Final
                </h1>
                <p className="text-muted-foreground">
                    {card.class_name} - {TRIMESTER_NAMES[card.trimester]} {card.year}
                </p>
            </div>

            {/* Closed Banner */}
            {isClosed && (
                <Card className="bg-muted/50 border-muted">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Lock className="w-5 h-5" />
                            <div>
                                <p className="font-medium">Tarjeta Cerrada</p>
                                <p className="text-sm">Esta evaluación es de solo lectura.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Resumen del Trimestre</CardTitle>
                    <CardDescription>Totales acumulados de las {card.weeks_completed || 0} semanas registradas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <BookOpen className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                            <p className="text-2xl font-bold">{totals.totalLessons}</p>
                            <p className="text-xs text-muted-foreground">Lecciones Estudiadas</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <Users className="w-6 h-6 mx-auto text-green-500 mb-2" />
                            <p className="text-2xl font-bold">{totals.attendanceRate}%</p>
                            <p className="text-xs text-muted-foreground">Asistencia Promedio</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <Target className="w-6 h-6 mx-auto text-gold mb-2" />
                            <p className="text-2xl font-bold">{totals.totalBibleStudies}</p>
                            <p className="text-xs text-muted-foreground">Estudios Bíblicos</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <TrendingUp className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                            <p className="text-2xl font-bold">{totals.totalContacts}</p>
                            <p className="text-xs text-muted-foreground">Contactos Misioneros</p>
                        </div>
                    </div>

                    {/* Goal Progress */}
                    {goals && (
                        <div className="mt-6 space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground">Progreso de Metas</h4>

                            {goals.bible_studies_goal > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Estudios Bíblicos</span>
                                        <span className="flex items-center gap-1">
                                            {totals.totalBibleStudies} / {goals.bible_studies_goal}
                                            {bibleStudiesProgress >= 100 && <Check className="w-4 h-4 text-green-500" />}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${bibleStudiesProgress >= 100 ? 'bg-green-500' : 'bg-gold'}`}
                                            style={{ width: `${bibleStudiesProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {goals.missionary_contacts_goal > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Contactos Misioneros</span>
                                        <span className="flex items-center gap-1">
                                            {totals.totalContacts} / {goals.missionary_contacts_goal}
                                            {contactsProgress >= 100 && <Check className="w-4 h-4 text-green-500" />}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${contactsProgress >= 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                                            style={{ width: `${contactsProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Student Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Alumnos ({cardStudents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {cardStudents.map(({ student }) => (
                            <div key={student.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {student.name.charAt(0)}
                                </div>
                                <span className="text-sm truncate">{student.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Evaluation Text */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Resumen y Observaciones
                    </CardTitle>
                    <CardDescription>
                        Escribe un resumen general del trimestre, observaciones y recomendaciones
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Texto de Evaluación</Label>
                        <textarea
                            className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={summaryText}
                            onChange={(e) => setSummaryText(e.target.value)}
                            placeholder="Resumen del trimestre, logros destacados, áreas de mejora, observaciones sobre los alumnos..."
                            disabled={isClosed}
                        />
                    </div>

                    {!isClosed && (
                        <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={saving} className="flex-1">
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Guardando...' : 'Guardar Evaluación'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowCloseConfirm(true)}
                                className="text-destructive border-destructive hover:bg-destructive/10"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Cerrar Tarjeta
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Close Confirmation */}
            {showCloseConfirm && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-destructive">¿Cerrar esta tarjeta?</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Antes de cerrar, asegúrate de haber guardado la evaluación final. Una vez cerrada, la tarjeta pasará a modo de solo lectura y no podrá ser editada ni reabierta.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            // First save, then close
                                            await handleSave()
                                            if (cardId) {
                                                await closeCard(cardId)
                                                navigate(`/cards/${cardId}`)
                                            }
                                        }}
                                    >
                                        <Lock className="w-4 h-4 mr-2" />
                                        Guardar y Cerrar
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
