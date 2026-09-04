# Gestor de Tareas y Proyectos - Frontend React & TypeScript

Aplicación web desarrollada en React y TypeScript con Material-UI (MUI) que permite la gestión completa (CRUD) de tareas asociadas a proyectos, integrándose con una API REST remota mediante autenticación JWT.

## Características Principales

* **Gestión de Tareas (CRUD completo):**
* **Listar tareas (`GET /tasks`):** Visualización paginada con filtrado en tiempo real por título o descripción.
* **Crear tarea (`POST /projects/{projectId}/tasks`):** Permite registrar nuevas tareas asignadas a un proyecto específico.
* **Consultar por ID (`GET /tasks/{id}`):** Visualización detallada de los datos de una tarea específica.
* **Reemplazar tarea (`PUT /tasks/{id}`):** Actualización integral de los atributos de una tarea.
* **Cambiar Estado (`PATCH /tasks/{id}/status`):** Modificación dinámica de estados (`TODO`, `IN_PROGRESS`, `DONE`) respetando las validaciones de negocio del backend (como la restricción del estado `DONE` en tareas sin responsable).
* **Eliminar tarea (`DELETE /tasks/{id}`):** Borrado de tareas con confirmación previa.


* **Autenticación JWT:** Soporte para token de autorización Bearer configurable y persistente mediante `localStorage`.
* **Interfaz Responsiva:** Diseñada con componentes de Material-UI para una experiencia de usuario limpia y moderna.

## Tecnologías Utilizadas

* React
* TypeScript
* Material-UI (MUI)
* Vite / GitHub Pages

## Instalación y Ejecución Local

1. Clonar el repositorio e instalar las dependencias:
```bash
npm install

```


2. Ejecutar el entorno de desarrollo local:
```bash
npm run dev

```


3. Compilar el proyecto para producción:
```bash
npm run build

```


4. Desplegar en GitHub Pages:
```bash
npm run deploy

```



## Configuración de la API

La aplicación se comunica con la API REST remota mediante la siguiente URL base configurada en el sistema:

```typescript
const baseUrl = "https://d3ujwk09smrk9z.cloudfront.net";

```
