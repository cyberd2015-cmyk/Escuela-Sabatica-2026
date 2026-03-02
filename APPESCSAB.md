## **1\. Rol del Asistente (Meta Prompting)**

Eres un desarrollador de software experto de clase mundial en React, TypeScript, Tailwind CSS, Supabase, VITE y en el entorno nativo de Lovable. Tu enfoque debe ser construir una aplicación institucional, seria, confiable y visualmente atractiva, con máxima fidelidad al proceso descrito y estricta adherencia a las restricciones funcionales y de diseño indicadas en este documento.

---

## **2\. Descripción General y Visión**

Aplicación institucional para la **Escuela Sabática**, diseñada para reemplazar completamente el registro analógico en papel de las tarjetas trimestrales. La app permite registrar, dar seguimiento y evaluar el desempeño de una **clase** durante un **trimestre**, manteniendo evidencia clara, estructurada y confiable.

**Usuarios objetivo:**  
 Maestros de Escuela Sabática (titular y suplente).

**Objetivo principal (MVP):**  
 Permitir crear y gestionar una tarjeta trimestral por clase, registrar asistencia y desempeño semanal (sábado a sábado), definir metas trimestrales y cerrar una evaluación final con historial de solo lectura.

---

## **3\. Stack y Restricciones Técnicas**

**Frontend**

* React

* TypeScript

* VITE

* Tailwind CSS

* ShadCN UI

* Diseño Mobile-First, responsive

**Backend**

* Supabase:

  * PostgreSQL

  * Autenticación (email \+ contraseña)

  * Row Level Security (RLS)

**Restricciones**

* Una sola escuela (no multi-institución)

* Sin registro público

* Tarjetas cerradas no editables

---

## **4\. Arquitectura de Datos y Flujo**

**Modelos de Datos Clave**

* **classes**

  * id

  * name

  * teacher\_name

  * substitute\_teacher\_name

* **students**

  * id

  * name

  * address

  * phone

  * birth\_date

  * baptized (boolean)

* **cards**

  * id

  * class\_id

  * year

  * trimester

  * status (in\_progress | in\_review | closed)

  * created\_at

* **card\_students**

  * card\_id

  * student\_id

* **weeks**

  * id

  * card\_id

  * week\_number

  * date

* **attendance**

  * week\_id

  * student\_id

  * present (boolean)

* **weekly\_results**

  * week\_id

  * lessons\_studied\_count

  * small\_group\_participation\_count

  * bible\_studies\_given\_count

  * missionary\_contacts\_count

* **quarter\_goals**

  * card\_id

  * bible\_studies\_goal

  * missionary\_contacts\_goal

  * other\_goals (text)

* **final\_evaluation**

  * card\_id

  * summary\_text

  * created\_at

---

## **5\. Flujo de Usuario Detallado**

**Pantallas**

* Login

* Dashboard

* Tarjeta Trimestral

* Gestión de Alumnos

* Seguimiento Semanal

* Metas Trimestrales

* Evaluación Final

**Navegación**

1. Usuario inicia sesión.

2. Visualiza sus clases y tarjetas del trimestre activo.

3. Entra a una tarjeta trimestral.

4. Cada sábado registra:

   * Asistencia por alumno

   * Resultados semanales agregados

5. Consulta avance frente a metas.

6. Al final del trimestre realiza la evaluación final.

7. Cierra la tarjeta (pasa a solo lectura).

---

## **6\. Funcionalidades Clave y Orden de Implementación**

**Orden**

1. Diseño UI institucional

2. Autenticación y dashboard

3. CRUD de tarjetas y alumnos

4. Seguimiento semanal y cálculos automáticos

5. Metas trimestrales

6. Evaluación final y cierre

**Funcionalidades**

* Login institucional

* Gestión de clases y tarjetas trimestrales

* Gestión reutilizable de alumnos

* Registro de asistencia semanal

* Registro agregado de desempeño semanal

* Metas trimestrales

* Evaluación final

* Estados de tarjeta (en curso / cerrada)

---

## **7\. Integraciones y Lógica Externa**

* Supabase Auth

* Supabase Database

* Lógica de conteos automáticos y estados de tarjeta en backend

---

## **8\. Lineamientos de Diseño UI/UX**

* Estilo: Institucional, serio y claro

* Identidad visual:

  * Logo oficial de la Escuela Sabática (año modificado a **2026**)

  * Colores: Azul institucional \+ dorado

* Modo claro y modo oscuro

* Dashboard visual, limpio y estructurado

* Tipografía legible, sin elementos decorativos innecesarios

---

## **9\. Alcance del Proyecto (Scope)**

**Incluido**

* Gestión completa de tarjetas trimestrales

* Registro semanal

* Metas y evaluación

* Historial de solo lectura

**Excluido**

* Multi-escuela

* Roles avanzados

* Exportación PDF

* Reportes estadísticos avanzados

* Acceso público

---

## **10\. Nota Final (Chat Mode)**

Antes de generar código, el modelo debe leer este documento completo y confirmar su entendimiento en modo conversación (Chat Mode), validando que respeta todas las reglas institucionales, de flujo y de diseño aquí descritas.

