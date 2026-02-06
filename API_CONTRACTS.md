# Documento de Contratos de API - Sistema de Agendamiento

## 📢 NOTAS IMPORTANTES PARA EL FRONTEND

**Fecha de Actualización:** 2026-01-22  
**Versión:** 1.2

### ✅ Cambios Implementados

Se han realizado las siguientes actualizaciones solicitadas por el frontend:

#### 1. Dashboard - Reservas del Último Mes (ACTUALIZADO)
**Endpoint:** `GET /api/dashboard/last-month-reservations`

**Cambio:** Ahora incluye array `reservations` con todas las reservaciones del último mes, incluyendo relaciones completas (teacher, student, classType, resource).

**Nueva estructura de respuesta:**
```json
{
  "status": "success",
  "message": "Reservaciones del último mes",
  "data": {
    "total": 45,
    "confirmed": 40,
    "scheduled": 3,
    "cancelled": 2,
    "reservations": [ /* array completo de reservaciones */ ]
  }
}
```

#### 2. Dashboard - Clases Completadas (ACTUALIZADO)
**Endpoint:** `GET /api/dashboard/completed-reservations`

**Cambios:**
- ✅ Ahora incluye array `reservations` con todas las reservaciones completadas
- ✅ Soporta query parameter `teacher` para filtrar por profesor
- ✅ Cada reservación incluye campo `attended` (boolean)
- ✅ Incluye relaciones completas: teacher, student, classType, resource

**Nueva estructura de respuesta:**
```json
{
  "status": "success",
  "message": "Reservaciones completadas",
  "data": {
    "total": 120,
    "attended": 118,
    "not_attended": 2,
    "completion_rate": 98.33,
    "reservations": [ /* array con campo 'attended' en cada item */ ]
  }
}
```

**Query parameter soportado:**
```
GET /api/dashboard/completed-reservations?teacher=2
```

#### 3. Teachers - Obtener por ID (NUEVO)
**Endpoint:** `GET /api/teachers/{id}`

**Cambio:** Ahora retorna formato consistente con `ResponseHelper::success()`.

**Nueva estructura de respuesta:**
```json
{
  "status": "success",
  "message": "Profesor obtenido correctamente",
  "data": {
    "id": 2,
    "name": "María",
    "last_name": "García",
    /* ... otros campos */
  }
}
```

#### 4. Students - Obtener por ID (NUEVO)
**Endpoint:** `GET /api/students/{id}`

**Cambio:** Ahora retorna formato consistente con `ResponseHelper::success()`.

**Nueva estructura de respuesta:**
```json
{
  "status": "success",
  "message": "Estudiante obtenido correctamente",
  "data": {
    "id": 1,
    "name": "Juan",
    "last_name": "Pérez",
    /* ... otros campos */
  }
}
```

#### 5. Resources - Obtener por ID (ACTUALIZADO)
**Endpoint:** `GET /api/resources/{id}`

**Cambio:** Ahora retorna formato consistente con `ResponseHelper::success()`.

**Nota:** Los endpoints obsoletos `/api/teachers/availability` y `/api/teachers/availability/all` han sido eliminados. Use `/api/teacher-schedules` en su lugar, que cumple con todos los requisitos de funcionalidad.

**Nueva estructura de respuesta:**
```json
{
  "status": "success",
  "message": "Recurso obtenido correctamente",
  "data": {
    "id": 1,
    "name": "Aula 101",
    "type": "classroom",
    "teachers": [ /* ... */ ]
  }
}
```

### 📋 Resumen de Cambios

| Endpoint | Cambio | Estado |
|----------|--------|--------|
| `GET /api/dashboard/last-month-reservations` | Agregado array `reservations` + estadísticas | ✅ COMPLETADO |
| `GET /api/dashboard/completed-reservations` | Agregado array `reservations` + campo `attended` + soporte `teacher` param | ✅ COMPLETADO |
| `GET /api/teachers/{id}` | Formato consistente con ResponseHelper | ✅ COMPLETADO |
| `GET /api/students/{id}` | Formato consistente con ResponseHelper | ✅ COMPLETADO |
| `GET /api/resources/{id}` | Formato consistente con ResponseHelper | ✅ COMPLETADO |

### 🔄 Compatibilidad

Todos los cambios son **retrocompatibles**. Los endpoints existentes siguen funcionando, pero ahora retornan datos más completos y formatos más consistentes.

### 📝 Notas Adicionales

- El campo `attended` en las reservaciones completadas se calcula basándose en `attendance_status` ('attended' o 'late' = true, otros = false)
- Las estadísticas en los endpoints del dashboard se calculan en tiempo real
- Todos los endpoints ahora usan el formato estándar `ResponseHelper::success()` para consistencia

---

## Información General

### Base URL
```
http://localhost:8000/api
```
*Nota: Ajustar según el entorno de despliegue*

### Autenticación
La API utiliza **Laravel Sanctum** para autenticación mediante tokens Bearer.

**Formato del header:**
```
Authorization: Bearer {token}
```

Los tokens se obtienen mediante los endpoints de autenticación (`/register` o `/login`).

### Formato de Respuestas

#### Respuesta Exitosa (ResponseHelper::success)
```json
{
  "status": "success",
  "message": "Mensaje descriptivo",
  "data": { /* datos de respuesta */ }
}
```

#### Respuesta de Error (ResponseHelper::error)
```json
{
  "status": "error",
  "message": "Mensaje de error",
  "errors": { /* errores de validación (opcional) */ }
}
```

#### Respuesta Paginada (ResponseHelper::paginated)
```json
{
  "status": "success",
  "message": "Mensaje descriptivo",
  "data": [ /* array de items */ ],
  "pagination": {
    "total": 100,
    "per_page": 10,
    "current_page": 1,
    "last_page": 10,
    "next_page_url": "http://...",
    "prev_page_url": null
  }
}
```

### Códigos de Estado HTTP
- `200` - OK (operación exitosa)
- `201` - Created (recurso creado)
- `400` - Bad Request (error de validación)
- `401` - Unauthorized (no autenticado)
- `404` - Not Found (recurso no encontrado)
- `422` - Unprocessable Entity (error de validación de negocio)

---

## 1. Autenticación

### 1.1 Registrar Usuario
**POST** `/api/register`

**Autenticación:** No requerida

**Body:**
```json
{
  "name": "Juan",
  "document": "12345678",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Validaciones:**
- `name`: requerido, string, máximo 255 caracteres
- `document`: requerido, integer, único en la tabla users
- `password`: requerido, mínimo 6 caracteres, debe coincidir con `password_confirmation`

**Response 201:**
```json
{
  "message": "Usuario creado correctamente",
  "user": {
    "id": 1,
    "name": "Juan",
    "document": "12345678",
    "email": null,
    "role": "user",
    "active": true,
    "created_at": "2026-01-20T10:00:00.000000Z",
    "updated_at": "2026-01-20T10:00:00.000000Z"
  },
  "token": "1|abcdef123456...",
  "token_type": "Bearer"
}
```

**Response 422 (Error de validación):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "document": ["The document has already been taken."],
    "password": ["The password confirmation does not match."]
  }
}
```

---

### 1.2 Iniciar Sesión
**POST** `/api/login`

**Autenticación:** No requerida

**Body:**
```json
{
  "document": "12345678",
  "password": "password123"
}
```

**Validaciones:**
- `document`: requerido
- `password`: requerido

**Response 200:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "name": "Juan",
    "document": "12345678",
    "email": null,
    "role": "user",
    "active": true
  },
  "token": "2|xyz789abc...",
  "token_type": "Bearer"
}
```

**Response 422 (Credenciales incorrectas):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "document": ["Credenciales incorrectas"]
  }
}
```

---

### 1.3 Cerrar Sesión
**POST** `/api/logout`

**Autenticación:** Requerida (Bearer Token)

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

---

### 1.4 Obtener Usuario Actual
**GET** `/api/me`

**Autenticación:** Requerida (Bearer Token)

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "Juan",
  "last_name": "Pérez",
  "document": "12345678",
  "email": "juan@example.com",
  "number_phone": "3001234567",
  "role": "user",
  "active": true,
  "email_verified_at": "2026-01-20T10:00:00.000000Z",
  "created_at": "2026-01-20T10:00:00.000000Z",
  "updated_at": "2026-01-20T10:00:00.000000Z"
}
```

---

## 2. Citas (Appointments)

### 2.1 Listar Citas Activas
**GET** `/api/appointments`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `teacher_id` (integer): Filtrar por ID de profesor
- `student_id` (integer): Filtrar por ID de estudiante
- `date` (date): Filtrar por fecha (formato: YYYY-MM-DD)

**Ejemplo:**
```
GET /api/appointments?teacher_id=1&date=2026-01-25
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de citas activas",
  "data": [
    {
      "id": 1,
      "teacher_id": 2,
      "student_id": 1,
      "class_type_id": 1,
      "resource_id": 3,
      "date": "2026-01-25",
      "start_time": "09:00:00",
      "end_time": "10:00:00",
      "status": "confirmed",
      "teacher": {
        "id": 2,
        "name": "María",
        "document": "87654321"
      },
      "student": {
        "id": 1,
        "name": "Juan",
        "document": "12345678"
      },
      "classType": {
        "id": 1,
        "name": "Clase Presencial",
        "requires_resource": true
      },
      "resource": {
        "id": 3,
        "name": "Aula 101",
        "type": "classroom"
      }
    }
  ]
}
```

**Nota:** Solo retorna citas con status `scheduled` o `confirmed`.

---

### 2.2 Obtener Cita por ID
**GET** `/api/appointments/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID de la cita

**Response 200:**
```json
{
  "status": "success",
  "message": "Cita obtenida correctamente",
  "data": {
    "id": 1,
    "teacher_id": 2,
    "student_id": 1,
    "class_type_id": 1,
    "resource_id": 3,
    "date": "2026-01-25",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "status": "confirmed",
    "teacher": { /* objeto User */ },
    "student": { /* objeto User */ },
    "classType": { /* objeto ClassType */ },
    "resource": { /* objeto Resource */ }
  }
}
```

---

### 2.3 Crear Cita
**POST** `/api/appointments`

**Autenticación:** Requerida

**Body:**
```json
{
  "teacher_id": 2,
  "student_id": 1,
  "class_type_id": 1,
  "resource_id": 3,
  "date": "2026-01-25",
  "start_time": "09:00",
  "end_time": "10:00",
  "status": "scheduled"
}
```

**Validaciones:**
- `teacher_id`: opcional, debe existir en users
- `student_id`: opcional, debe existir en users
- `class_type_id`: requerido, debe existir en class_types
- `resource_id`: opcional, debe existir en resources
- `date`: requerido, formato fecha (YYYY-MM-DD)
- `start_time`: requerido, formato hora (HH:i)
- `end_time`: requerido, formato hora (HH:i), debe ser posterior a start_time
- `status`: opcional, valores permitidos: `scheduled`, `confirmed`, `cancelled`, `completed`

**Validaciones de Negocio:**
- Si se proporciona `resource_id`, se valida que el recurso no esté ocupado en ese horario.
- Si se proporciona `resource_id` y `teacher_id`, se valida que el slot no esté bloqueado por un **bloque de disponibilidad del recurso** (mantenimiento/taller, `ResourceAvailabilityBlock`) ni por un **bloqueo docente-recurso** (`TeacherResourceBlock`) para ese profesor y recurso en esa fecha/hora. Si el slot está bloqueado → **422** con mensaje "El recurso no está disponible en ese horario (bloqueo o mantenimiento)."
- Si se proporciona `student_id`, el mismo estudiante no puede tener ya una cita activa (scheduled/confirmed) del mismo tipo de clase en la misma fecha y horario solapado. Si ya tiene agendada esa clase en ese slot → **422**.
- Si se proporciona `student_id` y el estudiante tiene `access_start_date` y `access_end_date` definidos en el modelo User, la fecha de la cita debe estar dentro de ese rango (incluidos). Si no → **422**.
- Si se proporciona `student_id` y está configurado el límite de horas por periodo (`student_max_hours_per_period` > 0), se valida que la suma de horas ya agendadas del estudiante en ese periodo (según `student_hours_period_type`: week / fortnight / month) más la duración del slot a crear no supere el límite. Si se supera → **422**.

**Response 201:**
```json
{
  "status": "success",
  "message": "Cita creada correctamente",
  "data": {
    "id": 1,
    "teacher_id": 2,
    "student_id": 1,
    "class_type_id": 1,
    "resource_id": 3,
    "date": "2026-01-25",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "status": "scheduled",
    "teacher": { /* objeto User */ },
    "student": { /* objeto User */ },
    "classType": { /* objeto ClassType */ },
    "resource": { /* objeto Resource */ }
  }
}
```

**Response 422 (Recurso ocupado):**
```json
{
  "status": "error",
  "message": "El recurso ya está ocupado en ese horario",
  "errors": []
}
```

**Response 422 (Recurso bloqueado por mantenimiento o bloqueo docente-recurso):**
```json
{
  "status": "error",
  "message": "El recurso no está disponible en ese horario (bloqueo o mantenimiento).",
  "errors": []
}
```

**Response 422 (Estudiante ya tiene esa clase en ese horario):**
```json
{
  "status": "error",
  "message": "Ya tiene agendada una clase de este tipo en ese horario. No puede reservar dos veces el mismo espacio.",
  "errors": []
}
```

**Response 422 (Límite de horas por periodo):**
```json
{
  "status": "error",
  "message": "Ha alcanzado el máximo de X horas para este periodo.",
  "errors": []
}
```

**Response 422 (Fecha fuera de periodo de acceso del estudiante):**
```json
{
  "status": "error",
  "message": "La fecha de la cita está fuera de tu periodo de acceso (desde DD/MM/YYYY hasta DD/MM/YYYY).",
  "errors": []
}
```

---

### 2.4 Actualizar Cita
**PUT** `/api/appointments/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID de la cita

**Body:** (mismos campos que crear)

**Validaciones de Negocio (con student_id):**
- Rango de acceso del estudiante: si tiene `access_start_date` y `access_end_date` definidos, la fecha de la cita debe estar dentro del rango. Si no → **422**.
- Límite de clases por semana y por día (igual que en crear). Si se supera → **422**.
- Límite de horas por periodo: si `student_max_hours_per_period` > 0, se calculan las horas ya agendadas del estudiante en el periodo (excluyendo esta cita) más las horas del nuevo slot; si el total supera el límite → **422**.
- Si se proporcionan `resource_id` y `teacher_id`: se valida que el slot no esté bloqueado por `ResourceAvailabilityBlock` ni por `TeacherResourceBlock`. Si está bloqueado → **422** con mensaje "El recurso no está disponible en ese horario (bloqueo o mantenimiento)."

**Response 200:**
```json
{
  "status": "success",
  "message": "Cita actualizada correctamente",
  "data": { /* objeto Appointment actualizado */ }
}
```

---

### 2.5 Eliminar Cita
**DELETE** `/api/appointments/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID de la cita

**Response 200:**
```json
{
  "status": "success",
  "message": "Cita eliminada correctamente",
  "data": []
}
```

---

### 2.6 Listar Todas las Citas (Incluye canceladas y completadas)
**GET** `/api/appointments-all`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- Mismos que en 2.1

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado completo de citas",
  "data": [ /* array de todas las citas, incluyendo canceladas y completadas */ ]
}
```

---

### 2.7 Cambiar Estado de Cita
**PATCH** `/api/appointments/{id}/status`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID de la cita

**Body:**
```json
{
  "status": "confirmed"
}
```

**Validaciones:**
- `status`: requerido, valores permitidos: `scheduled`, `confirmed`, `cancelled`, `completed`

**Validaciones de Negocio:**
- No se puede modificar una cita con status `completed`
- Si `status` = `cancelled` y la cita tiene `student_id`: se aplican las reglas de cancelación parametrizables. Si `cancellation_allow_after_limit` = false y la cancelación es tardía (menos de `cancellation_hours_limit` horas antes) → **422**. Si se permite, se aplica multa por cancelación tardía cuando `cancellation_late_penalty_enabled` = true.

**Response 200:**
```json
{
  "status": "success",
  "message": "Estado de la cita actualizado",
  "data": {
    "id": 1,
    "status": "confirmed",
    /* otros campos */
  }
}
```

**Response 422 (Cita finalizada):**
```json
{
  "status": "error",
  "message": "No se puede modificar una clase finalizada",
  "errors": []
}
```

**Response 422 (Cancelación no permitida):**
```json
{
  "status": "error",
  "message": "No puede cancelar; ha superado el tiempo límite.",
  "errors": []
}
```

---

## 3. Disponibilidad de Citas

### 3.1 Obtener Horarios Disponibles
**GET** `/api/appointments/available-slots`

**Autenticación:** Requerida

**Query Parameters:**
- `teacher_id` (integer, opcional): ID del profesor
- `date` (date, opcional): Fecha a consultar (formato: YYYY-MM-DD)
- `class_type_id` (integer, opcional): ID del tipo de clase
- `resource_id` (integer, opcional): ID del recurso (requerido si el tipo de clase requiere recurso)

**Ejemplo:**
```
GET /api/appointments/available-slots?teacher_id=2&date=2026-01-25&class_type_id=1&resource_id=3
```

**Validaciones:**
- Si `class_type_id` requiere recurso (`requires_resource = true`), entonces `resource_id` es obligatorio

**Response 200:**
```json
{
  "status": "success",
  "message": "Disponibilidad obtenida correctamente",
  "data": {
    "date": "2026-01-25",
    "slots": [
      {
        "start": "09:00",
        "end": "09:30"
      },
      {
        "start": "09:30",
        "end": "10:00"
      },
      {
        "start": "10:00",
        "end": "10:30"
      }
    ]
  }
}
```

**Response 422 (Recurso requerido):**
```json
{
  "status": "error",
  "message": "The given data was invalid.",
  "errors": {
    "resource_id": ["Este tipo de clase requiere un recurso"]
  }
}
```

**Nota:** Los slots se generan basándose en:
- Horarios del profesor para ese día de la semana
- Bloques de tiempo bloqueados del profesor (`TeacherBlockedTime`)
- Citas existentes del profesor
- Si requiere recurso: citas existentes del recurso; **bloques de disponibilidad del recurso** (`ResourceAvailabilityBlock`: mantenimiento/taller) que solapen el slot; **bloqueos docente-recurso** (`TeacherResourceBlock`) para ese profesor y recurso en esa fecha. Un slot no se ofrece si el recurso está en mantenimiento o el docente tiene bloqueado ese recurso en ese horario.

---

## 4. Recursos (Resources)

### 4.1 Listar Recursos
**GET** `/api/resources`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `type` (string): Filtrar por tipo (`classroom` o `vehicle`)
- `per_page` (integer): Items por página (default: 10)

**Ejemplo:**
```
GET /api/resources?type=vehicle&per_page=20
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Recursos listados correctamente",
  "data": [
    {
      "id": 1,
      "name": "Aula 101",
      "type": "classroom",
      "plate": null,
      "brand": null,
      "model": null,
      "year": null,
      "color": null,
      "active": true,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Mazda 2",
      "type": "vehicle",
      "plate": "ABC123",
      "brand": "Mazda",
      "model": "2",
      "year": 2020,
      "color": "Rojo",
      "active": true,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "per_page": 10,
    "current_page": 1,
    "last_page": 2,
    "next_page_url": "http://localhost:8000/api/resources?page=2",
    "prev_page_url": null
  }
}
```

---

### 4.2 Obtener Recurso por ID
**GET** `/api/resources/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del recurso

**Response 200:**
```json
{
  "status": "success",
  "message": "Recurso obtenido correctamente",
  "data": {
    "id": 1,
    "name": "Aula 101",
    "type": "classroom",
    "active": true,
    "teachers": [
      {
        "id": 2,
        "name": "María",
        "document": "87654321"
      }
    ]
  }
}
```

---

### 4.3 Crear Recurso
**POST** `/api/resources`

**Autenticación:** Requerida

**Body (Aula):**
```json
{
  "name": "Aula 201",
  "type": "classroom",
  "active": true
}
```

**Body (Vehículo):**
```json
{
  "name": "Mazda 2",
  "type": "vehicle",
  "plate": "ABC123",
  "brand": "Mazda",
  "model": "2",
  "year": 2020,
  "color": "Rojo",
  "active": true
}
```

**Validaciones:**
- `name`: requerido, string, máximo 255 caracteres
- `type`: requerido, valores permitidos: `classroom`, `vehicle`
- `plate`: requerido si type es `vehicle`, string, máximo 50 caracteres
- `brand`: requerido si type es `vehicle`, string, máximo 100 caracteres
- `model`: requerido si type es `vehicle`, string, máximo 100 caracteres
- `year`: requerido si type es `vehicle`, integer, entre 1900 y año actual
- `color`: requerido si type es `vehicle`, string, máximo 50 caracteres
- `active`: opcional, boolean

**Response 201:**
```json
{
  "id": 3,
  "name": "Aula 201",
  "type": "classroom",
  "plate": null,
  "brand": null,
  "model": null,
  "year": null,
  "color": null,
  "active": true,
  "created_at": "2026-01-20T10:00:00.000000Z",
  "updated_at": "2026-01-20T10:00:00.000000Z"
}
```

---

### 4.4 Actualizar Recurso
**PUT** `/api/resources/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del recurso

**Body:** (mismos campos que crear)

**Response 200:**
```json
{
  "id": 1,
  "name": "Aula 101 Actualizada",
  "type": "classroom",
  "active": true,
  /* otros campos */
}
```

---

### 4.5 Desactivar Recurso
**DELETE** `/api/resources/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del recurso

**Nota:** Este endpoint no elimina el recurso, solo lo desactiva (`active = false`)

**Response 200:**
```json
{
  "message": "Recurso desactivado correctamente"
}
```

---

### 4.6 Asignar Profesores a Recurso
**POST** `/api/resources/{id}/teachers`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del recurso

**Body:**
```json
{
  "teacher_ids": [2, 3, 5]
}
```

**Validaciones:**
- `teacher_ids`: requerido, array
- `teacher_ids.*`: cada ID debe existir en users

**Response 200:**
```json
{
  "message": "Docentes asignados correctamente"
}
```

---

### 4.7 Bloqueos de disponibilidad del recurso (mantenimiento/taller)
**Resource Availability Blocks:** bloques de fecha/hora en los que un recurso no está disponible (mantenimiento, taller, etc.). Afectan el cálculo de slots disponibles y la validación al crear/actualizar citas con ese recurso.

**Base:** `GET|POST /api/resource-availability-blocks`, `GET|PUT|DELETE /api/resource-availability-blocks/{id}`

**Autenticación:** Requerida (admin o rol con permiso de gestión de recursos).

#### Listar bloques
**GET** `/api/resource-availability-blocks`

**Query (opcional):** `resource_id` (integer): filtrar por recurso.

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de bloques de disponibilidad",
  "data": [
    {
      "id": 1,
      "resource_id": 2,
      "start_datetime": "2026-02-05 08:00:00",
      "end_datetime": "2026-02-05 12:00:00",
      "reason": "Mantenimiento",
      "created_at": "...",
      "updated_at": "...",
      "resource": { "id": 2, "name": "Vehículo X", "type": "vehicle" }
    }
  ]
}
```
Orden: por `start_datetime`.

#### Crear bloque
**POST** `/api/resource-availability-blocks`

**Body:**
```json
{
  "resource_id": 2,
  "start_datetime": "2026-02-05 08:00:00",
  "end_datetime": "2026-02-05 12:00:00",
  "reason": "Mantenimiento"
}
```
**Validaciones:** `resource_id` requerido, existe en resources; `start_datetime` y `end_datetime` requeridos (datetime); `end_datetime` debe ser posterior a `start_datetime`; `reason` opcional, string.

**Response 201:** `{ "status": "success", "message": "Bloque creado correctamente", "data": { ... } }`

#### Obtener bloque por ID
**GET** `/api/resource-availability-blocks/{id}`

**Response 200:** `{ "status": "success", "message": "...", "data": { "id", "resource_id", "start_datetime", "end_datetime", "reason", "resource": { } } }`

#### Actualizar bloque
**PUT** `/api/resource-availability-blocks/{id}`

**Body:** `resource_id`, `start_datetime`, `end_datetime`, `reason` (mismas reglas que crear).

**Response 200:** `{ "status": "success", "message": "Bloque actualizado correctamente", "data": { ... } }`

#### Eliminar bloque
**DELETE** `/api/resource-availability-blocks/{id}`

**Response 200:** `{ "status": "success", "message": "Bloque eliminado correctamente", "data": [] }`

---

## 5. Tipos de Clase (Class Types)

### 5.1 Listar Tipos de Clase
**GET** `/api/classtype`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de tipos de clase obtenido correctamente",
  "data": [
    {
      "id": 1,
      "name": "Clase Presencial",
      "requires_resource": true,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Clase Virtual",
      "requires_resource": false,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z"
    }
  ]
}
```

---

### 5.2 Obtener Tipo de Clase por ID
**GET** `/api/classtype/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del tipo de clase

**Response 200:**
```json
{
  "status": "success",
  "message": "Tipo de clase obtenido correctamente",
  "data": {
    "id": 1,
    "name": "Clase Presencial",
    "requires_resource": true
  }
}
```

---

### 5.3 Crear Tipo de Clase
**POST** `/api/classtype`

**Autenticación:** Requerida

**Body:**
```json
{
  "name": "Clase Intensiva",
  "requires_resource": true
}
```

**Validaciones:**
- `name`: requerido, string, máximo 255 caracteres
- `requires_resource`: opcional, boolean

**Response 200:**
```json
{
  "status": "success",
  "message": "Tipo de clase creada correctamente",
  "data": {
    "id": 3,
    "name": "Clase Intensiva",
    "requires_resource": true,
    "created_at": "2026-01-20T10:00:00.000000Z",
    "updated_at": "2026-01-20T10:00:00.000000Z"
  }
}
```

---

### 5.4 Actualizar Tipo de Clase
**PUT** `/api/classtype/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del tipo de clase

**Body:** (mismos campos que crear)

**Response 200:**
```json
{
  "status": "success",
  "message": "Tipo de clase actualizado correctamente",
  "data": { /* objeto ClassType actualizado */ }
}
```

---

### 5.5 Eliminar Tipo de Clase
**DELETE** `/api/classtype/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del tipo de clase

**Validaciones de Negocio:**
- No se puede eliminar si tiene citas asociadas

**Response 200:**
```json
{
  "status": "success",
  "message": "Tipo de clase eliminado correctamente",
  "data": []
}
```

**Response 422 (Tiene citas asociadas):**
```json
{
  "message": "No se puede eliminar un tipo de clase con citas asociadas"
}
```

---

## 6. Recursos de Profesores (Teacher Resources)

### 6.1 Listar Asignaciones de Recursos a Profesores
**GET** `/api/teacher-resources`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de recursos asignados a profesores",
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "resource_id": 1,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z",
      "user": {
        "id": 2,
        "name": "María",
        "document": "87654321"
      },
      "resource": {
        "id": 1,
        "name": "Aula 101",
        "type": "classroom"
      }
    }
  ]
}
```

---

### 6.2 Obtener Asignación por ID
**GET** `/api/teacher-resources/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID de la asignación

**Response 200:**
```json
{
  "status": "success",
  "message": "Asignación obtenida correctamente",
  "data": {
    "id": 1,
    "user_id": 2,
    "resource_id": 1,
    "user": { /* objeto User */ },
    "resource": { /* objeto Resource */ }
  }
}
```

---

### 6.3 Crear Asignación de Recurso a Profesor
**POST** `/api/teacher-resources`

**Autenticación:** Requerida

**Body:**
```json
{
  "user_id": 2,
  "resource_id": 1
}
```

**Validaciones:**
- `user_id`: requerido, debe existir en users
- `resource_id`: requerido, debe existir en resources

**Validaciones de Negocio:**
- No se permite duplicar la misma asignación

**Response 201:**
```json
{
  "status": "success",
  "message": "Recurso asignado al profesor correctamente",
  "data": {
    "id": 1,
    "user_id": 2,
    "resource_id": 1,
    "user": { /* objeto User */ },
    "resource": { /* objeto Resource */ }
  }
}
```

**Response 422 (Asignación duplicada):**
```json
{
  "status": "error",
  "message": "El recurso ya está asignado a este profesor",
  "errors": []
}
```

---

### 6.4 Actualizar Asignación
**PUT** `/api/teacher-resources/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID de la asignación

**Body:** (mismos campos que crear)

**Response 200:**
```json
{
  "status": "success",
  "message": "Asignación actualizada correctamente",
  "data": { /* objeto TeacherResource actualizado */ }
}
```

---

### 6.5 Eliminar Asignación
**DELETE** `/api/teacher-resources/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID de la asignación

**Response 200:**
```json
{
  "status": "success",
  "message": "Asignación eliminada correctamente",
  "data": []
}
```

---

## 7. Horarios de Profesores (Teacher Schedules)

**Nota importante:** Los endpoints de esta sección (`/api/teacher-schedules`) reemplazan y cumplen con todos los requisitos de los endpoints obsoletos `/api/teachers/availability`. Use estos endpoints para gestionar los horarios y disponibilidad de los profesores.

### 7.1 Listar Horarios de Profesor
**GET** `/api/teacher-schedules`

**Autenticación:** Requerida

**Query Parameters:**
- `teacher_id` (integer, requerido): ID del profesor

**Ejemplo:**
```
GET /api/teacher-schedules?teacher_id=2
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Horarios obtenidos correctamente",
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "day_of_week": 1,
      "start_time": "09:00:00",
      "end_time": "12:00:00",
      "slot_minutes": 30,
      "active": true,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z"
    }
  ]
}
```

**Nota:** `day_of_week`: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

---

### 7.2 Crear Horario de Profesor
**POST** `/api/teacher-schedules`

**Autenticación:** Requerida

**Body:**
```json
{
  "user_id": 2,
  "day_of_week": 1,
  "start_time": "09:00",
  "end_time": "12:00",
  "slot_minutes": 30
}
```

**Validaciones:**
- `user_id`: requerido, debe existir en users
- `day_of_week`: requerido, integer, entre 0 y 6
- `start_time`: requerido, formato hora (HH:i)
- `end_time`: requerido, formato hora (HH:i), debe ser posterior a start_time
- `slot_minutes`: requerido, integer, entre 5 y 240

**Validaciones de Negocio:**
- No se permite solapamiento de horarios para el mismo profesor y día

**Response 201:**
```json
{
  "status": "success",
  "message": "Horario creado correctamente",
  "data": {
    "id": 1,
    "user_id": 2,
    "day_of_week": 1,
    "start_time": "09:00:00",
    "end_time": "12:00:00",
    "slot_minutes": 30,
    "active": true
  }
}
```

**Response 422 (Horario solapado):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "schedule": ["El horario se cruza con otro existente"]
  }
}
```

---

### 7.3 Actualizar Horario
**PUT** `/api/teacher-schedules/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del horario

**Body:**
```json
{
  "day_of_week": 1,
  "start_time": "09:00",
  "end_time": "13:00",
  "slot_minutes": 30,
  "active": true
}
```

**Validaciones:** (mismas que crear, excepto `user_id`)

**Response 200:**
```json
{
  "status": "success",
  "message": "Horario actualizado correctamente",
  "data": { /* objeto TeacherSchedule actualizado */ }
}
```

---

### 7.4 Eliminar Horario
**DELETE** `/api/teacher-schedules/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del horario

**Response 200:**
```json
{
  "status": "success",
  "message": "Horario eliminado correctamente",
  "data": null
}
```

---

### 7.5 Activar/Desactivar Horario
**PATCH** `/api/teacher-schedules/{id}/toggle`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del horario

**Response 200:**
```json
{
  "status": "success",
  "message": "Horario activado",
  "data": {
    "id": 1,
    "active": true,
    /* otros campos */
  }
}
```

---

### 7.6 Bloqueos docente-recurso (Teacher Resource Blocks)
**Teacher Resource Blocks:** bloqueos por los que un docente indica que no usará un recurso (p. ej. un vehículo) en una fecha y opcionalmente en un rango de horas. Si `start_time` y `end_time` son null, el recurso queda bloqueado todo el día para ese docente y fecha. Afectan el cálculo de slots disponibles y la validación al crear/actualizar citas o reservas con ese profesor y recurso.

**Base:** `GET|POST /api/teacher/resource-blocks`, `GET|PUT|DELETE /api/teacher/resource-blocks/{id}`

**Autenticación:** Requerida. Si el usuario es **docente**, solo puede ver y gestionar sus propios bloqueos (`teacher_id = auth()->id()`). Si es **admin**, puede filtrar por `teacher_id` y gestionar cualquier bloqueo.

#### Listar bloqueos
**GET** `/api/teacher/resource-blocks`

**Query (opcionales):** `teacher_id` (solo admin), `resource_id`, `date_from`, `date_to` (YYYY-MM-DD).

**Response 200:** Listado de bloqueos con relaciones teacher, resource. Formato estándar success.

#### Crear bloque
**POST** `/api/teacher/resource-blocks`

**Body:** `resource_id`, `date` (YYYY-MM-DD), `start_time` (opcional), `end_time` (opcional), `reason` (opcional). Si docente: `teacher_id` = usuario autenticado; si admin: se puede enviar `teacher_id`. Regla: ambos `start_time` y `end_time` null (todo el día) o ambos presentes con end > start.

**Response 201:** Bloque creado con relaciones.

#### Obtener / Actualizar / Eliminar
**GET** `/api/teacher/resource-blocks/{id}` — **PUT** `/api/teacher/resource-blocks/{id}` — **DELETE** `/api/teacher/resource-blocks/{id}`

Docente solo accede a sus propios bloqueos; admin a cualquiera.

---

## 8. Configuraciones del Sistema (System Settings)

### 8.1 Listar Configuraciones
**GET** `/api/system-settings`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de configuraciones del sistema",
  "data": [
    {
      "id": 1,
      "setting_key": "attendance_tolerance_minutes",
      "name": "Tolerancia en minutos (asistencia)",
      "description": "Tolerancia en minutos (ej. llegada tarde vs. asistió).",
      "type": "int",
      "value": 10
    },
    {
      "id": 2,
      "setting_key": "max_appointments_per_day",
      "name": null,
      "description": null,
      "type": "string",
      "value": "5"
    }
  ]
}
```

---

### 8.2 Obtener Configuración por Key
**GET** `/api/system-settings/{key}`

**Autenticación:** Requerida

**Path Parameters:**
- `key` (string): Clave de la configuración

**Ejemplo:**
```
GET /api/system-settings/attendance_tolerance_minutes
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Configuración encontrada",
  "data": {
    "setting_key": "attendance_tolerance_minutes",
    "name": "Tolerancia en minutos (asistencia)",
    "description": "Tolerancia en minutos (ej. llegada tarde vs. asistió).",
    "type": "int",
    "value": 10
  }
}
```

---

### 8.3 Crear Configuración
**POST** `/api/system-settings`

**Autenticación:** Requerida

**Body:**
```json
{
  "setting_key": "max_appointments_per_day",
  "type": "int",
  "value": "5",
  "name": "Máximo de citas por día",
  "description": "Límite de citas por día (opcional)."
}
```

**Validaciones:**
- `setting_key`: requerido, string, único en system_settings
- `type`: requerido, valores permitidos: `string`, `int`, `bool`, `json`
- `value`: requerido
- `name`: opcional, string. Nombre legible de la configuración.
- `description`: opcional, string. Descripción de qué hace la configuración.

**Response 201:**
```json
{
  "status": "success",
  "message": "Configuración creada correctamente",
  "data": {
    "id": 3,
    "setting_key": "max_appointments_per_day",
    "name": "Máximo de citas por día",
    "description": "Límite de citas por día (opcional).",
    "type": "int",
    "value": 5,
    "created_at": "2026-01-20T10:00:00.000000Z",
    "updated_at": "2026-01-20T10:00:00.000000Z"
  }
}
```

---

### 8.4 Actualizar Configuración
**PUT** `/api/system-settings/{key}`

**Autenticación:** Requerida

**Path Parameters:**
- `key` (string): Clave de la configuración

**Body:**
```json
{
  "type": "int",
  "value": "10",
  "name": "Máximo de citas por día",
  "description": "Límite de citas por día (opcional)."
}
```

**Validaciones:**
- `type`: requerido, valores permitidos: `string`, `int`, `bool`, `json`
- `value`: requerido
- `name`: opcional, string. Nombre legible de la configuración.
- `description`: opcional, string. Descripción de qué hace la configuración.

**Response 200:**
```json
{
  "status": "success",
  "message": "Configuración actualizada correctamente",
  "data": { "id", "setting_key", "name", "description", "type", "value", "created_at", "updated_at" }
}
```

---

### 8.5 Eliminar Configuración
**DELETE** `/api/system-settings/{key}`

**Autenticación:** Requerida

**Path Parameters:**
- `key` (string): Clave de la configuración

**Response 200:**
```json
{
  "status": "success",
  "message": "Configuración eliminada correctamente",
  "data": null
}
```

---

### 8.6 Reglas de cancelación y asistencia (parametrizables)

Las siguientes claves en `system_settings` parametrizan las reglas de cancelación y asistencia. Se gestionan con los endpoints de System Settings (`GET`/`PUT` `/api/system-settings`, etc.). Valores por defecto provienen del `SchoolSettingsSeeder`.

**Nota:** Cada configuración puede tener campos opcionales `name` (nombre legible) y `description` (descripción de qué hace la configuración) para facilitar la gestión desde la interfaz de administración.

**Reglas de cancelación:**

| Key | Tipo | Descripción | Default |
|-----|------|-------------|---------|
| `cancellation_hours_limit` | int | Horas mínimas antes de la cita para cancelar "a tiempo" | 4 |
| `cancellation_allow_after_limit` | bool | ¿Se permite cancelar después del límite? | true |
| `cancellation_late_penalty_enabled` | bool | ¿Hay multa por cancelación tardía? | true |
| `cancellation_late_penalty_amount` | int | Monto de la multa por cancelación tardía (fallback si no hay monto por tipo de clase) | 50000 |

**Multas por tipo de clase (cancelación tardía):** Se puede configurar un monto distinto por tipo de clase con la clave `cancellation_late_penalty_amount_class_type_{id}`, donde `{id}` es el `class_type_id` (ej. `cancellation_late_penalty_amount_class_type_1`, `cancellation_late_penalty_amount_class_type_2`). Si existe esa clave para el tipo de clase de la cita, se usa ese monto; si no, se usa `cancellation_late_penalty_amount`. En todos los casos donde se aplica multa (cancelación tardía, inasistencia), se valida que el tipo de clase de la cita exista en `class_types`; si no es válido, no se aplica la multa.

**Reglas de asistencia:**

| Key | Tipo | Descripción | Default |
|-----|------|-------------|---------|
| `attendance_tolerance_minutes` | int | Tolerancia en minutos (ej. llegada tarde vs. asistió) | 10 |
| `attendance_count_absent_as_no_show` | bool | ¿Marcar "no llegó" (absent) como inasistencia para multa y límite? | true |
| `attendance_no_show_penalty_enabled` | bool | ¿Hay multa por inasistencia? | true |
| `attendance_no_show_penalty_amount` | int | Monto de la multa por inasistencia (fallback si no hay monto por tipo de clase) | 50000 |
| `attendance_no_show_limit` | int | Límite de inasistencias; al superarlo no se pueden reservar nuevas clases | 3 |

**Multas por tipo de clase (inasistencia):** Clave `attendance_no_show_penalty_amount_class_type_{id}` (ej. `attendance_no_show_penalty_amount_class_type_1`). Mismo criterio de fallback y validación de tipo de clase que en cancelación tardía.

**Agendamiento (estudiantes):**

| Key | Tipo | Descripción | Default |
|-----|------|-------------|---------|
| `scheduling_days_limit` | int | Número de días hacia adelante que se muestran en el agendamiento para estudiantes (GET `/api/student/available-slots`). Ej.: 7 = mostrar los próximos 7 días. Se aplica tanto por defecto como límite máximo del rango cuando se envían `date_from`/`date_to`. | 7 |
| `student_max_classes_per_week` | int | Máximo de clases que un estudiante puede tener agendadas en una misma semana (ISO: lunes a domingo). 0 = sin límite. | 0 |
| `student_max_classes_per_day` | int | Máximo de clases que un estudiante puede tener agendadas en un mismo día. 0 = no puede agendar clases ese día. | 0 |
| `student_max_hours_per_period` | int | Máximo de horas que un estudiante puede agendar en el periodo configurado (según `student_hours_period_type`). 0 = sin límite. | 0 |
| `student_hours_period_type` | string | Tipo de periodo para el límite de horas: `week` (semana ISO lunes–domingo), `fortnight` (quincena: 1–15 o 16–fin de mes), `month` (mes completo). | week |

**Límite semanal:** Si `student_max_classes_per_week` > 0, al crear o actualizar una cita con `student_id` se valida que el estudiante no supere ese número de citas activas (scheduled/confirmed) en la misma semana. Si se supera, la API responde **422** con un mensaje explicativo en `POST /api/appointments`, `POST /api/student/book-class` y `PUT /api/appointments/{id}`.

**Límite de horas por periodo:** Si `student_max_hours_per_period` > 0, al crear o actualizar una cita con `student_id` (en `POST /api/appointments`, `PUT /api/appointments/{id}` y `POST /api/student/book-class`) se calculan las horas ya agendadas del estudiante en el periodo correspondiente (según `student_hours_period_type`) y se suma la duración del slot; si el total supera el límite, la API responde **422** con mensaje tipo "Ha alcanzado el máximo de X horas para este periodo."

**Rango de acceso del estudiante (User):** Los usuarios (estudiantes) pueden tener `access_start_date` y `access_end_date` (date, nullable). Si ambos están definidos, el estudiante solo puede agendar citas cuya fecha esté dentro de ese rango; si no tiene fechas configuradas, no hay restricción. La validación se aplica en `POST /api/appointments`, `PUT /api/appointments/{id}` y `POST /api/student/book-class`. En `GET /api/student/available-slots`, si se envía `student_id` (o el usuario es estudiante autenticado) y tiene rango definido, solo se devuelven slots en fechas con acceso.

**Activación de acceso y notificación por correo:** Cuando se "activa" el acceso de un estudiante (es decir, tras crear o actualizar el usuario con rol estudiante, queda con ambos `access_start_date` y `access_end_date` definidos y la fecha de hoy está dentro de ese rango, y antes no tenía acceso hoy o es usuario recién creado), se envía un correo al estudiante indicando que ya puede agendar clases y el rango de fechas. El correo se encola (Mail/Queue). Criterio de activación documentado en `UserAccessService::notifyIfActivated`.

**Efecto en GET `/api/student/available-slots`:** Si no se envían `date_from` ni `date_to`, el rango por defecto es hoy hasta hoy + (`scheduling_days_limit` - 1). Si se envían, el rango se acota a `scheduling_days_limit` días como máximo y `date_to` no supera hoy + 90.

---

## 9. Penalizaciones (Penalties)

### 9.1 Listar Penalizaciones
**GET** `/api/penalties`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `user_id` (integer): Filtrar por ID de usuario

**Ejemplo:**
```
GET /api/penalties?user_id=1
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de penalizaciones",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "appointment_id": 5,
      "amount": 50000,
      "reason": "Cancelación tardía",
      "paid": false,
      "paid_at": null,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z",
      "user": {
        "id": 1,
        "name": "Juan",
        "document": "12345678"
      },
      "appointment": {
        "id": 5,
        "date": "2026-01-25",
        "status": "cancelled"
      }
    }
  ]
}
```

---

### 9.2 Crear Penalización
**POST** `/api/penalties`

**Autenticación:** Requerida

**Body:**
```json
{
  "user_id": 1,
  "appointment_id": 5,
  "amount": 50000,
  "reason": "Cancelación tardía"
}
```

**Validaciones:**
- `user_id`: requerido, debe existir en users
- `appointment_id`: opcional, debe existir en appointments
- `amount`: requerido, integer, mínimo 1
- `reason`: requerido, string

**Response 201:**
```json
{
  "status": "success",
  "message": "Penalización creada correctamente",
  "data": {
    "id": 1,
    "user_id": 1,
    "appointment_id": 5,
    "amount": 50000,
    "reason": "Cancelación tardía",
    "paid": false,
    "paid_at": null
  }
}
```

---

### 9.3 Marcar Penalización como Pagada
**POST** `/api/penalties/{id}/pay`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID de la penalización

**Response 200:**
```json
{
  "status": "success",
  "message": "Penalización marcada como pagada",
  "data": {
    "id": 1,
    "paid": true,
    "paid_at": "2026-01-20T15:30:00.000000Z",
    /* otros campos */
  }
}
```

---

### 9.4 Obtener Total de Deuda por Usuario
**GET** `/api/penalties/user/{userId}/debt`

**Autenticación:** Requerida

**Path Parameters:**
- `userId` (integer): ID del usuario

**Response 200:**
```json
{
  "status": "success",
  "message": "Total de deuda del usuario",
  "data": {
    "user_id": 1,
    "total_debt": 150000
  }
}
```

**Nota:** Solo suma las penalizaciones con `paid = false`.

---

## 10. Gestión de Usuarios

### 10.1 Crear o Actualizar Usuario
**POST** `/api/users`

**Autenticación:** Requerida

**Body:**
```json
{
  "name": "Juan",
  "last_name": "Pérez",
  "document": "12345678",
  "email": "juan@example.com",
  "number_phone": "3001234567",
  "role": "docente"
}
```

**Validaciones:**
- `name`: requerido, string, máximo 255 caracteres
- `last_name`: requerido, string, máximo 255 caracteres
- `document`: requerido, numeric
- `email`: requerido, email válido
- `number_phone`: opcional, string
- `role`: requerido, valores permitidos: `user`, `docente`

**Nota:** 
- Si el usuario existe (por email), se actualiza. Si no existe, se crea.
- Se genera una contraseña aleatoria de 10 caracteres.
- Se envía un correo electrónico con las credenciales al usuario.

**Response 201:**
```json
{
  "success": true,
  "message": "Usuario creado/actualizado y credenciales enviadas por correo",
  "data": {
    "id": 1,
    "name": "Juan",
    "document": "12345678",
    "role": "docente"
  }
}
```

---

## 11. Gestión de Profesores (Teachers)

### 11.1 Listar Profesores
**GET** `/api/teachers`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `search` (string): Buscar por nombre o documento
- `active` (boolean): Filtrar por estado activo
- `per_page` (integer): Items por página (default: 10)

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de profesores",
  "data": [
    {
      "id": 2,
      "name": "María",
      "last_name": "García",
      "document": "87654321",
      "email": "maria@example.com",
      "number_phone": "3009876543",
      "role": "docente",
      "active": true,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

### 11.2 Obtener Profesor por ID
**GET** `/api/teachers/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del profesor

**Response 200:**
```json
{
  "status": "success",
  "message": "Profesor obtenido correctamente",
  "data": {
    "id": 2,
    "name": "María",
    "last_name": "García",
    "document": "87654321",
    "email": "maria@example.com",
    "number_phone": "3009876543",
    "role": "docente",
    "active": true,
    "created_at": "2026-01-20T10:00:00.000000Z",
    "updated_at": "2026-01-20T10:00:00.000000Z"
  }
}
```

**Response 404 (No es profesor):**
```json
{
  "status": "error",
  "message": "El usuario no es un profesor",
  "errors": []
}
```

---

### 11.3 Crear Profesor
**POST** `/api/teachers`

**Autenticación:** Requerida

**Body:**
```json
{
  "name": "María",
  "last_name": "García",
  "document": "87654321",
  "email": "maria@example.com",
  "number_phone": "3009876543"
}
```

**Validaciones:**
- `name`: requerido, string, máximo 255 caracteres
- `last_name`: requerido, string, máximo 255 caracteres
- `document`: requerido, numeric, único
- `email`: requerido, email válido, único
- `number_phone`: opcional, string

**Response 201:**
```json
{
  "id": 2,
  "name": "María",
  "last_name": "García",
  "document": "87654321",
  "email": "maria@example.com",
  "number_phone": "3009876543",
  "role": "docente",
  "active": true
}
```

---

### 11.4 Actualizar Profesor
**PUT** `/api/teachers/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del profesor

**Body:** (mismos campos que crear)

**Response 200:**
```json
{
  "id": 2,
  "name": "María Actualizada",
  "last_name": "García",
  "document": "87654321",
  "email": "maria@example.com",
  "number_phone": "3009876543",
  "role": "docente",
  "active": true
}
```

---

### 11.5 Eliminar Profesor
**DELETE** `/api/teachers/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del profesor

**Response 200:**
```json
{
  "message": "Profesor eliminado correctamente"
}
```

---

## 12. Gestión de Estudiantes (Students)

### 12.1 Listar Estudiantes
**GET** `/api/students`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `search` (string): Buscar por nombre o documento
- `active` (boolean): Filtrar por estado activo
- `per_page` (integer): Items por página (default: 10)

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de estudiantes",
  "data": [
    {
      "id": 1,
      "name": "Juan",
      "last_name": "Pérez",
      "document": "12345678",
      "email": "juan@example.com",
      "number_phone": "3001234567",
      "role": "user",
      "active": true,
      "created_at": "2026-01-20T10:00:00.000000Z",
      "updated_at": "2026-01-20T10:00:00.000000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

### 12.2 Obtener Estudiante por ID
**GET** `/api/students/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del estudiante

**Response 200:**
```json
{
  "status": "success",
  "message": "Estudiante obtenido correctamente",
  "data": {
    "id": 1,
    "name": "Juan",
    "last_name": "Pérez",
    "document": "12345678",
    "email": "juan@example.com",
    "number_phone": "3001234567",
    "role": "user",
    "active": true,
    "created_at": "2026-01-20T10:00:00.000000Z",
    "updated_at": "2026-01-20T10:00:00.000000Z"
  }
}
```

**Response 404 (No es estudiante):**
```json
{
  "status": "error",
  "message": "El usuario no es un estudiante",
  "errors": []
}
```

---

### 12.3 Crear Estudiante
**POST** `/api/students`

**Autenticación:** Requerida

**Body:**
```json
{
  "name": "Juan",
  "last_name": "Pérez",
  "document": "12345678",
  "email": "juan@example.com",
  "number_phone": "3001234567"
}
```

**Validaciones:**
- `name`: requerido, string, máximo 255 caracteres
- `last_name`: requerido, string, máximo 255 caracteres
- `document`: requerido, numeric, único
- `email`: requerido, email válido, único
- `number_phone`: opcional, string

**Response 201:**
```json
{
  "id": 1,
  "name": "Juan",
  "last_name": "Pérez",
  "document": "12345678",
  "email": "juan@example.com",
  "number_phone": "3001234567",
  "role": "user",
  "active": true
}
```

---

### 12.4 Actualizar Estudiante
**PUT** `/api/students/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del estudiante

**Body:** (mismos campos que crear)

**Response 200:**
```json
{
  "id": 1,
  "name": "Juan Actualizado",
  "last_name": "Pérez",
  "document": "12345678",
  "email": "juan@example.com",
  "number_phone": "3001234567",
  "role": "user",
  "active": true
}
```

---

### 12.5 Eliminar Estudiante
**DELETE** `/api/students/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del estudiante

**Response 200:**
```json
{
  "message": "Estudiante eliminado correctamente"
}
```

---



## 13. Vehículos (Vehicles)

### 13.1 Listar Vehículos
**GET** `/api/vehicles`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `per_page` (integer): Items por página (default: 10)

**Response 200:**
```json
{
  "status": "success",
  "message": "Vehículos listados correctamente",
  "data": [
    {
      "id": 1,
      "name": "Mazda 2",
      "type": "vehicle",
      "plate": "ABC123",
      "brand": "Mazda",
      "model": "2",
      "year": 2020,
      "color": "Rojo",
      "active": true
    }
  ],
  "pagination": {
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null
  }
}
```

**Nota:** Retorna solo recursos con `type = 'vehicle'`. Usa formato `ResponseHelper::paginated()`.

---

### 13.2 Crear Vehículo
**POST** `/api/vehicles`

**Autenticación:** Requerida

**Body:**
```json
{
  "name": "Mazda 2",
  "plate": "ABC123",
  "brand": "Mazda",
  "model": "2",
  "year": 2020,
  "color": "Rojo",
  "active": true
}
```

**Validaciones:**
- `name`: requerido, string, máximo 255 caracteres
- `plate`: requerido, string, máximo 50 caracteres, único en resources
- `brand`: requerido, string, máximo 100 caracteres
- `model`: requerido, string, máximo 100 caracteres
- `year`: requerido, integer, entre 1900 y año actual
- `color`: requerido, string, máximo 50 caracteres
- `active`: opcional, boolean

**Response 201:**
```json
{
  "status": "success",
  "message": "Vehículo creado correctamente",
  "data": {
    "id": 1,
    "name": "Mazda 2",
    "type": "vehicle",
    "plate": "ABC123",
    "brand": "Mazda",
    "model": "2",
    "year": 2020,
    "color": "Rojo",
    "active": true,
    "created_at": "2026-01-20T10:00:00.000000Z",
    "updated_at": "2026-01-20T10:00:00.000000Z"
  }
}
```

---

### 13.3 Actualizar Vehículo
**PUT** `/api/vehicles/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del vehículo (debe ser un recurso con type = 'vehicle')

**Body:** (mismos campos que crear)

**Response 200:**
```json
{
  "status": "success",
  "message": "Vehículo actualizado correctamente",
  "data": {
    "id": 1,
    "name": "Mazda 2 Actualizado",
    "type": "vehicle",
    "plate": "ABC123",
    /* otros campos actualizados */
  }
}
```

**Response 404:** Si el recurso no es un vehículo.

---

### 13.4 Eliminar Vehículo
**DELETE** `/api/vehicles/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del vehículo

**Nota:** Este endpoint no elimina el vehículo, solo lo desactiva (`active = false`)

**Response 200:**
```json
{
  "status": "success",
  "message": "Vehículo desactivado correctamente",
  "data": []
}
```

---

## 14. Aulas (Classrooms)

### 14.1 Listar Aulas
**GET** `/api/classrooms`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `per_page` (integer): Items por página (default: 10)

**Response 200:**
```json
{
  "status": "success",
  "message": "Aulas listadas correctamente",
  "data": [
    {
      "id": 1,
      "name": "Aula 101",
      "type": "classroom",
      "plate": null,
      "brand": null,
      "model": null,
      "year": null,
      "color": null,
      "active": true
    }
  ],
  "pagination": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null
  }
}
```

**Nota:** Retorna solo recursos con `type = 'classroom'`. Usa formato `ResponseHelper::paginated()`.

---

### 14.2 Crear Aula
**POST** `/api/classrooms`

**Autenticación:** Requerida

**Body:**
```json
{
  "name": "Aula 201",
  "active": true
}
```

**Validaciones:**
- `name`: requerido, string, máximo 255 caracteres
- `active`: opcional, boolean

**Response 201:**
```json
{
  "status": "success",
  "message": "Aula creada correctamente",
  "data": {
    "id": 2,
    "name": "Aula 201",
    "type": "classroom",
    "plate": null,
    "brand": null,
    "model": null,
    "year": null,
    "color": null,
    "active": true,
    "created_at": "2026-01-20T10:00:00.000000Z",
    "updated_at": "2026-01-20T10:00:00.000000Z"
  }
}
```

---

### 14.3 Actualizar Aula
**PUT** `/api/classrooms/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del aula (debe ser un recurso con type = 'classroom')

**Body:**
```json
{
  "name": "Aula 201 Actualizada",
  "active": true
}
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Aula actualizada correctamente",
  "data": {
    "id": 2,
    "name": "Aula 201 Actualizada",
    "type": "classroom",
    "active": true,
    /* otros campos */
  }
}
```

**Response 404:** Si el recurso no es un aula.

---

### 14.4 Eliminar Aula
**DELETE** `/api/classrooms/{id}`

**Autenticación:** Requerida

**Path Parameters:**
- `id` (integer): ID del aula

**Nota:** Este endpoint no elimina el aula, solo la desactiva (`active = false`)

**Response 200:**
```json
{
  "status": "success",
  "message": "Aula desactivada correctamente",
  "data": []
}
```

---

## Estructura de Datos

### User (Usuario)
```json
{
  "id": 1,
  "name": "Juan",
  "last_name": "Pérez",
  "document": "12345678",
  "email": "juan@example.com",
  "number_phone": "3001234567",
  "role": "user",
  "active": true,
  "email_verified_at": "2026-01-20T10:00:00.000000Z",
  "created_at": "2026-01-20T10:00:00.000000Z",
  "updated_at": "2026-01-20T10:00:00.000000Z"
}
```

**Roles permitidos:**
- `user`: Usuario regular (estudiante)
- `docente`: Profesor

---

### Appointment (Cita)
```json
{
  "id": 1,
  "teacher_id": 2,
  "student_id": 1,
  "class_type_id": 1,
  "resource_id": 3,
  "date": "2026-01-25",
  "start_time": "09:00:00",
  "end_time": "10:00:00",
  "status": "confirmed",
  "created_at": "2026-01-20T10:00:00.000000Z",
  "updated_at": "2026-01-20T10:00:00.000000Z"
}
```

**Estados permitidos:**
- `scheduled`: Programada
- `confirmed`: Confirmada
- `cancelled`: Cancelada
- `completed`: Completada

---

### Resource (Recurso)
```json
{
  "id": 1,
  "name": "Aula 101",
  "type": "classroom",
  "plate": null,
  "brand": null,
  "model": null,
  "year": null,
  "color": null,
  "active": true,
  "created_at": "2026-01-20T10:00:00.000000Z",
  "updated_at": "2026-01-20T10:00:00.000000Z"
}
```

**Tipos permitidos:**
- `classroom`: Aula
- `vehicle`: Vehículo

**Campos específicos de vehículo:**
- `plate`: Placa del vehículo
- `brand`: Marca
- `model`: Modelo
- `year`: Año
- `color`: Color

---

### ClassType (Tipo de Clase)
```json
{
  "id": 1,
  "name": "Clase Presencial",
  "requires_resource": true,
  "created_at": "2026-01-20T10:00:00.000000Z",
  "updated_at": "2026-01-20T10:00:00.000000Z"
}
```

---

### TeacherSchedule (Horario de Profesor)
```json
{
  "id": 1,
  "user_id": 2,
  "day_of_week": 1,
  "start_time": "09:00:00",
  "end_time": "12:00:00",
  "slot_minutes": 30,
  "active": true,
  "created_at": "2026-01-20T10:00:00.000000Z",
  "updated_at": "2026-01-20T10:00:00.000000Z"
}
```

**Días de la semana:**
- `0`: Domingo
- `1`: Lunes
- `2`: Martes
- `3`: Miércoles
- `4`: Jueves
- `5`: Viernes
- `6`: Sábado

---

### Penalty (Penalización)
```json
{
  "id": 1,
  "user_id": 1,
  "appointment_id": 5,
  "amount": 50000,
  "reason": "Cancelación tardía",
  "paid": false,
  "paid_at": null,
  "created_at": "2026-01-20T10:00:00.000000Z",
  "updated_at": "2026-01-20T10:00:00.000000Z"
}
```

---

## 15. Dashboard de Profesor (Teacher Classes)

### 15.1 Listar Clases del Profesor
**GET** `/api/teacher/classes`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `date` (date): Filtrar por fecha (YYYY-MM-DD)
- `status` (string): Filtrar por estado

**Response 200:**
```json
{
  "status": "success",
  "message": "Clases del profesor",
  "data": [
    {
      "id": 1,
      "teacher_id": 2,
      "student_id": 1,
      "date": "2026-01-25",
      "start_time": "09:00:00",
      "end_time": "10:00:00",
      "status": "confirmed",
      "attendance_marked": false,
      "student": {
        "id": 1,
        "name": "Juan",
        "document": "12345678"
      }
    }
  ]
}
```

---

### 15.2 Registrar Asistencia
**POST** `/api/teacher/classes/attendance`

**Autenticación:** Requerida

**Body:**
```json
{
  "appointment_id": 1,
  "student_id": 1,
  "attended": true,
  "notes": "Llegó a tiempo"
}
```

**Validaciones:**
- `appointment_id`: requerido, debe existir en appointments
- `student_id`: requerido, debe existir en users
- `attended`: requerido, boolean
- `notes`: opcional, string

**Reglas de negocio (parametrizables):**
- Si `attended` = false: se marca `attendance_status` = `absent`. Si `attendance_count_absent_as_no_show` = true y `attendance_no_show_penalty_enabled` = true, se aplica multa por inasistencia (monto según tipo de clase de la cita; se valida que el tipo de clase exista). La respuesta incluye `penalty_applied` (bool) cuando `attended` = false.

**Response 200:**
```json
{
  "status": "success",
  "message": "Asistencia actualizada correctamente",
  "data": {
    "appointment_id": 1,
    "student_id": 1,
    "attended": true,
    "notes": "Llegó a tiempo",
    "penalty_applied": false
  }
}
```

Cuando `attended` = false y se aplica multa: `penalty_applied` = true.

---

### 15.3 Cancelar Clase
**POST** `/api/teacher/classes/cancel`

**Autenticación:** Requerida

**Body:**
```json
{
  "appointment_id": 1,
  "reason": "Emergencia personal"
}
```

**Validaciones:**
- `appointment_id`: requerido, debe existir en appointments
- `reason`: opcional, string

**Validaciones de Negocio:**
- Solo se pueden cancelar clases con status `scheduled` o `confirmed`

**Response 200:**
```json
{
  "status": "success",
  "message": "Clase cancelada correctamente",
  "data": {
    "id": 1,
    "appointment_id": 1,
    "status": "cancelled",
    "cancelled_at": "2026-01-25T09:00:00.000000Z"
  }
}
```

---

## 16. Dashboard General

### 16.1 Estudiantes Activos
**GET** `/api/dashboard/active-students`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Total de estudiantes activos",
  "data": {
    "total": 15,
    "active": 14,
    "inactive": 1
  }
}
```

---

### 16.2 Reservas del Último Mes
**GET** `/api/dashboard/last-month-reservations`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Reservaciones del último mes",
  "data": {
    "total": 45,
    "confirmed": 40,
    "scheduled": 3,
    "cancelled": 2,
    "reservations": [
      {
        "id": 1,
        "teacher_id": 2,
        "student_id": 1,
        "class_type_id": 1,
        "resource_id": 3,
        "date": "2026-01-20",
        "start_time": "09:00:00",
        "end_time": "10:00:00",
        "status": "confirmed",
        "teacher": {
          "id": 2,
          "name": "María",
          "last_name": "García",
          "document": "87654321"
        },
        "student": {
          "id": 1,
          "name": "Juan",
          "last_name": "Pérez",
          "document": "12345678"
        },
        "classType": {
          "id": 1,
          "name": "Clase Presencial",
          "requires_resource": true
        },
        "resource": {
          "id": 3,
          "name": "Aula 101",
          "type": "classroom"
        }
      }
    ]
  }
}
```

**Nota:** Incluye todas las reservaciones creadas en los últimos 30 días con todas sus relaciones cargadas.

---

### 16.3 Clases Completadas
**GET** `/api/dashboard/completed-reservations`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `teacher` (integer): Filtrar por ID de profesor

**Ejemplo:**
```
GET /api/dashboard/completed-reservations?teacher=2
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Reservaciones completadas",
  "data": {
    "total": 120,
    "attended": 118,
    "not_attended": 2,
    "completion_rate": 98.33,
    "reservations": [
      {
        "id": 1,
        "teacher_id": 2,
        "student_id": 1,
        "class_type_id": 1,
        "resource_id": 3,
        "date": "2026-01-20",
        "start_time": "09:00:00",
        "end_time": "10:00:00",
        "status": "completed",
        "attendance_status": "attended",
        "attended": true,
        "teacher": {
          "id": 2,
          "name": "María",
          "last_name": "García",
          "document": "87654321"
        },
        "student": {
          "id": 1,
          "name": "Juan",
          "last_name": "Pérez",
          "document": "12345678"
        },
        "classType": {
          "id": 1,
          "name": "Clase Presencial",
          "requires_resource": true
        },
        "resource": {
          "id": 3,
          "name": "Aula 101",
          "type": "classroom"
        }
      }
    ]
  }
}
```

**Nota:** 
- Cada reservación incluye el campo `attended` (boolean) que indica si el estudiante asistió
- El campo `attended` es `true` si `attendance_status` es 'attended' o 'late', `false` en otros casos
- Incluye todas las relaciones: teacher, student, classType, resource

---

### 16.4 Exportar RUNT
**GET** `/api/dashboard/export-runt`

**Autenticación:** Requerida

**Response 200:** (Archivo CSV)

**Nota:** Descarga un archivo CSV con datos de estudiantes en formato RUNT.

---

## 17. Dashboard de Estudiante (Student Dashboard)

### 17.1 Obtener Slots Disponibles
**GET** `/api/student/available-slots`

**Autenticación:** Requerida

**Query Parameters:**
- `classType` (string, opcional): Filtrar por tipo de clase. Valores: `"theoretical"` o `"practical"`
- `date_from` (date, opcional): Fecha de inicio del rango (YYYY-MM-DD). Si no se proporciona, se usa la fecha actual
- `date_to` (date, opcional): Fecha de fin del rango (YYYY-MM-DD). Si no se proporciona, se calcula según `scheduling_days_limit`
- `teacher_id` (integer, opcional): Filtrar por ID del profesor
- `student_id` o `studentId` (integer, opcional): ID del estudiante. Si se envía y el estudiante tiene `access_start_date` y `access_end_date` definidos, solo se devuelven slots en fechas dentro de ese rango. Si el usuario autenticado es estudiante y no se envía, se usa su ID.

**Notas sobre el rango de fechas:**
- Si no se envían `date_from` ni `date_to`, el rango por defecto es desde hoy hasta hoy + (`scheduling_days_limit` - 1) días
- El setting `scheduling_days_limit` (default: 7) controla cuántos días se muestran
- Si se envían `date_from` y/o `date_to`, el rango se ajusta automáticamente:
  - `date_from` no puede ser anterior a hoy
  - El rango máximo es `scheduling_days_limit` días
  - `date_to` no puede superar hoy + 90 días
- Si solo se envía `date_from`, `date_to` se calcula como `date_from + (scheduling_days_limit - 1)`
- Si solo se envía `date_to`, `date_from` se establece como hoy

**Ejemplo:**
```
GET /api/student/available-slots?classType=theoretical&date_from=2026-01-26&date_to=2026-01-30
```

**Response 200:**
```json
{
  "status": "success",
  "message": "Slots disponibles obtenidos correctamente",
  "data": {
    "slots": [
      {
        "date": "2026-01-26",
        "startTime": "09:00",
        "endTime": "10:00",
        "options": [
          {
            "id": "slot_2_2026-01-26_0900_3",
            "teacher_id": 2,
            "resource_id": 3,
            "class_type_id": 1,
            "availableSpots": 17,
            "totalCapacity": 20,
            "currentBookings": 3
          }
        ]
      },
      {
        "date": "2026-01-26",
        "startTime": "10:00",
        "endTime": "11:00",
        "options": [
          {
            "id": "slot_2_2026-01-26_1000",
            "teacher_id": 2,
            "resource_id": null,
            "class_type_id": 2
          }
        ]
      }
    ],
    "teachers": {
      "2": {
        "id": 2,
        "name": "María García",
        "document": "87654321"
      }
    },
    "resources": {
      "3": {
        "id": 3,
        "name": "Aula 101",
        "type": "classroom",
        "capacity": 20
      }
    },
    "classTypes": {
      "1": {
        "id": 1,
        "name": "Teórica",
        "requires_resource": true
      },
      "2": {
        "id": 2,
        "name": "Práctica",
        "requires_resource": true
      }
    }
  }
}
```

**Estructura de la respuesta:**
- `slots`: Array de bloques de tiempo agrupados por fecha, hora inicio y hora fin
  - Cada bloque tiene `options` con las diferentes combinaciones de profesor/recurso/tipo de clase disponibles
  - Si el tipo de clase requiere recurso con capacidad, cada opción incluye `availableSpots`, `totalCapacity` y `currentBookings`
- `teachers`: Mapa (objeto) de profesores por ID con información básica
- `resources`: Mapa (objeto) de recursos por ID con información básica
- `classTypes`: Mapa (objeto) de tipos de clase por ID con información básica

---

### 17.2 Reservar Clase
**POST** `/api/student/book-class`

**Autenticación:** Requerida

**Body:**
```json
{
  "teacher_id": 2,
  "class_type_id": 1,
  "resource_id": 3,
  "date": "2026-01-25",
  "start_time": "09:00",
  "end_time": "10:00"
}
```

**Validaciones:**
- `teacher_id`: requerido, debe existir en users
- `class_type_id`: requerido, debe existir en class_types
- `resource_id`: opcional, requerido si el tipo de clase lo necesita
- `date`: requerido, formato YYYY-MM-DD
- `start_time`: requerido, formato HH:i
- `end_time`: requerido, formato HH:i

**Validaciones de Negocio:**
- El slot debe estar disponible.
- Si se envía `resource_id`, el recurso no debe estar ocupado por otra cita en ese horario; además no debe existir un **ResourceAvailabilityBlock** que solape con la fecha/hora de la cita ni un **TeacherResourceBlock** para ese profesor y recurso en esa fecha/hora. Si el recurso está bloqueado (mantenimiento o bloqueo docente-recurso) → **422** con mensaje "El recurso no está disponible en ese horario (bloqueo o mantenimiento)."
- El mismo estudiante no puede tener ya una cita activa (scheduled/confirmed) del mismo tipo de clase en la misma fecha y horario solapado. Si ya tiene agendada esa clase en ese slot → **422**.
- El estudiante no debe superar el límite de inasistencias (`attendance_no_show_limit`). Si lo supera → **422**.
- Si el estudiante tiene `access_start_date` y `access_end_date` definidos, la fecha de la cita debe estar dentro de ese rango. Si no → **422**.
- Si está configurado el límite de horas por periodo (`student_max_hours_per_period` > 0), la suma de horas ya agendadas del estudiante en ese periodo más la duración del slot no debe superar el límite. Si se supera → **422**.

**Response 201:**
```json
{
  "status": "success",
  "message": "Clase reservada correctamente",
  "data": {
    "id": 1,
    "teacher_id": 2,
    "student_id": 1,
    "class_type_id": 1,
    "resource_id": 3,
    "date": "2026-01-25",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "status": "scheduled"
  }
}
```

**Response 422 (Ya tiene agendada una clase en ese horario):**
```json
{
  "status": "error",
  "message": "Ya tiene agendada una clase de este tipo en ese horario. No puede reservar dos veces el mismo espacio.",
  "errors": []
}
```

**Response 422 (Límite de inasistencias):**
```json
{
  "status": "error",
  "message": "Ha superado el límite de inasistencias. No puede reservar nuevas clases.",
  "errors": []
}
```

**Response 422 (Límite de horas por periodo):**
```json
{
  "status": "error",
  "message": "Ha alcanzado el máximo de X horas para este periodo.",
  "errors": []
}
```

**Response 422 (Fecha fuera de periodo de acceso):**
```json
{
  "status": "error",
  "message": "La fecha de la cita está fuera de tu periodo de acceso (desde DD/MM/YYYY hasta DD/MM/YYYY).",
  "errors": []
}
```

**Response 422 (Recurso bloqueado por mantenimiento o bloqueo docente-recurso):**
```json
{
  "status": "error",
  "message": "El recurso no está disponible en ese horario (bloqueo o mantenimiento).",
  "errors": []
}
```

---

### 17.3 Obtener Mis Reservas
**GET** `/api/student/bookings`

**Autenticación:** Requerida

**Query Parameters (opcionales):**
- `status` (string): Filtrar por estado
- `date_from` (date): Desde fecha
- `date_to` (date): Hasta fecha

**Response 200:**
```json
{
  "status": "success",
  "message": "Mis reservas",
  "data": [
    {
      "id": 1,
      "teacher_id": 2,
      "teacher_name": "María",
      "date": "2026-01-25",
      "start_time": "09:00:00",
      "end_time": "10:00:00",
      "status": "confirmed",
      "class_type": "Clase Presencial"
    }
  ]
}
```

---

### 17.4 Cancelar Reserva
**POST** `/api/student/cancel-booking`

**Autenticación:** Requerida

**Body:**
```json
{
  "appointment_id": 1,
  "student_id": 1,
  "reason": "No puedo asistir"
}
```

**Validaciones:**
- `appointment_id`: requerido, debe existir en appointments
- `student_id`: requerido, debe existir en users
- `reason`: opcional, string

**Validaciones de Negocio:**
- No se puede cancelar clases completadas
- La reservación debe pertenecer al estudiante
- Si `cancellation_allow_after_limit` = false y la cancelación es tardía (menos de `cancellation_hours_limit` horas antes) → **422**
- Si se permite y es tardía, puede aplicarse multa según `cancellation_late_penalty_enabled` y el monto por tipo de clase (o `cancellation_late_penalty_amount` como fallback); se valida que el tipo de clase de la cita exista.

**Response 200:**
```json
{
  "status": "success",
  "message": "Reservación cancelada correctamente",
  "data": {
    "id": 1,
    "status": "cancelled",
    "penalty_applied": false
  }
}
```

Cuando se aplica multa: `penalty_applied` = true y se incluye `penalty`: `{ "id": 1, "amount": 50000, "reason": "Cancelación tardía - Menos de 4 horas antes de la clase" }`. El mensaje puede ser "Reservación cancelada. Se aplicó una penalización por cancelación tardía."

**Response 422 (Tiempo límite):**
```json
{
  "status": "error",
  "message": "No puede cancelar; ha superado el tiempo límite.",
  "errors": []
}
```

---

### 17.5 Obtener Mis Multas
**GET** `/api/student/fines`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Mis multas",
  "data": [
    {
      "id": 1,
      "amount": 50000,
      "reason": "Cancelación tardía",
      "paid": false,
      "created_at": "2026-01-20T10:00:00.000000Z"
    }
  ],
  "summary": {
    "total_fines": 1,
    "total_amount": 50000,
    "paid_amount": 0,
    "unpaid_amount": 50000
  }
}
```

---

### 17.6 Obtener Mi Deuda
**GET** `/api/student/debt`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Mi deuda",
  "data": {
    "user_id": 1,
    "total_debt": 50000,
    "unpaid_penalties": 1,
    "can_book": false
  }
}
```

---


---

## Notas Importantes

1. **Autenticación:** Todos los endpoints (excepto `/register` y `/login`) requieren el header `Authorization: Bearer {token}`.

2. **Formato de Fechas:**
   - Fechas: `YYYY-MM-DD` (ejemplo: `2026-01-25`)
   - Horas: `HH:i` o `HH:i:s` (ejemplo: `09:00` o `09:00:00`)

3. **Paginación:** Los endpoints que retornan listas paginadas usan el formato estándar de Laravel o el formato personalizado de `ResponseHelper::paginated`.

4. **Validaciones:** Todos los campos requeridos deben ser enviados. Los campos opcionales pueden omitirse o enviarse como `null`.

5. **Errores de Validación:** Cuando hay errores de validación, la API retorna código `422` con un objeto `errors` que contiene los campos y sus mensajes de error.

6. **Recursos y Tipos de Clase:** Al crear una cita, si el tipo de clase tiene `requires_resource = true`, es obligatorio proporcionar un `resource_id`.

7. **Horarios Disponibles:** 
   - El endpoint `/appointments/available-slots` calcula los slots disponibles para una fecha específica considerando:
     - Horarios del profesor para ese día
     - Bloques de tiempo bloqueados del profesor (`TeacherBlockedTime`)
     - Citas existentes del profesor
     - Si requiere recurso: citas existentes del recurso; **bloques de disponibilidad del recurso** (`ResourceAvailabilityBlock`: mantenimiento/taller) que solapen el slot; **bloqueos docente-recurso** (`TeacherResourceBlock`) para ese profesor y recurso en esa fecha.
   - El endpoint `/api/student/available-slots` retorna slots disponibles para un rango de fechas. El rango se controla mediante el setting `scheduling_days_limit` (default: 7 días). Si no se envían `date_from`/`date_to`, se muestra el rango por defecto. Si se envían, el rango se acota automáticamente según el límite configurado. Los slots excluyen automáticamente horarios en los que el recurso está en mantenimiento (`ResourceAvailabilityBlock`) o el docente tiene bloqueado ese recurso (`TeacherResourceBlock`).

8. **Dashboard de Profesor:** Los endpoints de `/api/teacher/` están diseñados para que los profesores gestionen sus clases, asistencia y cancelaciones.

9. **Dashboard de Estudiante:** Los endpoints de `/api/student/` permiten a los estudiantes ver disponibilidad, hacer reservas, ver sus multas y deuda.

10. **Multas y Deuda:** 
    - Las multas se crean automáticamente al cancelar una clase en ciertos casos
    - Los estudiantes no pueden hacer nuevas reservas si tienen deuda pendiente
    - La deuda se calcula sumando todas las penalizaciones no pagadas

---

## Ejemplo de Flujo Completo

### 1. Registrar/Login
```bash
POST /api/register
# Obtener token
```

### 2. Usar el token en requests siguientes
```bash
GET /api/me
Authorization: Bearer {token}
```

### 3. Ver Horarios Disponibles (como Estudiante)
```bash
GET /api/student/available-slots?classType=theoretical&date_from=2026-01-26&date_to=2026-01-30&teacher_id=2
Authorization: Bearer {token}
```

### 4. Reservar una Clase
```bash
POST /api/student/book-class
Authorization: Bearer {token}
{
  "teacher_id": 2,
  "student_id": 1,
  "class_type_id": 1,
  "resource_id": 3,
  "date": "2026-01-25",
  "start_time": "09:00",
  "end_time": "10:00"
}
```

### 5. Ver mis Reservas
```bash
GET /api/student/bookings
Authorization: Bearer {token}
```

### 6. Como Profesor: Ver mis Clases
```bash
GET /api/teacher/classes
Authorization: Bearer {token}
```

### 7. Registrar Asistencia
```bash
POST /api/teacher/classes/attendance
Authorization: Bearer {token}
{
  "appointment_id": 1,
  "attended": true
}
```

### 8. Ver mi Deuda (como Estudiante)
```bash
GET /api/student/debt
Authorization: Bearer {token}
```

---

## Cambios Recientes

### v1.2 (2026-01-22) - Actualizaciones Solicitadas por Frontend

- **Actualizado:** `GET /api/dashboard/last-month-reservations` - Ahora incluye array `reservations` completo con todas las relaciones
- **Actualizado:** `GET /api/dashboard/completed-reservations` - Ahora incluye array `reservations` con campo `attended` y soporte para query param `teacher`
- **Agregado:** `GET /api/teachers/{id}` - Endpoint para obtener profesor por ID con formato consistente
- **Agregado:** `GET /api/students/{id}` - Endpoint para obtener estudiante por ID con formato consistente
- **Actualizado:** `GET /api/resources/{id}` - Ahora usa formato `ResponseHelper::success()` para consistencia
- **Actualizado:** `GET /api/vehicles` - Ahora usa formato `ResponseHelper::paginated()` para consistencia
- **Actualizado:** `GET /api/classrooms` - Ahora usa formato `ResponseHelper::paginated()` para consistencia
- **Actualizado:** Todos los endpoints POST/PUT de vehicles y classrooms ahora usan formato consistente

### v1.1 (2026-01-20)

- **Agregados:** Endpoints de Gestión de Profesores (CRUD y Disponibilidad)
- **Agregados:** Endpoints de Gestión de Estudiantes (CRUD)
- **Agregados:** Dashboard de Profesor con asistencia y cancelación
- **Agregados:** Dashboard General con estadísticas
- **Agregados:** Dashboard de Estudiante con reservas, multas y deuda
- **Actualizado:** Numeración de secciones para incluir nuevos endpoints

---

**Documento generado el:** 2026-01-22  
**Versión de la API:** 1.2  
**Última actualización:** 2026-01-22
