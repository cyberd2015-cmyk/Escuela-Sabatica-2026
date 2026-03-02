import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { error } = await signIn(email, password)
            if (error) {
                setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.')
            }
        } catch {
            setError('Error al conectar con el servidor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-institutional">
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                        <BookOpen className="w-10 h-10 text-gold" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Escuela Sabática</h1>
                    <p className="text-white/70 mt-2">Sistema de Registro Trimestral</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
                        2026
                    </span>
                </div>

                {/* Login Card */}
                <Card className="glass">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tus credenciales para acceder
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-white/50 text-sm mt-6">
                    © 2026 Escuela Sabática. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}
