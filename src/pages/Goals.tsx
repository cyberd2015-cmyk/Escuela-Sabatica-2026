import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useDepartmentGoals } from '@/hooks/useWeeklyData'
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
    UserPlus,
    ArrowLeft,
    ShieldCheck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

export default function GoalsPage() {
    const navigate = useNavigate()
    const { isAdmin } = useAuth()

    // Current date to default year/trimester
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentTrimester = currentMonth <= 3 ? 1 : currentMonth <= 6 ? 2 : currentMonth <= 9 ? 3 : 4

    const [year, setYear] = useState(currentYear)
    const [trimester, setTrimester] = useState(currentTrimester)

    if (!isAdmin) {
        return (
            <div className="space-y-6 text-center py-12">
                <ShieldCheck className="w-16 h-16 mx-auto text-muted-foreground" />
                <h2 className="text-xl font-semibold">Acceso Restringido</h2>
                <p className="text-muted-foreground">
                    Las metas departamentales son administradas únicamente por la directiva.
                </p>
                <p className="text-muted-foreground text-sm">
                    Para definir metas de tu clase, entra a tu tarjeta y haz clic en "Metas".
                </p>
                <Button variant="outline" onClick={() => navigate('/cards')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ir a Tarjetas
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Metas Departamentales</h1>
                <p className="text-muted-foreground">
                    Metas generales del Departamento de Escuela Sabática
                </p>
            </div>

            {/* Year / Trimester Selector */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <Label>Año</Label>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" onClick={() => setYear(y => y - 1)}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="w-16 text-center font-bold text-lg">{year}</span>
                                <Button variant="outline" size="icon" onClick={() => setYear(y => y + 1)}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label>Trimestre</Label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map(q => (
                                    <Button
                                        key={q}
                                        variant={trimester === q ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setTrimester(q)}
                                    >
                                        Q{q}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Goals Editor */}
            <DepartmentGoalsEditor year={year} trimester={trimester} />
        </div>
    )
}

function DepartmentGoalsEditor({ year, trimester }: { year: number; trimester: number }) {
    const { goals, saveGoals, loading } = useDepartmentGoals(year, trimester)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        bible_studies_goal: 0,
        missionary_contacts_goal: 0,
        attendance_goal: 0,
        new_members_goal: 0,
        other_goals: ''
    })

    useEffect(() => {
        if (goals) {
            setForm({
                bible_studies_goal: goals.bible_studies_goal,
                missionary_contacts_goal: goals.missionary_contacts_goal,
                attendance_goal: goals.attendance_goal,
                new_members_goal: goals.new_members_goal,
                other_goals: goals.other_goals || ''
            })
        } else {
            setForm({
                bible_studies_goal: 0,
                missionary_contacts_goal: 0,
                attendance_goal: 0,
                new_members_goal: 0,
                other_goals: ''
            })
        }
    }, [goals])

    const handleSave = async () => {
        setSaving(true)
        const success = await saveGoals(form)
        setSaving(false)
        if (success) {
            alert('¡Metas departamentales guardadas!')
        }
    }

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Cargando metas...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Metas del Departamento — Q{trimester} {year}
                </CardTitle>
                <CardDescription>
                    Establece las metas generales que la directiva del departamento debe alcanzar este trimestre
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Bible Studies */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gold" />
                            Meta de Estudios Bíblicos
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            value={form.bible_studies_goal}
                            onChange={(e) => setForm({ ...form, bible_studies_goal: parseInt(e.target.value) || 0 })}
                            placeholder="Ej: 50"
                        />
                    </div>

                    {/* Missionary Contacts */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            Meta de Contactos Misioneros
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            value={form.missionary_contacts_goal}
                            onChange={(e) => setForm({ ...form, missionary_contacts_goal: parseInt(e.target.value) || 0 })}
                            placeholder="Ej: 100"
                        />
                    </div>

                    {/* Attendance */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-500" />
                            Meta de Asistencia (%)
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={form.attendance_goal}
                            onChange={(e) => setForm({ ...form, attendance_goal: parseInt(e.target.value) || 0 })}
                            placeholder="Ej: 85"
                        />
                    </div>

                    {/* New Members */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-blue-500" />
                            Meta de Nuevos Miembros
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            value={form.new_members_goal}
                            onChange={(e) => setForm({ ...form, new_members_goal: parseInt(e.target.value) || 0 })}
                            placeholder="Ej: 10"
                        />
                    </div>
                </div>

                {/* Other Goals */}
                <div className="space-y-2">
                    <Label>Otras Metas / Notas Departamentales (opcional)</Label>
                    <textarea
                        className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.other_goals}
                        onChange={(e) => setForm({ ...form, other_goals: e.target.value })}
                        placeholder="Escribe metas adicionales, planes o notas para la directiva..."
                    />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Metas Departamentales'}
                </Button>
            </CardContent>
        </Card>
    )
}
