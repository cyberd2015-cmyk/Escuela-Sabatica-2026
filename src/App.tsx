import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Index from './pages/Index'
import Classes from './pages/Classes'
import Cards from './pages/Cards'
import CardDetail from './pages/CardDetail'
import Students from './pages/Students'
import Attendance from './pages/Attendance'
import Goals from './pages/Goals'
import CardGoals from './pages/CardGoals'
import WeeklyEntry from './pages/WeeklyEntry'
import Evaluation from './pages/Evaluation'
import NotFound from './pages/NotFound'
import MainLayout from './layouts/MainLayout'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-primary font-medium">Cargando...</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

function AppRoutes() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-primary font-medium">Cargando...</div>
            </div>
        )
    }

    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/cards/:id" element={<CardDetail />} />
                <Route path="/cards/:id/weekly" element={<WeeklyEntry />} />
                <Route path="/cards/:id/evaluation" element={<Evaluation />} />
                <Route path="/cards/:id/goals" element={<CardGoals />} />
                <Route path="/students" element={<Students />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/goals" element={<Goals />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}


function App() {
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
        setDarkMode(isDark)
    }, [])

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])

    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App
