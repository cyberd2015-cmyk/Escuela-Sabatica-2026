---
trigger: always_on
---

1. Principios Rectores del Proyecto
1.1 Fidelidad al proceso real

La aplicación no debe reinterpretar ni simplificar en exceso el proceso manual existente.

Toda funcionalidad debe corresponder a una necesidad real del registro trimestral en papel.

La tarjeta trimestral es la unidad central del sistema.

1.2 Institucionalidad

El sistema debe reflejar:

Seriedad

Orden

Claridad

Confiabilidad

Evitar estilos, animaciones o micro-interacciones que resten formalidad.

1.3 Simplicidad funcional

Priorizar claridad sobre complejidad.

Ninguna funcionalidad “extra” fuera del alcance definido debe introducirse sin validación explícita.

2. Reglas de Arquitectura
2.1 Separación de responsabilidades

UI (presentación) separada de lógica de negocio.

Lógica de negocio reutilizable y testeable.

Acceso a datos encapsulado (services / hooks).

2.2 Fuente única de verdad

Supabase (PostgreSQL) es la fuente única de datos.

Evitar estados duplicados o cálculos inconsistentes entre frontend y backend.

2.3 Estados inmutables críticos

Una tarjeta cerrada:

No puede editarse

No puede reabrirse

No puede eliminarse

Estas reglas deben validarse:

En frontend (UX)

En backend (RLS / constraints)

3. Reglas de Datos
3.1 Integridad histórica

Nunca borrar información histórica relevante.

Alumnos eliminados de una tarjeta:

No deben afectar tarjetas cerradas

No deben borrar registros históricos

3.2 Cálculos automáticos

Totales semanales y trimestrales deben:

Calcularse automáticamente

No ingresarse manualmente

Evitar campos derivados persistidos innecesariamente.

3.3 Validaciones obligatorias

Campos críticos (fechas, conteos, asistencia) deben validarse antes de guardar.

No permitir registros inconsistentes (ej. conteos negativos).

4. Autenticación y Permisos
4.1 Acceso

No existe registro público.

Acceso solo por usuarios previamente creados.

4.2 Roles

Maestro titular y suplente:

Mismos permisos de lectura y escritura.

No existen roles administrativos en el MVP.

4.3 Seguridad

Implementar Row Level Security (RLS) en Supabase.

Validar siempre que el usuario tenga acceso a la tarjeta que intenta modificar.

5. Buenas Prácticas de UI/UX
5.1 Identidad visual

Uso obligatorio del logo institucional (año 2026).

Colores base:

Azul institucional (primario)

Dorado (acento)

Modo claro y modo oscuro consistentes.

5.2 Claridad antes que densidad

Tablas legibles.

Etiquetas claras.

Evitar sobrecargar una sola vista con demasiada información.

5.3 Feedback al usuario

Confirmaciones claras al:

Guardar

Cerrar una tarjeta

Eliminar un alumno

Advertencias explícitas para acciones irreversibles.

6. Reglas de Desarrollo Frontend
6.1 Componentes

Componentes pequeños, reutilizables y bien nombrados.

Evitar componentes “Dios” con demasiada lógica.

6.2 Tipado

TypeScript estricto.

No usar any.

Tipos compartidos entre frontend y backend cuando sea posible.

6.3 Estado

Minimizar estado global.

Preferir estado local y hooks especializados.

Sincronizar estado con backend de forma explícita.

7. Reglas de Backend (Supabase)
7.1 Base de datos

Nombres de tablas y columnas claros y consistentes.

Uso de claves foráneas para mantener integridad.

7.2 Seguridad

RLS activo en todas las tablas sensibles.

Ninguna operación crítica debe depender solo del frontend.

7.3 Migraciones

Todas las modificaciones de esquema deben versionarse.

Nunca modificar datos productivos sin respaldo.

8. Flujo de Desarrollo
8.1 Orden recomendado

Modelos de datos

RLS y permisos

UI base (layout + navegación)

CRUD principal

Lógica de negocio

Validaciones

Refinamiento visual

8.2 Cambios de alcance

Cualquier cambio que:

Afecte datos históricos

Modifique el flujo trimestral

Introduzca nuevos roles
debe validarse explícitamente antes de implementarse.

9. Mantenibilidad y Futuro
9.1 Código legible

Priorizar código entendible sobre “ingenioso”.

Comentarios solo donde el por qué no sea obvio.

9.2 Preparación para v2

Diseñar pensando en:

Exportación PDF futura

Reportes

Nuevos roles

Sin implementar estas funciones en el MVP.

10. Regla Final (No negociable)

Si una funcionalidad no existe en la tarjeta física o no apoya directamente el control, seguimiento o evaluación institucional, no debe implementarse en el MVP.