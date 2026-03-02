// Mock Data Store for Demo Mode
// This simulates a database when Supabase is not configured

import { Class, Student, Card, CardStudent, Week, Attendance, WeeklyResults, QuarterGoals, Alert, AttendanceAlert } from '@/types/database'

// Generate UUID-like IDs
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

// Demo Credentials linked to Classes in mockStore
export const DEMO_CREDENTIALS = [
    { email: 'clase1@appes.org', password: '123', class_id: 'class-1', name: 'Maestro Clase 1' },
    { email: 'clase2@appes.org', password: '123', class_id: 'class-2', name: 'Maestro Clase 2' },
    { email: 'clase3@appes.org', password: '123', class_id: 'class-3', name: 'Maestro Clase 3' },
    { email: 'clase4@appes.org', password: '123', class_id: 'class-4', name: 'Maestro Clase 4' },
    { email: 'jovenes@appes.org', password: '123', class_id: 'class-5', name: 'Maestro Jóvenes' },
    { email: 'admin@appes.org', password: '123', class_id: null, name: 'Administrador' } // Admin sees all
]

// Initial mock data
const initialClasses: Class[] = [
    {
        id: 'class-1',
        name: 'Clase 1',
        teacher_name: 'María González',
        substitute_teacher_name: 'Juan Pérez',
        created_by: 'demo-user-id',
        created_at: '2026-01-01T00:00:00Z'
    },
    {
        id: 'class-2',
        name: 'Clase 2',
        teacher_name: 'Carlos Rodríguez',
        created_by: 'demo-user-id',
        created_at: '2026-01-01T00:00:00Z'
    },
    {
        id: 'class-3',
        name: 'Clase 3',
        teacher_name: 'Ana López',
        created_by: 'demo-user-id',
        created_at: '2026-01-01T00:00:00Z'
    },
    {
        id: 'class-4',
        name: 'Clase 4',
        teacher_name: 'Roberto Gómez',
        created_by: 'demo-user-id',
        created_at: '2026-01-01T00:00:00Z'
    },
    {
        id: 'class-5',
        name: 'Clase de Jóvenes',
        teacher_name: 'Elena Torres',
        created_by: 'demo-user-id',
        created_at: '2026-01-01T00:00:00Z'
    }
]

const initialStudents: Student[] = [
    { id: 'student-1', name: 'Pedro Martínez', baptized: true, created_by: 'demo-user-id', created_at: '2026-01-01T00:00:00Z' },
    { id: 'student-2', name: 'Laura Sánchez', baptized: false, created_by: 'demo-user-id', created_at: '2026-01-01T00:00:00Z' },
    { id: 'student-3', name: 'Diego Hernández', baptized: true, created_by: 'demo-user-id', created_at: '2026-01-01T00:00:00Z' },
    { id: 'student-4', name: 'Lucía Fernández', baptized: true, created_by: 'demo-user-id', created_at: '2026-01-01T00:00:00Z' },
    { id: 'student-5', name: 'Miguel Ángel', baptized: false, created_by: 'demo-user-id', created_at: '2026-01-01T00:00:00Z' },
]

const initialCards: Card[] = [
    {
        id: 'card-1',
        class_id: 'class-1',
        class_name: 'Clase 1',
        year: 2026,
        trimester: 1,
        status: 'in_progress',
        created_at: '2026-01-01T00:00:00Z',
        students_count: 1,
        weeks_completed: 0,
        progress: 0
    },
    {
        id: 'card-2',
        class_id: 'class-2',
        class_name: 'Clase 2',
        year: 2026,
        trimester: 1,
        status: 'in_progress',
        created_at: '2026-01-01T00:00:00Z',
        students_count: 1,
        weeks_completed: 0,
        progress: 0
    },
    {
        id: 'card-3',
        class_id: 'class-3',
        class_name: 'Clase 3',
        year: 2026,
        trimester: 1,
        status: 'in_progress',
        created_at: '2026-01-01T00:00:00Z',
        students_count: 1,
        weeks_completed: 0,
        progress: 0
    },
    {
        id: 'card-4',
        class_id: 'class-4',
        class_name: 'Clase 4',
        year: 2026,
        trimester: 1,
        status: 'in_progress',
        created_at: '2026-01-01T00:00:00Z',
        students_count: 1,
        weeks_completed: 0,
        progress: 0
    },
    {
        id: 'card-5',
        class_id: 'class-5',
        class_name: 'Clase de Jóvenes',
        year: 2026,
        trimester: 1,
        status: 'in_progress',
        created_at: '2026-01-01T00:00:00Z',
        students_count: 1,
        weeks_completed: 0,
        progress: 0
    }
]

const initialCardStudents: CardStudent[] = [
    { card_id: 'card-1', student_id: 'student-1' },
    { card_id: 'card-2', student_id: 'student-2' },
    { card_id: 'card-3', student_id: 'student-3' },
    { card_id: 'card-4', student_id: 'student-4' },
    { card_id: 'card-5', student_id: 'student-5' },
]

// In-memory store
class MockStore {
    private classes: Class[] = [...initialClasses]
    private students: Student[] = [...initialStudents]
    private cards: Card[] = [...initialCards]
    private cardStudents: CardStudent[] = [...initialCardStudents]
    private weeks: Week[] = []
    private attendance: Attendance[] = []
    private weeklyResults: WeeklyResults[] = []
    private quarterGoals: QuarterGoals[] = []
    private finalEvaluations: { id: string; card_id: string; summary_text: string; created_at: string }[] = []
    private alerts: Alert[] = []
    private hasIndexes: boolean = false // SRE Optimization flag

    constructor() {
        // Pre-fill some attendance to trigger an alert
        // Let's assume student-2 (Laura Sánchez) in class-2 missed last 3 weeks
        const card2 = 'card-2'
        const student2 = 'student-2'

        // Week 1: Absent
        const w1 = this.createOrGetWeek(card2, 1, '2026-02-08')
        this.setAttendance(w1.id, student2, false)

        // Week 2: Absent
        const w2 = this.createOrGetWeek(card2, 2, '2026-02-15')
        this.setAttendance(w2.id, student2, false)

        // Week 3: Absent
        const w3 = this.createOrGetWeek(card2, 3, '2026-02-22')
        this.setAttendance(w3.id, student2, false)

        // Add a birthday alert for someone
        this.alerts.push({
            id: generateId(),
            student_id: 'student-3',
            type: 'birthday',
            message: 'Diego Hernández cumple años hoy. ¡Celébralo!',
            resolved: false,
            created_at: new Date().toISOString()
        })
    }

    // Classes
    getClasses(): Class[] {
        return this.classes
    }

    getClass(id: string): Class | undefined {
        return this.classes.find(c => c.id === id)
    }

    createClass(data: Omit<Class, 'id' | 'created_at' | 'created_by'>): Class {
        const newClass: Class = {
            ...data,
            id: generateId(),
            created_by: 'demo-user-id',
            created_at: new Date().toISOString()
        }
        this.classes.push(newClass)
        return newClass
    }

    updateClass(id: string, data: Partial<Class>): Class | undefined {
        const index = this.classes.findIndex(c => c.id === id)
        if (index === -1) return undefined
        this.classes[index] = { ...this.classes[index], ...data }
        return this.classes[index]
    }

    deleteClass(id: string): boolean {
        const index = this.classes.findIndex(c => c.id === id)
        if (index === -1) return false
        this.classes.splice(index, 1)
        return true
    }

    // Students
    getStudents(): Student[] {
        return this.students
    }

    getStudent(id: string): Student | undefined {
        return this.students.find(s => s.id === id)
    }

    createStudent(data: Omit<Student, 'id' | 'created_at' | 'created_by'>): Student {
        const newStudent: Student = {
            ...data,
            id: generateId(),
            created_by: 'demo-user-id',
            created_at: new Date().toISOString()
        }
        this.students.push(newStudent)
        return newStudent
    }

    updateStudent(id: string, data: Partial<Student>): Student | undefined {
        const index = this.students.findIndex(s => s.id === id)
        if (index === -1) return undefined
        this.students[index] = { ...this.students[index], ...data }
        return this.students[index]
    }

    deleteStudent(id: string): boolean {
        const index = this.students.findIndex(s => s.id === id)
        if (index === -1) return false
        this.students.splice(index, 1)
        this.cardStudents = this.cardStudents.filter(cs => cs.student_id !== id)
        return true
    }

    // Cards
    getCards(): Card[] {
        return this.cards.map(card => ({
            ...card,
            class_name: this.getClass(card.class_id)?.name,
            weeks_completed: this.getWeeks(card.id).length,
            progress: Math.round((this.getWeeks(card.id).length / 13) * 100)
        }))
    }

    getCard(id: string): Card | undefined {
        const card = this.cards.find(c => c.id === id)
        if (!card) return undefined
        return {
            ...card,
            class_name: this.getClass(card.class_id)?.name,
            weeks_completed: this.getWeeks(id).length,
            progress: Math.round((this.getWeeks(id).length / 13) * 100)
        }
    }

    createCard(data: { class_id: string; year: number; trimester: 1 | 2 | 3 | 4 }): Card {
        const newCard: Card = {
            id: generateId(),
            class_id: data.class_id,
            class_name: this.getClass(data.class_id)?.name,
            year: data.year,
            trimester: data.trimester,
            status: 'in_progress',
            created_at: new Date().toISOString(),
            students_count: 0,
            weeks_completed: 0,
            progress: 0
        }
        this.cards.push(newCard)
        return newCard
    }

    deleteCard(id: string): boolean {
        const index = this.cards.findIndex(c => c.id === id)
        if (index === -1) return false
        this.cards.splice(index, 1)
        // Cleanup dependencies
        this.cardStudents = this.cardStudents.filter(cs => cs.card_id !== id)
        this.weeks = this.weeks.filter(w => w.card_id !== id)
        this.quarterGoals = this.quarterGoals.filter(qg => qg.card_id !== id)
        this.finalEvaluations = this.finalEvaluations.filter(fe => fe.card_id !== id)
        return true
    }

    updateCard(id: string, data: Partial<Card>): Card | undefined {
        const card = this.cards.find(c => c.id === id)
        if (!card) return undefined
        if (card.status === 'closed' && data.status !== 'closed') {
            throw new Error('Esta tarjeta está cerrada y no puede ser modificada.')
        }
        const index = this.cards.findIndex(c => c.id === id)
        this.cards[index] = { ...this.cards[index], ...data }
        return this.cards[index]
    }

    closeCard(id: string): Card | undefined {
        return this.updateCard(id, { status: 'closed' })
    }

    // Card Students
    getCardStudents(cardId: string): (CardStudent & { student: Student })[] {
        return this.cardStudents
            .filter(cs => cs.card_id === cardId)
            .map(cs => ({
                ...cs,
                student: this.getStudent(cs.student_id)!
            }))
            .filter(cs => cs.student)
    }

    addStudentToCard(cardId: string, studentId: string): void {
        const card = this.getCard(cardId)
        if (card?.status === 'closed') {
            throw new Error('No se pueden agregar alumnos a una tarjeta cerrada.')
        }
        if (!this.cardStudents.find(cs => cs.card_id === cardId && cs.student_id === studentId)) {
            this.cardStudents.push({ card_id: cardId, student_id: studentId })
            const cardIndex = this.cards.findIndex(c => c.id === cardId)
            if (cardIndex !== -1) {
                this.cards[cardIndex].students_count = this.getCardStudents(cardId).length
            }
        }
    }

    removeStudentFromCard(cardId: string, studentId: string): void {
        const card = this.getCard(cardId)
        if (card?.status === 'closed') {
            throw new Error('No se pueden eliminar alumnos de una tarjeta cerrada.')
        }
        this.cardStudents = this.cardStudents.filter(
            cs => !(cs.card_id === cardId && cs.student_id === studentId)
        )
        const cardIndex = this.cards.findIndex(c => c.id === cardId)
        if (cardIndex !== -1) {
            this.cards[cardIndex].students_count = this.getCardStudents(cardId).length
        }
    }

    // Weeks
    getWeeks(cardId: string): Week[] {
        return this.weeks.filter(w => w.card_id === cardId).sort((a, b) => a.week_number - b.week_number)
    }

    getWeek(cardId: string, weekNumber: number): Week | undefined {
        return this.weeks.find(w => w.card_id === cardId && w.week_number === weekNumber)
    }

    createOrGetWeek(cardId: string, weekNumber: number, date: string): Week {
        const card = this.getCard(cardId)
        if (card?.status === 'closed') {
            throw new Error('No se pueden agregar semanas a una tarjeta cerrada.')
        }
        let week = this.getWeek(cardId, weekNumber)
        if (!week) {
            week = {
                id: generateId(),
                card_id: cardId,
                week_number: weekNumber,
                date
            }
            this.weeks.push(week)
        }
        return week
    }

    // Attendance
    getAttendance(weekId: string): (Attendance & { student: Student })[] {
        return this.attendance
            .filter(a => a.week_id === weekId)
            .map(a => ({
                ...a,
                student: this.getStudent(a.student_id)!
            }))
            .filter(a => a.student)
    }

    setAttendance(weekId: string, studentId: string, present: boolean): Attendance {
        const existing = this.attendance.find(a => a.week_id === weekId && a.student_id === studentId)
        if (existing) {
            existing.present = present
            return existing
        }
        const newAttendance: Attendance = {
            id: generateId(),
            week_id: weekId,
            student_id: studentId,
            present
        }
        this.attendance.push(newAttendance)
        return newAttendance
    }

    // Weekly Results
    getWeeklyResults(weekId: string): WeeklyResults | undefined {
        return this.weeklyResults.find(wr => wr.week_id === weekId)
    }

    setWeeklyResults(weekId: string, data: Omit<WeeklyResults, 'id' | 'week_id'>): WeeklyResults {
        const existing = this.weeklyResults.find(wr => wr.week_id === weekId)
        if (existing) {
            Object.assign(existing, data)
            return existing
        }
        const newResults: WeeklyResults = {
            id: generateId(),
            week_id: weekId,
            ...data
        }
        this.weeklyResults.push(newResults)
        return newResults
    }

    // Get totals for a card
    getCardTotals(cardId: string): { totalLessons: number; totalSmallGroup: number; totalBibleStudies: number; totalContacts: number; attendanceRate: number } {
        const weeks = this.getWeeks(cardId)
        let totalLessons = 0, totalSmallGroup = 0, totalBibleStudies = 0, totalContacts = 0
        let totalPresent = 0, totalPossible = 0

        weeks.forEach(week => {
            const results = this.getWeeklyResults(week.id)
            if (results) {
                totalLessons += results.lessons_studied_count
                totalSmallGroup += results.small_group_participation_count
                totalBibleStudies += results.bible_studies_given_count
                totalContacts += results.missionary_contacts_count
            }
            const attendance = this.getAttendance(week.id)
            totalPresent += attendance.filter(a => a.present).length
            totalPossible += attendance.length
        })

        return {
            totalLessons,
            totalSmallGroup,
            totalBibleStudies,
            totalContacts,
            attendanceRate: totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0
        }
    }

    // Quarter Goals
    getQuarterGoals(cardId: string): QuarterGoals | undefined {
        return this.quarterGoals.find(qg => qg.card_id === cardId)
    }

    setQuarterGoals(cardId: string, data: Omit<QuarterGoals, 'id' | 'card_id'>): QuarterGoals {
        const card = this.getCard(cardId)
        if (card?.status === 'closed') {
            throw new Error('No se pueden modificar metas de una tarjeta cerrada.')
        }
        const existing = this.quarterGoals.find(qg => qg.card_id === cardId)
        if (existing) {
            Object.assign(existing, data)
            return existing
        }
        const newGoals: QuarterGoals = {
            id: generateId(),
            card_id: cardId,
            ...data
        }
        this.quarterGoals.push(newGoals)
        return newGoals
    }

    // Final Evaluation
    getFinalEvaluation(cardId: string): { id: string; card_id: string; summary_text: string; created_at: string } | undefined {
        return this.finalEvaluations.find(fe => fe.card_id === cardId)
    }

    setFinalEvaluation(cardId: string, summaryText: string): { id: string; card_id: string; summary_text: string; created_at: string } {
        const card = this.getCard(cardId)
        if (card?.status === 'closed') {
            throw new Error('No se puede modificar la evaluación de una tarjeta cerrada.')
        }
        const existing = this.finalEvaluations.find(fe => fe.card_id === cardId)
        if (existing) {
            existing.summary_text = summaryText
            return existing
        }
        const newEval = {
            id: generateId(),
            card_id: cardId,
            summary_text: summaryText,
            created_at: new Date().toISOString()
        }
        this.finalEvaluations.push(newEval)
        return newEval
    }

    getAbsenteeismAlerts(): AttendanceAlert[] {
        const start = Date.now()
        // Simulate real DB load if no indexes (SRE Heuristic)
        if (!this.hasIndexes && this.students.length > 50) {
            console.warn(`[SRE] Alerta: Sin índices en columnas críticas. Iniciado a ${start}. SQL Scan demorado.`);
            // Simulate 300ms delay as requested > 200ms
            const wait = Date.now() + 300;
            while (Date.now() < wait);
        }

        const alerts: AttendanceAlert[] = []
        this.students.forEach(student => {
            const memberships = this.cardStudents.filter(cs => cs.student_id === student.id)
            memberships.forEach(m => {
                const card = this.getCard(m.card_id)
                if (!card || card.status === 'closed') return
                const cardWeeks = this.getWeeks(card.id).sort((a, b) => b.week_number - a.week_number)
                let consecutiveAbsences = 0
                let lastPresence: string | undefined = undefined
                for (const week of cardWeeks) {
                    const att = this.attendance.find(a => a.week_id === week.id && a.student_id === student.id)
                    if (att && !att.present) {
                        consecutiveAbsences++
                    } else if (att && att.present) {
                        lastPresence = week.date
                        break
                    }
                }
                if (consecutiveAbsences >= 2) {
                    alerts.push({
                        student_id: student.id,
                        student_name: student.name,
                        class_name: card.class_name || 'Sin Clase',
                        consecutive_absences: consecutiveAbsences,
                        last_presence: lastPresence,
                        status: consecutiveAbsences >= 3 ? 'urgent' : 'warning'
                    })
                }
            })
        })
        return alerts
    }

    getAlerts(resolved: boolean = false): Alert[] {
        return this.alerts.filter(a => a.resolved === resolved)
    }

    resolveAlert(id: string): void {
        const alert = this.alerts.find(a => a.id === id)
        if (alert) alert.resolved = true
    }

    addPerformanceIndexes(): void {
        console.log('[SRE] Aplicando índices autónomos: idx_attendance_date, idx_attendance_student_id');
        this.hasIndexes = true;
    }

    verifyCredentials(email: string, password: string) {
        return DEMO_CREDENTIALS.find(u => u.email === email && u.password === password)
    }

    addStudentToClass(studentId: string, classId: string): boolean {
        // Find the active card for this class (in_progress)
        const activeCard = this.cards.find(c => c.class_id === classId && c.status === 'in_progress')
        if (activeCard) {
            this.addStudentToCard(activeCard.id, studentId)
            return true
        }
        return false
    }
}



// Singleton instance
export const mockStore = new MockStore()

