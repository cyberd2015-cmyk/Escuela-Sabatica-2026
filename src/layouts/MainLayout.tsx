import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
    BookOpen,
    Calendar,
    Users,
    Target,
    LogOut,
    Menu,
    X,
    Sun,
    Moon,
    GraduationCap,
    UserCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MainLayout() {
    const { signOut, isAdmin, profile } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(false)

    // Build nav items based on role
    const navItems = [
        { path: '/dashboard', label: 'Inicio', icon: BookOpen },
        { path: '/attendance', label: 'Asistencia', icon: UserCheck },
        ...(isAdmin ? [{ path: '/classes', label: 'Clases', icon: GraduationCap }] : []),
        { path: '/cards', label: 'Tarjetas', icon: Calendar },
        { path: '/students', label: 'Alumnos', icon: Users },
        ...(isAdmin ? [{ path: '/goals', label: 'Metas', icon: Target }] : []),
    ]

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark')
        setDarkMode(isDark)
    }, [])

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        if (!darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    const handleNavClick = (path: string) => {
        navigate(path)
        setSidebarOpen(false)
    }

    const displayName = profile?.full_name || 'Usuario 1853'

    const Logo = ({ className = "" }: { className?: string }) => (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-institutional-gold/30">
                <BookOpen className="w-5 h-5 text-institutional-gold" />
            </div>
            <div>
                <h1 className="font-black text-xs md:text-sm uppercase tracking-[0.2em]">Escuela Sabática</h1>
                <span className="text-[10px] text-white/60 tracking-widest font-bold">SELLO 1853</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-institutional-white flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-col bg-institutional-blue text-white sticky top-0 h-screen border-r border-institutional-gold/20">
                <div className="p-8">
                    <Logo />
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 pt-4">Navegación</p>
                    {navItems.map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${location.pathname === item.path
                                ? 'bg-institutional-gold text-institutional-blue shadow-lg scale-[1.02]'
                                : 'hover:bg-white/5 text-white/70 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest leading-none pt-0.5">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 bg-white/5 mx-4 mb-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-institutional-blue flex items-center justify-center border border-institutional-gold">
                            <Users className="w-4 h-4 text-institutional-gold" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-bold uppercase tracking-widest truncate">{displayName}</p>
                            <p className="text-[8px] text-white/50 uppercase tracking-widest">{isAdmin ? 'ADMIN' : 'MAESTRO'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-white hover:bg-white/10">
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={signOut} className="text-white hover:bg-white/10 opacity-50 hover:opacity-100">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </aside>

            {/* Mobile / Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden bg-institutional-blue text-white p-4 flex items-center justify-between border-b border-institutional-gold/20 sticky top-0 z-50">
                    <Logo />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </Button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
                    <Outlet />
                </main>

                {/* Mobile Navigation Dock (iOS style) */}
                <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-institutional-blue text-white px-2 py-4 rounded-3xl shadow-2xl border border-institutional-gold/20 flex justify-around items-center z-50">
                    {navItems.slice(0, 4).map(item => {
                        const isActive = location.pathname === item.path
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center gap-1 group relative ${isActive ? 'text-institutional-gold' : 'text-white/40'}`}
                            >
                                <item.icon className={`w-6 h-6 transition-all ${isActive ? 'scale-110' : 'scale-100'}`} />
                                {isActive && <span className="absolute -top-1 w-1 h-1 bg-institutional-gold rounded-full" />}
                            </button>
                        )
                    })}
                    <button onClick={signOut} className="text-white/20">
                        <LogOut className="w-5 h-5" />
                    </button>
                </nav>
            </div>

            {/* Mobile Slide-out Menu */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-institutional-blue text-white shadow-2xl flex flex-col border-r border-institutional-gold/30">
                        <div className="p-8 border-b border-white/10 flex items-center justify-between">
                            <Logo />
                            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-white">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {navItems.map(item => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl ${location.pathname === item.path ? 'bg-institutional-gold text-institutional-blue' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-bold uppercase tracking-widest text-xs">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                        <div className="p-6 bg-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">Información</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-institutional-blue border border-institutional-gold flex items-center justify-center">
                                    <Users className="w-5 h-5 text-institutional-gold" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest">{displayName}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{isAdmin ? 'Administrador' : 'Maestro'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

