import { useState } from 'react'
import { useClasses } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Plus, User, Users, Pencil, Trash2, Save, X } from 'lucide-react'
import type { Class } from '@/types/database'

export default function Classes() {
    const { classes, loading, error, createClass, updateClass, deleteClass } = useClasses()
    const { isAdmin } = useAuth()
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        teacher_name: '',
        substitute_teacher_name: ''
    })
    const [editFormData, setEditFormData] = useState({
        name: '',
        teacher_name: '',
        substitute_teacher_name: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createClass(formData)
            setIsCreating(false)
            setFormData({ name: '', teacher_name: '', substitute_teacher_name: '' })
        } catch (err) {
            console.error(err)
        }
    }

    const startEditing = (cls: Class) => {
        setEditingId(cls.id)
        setEditFormData({
            name: cls.name,
            teacher_name: cls.teacher_name || '',
            substitute_teacher_name: cls.substitute_teacher_name || ''
        })
    }

    const handleUpdate = async (id: string) => {
        try {
            await updateClass(id, editFormData)
            setEditingId(null)
        } catch (err) {
            console.error(err)
            alert('Error al actualizar la clase')
        }
    }

    const handleDelete = async (cls: Class) => {
        const confirmed = window.confirm(
            `¿Estás seguro de eliminar la clase "${cls.name}"?\n\nEsta acción eliminará también todas las tarjetas, semanas y registros asociados a esta clase. Esta acción es IRREVERSIBLE.`
        )
        if (!confirmed) return
        try {
            await deleteClass(cls.id)
        } catch (err) {
            console.error(err)
            alert('Error al eliminar la clase. Puede tener datos asociados.')
        }
    }

    if (loading) return <div>Cargando clases...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Gestión de Clases</h2>
                    <p className="text-muted-foreground">Administra las clases y sus maestros</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsCreating(!isCreating)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isCreating ? 'Cancelar' : 'Nueva Clase'}
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="border-primary/50">
                    <CardHeader>
                        <CardTitle>Nueva Clase</CardTitle>
                        <CardDescription>Ingresa los datos de la nueva clase</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre de la Clase</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Clase de Jóvenes"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="teacher">Maestro Titular</Label>
                                <Input
                                    id="teacher"
                                    value={formData.teacher_name}
                                    onChange={e => setFormData({ ...formData, teacher_name: e.target.value })}
                                    placeholder="Nombre del maestro"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sub_teacher">Maestro Suplente</Label>
                                <Input
                                    id="sub_teacher"
                                    value={formData.substitute_teacher_name}
                                    onChange={e => setFormData({ ...formData, substitute_teacher_name: e.target.value })}
                                    placeholder="Nombre del suplente"
                                />
                            </div>
                            <Button type="submit">Guardar Clase</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(cls => (
                    <Card key={cls.id}>
                        <CardContent className="p-6">
                            {editingId === cls.id ? (
                                /* Edit Mode */
                                <div className="space-y-3">
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Nombre</Label>
                                        <Input
                                            value={editFormData.name}
                                            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                            placeholder="Nombre de la clase"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Maestro Titular</Label>
                                        <Input
                                            value={editFormData.teacher_name}
                                            onChange={e => setEditFormData({ ...editFormData, teacher_name: e.target.value })}
                                            placeholder="Maestro titular"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Maestro Suplente</Label>
                                        <Input
                                            value={editFormData.substitute_teacher_name}
                                            onChange={e => setEditFormData({ ...editFormData, substitute_teacher_name: e.target.value })}
                                            placeholder="Maestro suplente"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" onClick={() => handleUpdate(cls.id)}>
                                            <Save className="w-3.5 h-3.5 mr-1.5" />
                                            Guardar
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                            <X className="w-3.5 h-3.5 mr-1.5" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                            <h3 className="font-semibold">{cls.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                            <User className="w-4 h-4" />
                                            <span>{cls.teacher_name || 'Sin maestro asignado'}</span>
                                        </div>
                                        {cls.substitute_teacher_name && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span>Suplente: {cls.substitute_teacher_name}</span>
                                            </div>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => startEditing(cls)}
                                                title="Editar clase"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(cls)}
                                                className="text-destructive hover:text-destructive"
                                                title="Eliminar clase"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
