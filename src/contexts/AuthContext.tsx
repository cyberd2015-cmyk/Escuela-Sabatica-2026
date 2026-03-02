import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockStore } from '@/lib/mockStore'

interface UserProfile {
    role: 'admin' | 'teacher'
    assigned_class_id: string | null
    full_name: string | null
}

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    demoMode: boolean
    // Class-based access helpers
    profile: UserProfile | null
    isAdmin: boolean
    classId: string | null
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [demoMode] = useState(!isSupabaseConfigured)

    useEffect(() => {
        if (!isSupabaseConfigured) {
            console.warn('Supabase not configured. Running in demo mode.')
            setLoading(false)
            return
        }

        const fetchProfile = async (session: Session | null) => {
            if (session?.user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (profileData) {
                    const userProfile: UserProfile = {
                        role: profileData.role || 'teacher',
                        assigned_class_id: profileData.assigned_class_id || null,
                        full_name: profileData.full_name || null
                    }
                    setProfile(userProfile)

                    // Merge profile into user metadata for backward compatibility
                    const userWithRole = {
                        ...session.user,
                        user_metadata: {
                            ...session.user.user_metadata,
                            ...profileData
                        }
                    }
                    setUser(userWithRole)
                } else {
                    setUser(session.user)
                    setProfile(null)
                }
            } else {
                setUser(null)
                setProfile(null)
            }
            setLoading(false)
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            fetchProfile(session)
        }).catch((err) => {
            console.error('Error getting session:', err)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            fetchProfile(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            // Demo mode login
            const validUser = mockStore.verifyCredentials(email, password)
            if (validUser) {
                const user: any = {
                    id: 'demo-user-' + validUser.class_id,
                    email: validUser.email,
                    aud: 'authenticated',
                    role: 'authenticated',
                    user_metadata: {
                        class_id: validUser.class_id,
                        name: validUser.name,
                        assigned_class_id: validUser.class_id
                    },
                    created_at: new Date().toISOString(),
                }
                setUser(user)
                setProfile({
                    role: 'teacher',
                    assigned_class_id: validUser.class_id,
                    full_name: validUser.name
                })
                return { error: null }
            }
            return { error: new Error('Credenciales inválidas') }
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
    }

    const signOut = async () => {
        if (!isSupabaseConfigured) {
            setUser(null)
            setProfile(null)
            return
        }
        await supabase.auth.signOut()
    }

    const isAdmin = profile?.role === 'admin'
    const classId = profile?.assigned_class_id || null

    return (
        <AuthContext.Provider value={{
            user, session, loading, demoMode,
            profile, isAdmin, classId,
            signIn, signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
