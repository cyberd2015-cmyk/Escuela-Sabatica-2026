// Database Types for APPES

export interface Class {
    id: string
    name: string
    teacher_name: string
    substitute_teacher_name?: string
    created_by: string
    created_at: string
}

export interface Student {
    id: string
    name: string
    class_id?: string
    address?: string
    phone?: string
    birth_date?: string
    baptized: boolean
    created_by: string
    created_at: string
}

export type CardStatus = 'in_progress' | 'in_review' | 'closed'

export interface Card {
    id: string
    class_id: string
    class_name?: string // Joined from classes
    year: number
    trimester: 1 | 2 | 3 | 4
    status: CardStatus
    created_at: string
    // Computed fields
    students_count?: number
    weeks_completed?: number
    progress?: number
}

export interface CardStudent {
    card_id: string
    student_id: string
    student?: Student // Joined
}

export interface Week {
    id: string
    card_id: string
    week_number: number
    date: string
}

export interface Attendance {
    id: string
    week_id: string
    student_id: string
    present: boolean
}

export interface WeeklyResults {
    id: string
    week_id: string
    lessons_studied_count: number
    small_group_participation_count: number
    bible_studies_given_count: number
    missionary_contacts_count: number
}

export interface QuarterGoals {
    id: string
    card_id: string
    bible_studies_goal: number
    missionary_contacts_goal: number
    other_goals?: string
}

export interface FinalEvaluation {
    id: string
    card_id: string
    summary_text: string
    created_at: string
}

export interface AttendanceAlert {
    student_id: string
    student_name: string
    class_name: string
    consecutive_absences: number
    last_presence?: string
    status: 'urgent' | 'warning'
}

export interface Alert {
    id: string
    student_id: string
    type: 'absenteeism' | 'birthday' | 'custom'
    message: string
    resolved: boolean
    created_at: string
}

// Form types
export interface CardFormData {
    class_id: string
    year: number
    trimester: 1 | 2 | 3 | 4
}

export interface StudentFormData {
    name: string
    address?: string
    phone?: string
    birth_date?: string
    baptized: boolean
}

export interface ClassFormData {
    name: string
    teacher_name: string
    substitute_teacher_name?: string
}
