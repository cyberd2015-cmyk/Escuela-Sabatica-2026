import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCard, useStudents, useCards } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ArrowLeft,
    Calendar,
    Users,
    Target,
    Plus,
    X,
    Check,
    Lock,
    AlertTriangle,
    BookOpen
} from 'lucide-react'

const TRIMESTER_NAMES = {
    1: 'Primer Trimestre',
    2: 'Segundo Trimestre',
    3: 'Tercer Trimestre',
    4: 'Cuarto Trimestre'
}

export default function CardDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { card, students: cardStudents, loading, addStudent, removeStudent } = useCard(id)
    const { students: allStudents } = useStudents()
    const { closeCard } = useCards()
    const [showAddStudent, setShowAddStudent] = useState(false)
    const [showCloseConfirm, setShowCloseConfirm] = useState(false)

    const availableStudents = allStudents.filter(
        s => s.class_id === card?.class_id && !cardStudents.find(cs => cs.student_id === s.id)
    )

    const handleAddStudent = async (studentId: string) => {
        await addStudent(studentId)
        setShowAddStudent(false)
    }

    const handleRemoveStudent = async (studentId: string) => {
        if (confirm('¿Remover este alumno de la tarjeta?')) {
            await removeStudent(studentId)
        }
    }

    const handleCloseCard = async () => {
        if (id) {
            await closeCard(id)
            setShowCloseConfirm(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-primary">Cargando tarjeta...</div>
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
            <div className="flex items-start justify-between">
                <div>
                    <Button variant="ghost" onClick={() => navigate('/cards')} className="mb-2 -ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {card.class_name}
                        {isClosed && <Lock className="w-5 h-5 text-muted-foreground" />}
                    </h1>
                    <p className="text-muted-foreground">
                        {TRIMESTER_NAMES[card.trimester]} {card.year}
                    </p>
                </div>
                {!isClosed && (
                    <Button variant="outline" onClick={() => setShowCloseConfirm(true)} className="text-destructive border-destructive hover:bg-destructive/10">
                        <Lock className="w-4 h-4 mr-2" />
                        Cerrar Tarjeta
                    </Button>
                )}
            </div>

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
                                    Una vez cerrada, la tarjeta pasará a modo de solo lectura y no podrá ser editada ni reabierta. Esta acción es irreversible.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="destructive" onClick={handleCloseCard}>
                                        <Lock className="w-4 h-4 mr-2" />
                                        Sí, Cerrar Tarjeta
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

            {/* Closed Banner */}
            {isClosed && (
                <Card className="bg-muted/50 border-muted">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Lock className="w-5 h-5" />
                            <div>
                                <p className="font-medium">Tarjeta Cerrada</p>
                                <p className="text-sm">Esta tarjeta está en modo de solo lectura.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{cardStudents.length}</p>
                        <p className="text-sm text-muted-foreground">Alumnos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Calendar className="w-8 h-8 mx-auto text-gold mb-2" />
                        <p className="text-2xl font-bold">{card.weeks_completed || 0}/13</p>
                        <p className="text-sm text-muted-foreground">Semanas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Target className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold">{card.progress || 0}%</p>
                        <p className="text-sm text-muted-foreground">Progreso</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <BookOpen className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Estudios</p>
                    </CardContent>
                </Card>
            </div>

            {/* Students Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Alumnos de la Tarjeta</CardTitle>
                    {!isClosed && (
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setShowAddStudent(true)}>
                                <Users className="w-4 h-4 mr-2" />
                                Existente
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/students?action=new&class_id=${card.class_id}`)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Alumno
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {/* Add Student Dropdown */}
                    {showAddStudent && (
                        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-medium">Seleccionar Alumno</p>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddStudent(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            {availableStudents.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay más alumnos disponibles. Crea nuevos alumnos en la sección de Alumnos.</p>
                            ) : (
                                <div className="grid gap-2 max-h-48 overflow-y-auto">
                                    {availableStudents.map(student => (
                                        <button
                                            key={student.id}
                                            onClick={() => handleAddStudent(student.id)}
                                            className="flex items-center justify-between p-2 rounded hover:bg-muted text-left"
                                        >
                                            <span>{student.name}</span>
                                            <Plus className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Students List */}
                    {cardStudents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No hay alumnos asignados a esta tarjeta.</p>
                            {!isClosed && (
                                <Button variant="outline" className="mt-4" onClick={() => setShowAddStudent(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Alumno
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {cardStudents.map(({ student_id, student }) => (
                                <div key={student_id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            {student.baptized && (
                                                <span className="text-xs text-gold">Bautizado</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Check className="w-4 h-4 text-green-500" />
                                            0/0
                                        </span>
                                        {!isClosed && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveStudent(student_id)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            {!isClosed && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate(`/cards/${id}/weekly`)}>
                        <Calendar className="w-6 h-6 mb-2" />
                        <span className="text-sm">Registrar Semana</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate(`/cards/${id}/goals`)}>
                        <Target className="w-6 h-6 mb-2" />
                        <span className="text-sm">Metas</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate(`/cards/${id}/evaluation`)}>
                        <BookOpen className="w-6 h-6 mb-2" />
                        <span className="text-sm">Evaluación</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate(`/cards/${id}/weekly`)}>
                        <Users className="w-6 h-6 mb-2" />
                        <span className="text-sm">Asistencia</span>
                    </Button>
                </div>
            )}
        </div>
    )
}
