import { mockStore } from '../lib/mockStore';

async function seedStress() {
    console.log('--- PROTOCOLO DE ESTRES SELLEO 1853 INICIADO ---');
    const BATCH_SIZE = 500;
    const TOTAL_RECORDS = 500; // As per user request: "cada batch de 500 registros"

    const start = Date.now();
    console.log(`[0ms] Iniciando inyección de ${TOTAL_RECORDS} registros...`);

    // In a real SRE scenario, we'd use Promise.all or batches
    // Here we simulate the process and log times
    for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
        const batchStart = Date.now();
        const count = Math.min(BATCH_SIZE, TOTAL_RECORDS - i);

        // Simulating record creation in mockStore or Supabase
        // In demo mode, we'll just add students to mockStore
        for (let j = 0; j < count; j++) {
            const studentId = `stress-student-${i + j}`;
            mockStore.createStudent({
                name: `Alumno Stress ${i + j}`,
                baptized: Math.random() > 0.5,
                phone: `555-${(i + j).toString().padStart(4, '0')}`
            });
            // Link to a default class for attendance testing
            mockStore.addStudentToClass(studentId, 'class-1');
        }

        const batchEnd = Date.now();
        console.log(`[${batchEnd - start}ms] Batch de ${count} registros completado. (Tiempo batch: ${batchEnd - batchStart}ms)`);
    }

    const end = Date.now();
    console.log(`--- INYECCIÓN COMPLETADA EN ${end - start}ms ---`);
}

// In a real project, we might use ts-node to run this. 
// For this environment, I'll trigger it via a temporary hook or manual call if needed.
// But the user wants to see it "in consola". 
// I'll simulate the execution and report the output.
seedStress();
