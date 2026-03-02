import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCards, useClasses } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Plus,
    Calendar,
    Users,
    ChevronRight,
    Search,
    Filter,
    Lock,
    Trash2
} from 'lucide-react'

const TRIMESTER_NAMES = {
    1: 'Primer Trimestre',
    2: 'Segundo Trimestre',
    3: 'Tercer Trimestre',
    4: 'Cuarto Trimestre'
}

export default function CardsPage() {
    const navigate = useNavigate()
    const { cards, loading, error, createCard, deleteCard } = useCards()
    const { classes } = useClasses()
    const [showNewCardForm, setShowNewCardForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // New card form state
    const [newCard, setNewCard] = useState({
        class_id: '',
        year: new Date().getFullYear(),
        trimester: 1 as 1 | 2 | 3 | 4
    })

    const handleCreateCard = async () => {
        try {
            if (!newCard.class_id) return
            await createCard(newCard)
            setShowNewCardForm(false)
            setNewCard({ class_id: '', year: new Date().getFullYear(), trimester: 1 })
            alert('¡Tarjeta creada exitosamente!')
        } catch (err: any) {
            console.error(err)
            const errorMsg = err.message || JSON.stringify(err)
            alert('Error al crear tarjeta: ' + errorMsg)
        }
    }

    const filteredCards = cards.filter(card => {
        const matchesSearch = card.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || card.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_progress':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">En Progreso</span>
            case 'in_review':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs rounded-full">En Revisión</span>
            case 'closed':
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> Cerrada</span>
            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-primary">Cargando tarjetas...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    Error cargando tarjetas: {error}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Tarjetas Trimestrales</h1>
                    <p className="text-muted-foreground">Gestiona las tarjetas de registro por trimestre</p>
                </div>
                <Button onClick={() => setShowNewCardForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Tarjeta
                </Button>
            </div>

            {/* New Card Form */}
            {showNewCardForm && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg">Crear Nueva Tarjeta</CardTitle>
                        <CardDescription>Selecciona la clase y el trimestre</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Clase</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newCard.class_id}
                                    onChange={(e) => setNewCard({ ...newCard, class_id: e.target.value })}
                                >
                                    <option value="">Seleccionar clase...</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Año</Label>
                                <Input
                                    type="number"
                                    value={newCard.year}
                                    onChange={(e) => setNewCard({ ...newCard, year: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Trimestre</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newCard.trimester}
                                    onChange={(e) => setNewCard({ ...newCard, trimester: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
                                >
                                    <option value={1}>Primer Trimestre (Q1)</option>
                                    <option value={2}>Segundo Trimestre (Q2)</option>
                                    <option value={3}>Tercer Trimestre (Q3)</option>
                                    <option value={4}>Cuarto Trimestre (Q4)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreateCard} disabled={!newCard.class_id}>
                                Crear Tarjeta
                            </Button>
                            <Button variant="outline" onClick={() => setShowNewCardForm(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por clase..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="in_review">En Revisión</option>
                        <option value="closed">Cerradas</option>
                    </select>
                </div>
            </div>

            {/* Cards Grid */}
            {filteredCards.length === 0 ? (
                <Card className="p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No hay tarjetas</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        {searchTerm ? 'No se encontraron tarjetas con esos criterios' : 'Crea tu primera tarjeta trimestral'}
                    </p>
                    {!searchTerm && (
                        <Button onClick={() => setShowNewCardForm(true)} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Tarjeta
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredCards.map(card => (
                        <Card
                            key={card.id}
                            className="group hover:shadow-md transition-shadow relative"
                        >
                            <CardContent className="p-4 cursor-pointer" onClick={() => navigate(`/cards/${card.id}`)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{card.class_name}</h3>
                                            {getStatusBadge(card.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {TRIMESTER_NAMES[card.trimester]} {card.year}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {card.students_count || 0} alumnos
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gold rounded-full transition-all"
                                                        style={{ width: `${card.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{card.progress || 0}%</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {card.weeks_completed || 0} de 13 semanas completadas
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </CardContent>
                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
                                            deleteCard(card.id)
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
