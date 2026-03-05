import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStudents, useClasses } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Plus,
    Search,
    User,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Trash2,
    X,
    Check
} from 'lucide-react'

export default function StudentsPage() {
    const [searchParams] = useSearchParams()
    const { students, loading, createStudent, updateStudent, deleteStudent } = useStudents()
    const { classes } = useClasses()
    const [searchTerm, setSearchTerm] = useState('')
    const [showNewForm, setShowNewForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        birth_date: '',
        baptized: false,
        class_id: '' // For assignment
    })

    // Handle URL params
    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            setShowNewForm(true)
            const classId = searchParams.get('class_id')
            if (classId) {
                setFormData(prev => ({ ...prev, class_id: classId }))
            }
        }
    }, [searchParams])

    const resetForm = () => {
        setFormData({ name: '', address: '', phone: '', birth_date: '', baptized: false, class_id: '' })
        setShowNewForm(false)
        setEditingId(null)
    }

    const handleSave = async () => {
        if (!formData.name.trim()) return

        if (editingId) {
            // Si ya existe el ID, hacer UPDATE (mapear array y reemplazar localmente se hace en el hook)
            await updateStudent(editingId, formData)
        } else {
            // Si NO existe ID, hacer CREATE (añadir nuevo)
            const { class_id, ...studentData } = formData
            await createStudent(studentData, class_id || undefined)
        }
        resetForm()
    }

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este alumno?')) {
            await deleteStudent(id)
        }
    }

    const startEdit = (student: typeof students[0]) => {
        setEditingId(student.id)
        setFormData({
            name: student.name,
            address: student.address || '',
            phone: student.phone || '',
            birth_date: student.birth_date || '',
            baptized: student.baptized,
            class_id: '' // Reset class_id when editing, as it's only for new assignments
        })
        setShowNewForm(false)
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-primary">Cargando alumnos...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Alumnos</h1>
                    <p className="text-muted-foreground">Gestiona el registro de alumnos</p>
                </div>
                <Button onClick={() => { setShowNewForm(true); setEditingId(null); }} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Alumno
                </Button>
            </div>

            {/* New/Edit Form */}
            {(showNewForm || editingId) && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{editingId ? 'Editar Alumno' : 'Nuevo Alumno'}</h3>
                            <Button variant="ghost" size="icon" onClick={resetForm}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input
                                    placeholder="Nombre completo"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Class Assignment */}
                            {!editingId && (
                                <div className="space-y-2">
                                    <Label>Asignar a Clase</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    >
                                        <option value="">Seleccionar clase...</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input
                                    placeholder="Número de teléfono"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Nacimiento</Label>
                                <Input
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Dirección</Label>
                                <Input
                                    placeholder="Dirección"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="baptized"
                                    checked={formData.baptized}
                                    onChange={(e) => setFormData({ ...formData, baptized: e.target.checked })}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="baptized">Bautizado</Label>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={!formData.name.trim()}>
                                <Check className="w-4 h-4 mr-2" />
                                {editingId ? 'Guardar Cambios' : 'Crear Alumno'}
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Students List */}
            {filteredStudents.length === 0 ? (
                <Card className="p-8 text-center">
                    <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No hay alumnos</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        {searchTerm ? 'No se encontraron alumnos' : 'Registra tu primer alumno'}
                    </p>
                    {!searchTerm && (
                        <Button onClick={() => setShowNewForm(true)} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Alumno
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid gap-3">
                    {filteredStudents.map(student => (
                        <Card key={student.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{student.name}</h3>
                                                {student.baptized && (
                                                    <span className="px-2 py-0.5 bg-gold/20 text-gold-700 dark:text-gold-300 text-xs rounded-full">
                                                        Bautizado
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                                                {student.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {student.phone}
                                                    </span>
                                                )}
                                                {student.address && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {student.address}
                                                    </span>
                                                )}
                                                {student.birth_date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {student.birth_date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(student)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)} className="text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Summary */}
            <div className="text-sm text-muted-foreground text-center">
                {filteredStudents.length} alumno{filteredStudents.length !== 1 ? 's' : ''} registrado{filteredStudents.length !== 1 ? 's' : ''}
            </div>
        </div>
    )
}
