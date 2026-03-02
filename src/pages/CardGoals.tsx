import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCard } from '@/hooks/useData'
import { useQuarterGoals, useCardTotals } from '@/hooks/useWeeklyData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Target,
    Save,
    BookOpen,
    Users,
    TrendingUp,
    Check,
    ArrowLeft
} from 'lucide-react'

export default function CardGoalsPage() {
    const { id: cardId } = useParams()
    const navigate = useNavigate()
    const { card } = useCard(cardId)
    const { goals, saveGoals, loading } = useQuarterGoals(cardId)
    const { totals } = useCardTotals(cardId)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        bible_studies_goal: 0,
        missionary_contacts_goal: 0,
        other_goals: ''
    })

    useEffect(() => {
        if (goals) {
            setForm({
                bible_studies_goal: goals.bible_studies_goal,
                missionary_contacts_goal: goals.missionary_contacts_goal,
                other_goals: goals.other_goals || ''
            })
        }
    }, [goals])

    const handleSave = async () => {
        setSaving(true)
        const success = await saveGoals(form)
        setSaving(false)
        if (success) {
            alert('¡Metas guardadas correctamente!')
        }
    }

    const bibleStudiesProgress = form.bible_studies_goal > 0
        ? Math.min(100, Math.round((totals.totalBibleStudies / form.bible_studies_goal) * 100))
        : 0

    const contactsProgress = form.missionary_contacts_goal > 0
        ? Math.min(100, Math.round((totals.totalContacts / form.missionary_contacts_goal) * 100))
        : 0

    const isClosed = card?.status === 'closed'

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

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Cargando metas...</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => navigate(`/cards/${cardId}`)} className="mb-2 -ml-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Tarjeta
                </Button>
                <h1 className="text-2xl font-bold">Metas de la Tarjeta</h1>
                <p className="text-muted-foreground">
                    {card.class_name} — Q{card.trimester} {card.year}
                </p>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <BookOpen className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">{totals.totalLessons}</p>
                        <p className="text-xs text-muted-foreground">Lecciones</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Users className="w-6 h-6 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold">{totals.attendanceRate}%</p>
                        <p className="text-xs text-muted-foreground">Asistencia</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Target className="w-6 h-6 mx-auto text-gold mb-2" />
                        <p className="text-2xl font-bold">{totals.totalBibleStudies}</p>
                        <p className="text-xs text-muted-foreground">Estudios</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold">{totals.totalContacts}</p>
                        <p className="text-xs text-muted-foreground">Contactos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Goals Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Definir Metas
                    </CardTitle>
                    <CardDescription>
                        Establece metas para el trimestre y da seguimiento al progreso
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Bible Studies Goal */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Meta de Estudios Bíblicos</Label>
                            <span className="text-sm font-medium">
                                {totals.totalBibleStudies} / {form.bible_studies_goal}
                            </span>
                        </div>
                        <Input
                            type="number"
                            min="0"
                            value={form.bible_studies_goal}
                            onChange={(e) => setForm({ ...form, bible_studies_goal: parseInt(e.target.value) || 0 })}
                            placeholder="Ej: 10"
                            disabled={isClosed}
                        />
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gold rounded-full transition-all"
                                style={{ width: `${bibleStudiesProgress}%` }}
                            />
                        </div>
                        {bibleStudiesProgress >= 100 && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <Check className="w-4 h-4" />
                                ¡Meta alcanzada!
                            </div>
                        )}
                    </div>

                    {/* Missionary Contacts Goal */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Meta de Contactos Misioneros</Label>
                            <span className="text-sm font-medium">
                                {totals.totalContacts} / {form.missionary_contacts_goal}
                            </span>
                        </div>
                        <Input
                            type="number"
                            min="0"
                            value={form.missionary_contacts_goal}
                            onChange={(e) => setForm({ ...form, missionary_contacts_goal: parseInt(e.target.value) || 0 })}
                            placeholder="Ej: 20"
                            disabled={isClosed}
                        />
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${contactsProgress}%` }}
                            />
                        </div>
                        {contactsProgress >= 100 && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <Check className="w-4 h-4" />
                                ¡Meta alcanzada!
                            </div>
                        )}
                    </div>

                    {/* Other Goals */}
                    <div className="space-y-2">
                        <Label>Otras Metas (opcional)</Label>
                        <textarea
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.other_goals}
                            onChange={(e) => setForm({ ...form, other_goals: e.target.value })}
                            placeholder="Escribe otras metas o notas para el trimestre..."
                            disabled={isClosed}
                        />
                    </div>

                    {!isClosed && (
                        <Button onClick={handleSave} disabled={saving} className="w-full">
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Guardando...' : 'Guardar Metas'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
