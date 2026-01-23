# Missing API Endpoints

This document lists all API endpoints that are **not currently implemented** in the frontend, with complete request/response contracts.

---

## 1. Authentication

### 1.1 Obtener Usuario Actual
**GET** `/api/me`

**Autenticación:** Requerida

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

## 2. Appointments (Citas)

### 2.1 Listar Citas Activas
**GET** `/api/appointments`

**Autenticación:** Requerida

**Query (opcionales):**
- `teacher_id` (integer): filtrar por profesor
- `student_id` (integer): filtrar por estudiante
- `date` (YYYY-MM-DD): filtrar por fecha

**Ejemplo:** `GET /api/appointments?teacher_id=1&date=2026-01-25`

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
      "teacher": { "id": 2, "name": "María", "document": "87654321" },
      "student": { "id": 1, "name": "Juan", "document": "12345678" },
      "classType": { "id": 1, "name": "Teórica", "requires_resource": false },
      "resource": { "id": 3, "name": "Aula 101", "type": "classroom" }
    }
  ]
}
```
Solo retorna `status` `scheduled` o `confirmed`.

---

### 2.2 Obtener Cita por ID
**GET** `/api/appointments/{id}`

**Autenticación:** Requerida

**Path:** `id` (integer) — ID de la cita

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
    "teacher": { },
    "student": { },
    "classType": { },
    "resource": { }
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
- `date`: requerido, formato YYYY-MM-DD
- `start_time`: requerido, formato HH:i
- `end_time`: requerido, formato HH:i, posterior a `start_time`
- `status`: opcional, uno de: `scheduled`, `confirmed`, `cancelled`, `completed`

**Validaciones de negocio:** Si hay `resource_id`, se valida que el recurso no esté ocupado en ese horario.

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
    "teacher": { },
    "student": { },
    "classType": { },
    "resource": { }
  }
}
```

**Response 422:** `{ "status": "error", "message": "El recurso ya está ocupado en ese horario", "errors": [] }`

---

### 2.4 Actualizar Cita
**PUT** `/api/appointments/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID de la cita  

**Body:** mismos campos que crear.

**Response 200:** `{ "status": "success", "message": "Cita actualizada correctamente", "data": { ... } }`

---

### 2.5 Eliminar Cita
**DELETE** `/api/appointments/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID de la cita

**Response 200:** `{ "status": "success", "message": "Cita eliminada correctamente", "data": [] }`

---

### 2.6 Listar Todas las Citas
**GET** `/api/appointments-all`

**Autenticación:** Requerida

**Query:** mismos que 2.1 (`teacher_id`, `student_id`, `date`).

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado completo de citas",
  "data": [ /* incluye canceladas y completadas */ ]
}
```

---

### 2.7 Cambiar Estado de Cita
**PATCH** `/api/appointments/{id}/status`

**Autenticación:** Requerida

**Path:** `id` — ID de la cita

**Body:**
```json
{
  "status": "confirmed"
}
```

**Validaciones:** `status` requerido, uno de: `scheduled`, `confirmed`, `cancelled`, `completed`.

**Validaciones de negocio:** No se puede modificar una cita con `status` `completed`.

**Response 200:** `{ "status": "success", "message": "Estado de la cita actualizado", "data": { "id": 1, "status": "confirmed", ... } }`

**Response 422:** `{ "status": "error", "message": "No se puede modificar una clase finalizada", "errors": [] }`

---

### 2.8 Obtener Horarios Disponibles
**GET** `/api/appointments/available-slots`

**Autenticación:** Requerida

**Query:**
- `teacher_id` (integer, opcional): ID del profesor
- `date` (YYYY-MM-DD, opcional): fecha
- `class_type_id` (integer, opcional): ID del tipo de clase
- `resource_id` (integer, opcional): obligatorio si el tipo de clase tiene `requires_resource = true`

**Ejemplo:** `GET /api/appointments/available-slots?teacher_id=2&date=2026-01-25&class_type_id=1&resource_id=3`

**Response 200:**
```json
{
  "status": "success",
  "message": "Disponibilidad obtenida correctamente",
  "data": {
    "date": "2026-01-25",
    "slots": [
      { "start": "09:00", "end": "09:30" },
      { "start": "09:30", "end": "10:00" },
      { "start": "10:00", "end": "10:30" }
    ]
  }
}
```

**Response 422:** Si el tipo requiere recurso y no se envía `resource_id`:  
`{ "message": "The given data was invalid.", "errors": { "resource_id": ["Este tipo de clase requiere un recurso"] } }`

---

## 3. Resources (Recursos)

### 3.1 Obtener Recurso por ID
**GET** `/api/resources/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del recurso

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
    "teachers": [ { "id": 2, "name": "María", "document": "87654321" } ]
  }
}
```

---

### 3.2 Crear Recurso
**POST** `/api/resources`

**Autenticación:** Requerida

**Body (aula):**
```json
{
  "name": "Aula 201",
  "type": "classroom",
  "active": true
}
```

**Body (vehículo):**
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
- `name`: requerido, string, máx. 255
- `type`: requerido, `classroom` | `vehicle`
- Si `type = vehicle`: `plate`, `brand`, `model`, `year`, `color` requeridos
- `active`: opcional, boolean

**Response 201:** `{ "status": "success", "message": "...", "data": { ... } }` o objeto recurso según implementación.

---

### 3.3 Actualizar Recurso
**PUT** `/api/resources/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del recurso  

**Body:** mismos campos que crear.

**Response 200:** `{ "status": "success", "message": "...", "data": { ... } }`

---

### 3.4 Desactivar Recurso
**DELETE** `/api/resources/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del recurso  

**Nota:** No elimina, solo pone `active = false`.

**Response 200:** `{ "message": "Recurso desactivado correctamente" }`

---

### 3.5 Asignar Profesores a Recurso
**POST** `/api/resources/{id}/teachers`

**Autenticación:** Requerida

**Path:** `id` — ID del recurso

**Body:**
```json
{
  "teacher_ids": [2, 3, 5]
}
```

**Validaciones:** `teacher_ids` requerido, array; cada ID debe existir en users.

**Response 200:** `{ "message": "Docentes asignados correctamente" }`

---

## 4. Class Types (Tipos de Clase)

### 4.1 Listar Tipos de Clase
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
      "name": "Teórica",
      "requires_resource": false,
      "created_at": "...",
      "updated_at": "..."
    },
    {
      "id": 2,
      "name": "Práctica",
      "requires_resource": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

### 4.2 Obtener Tipo de Clase por ID
**GET** `/api/classtype/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del tipo de clase

**Response 200:** `{ "status": "success", "message": "...", "data": { "id": 1, "name": "Teórica", "requires_resource": false, ... } }`

---

### 4.3 Crear Tipo de Clase
**POST** `/api/classtype`

**Autenticación:** Requerida

**Body:**
```json
{
  "name": "Intensiva",
  "requires_resource": true
}
```

**Validaciones:** `name` requerido, string, máx. 255; `requires_resource` opcional, boolean.

**Response 200/201:** `{ "status": "success", "message": "Tipo de clase creada correctamente", "data": { ... } }`

---

### 4.4 Actualizar Tipo de Clase
**PUT** `/api/classtype/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del tipo  

**Body:** mismos campos que crear.

**Response 200:** `{ "status": "success", "message": "Tipo de clase actualizado correctamente", "data": { ... } }`

---

### 4.5 Eliminar Tipo de Clase
**DELETE** `/api/classtype/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del tipo  

**Validaciones de negocio:** No se puede eliminar si tiene citas asociadas.

**Response 200:** `{ "status": "success", "message": "Tipo de clase eliminado correctamente", "data": [] }`

**Response 422:** `{ "message": "No se puede eliminar un tipo de clase con citas asociadas" }`

---

## 5. Teacher Resources (Recursos de Profesores)

### 5.1 Listar Asignaciones
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
      "user": { "id": 2, "name": "María", "document": "87654321" },
      "resource": { "id": 1, "name": "Aula 101", "type": "classroom" }
    }
  ]
}
```

---

### 5.2 Obtener Asignación por ID
**GET** `/api/teacher-resources/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID de la asignación

**Response 200:** `{ "status": "success", "message": "...", "data": { "id": 1, "user_id": 2, "resource_id": 1, "user": { }, "resource": { } } }`

---

### 5.3 Crear Asignación
**POST** `/api/teacher-resources`

**Autenticación:** Requerida

**Body:**
```json
{
  "user_id": 2,
  "resource_id": 1
}
```

**Validaciones:** `user_id` y `resource_id` requeridos, deben existir. No duplicar misma asignación.

**Response 201:** `{ "status": "success", "message": "Recurso asignado al profesor correctamente", "data": { ... } }`

**Response 422:** `{ "status": "error", "message": "El recurso ya está asignado a este profesor", "errors": [] }`

---

### 5.4 Actualizar Asignación
**PUT** `/api/teacher-resources/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID de la asignación  

**Body:** `user_id`, `resource_id`.

**Response 200:** `{ "status": "success", "message": "Asignación actualizada correctamente", "data": { ... } }`

---

### 5.5 Eliminar Asignación
**DELETE** `/api/teacher-resources/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID de la asignación

**Response 200:** `{ "status": "success", "message": "Asignación eliminada correctamente", "data": [] }`

---

## 6. Teacher Schedules (Horarios de Profesores)

### 6.1 Listar Horarios
**GET** `/api/teacher-schedules`

**Autenticación:** Requerida

**Query:** `teacher_id` (integer, requerido) — ID del profesor.

**Ejemplo:** `GET /api/teacher-schedules?teacher_id=2`

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
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```
`day_of_week`: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado.

---

### 6.2 Crear Horario
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
- `user_id`: requerido, existe en users
- `day_of_week`: requerido, integer 0–6
- `start_time`, `end_time`: requeridos, HH:i, `end_time` > `start_time`
- `slot_minutes`: requerido, integer 5–240

**Validaciones de negocio:** No solapamiento de horarios mismo profesor y día.

**Response 201:** `{ "status": "success", "message": "Horario creado correctamente", "data": { ... } }`

**Response 422:** `{ "message": "The given data was invalid.", "errors": { "schedule": ["El horario se cruza con otro existente"] } }`

---

### 6.3 Actualizar Horario
**PUT** `/api/teacher-schedules/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del horario  

**Body:** `day_of_week`, `start_time`, `end_time`, `slot_minutes`, `active` (mismas reglas que crear).

**Response 200:** `{ "status": "success", "message": "Horario actualizado correctamente", "data": { ... } }`

---

### 6.4 Eliminar Horario
**DELETE** `/api/teacher-schedules/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del horario

**Response 200:** `{ "status": "success", "message": "Horario eliminado correctamente", "data": null }`

---

### 6.5 Activar/Desactivar Horario
**PATCH** `/api/teacher-schedules/{id}/toggle`

**Autenticación:** Requerida

**Path:** `id` — ID del horario

**Response 200:** `{ "status": "success", "message": "Horario activado" | "Horario desactivado", "data": { ... } }`

---

## 7. System Settings

### 7.1 Listar Configuraciones
**GET** `/api/system-settings`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de configuraciones del sistema",
  "data": [
    { "id": 1, "setting_key": "attendance_tolerance_minutes", "type": "int", "value": 10 },
    { "id": 2, "setting_key": "max_appointments_per_day", "type": "string", "value": "5" }
  ]
}
```

---

### 7.2 Obtener Configuración por Key
**GET** `/api/system-settings/{key}`

**Autenticación:** Requerida

**Path:** `key` (string) — clave de la configuración.

**Response 200:** `{ "status": "success", "message": "Configuración encontrada", "data": { "setting_key": "...", "type": "int", "value": 10 } }`

---

### 7.3 Crear Configuración
**POST** `/api/system-settings`

**Body:** `{ "setting_key": "max_appointments_per_day", "type": "int", "value": "5" }`  
**Validaciones:** `setting_key` único; `type` en `string`, `int`, `bool`, `json`; `value` requerido.

**Response 201:** `{ "status": "success", "message": "Configuración creada correctamente", "data": { ... } }`

---

### 7.4 Actualizar Configuración
**PUT** `/api/system-settings/{key}`

**Path:** `key`  
**Body:** `{ "type": "int", "value": "10" }`

**Response 200:** `{ "status": "success", "message": "Configuración actualizada correctamente", "data": { ... } }`

---

### 7.5 Eliminar Configuración
**DELETE** `/api/system-settings/{key}`

**Path:** `key`

**Response 200:** `{ "status": "success", "message": "Configuración eliminada correctamente", "data": null }`

---

## 8. Penalties (Penalizaciones)

### 8.1 Listar Penalizaciones
**GET** `/api/penalties`

**Autenticación:** Requerida

**Query (opcional):** `user_id` (integer)

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
      "created_at": "...",
      "user": { },
      "appointment": { }
    }
  ]
}
```

---

### 8.2 Crear Penalización
**POST** `/api/penalties`

**Body:** `{ "user_id": 1, "appointment_id": 5, "amount": 50000, "reason": "Cancelación tardía" }`  
**Validaciones:** `user_id` requerido; `appointment_id` opcional; `amount` ≥ 1; `reason` requerido.

**Response 201:** `{ "status": "success", "message": "Penalización creada correctamente", "data": { ... } }`

---

### 8.3 Marcar como Pagada
**POST** `/api/penalties/{id}/pay`

**Path:** `id` — ID de la penalización

**Response 200:** `{ "status": "success", "message": "Penalización marcada como pagada", "data": { "id": 1, "paid": true, "paid_at": "...", ... } }`

---

### 8.4 Deuda por Usuario
**GET** `/api/penalties/user/{userId}/debt`

**Path:** `userId` — ID del usuario

**Response 200:** `{ "status": "success", "message": "Total de deuda del usuario", "data": { "user_id": 1, "total_debt": 150000 } }`

---

## 9. Users (Gestión de Usuarios)

### 9.1 Crear o Actualizar Usuario
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

**Validaciones:** `name`, `last_name`, `document`, `email`, `role` requeridos; `role` en `user`, `docente`.

**Nota:** Si existe por email, actualiza; si no, crea. Genera contraseña y envía credenciales por correo.

**Response 201:** `{ "success": true, "message": "Usuario creado/actualizado y credenciales enviadas por correo", "data": { "id": 1, "name": "...", "document": "...", "role": "..." } }`

---

## 10. Teachers (Profesores)

### 10.1 Obtener Profesor por ID
**GET** `/api/teachers/{id}`

**Path:** `id` — ID del profesor

**Response 200:** `{ "status": "success", "message": "Profesor obtenido correctamente", "data": { "id": 2, "name": "María", "last_name": "García", "document": "87654321", "email": "...", "role": "docente", "active": true, ... } }`

**Response 404:** `{ "status": "error", "message": "El usuario no es un profesor", "errors": [] }`

---

## 11. Students (Estudiantes)

### 11.1 Obtener Estudiante por ID
**GET** `/api/students/{id}`

**Path:** `id`

**Response 200:** `{ "status": "success", "message": "Estudiante obtenido correctamente", "data": { "id": 1, "name": "Juan", "last_name": "Pérez", "document": "12345678", "email": "...", "role": "user", "active": true, ... } }`

**Response 404:** `{ "status": "error", "message": "El usuario no es un estudiante", "errors": [] }`

---

## Summary

### Total Missing Endpoints by Category:
1. **Appointments**: 8 endpoints
2. **Class Types**: 5 endpoints
3. **Teacher Resources**: 5 endpoints
4. **Teacher Schedules**: 5 endpoints
5. **System Settings**: 5 endpoints
6. **Penalties (Admin)**: 4 endpoints
7. **Resources (CRUD)**: 5 endpoints
8. **Users**: 1 endpoint
9. **Teachers**: 1 endpoint (GET by ID)
10. **Students**: 1 endpoint (GET by ID)
11. **Authentication**: 1 endpoint (GET /me)

### Total: **41 missing endpoints**

### Priority Recommendations:
1. **High Priority**: 
   - `GET /api/me` - Essential for user session management
   - `GET /api/appointments/available-slots` - Used for booking flow
   - `GET /api/teachers/{id}` and `GET /api/students/{id}` - Needed for detail views
   - `GET /api/resources/{id}` - Needed for resource detail views

2. **Medium Priority**:
   - Appointments CRUD endpoints - Core functionality
   - Class Types endpoints - Needed for class type management
   - Teacher Schedules endpoints - Needed for schedule management

3. **Low Priority**:
   - System Settings - Admin configuration
   - Teacher Resources - Resource assignment management
   - Penalties admin endpoints - Already covered by student endpoints
