import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Award, Users, Calendar, TrendingUp, Bell, UserMinus, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockStore } from '@/lib/mockStore'
import { cn } from '@/lib/utils'

export default function Dashboard() {
    const [studentsData, setStudentsData] = useState<any[]>([])
    const [alerts, setAlerts] = useState<any[]>([])
    const [stats, setStats] = useState({
        progress: 68,
        totalStudents: 0,
        activeCards: 0
    })

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                if (!isSupabaseConfigured) {
                    // Demo Mode
                    const allStudents = mockStore.getStudents()
                    const allCards = mockStore.getCards()
                    setStudentsData(allStudents.slice(0, 5))
                    const startAlerts = Date.now()
                    const alertsDataMock = mockStore.getAbsenteeismAlerts()
                    const endAlerts = Date.now()

                    if ((endAlerts - startAlerts) > 200) {
                        console.warn(`[SRE] Latencia detectada (${endAlerts - startAlerts}ms). Aplicando Auto-Fix...`);
                        mockStore.addPerformanceIndexes();
                    }

                    setAlerts(alertsDataMock)
                    setStats({
                        progress: 68,
                        totalStudents: allStudents.length,
                        activeCards: allCards.filter(c => c.status !== 'closed').length
                    })
                } else {
                    // Real Supabase Fetch
                    const { data: alertsData } = await supabase
                        .from('v_alerta_ausentismo')
                        .select('*')

                    setAlerts(alertsData || [])

                    const { data: profiles } = await supabase
                        .from('students')
                        .select('*, class:classes(name)')
                        .order('created_at', { ascending: false })
                        .limit(5)

                    const { data: studentsCount } = await supabase
                        .from('students')
                        .select('id', { count: 'exact' })

                    const { data: cardsCount } = await supabase
                        .from('cards')
                        .select('id', { count: 'exact' })
                        .neq('status', 'closed')

                    setStudentsData(profiles || [])
                    setStats(s => ({
                        ...s,
                        totalStudents: studentsCount?.length || 0,
                        activeCards: cardsCount?.length || 0
                    }))
                }
            } catch (error) {
                console.error('Dashboard Fetch Error:', error)
            }
        }
        fetchDashboardData()
    }, [])

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-institutional-gold/10 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-institutional-gold" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-institutional-blue/60">Sistema de Gestión</span>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-[0.15em] text-institutional-blue leading-none">
                        Dashboard <span className="text-institutional-gold">2026</span>
                    </h2>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium mt-3">Resumen de operaciones y metas institucionales</p>
                </div>
                <div className="flex gap-4">
                    <Button className="rounded-xl border border-institutional-gold text-institutional-blue bg-institutional-gold hover:bg-gold-600 uppercase tracking-widest text-[10px] font-black px-8 py-6 h-auto shadow-lg shadow-institutional-gold/20 transition-all hover:scale-105 active:scale-95">
                        Nueva Tarjeta
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border-institutional-gold/10 rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-institutional-blue/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    <CardContent className="p-8 flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-institutional-blue/5 flex items-center justify-center border border-institutional-gold/10 group-hover:bg-institutional-blue transition-colors duration-500">
                            <Users className="w-8 h-8 text-institutional-blue group-hover:text-institutional-gold" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Membresía</p>
                            <p className="text-4xl font-black text-institutional-blue tabular-nums">{stats.totalStudents}</p>
                            <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest mt-1">Alumnos Registrados</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-institutional-gold/10 rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-institutional-gold/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    <CardContent className="p-8 flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-institutional-gold/5 flex items-center justify-center border border-institutional-blue/10 group-hover:bg-institutional-gold transition-colors duration-500">
                            <Calendar className="w-8 h-8 text-institutional-gold group-hover:text-institutional-blue" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Operativa</p>
                            <p className="text-4xl font-black text-institutional-blue tabular-nums">{stats.activeCards}</p>
                            <p className="text-[9px] font-bold text-institutional-gold uppercase tracking-widest mt-1">Tarjetas Activas</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-institutional-gold/10 rounded-xl bg-institutional-blue text-white shadow-2xl transition-all duration-500 group overflow-hidden relative hidden lg:block">
                    <div className="absolute inset-0 bg-hero-gradient opacity-50" />
                    <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">Estado Global</p>
                        <h3 className="text-xl font-black uppercase tracking-widest leading-tight">Excelencia en <br />el Servicio</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-institutional-gold" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Sincronizado con Central</span>
                        </div>
                    </CardContent>
                    <CheckCircle2 className="absolute bottom-4 right-4 w-12 h-12 text-white/10" />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Widget: Care Alerts (Alertas de Cuidado) */}
                <Card className="lg:col-span-12 border-institutional-gold rounded-xl bg-white shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-red-100 bg-red-50/30 p-8 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-red-100/50">
                                <Bell className="w-6 h-6 text-red-600 animate-pulse" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-red-900">Alertas de Cuidado</CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-red-700/60 mt-1">Detección Automática de Ausentismo</CardDescription>
                            </div>
                        </div>
                        {alerts.length > 0 && (
                            <span className="px-4 py-2 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
                                {alerts.length} Casos Críticos
                            </span>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {alerts.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                                <Award className="w-12 h-12 text-institutional-gold opacity-30" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Todos los alumnos están al día</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-red-100">
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-red-50/50 transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center border",
                                                alert.status === 'urgent' ? "bg-red-100 border-red-200 text-red-600" : "bg-orange-100 border-orange-200 text-orange-600"
                                            )}>
                                                <UserMinus className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-institutional-blue uppercase tracking-widest">{alert.student_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">
                                                        {alert.consecutive_absences} Sábados Ausente
                                                    </span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">• {alert.class_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">Última Presencia</p>
                                                <p className="text-[10px] font-black text-institutional-blue">{alert.last_presence || 'Nunca'}</p>
                                            </div>
                                            <Button variant="outline" className="rounded-xl border-red-200 text-red-600 font-black uppercase tracking-widest text-[9px] hover:bg-red-600 hover:text-white transition-all">
                                                Intervenir
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Widget: Progress Chart */}
                <Card className="lg:col-span-5 border-institutional-gold rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-institutional-gold/10 bg-institutional-blue/5 p-8">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-institutional-blue">Resumen Trimestral</CardTitle>
                        <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Ciclo 2026 - Q1</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 flex-1 flex flex-col items-center justify-center space-y-10">
                        <div className="relative w-56 h-56 group">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    className="text-institutional-blue/5"
                                    strokeWidth="16"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="100"
                                    cx="112"
                                    cy="112"
                                />
                                <circle
                                    className="text-institutional-gold transition-all duration-1000 ease-out"
                                    strokeWidth="16"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 * (1 - stats.progress / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="100"
                                    cx="112"
                                    cy="112"
                                    style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-6xl font-black text-institutional-blue tabular-nums leading-none">{stats.progress}%</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2">Progreso</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-institutional-blue/5 p-4 rounded-2xl border border-institutional-gold/10 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Meta Semanal</p>
                                <p className="text-sm font-black text-institutional-blue uppercase tracking-widest">Cumplido</p>
                            </div>
                            <div className="bg-institutional-gold/10 p-4 rounded-2xl border border-institutional-gold/30 text-center">
                                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Misiones</p>
                                <p className="text-sm font-black text-institutional-blue uppercase tracking-widest">Activas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Widget: Alumnos Table */}
                <Card className="lg:col-span-7 border-institutional-gold rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-institutional-gold/10 p-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-institutional-blue">Últimos Registros</CardTitle>
                            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">Actividad Reciente Alumnos</CardDescription>
                        </div>
                        <Button variant="outline" className="rounded-xl border-institutional-blue/20 text-[10px] font-black uppercase tracking-widest hover:bg-institutional-blue hover:text-white transition-all">
                            Ver todos
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        {studentsData.length === 0 ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-gray-50/50 space-y-6">
                                <div className="p-8 rounded-full bg-institutional-gold/10 border border-institutional-gold/20">
                                    <Award className="w-16 h-16 text-institutional-gold" />
                                </div>
                                <div>
                                    <p className="text-xl font-black uppercase tracking-[0.2em] text-institutional-blue">Estado Vacío</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mt-2">No hay registros de alumnos para mostrar</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-institutional-blue/5">
                                    <TableRow className="border-institutional-gold/10">
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 px-8 text-institutional-blue/40">Alumno</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 text-center text-institutional-blue/40">Clase</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-6 px-8 text-right text-institutional-blue/40">Detalle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentsData.map((student) => (
                                        <TableRow key={student.id} className="border-institutional-gold/5 hover:bg-institutional-blue/5 transition-all group">
                                            <TableCell className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-institutional-blue/5 flex items-center justify-center border border-institutional-gold/10 group-hover:scale-110 transition-transform">
                                                        <span className="text-sm font-black text-institutional-blue">{student.name?.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-institutional-blue uppercase tracking-[0.1em]">{student.name}</p>
                                                        <p className="text-[9px] text-muted-foreground uppercase tracking-tighter mt-0.5">{student.phone || 'Sin contacto'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center px-4 py-1 rounded-full bg-institutional-gold/20 text-institutional-blue text-[8px] font-black uppercase tracking-widest">
                                                    {student.class_name || student.class?.name || 'General'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-6 px-8 text-right">
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-institutional-blue hover:text-white transition-all">
                                                    <Award className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}

