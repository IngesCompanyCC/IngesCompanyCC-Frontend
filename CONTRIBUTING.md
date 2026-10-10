# Guía de Contribución

Todo el equipo de IngesCompanyCC debe seguir estas reglas para mantener la calidad y el orden del código y la documentación.

## 1. Flujo de Trabajo (GitFlow)

* **`main`**: Solo código en producción y versiones entregables.
* **`develop`**: Rama de integración donde se junta el trabajo de todos.
* **`feature/*`**: Ramas para crear nuevas vistas, funciones o secciones del informe (ej. `feature/ux-ui-chapter`).

## 2. Convenciones de Commits (Conventional Commits)

Cada commit debe estar en **inglés** y seguir este formato: `<tipo>(<contexto>): <descripción>`

* `feat:` Para nuevas funcionalidades o nuevas secciones del informe.
* `fix:` Para corregir errores o typos.
* `docs:` Para actualizar documentación, el README o el informe.
* `refactor:` Para reescribir código sin cambiar su comportamiento.

**Ejemplo:** `docs(report): add event storming diagrams to chapter 2`