# Contratos de API para Frontend

Documento con **contratos completos** de todos los endpoints que el frontend debe consumir.  
Incluye método, ruta, headers, body/query, validaciones y respuestas (200, 201, 422, etc.).

---

## Información General

**Base URL:** `http://localhost:8000/api` (ajustar según entorno)

**Autenticación:** Laravel Sanctum. Todos los endpoints (excepto `POST /api/register` y `POST /api/login`) requieren:
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

**Formato de respuestas:**
- **Éxito:** `{ "status": "success", "message": "...", "data": { ... } }`
- **Error:** `{ "status": "error", "message": "...", "errors": { ... } }`
- **Validación 422:** `{ "message": "The given data was invalid.", "errors": { "campo": ["..."] } }`

**Códigos HTTP:** `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `404` Not Found, `422` Unprocessable Entity

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
- `document`: requerido, integer, único en users
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

**Response 422:** `{ "message": "The given data was invalid.", "errors": { "document": ["..."], "password": ["..."] } }`

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

**Response 422:** `{ "message": "The given data was invalid.", "errors": { "document": ["Credenciales incorrectas"] } }`

---

### 1.3 Cerrar Sesión
**POST** `/api/logout`

**Autenticación:** Requerida

**Response 200:** `{ "message": "Sesión cerrada correctamente" }`

---

### 1.4 Obtener Usuario Actual
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

**Validaciones de negocio:** Si hay `resource_id`, se valida que el recurso no esté ocupado en ese horario. Si hay `resource_id` y `teacher_id`, se valida que el slot no esté bloqueado por un bloque de disponibilidad del recurso (mantenimiento, `ResourceAvailabilityBlock`) ni por un bloqueo docente-recurso (`TeacherResourceBlock`) → **422** con "El recurso no está disponible en ese horario (bloqueo o mantenimiento)." Si hay `student_id` y el estudiante tiene `access_start_date` y `access_end_date` definidos, la fecha de la cita debe estar dentro de ese rango → **422** si no. Si hay `student_id` y `student_max_hours_per_period` > 0, se valida que la suma de horas agendadas del estudiante en el periodo (según `student_hours_period_type`) más la duración del slot no supere el límite → **422** si se supera.

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

**Response 422:**
- `{ "status": "error", "message": "El recurso ya está ocupado en ese horario", "errors": [] }`
- `{ "status": "error", "message": "El recurso no está disponible en ese horario (bloqueo o mantenimiento).", "errors": [] }`
- `{ "status": "error", "message": "La fecha de la cita está fuera de tu periodo de acceso (desde DD/MM/YYYY hasta DD/MM/YYYY).", "errors": [] }`
- `{ "status": "error", "message": "Ha alcanzado el máximo de X horas para este periodo.", "errors": [] }`

---

### 2.4 Actualizar Cita
**PUT** `/api/appointments/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID de la cita  

**Body:** mismos campos que crear.

**Validaciones de negocio:** Además de las de crear (rango de acceso, límites de clases/horas), si se envían `resource_id` y `teacher_id` se valida que el slot no esté bloqueado por `ResourceAvailabilityBlock` ni `TeacherResourceBlock` → **422** "El recurso no está disponible en ese horario (bloqueo o mantenimiento)."

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

**Validaciones de negocio:**
- No se puede modificar una cita con `status` `completed`.
- Si `status` = `cancelled` y la cita tiene `student_id`: se aplican reglas de cancelación. Si `cancellation_allow_after_limit` = false y la cancelación es tardía → **422**. Si se permite, puede aplicarse multa por cancelación tardía.

**Response 200:** `{ "status": "success", "message": "Estado de la cita actualizado", "data": { "id": 1, "status": "confirmed", ... } }`

**Response 422:**
- `{ "status": "error", "message": "No se puede modificar una clase finalizada", "errors": [] }`
- `{ "status": "error", "message": "No puede cancelar; ha superado el tiempo límite.", "errors": [] }`

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

### 3.1 Listar Recursos
**GET** `/api/resources`

**Autenticación:** Requerida

**Query (opcionales):** `type` (`classroom` | `vehicle`), `per_page`

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
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "pagination": { "total": 15, "per_page": 10, "current_page": 1, "last_page": 2, "next_page_url": "...", "prev_page_url": null }
}
```

---

### 3.2 Obtener Recurso por ID
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

### 3.3 Crear Recurso
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

### 3.4 Actualizar Recurso
**PUT** `/api/resources/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del recurso  

**Body:** mismos campos que crear.

**Response 200:** `{ "status": "success", "message": "...", "data": { ... } }`

---

### 3.5 Desactivar Recurso
**DELETE** `/api/resources/{id}`

**Autenticación:** Requerida

**Path:** `id` — ID del recurso  

**Nota:** No elimina, solo pone `active = false`.

**Response 200:** `{ "message": "Recurso desactivado correctamente" }`

---

### 3.6 Asignar Profesores a Recurso
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

### 3.7 Bloqueos de disponibilidad del recurso (mantenimiento/taller)
**Resource Availability Blocks.** Afectan slots disponibles y validación al crear/actualizar citas.

- **GET** `/api/resource-availability-blocks` — Query: `resource_id` (opcional). Lista bloques ordenados por start_datetime.
- **POST** `/api/resource-availability-blocks` — Body: `resource_id`, `start_datetime`, `end_datetime` (end > start), `reason` (opcional).
- **GET** `/api/resource-availability-blocks/{id}` — Ver un bloque.
- **PUT** `/api/resource-availability-blocks/{id}` — Actualizar.
- **DELETE** `/api/resource-availability-blocks/{id}` — Eliminar.

**Response 200/201:** Formato estándar success con `data` del bloque (incl. relación `resource`).

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

### 6.6 Bloqueos docente-recurso (Teacher Resource Blocks)
**Teacher Resource Blocks.** Un docente (o admin) puede bloquear un recurso para una fecha (y opcionalmente rango de horas). Si `start_time`/`end_time` son null = todo el día. Afectan slots disponibles y validación al reservar.

- **GET** `/api/teacher/resource-blocks` — Query: `teacher_id` (solo admin), `resource_id`, `date_from`, `date_to`. Docente solo ve los suyos.
- **POST** `/api/teacher/resource-blocks` — Body: `resource_id`, `date`, `start_time` (opcional), `end_time` (opcional), `reason` (opcional). Docente: teacher_id = auth; admin puede enviar `teacher_id`. Regla: ambos null o ambos presentes con end > start.
- **GET** `/api/teacher/resource-blocks/{id}` — Ver bloque (docente solo los suyos).
- **PUT** `/api/teacher/resource-blocks/{id}` — Actualizar.
- **DELETE** `/api/teacher/resource-blocks/{id}` — Eliminar.

**Response 200/201:** Formato estándar success.

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

### 7.6 Reglas de cancelación y asistencia (parametrizables)

Claves en `system_settings` que parametrizan reglas de negocio. Valores por defecto en `SchoolSettingsSeeder`. Se gestionan con los endpoints de System Settings.

**Cancelación:** `cancellation_hours_limit` (int, 4), `cancellation_allow_after_limit` (bool, true), `cancellation_late_penalty_enabled` (bool, true), `cancellation_late_penalty_amount` (int, 50000). Multas por tipo de clase: `cancellation_late_penalty_amount_class_type_{id}` (int); si existe para el tipo de clase de la cita se usa ese monto, si no el global. En todos los casos de aplicación de multa se valida que el tipo de clase de la cita exista en `class_types`.

**Asistencia:** `attendance_tolerance_minutes` (int, 10), `attendance_count_absent_as_no_show` (bool, true), `attendance_no_show_penalty_enabled` (bool, true), `attendance_no_show_penalty_amount` (int, 50000), `attendance_no_show_penalty_amount_class_type_{id}` (int, por tipo de clase), `attendance_no_show_limit` (int, 3). Al superar el límite de inasistencias, el estudiante no puede reservar nuevas clases.

**Límite de horas por periodo (estudiante):** `student_max_hours_per_period` (int, 0 = sin límite), `student_hours_period_type` (string: `week` | `fortnight` | `month`, default `week`). Si `student_max_hours_per_period` > 0, al crear o actualizar una cita con `student_id` (POST/PUT appointments, POST book-class) se valida que la suma de horas ya agendadas del estudiante en ese periodo más la duración del slot no supere el límite; si se supera → **422** con mensaje "Ha alcanzado el máximo de X horas para este periodo."

**Rango de acceso del estudiante (User):** Los usuarios (estudiantes) pueden tener `access_start_date` y `access_end_date` (date, nullable). Si ambos están definidos, el estudiante solo puede agendar citas cuya fecha esté dentro de ese rango. Validación en POST/PUT appointments y POST book-class → **422** si la fecha está fuera del rango. En GET `/api/student/available-slots` se puede enviar `student_id` (o se usa el usuario autenticado si es estudiante); si tiene rango definido, solo se devuelven slots en fechas con acceso.

**Activación de acceso y correo:** Cuando se activa el acceso de un estudiante (tras crear o actualizar el usuario con `access_start_date` y `access_end_date` que incluyen hoy, y antes no tenía acceso hoy o es usuario recién creado), se envía un correo al estudiante indicando que ya puede agendar clases y el rango de fechas. El correo se encola (Mail/Queue). Criterio documentado en `UserAccessService::notifyIfActivated`.

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

### 8.5 Deuda por Query (Admin)
**GET** `/api/penalties/debt`

**Query:** parámetros según implementación (ej. `user_id`).

**Response 200:** `{ "status": "success", "message": "...", "data": { ... } }`

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

### 10.1 Listar Profesores
**GET** `/api/teachers`

**Query (opcionales):** `search`, `active`, `per_page`

**Response 200:**
```json
{
  "status": "success",
  "message": "Listado de profesores",
  "data": [ { "id": 2, "name": "María", "last_name": "García", "document": "87654321", "email": "...", "role": "docente", "active": true, ... } ],
  "pagination": { "total": 5, "per_page": 10, "current_page": 1, "last_page": 1 }
}
```

---

### 10.2 Obtener Profesor por ID
**GET** `/api/teachers/{id}`

**Path:** `id` — ID del profesor

**Response 200:** `{ "status": "success", "message": "Profesor obtenido correctamente", "data": { "id": 2, "name": "María", "last_name": "García", "document": "87654321", "email": "...", "role": "docente", "active": true, ... } }`

**Response 404:** `{ "status": "error", "message": "El usuario no es un profesor", "errors": [] }`

---

### 10.3 Crear Profesor
**POST** `/api/teachers`

**Body:** `name`, `last_name`, `document`, `email`, `number_phone` (opcional).  
**Validaciones:** documentos y email únicos.

**Response 201:** `{ "id": 2, "name": "...", "last_name": "...", "document": "...", "email": "...", "role": "docente", "active": true }` (o formato estándar según backend).

---

### 10.4 Actualizar Profesor
**PUT** `/api/teachers/{id}`

**Path:** `id`  
**Body:** mismos campos que crear.

**Response 200:** objeto profesor actualizado.

---

### 10.5 Eliminar Profesor
**DELETE** `/api/teachers/{id}`

**Path:** `id`

**Response 200:** `{ "message": "Profesor eliminado correctamente" }`

---

## 11. Students (Estudiantes)

### 11.1 Listar Estudiantes
**GET** `/api/students`

**Query (opcionales):** `search`, `active`, `per_page`

**Response 200:** `{ "status": "success", "message": "Listado de estudiantes", "data": [ ... ], "pagination": { ... } }`

---

### 11.2 Obtener Estudiante por ID
**GET** `/api/students/{id}`

**Path:** `id`

**Response 200:** `{ "status": "success", "message": "Estudiante obtenido correctamente", "data": { "id": 1, "name": "Juan", "last_name": "Pérez", "document": "12345678", "email": "...", "role": "user", "active": true, ... } }`

**Response 404:** `{ "status": "error", "message": "El usuario no es un estudiante", "errors": [] }`

---

### 11.3 Crear Estudiante
**POST** `/api/students`

**Body:** `name`, `last_name`, `document`, `email`, `number_phone` (opcional).  
**Validaciones:** documento y email únicos.

**Response 201:** objeto estudiante creado.

---

### 11.4 Actualizar Estudiante
**PUT** `/api/students/{id}`

**Path:** `id`  
**Body:** mismos campos que crear.

**Response 200:** objeto estudiante actualizado.

---

### 11.5 Eliminar Estudiante
**DELETE** `/api/students/{id}`

**Path:** `id`

**Response 200:** `{ "message": "Estudiante eliminado correctamente" }`

---

## 12. Vehicles (Vehículos)

### 12.1 Listar Vehículos
**GET** `/api/vehicles`

**Query (opcional):** `per_page`

**Response 200:** `{ "status": "success", "message": "Vehículos listados correctamente", "data": [ ... ], "pagination": { ... } }`  
Solo recursos `type = 'vehicle'`.

---

### 12.2 Crear Vehículo
**POST** `/api/vehicles`

**Body:** `name`, `plate`, `brand`, `model`, `year`, `color`, `active` (opcional).

**Response 201:** `{ "status": "success", "message": "Vehículo creado correctamente", "data": { ... } }`

---

### 12.3 Actualizar Vehículo
**PUT** `/api/vehicles/{id}`

**Path:** `id`  
**Body:** mismos campos que crear.

**Response 200:** `{ "status": "success", "message": "Vehículo actualizado correctamente", "data": { ... } }`

---

### 12.4 Eliminar Vehículo
**DELETE** `/api/vehicles/{id}`

**Path:** `id`  
**Nota:** Desactiva (`active = false`), no elimina.

**Response 200:** `{ "status": "success", "message": "Vehículo desactivado correctamente", "data": [] }`

---

## 13. Classrooms (Aulas)

### 13.1 Listar Aulas
**GET** `/api/classrooms`

**Query (opcional):** `per_page`

**Response 200:** `{ "status": "success", "message": "Aulas listadas correctamente", "data": [ ... ], "pagination": { ... } }`  
Solo recursos `type = 'classroom'`.

---

### 13.2 Crear Aula
**POST** `/api/classrooms`

**Body:** `{ "name": "Aula 201", "active": true }`

**Response 201:** `{ "status": "success", "message": "Aula creada correctamente", "data": { ... } }`

---

### 13.3 Actualizar Aula
**PUT** `/api/classrooms/{id}`

**Path:** `id`  
**Body:** `name`, `active`.

**Response 200:** `{ "status": "success", "message": "Aula actualizada correctamente", "data": { ... } }`

---

### 13.4 Eliminar Aula
**DELETE** `/api/classrooms/{id}`

**Path:** `id`  
**Nota:** Desactiva, no elimina.

**Response 200:** `{ "status": "success", "message": "Aula desactivada correctamente", "data": [] }`

---

## 14. Dashboard

### 14.1 Estudiantes Activos
**GET** `/api/dashboard/active-students`

**Autenticación:** Requerida

**Response 200:** `{ "status": "success", "message": "Conteo de estudiantes activos", "data": { "count": 15 } }`

---

### 14.2 Reservas del Último Mes
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
        "teacher": { "id": 2, "name": "María", "last_name": "García", "document": "87654321" },
        "student": { "id": 1, "name": "Juan", "last_name": "Pérez", "document": "12345678" },
        "classType": { "id": 1, "name": "Teórica", "requires_resource": false },
        "resource": { "id": 3, "name": "Aula 101", "type": "classroom" }
      }
    ]
  }
}
```

---

### 14.3 Clases Completadas
**GET** `/api/dashboard/completed-reservations`

**Autenticación:** Requerida

**Query (opcional):** `teacher` (integer) — ID del profesor.

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
        "date": "2026-01-20",
        "start_time": "09:00:00",
        "end_time": "10:00:00",
        "status": "completed",
        "attendance_status": "attended",
        "attended": true,
        "teacher": { },
        "student": { },
        "classType": { },
        "resource": { }
      }
    ]
  }
}
```
`attended`: `true` si `attendance_status` es `attended` o `late`, sino `false`.

---

### 14.4 Exportar RUNT
**GET** `/api/dashboard/export-runt`

**Autenticación:** Requerida

**Response 200:**
```json
{
  "status": "success",
  "message": "Datos para exportación RUNT",
  "data": {
    "school_info": { "name": "Escuela de Conducción", "nit": "123456789" },
    "students": [
      { "document": "12345678", "name": "Juan Pérez", "classes_completed": 10, "status": "active" }
    ],
    "classes": [
      { "student_document": "12345678", "date": "2026-01-20", "type": "theoretical" | "practical", "hours": 1, "status": "completed" }
    ]
  }
}
```

---

## 15. Teacher (Clases del Profesor)

### 15.1 Listar Clases del Profesor
**GET** `/api/teacher/classes`

**Autenticación:** Requerida

**Query (requeridos):**
- `teacherId` (integer): ID del profesor
- `date` (YYYY-MM-DD): fecha

**Ejemplo:** `GET /api/teacher/classes?teacherId=2&date=2026-01-25`

**Response 200:**
```json
{
  "status": "success",
  "message": "Clases del profesor obtenidas correctamente",
  "data": {
    "teacher_id": 2,
    "date": "2026-01-25",
    "theoretical": [
      {
        "id": 1,
        "student_id": 1,
        "class_type_id": 1,
        "resource_id": 3,
        "date": "2026-01-25",
        "start_time": "09:00:00",
        "end_time": "10:00:00",
        "status": "confirmed",
        "student": { "id": 1, "name": "Juan", "document": "12345678" },
        "classType": { },
        "resource": { }
      }
    ],
    "practical": [ ]
  }
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
- `appointment_id`: requerido, existe en appointments
- `student_id`: requerido, existe en users
- `attended`: requerido, boolean
- `notes`: opcional, string

**Validaciones de negocio:** El estudiante debe ser el de la cita.

**Reglas de negocio (parametrizables):** Si `attended` = false se marca `attendance_status` = `absent`. Si `attendance_count_absent_as_no_show` y `attendance_no_show_penalty_enabled` = true, se aplica multa por inasistencia (monto según tipo de clase de la cita; se valida que el tipo de clase exista). La respuesta incluye `penalty_applied` (bool) cuando `attended` = false.

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

**Response 422:** `{ "status": "error", "message": "El estudiante no pertenece a esta clase", "errors": [] }`

---

### 15.3 Cancelar Clase
**POST** `/api/teacher/classes/cancel`

**Autenticación:** Requerida

**Body:**
```json
{
  "appointment_id": 1,
  "justification": "Emergencia personal"
}
```

**Validaciones:** `appointment_id` requerido; `justification` opcional, string.

**Validaciones de negocio:** No se puede cancelar una clase con `status` `completed`.

**Response 200:**
```json
{
  "status": "success",
  "message": "Clase cancelada correctamente",
  "data": {
    "id": 1,
    "status": "cancelled",
    "justification": "Emergencia personal"
  }
}
```

**Response 422:** `{ "status": "error", "message": "No se puede cancelar una clase finalizada", "errors": [] }`

---

## 16. Student (Dashboard Estudiante / Agendar)

### 16.1 Slots Disponibles para Reservar
**GET** `/api/student/available-slots`

**Autenticación:** Requerida

**Query (opcionales):** `classType` — `theoretical` | `practical`; `student_id` o `studentId` (integer) — ID del estudiante. Si se envía `student_id` y el estudiante tiene `access_start_date` y `access_end_date` definidos, solo se devuelven slots en fechas dentro de ese rango. Si el usuario autenticado es estudiante y no se envía, se usa su ID.  
Si no se envía classType, retorna slots de todos los tipos (próximas 2 semanas).

**Response 200:**
```json
{
  "status": "success",
  "message": "Slots disponibles obtenidos correctamente",
  "data": [
    {
      "id": "slot_2_2026-01-25_0900",
      "date": "2026-01-25",
      "startTime": "09:00",
      "endTime": "10:00",
      "teacher": { "id": 2, "name": "Juan Pérez", "document": "87654321" },
      "resource": { "id": 3, "name": "Aula 101", "type": "classroom" } | null,
      "classType": { "id": 1, "name": "Teórica", "requires_resource": false }
    }
  ]
}
```
Para práctica, `resource` será un vehículo cuando `requires_resource` es `true`. Los slots excluyen automáticamente horarios en los que el recurso está en mantenimiento (`ResourceAvailabilityBlock`) o el docente tiene bloqueado ese recurso para esa fecha/hora (`TeacherResourceBlock`).

---

### 16.2 Agendar Clase (Reservar)
**POST** `/api/student/book-class`

**Autenticación:** Requerida

**Body:**
```json
{
  "student_id": 1,
  "teacher_id": 2,
  "class_type_id": 1,
  "resource_id": 3,
  "date": "2026-01-25",
  "start_time": "09:00",
  "end_time": "10:00"
}
```

**Validaciones:**
- `student_id`: requerido, existe en users
- `teacher_id`: requerido, existe en users
- `class_type_id`: requerido, existe en class_types
- `resource_id`: opcional, **obligatorio** si el tipo de clase tiene `requires_resource = true` (ej. Práctica)
- `date`: requerido, YYYY-MM-DD
- `start_time`: requerido, HH:i
- `end_time`: requerido, HH:i, posterior a `start_time`

**Validaciones de negocio:**
- El recurso no debe estar ocupado en ese horario si se envía `resource_id`. Además no debe haber un bloque de disponibilidad del recurso (`ResourceAvailabilityBlock`) ni un bloqueo docente-recurso (`TeacherResourceBlock`) que solape con la fecha/hora. Si el recurso está bloqueado → **422** "El recurso no está disponible en ese horario (bloqueo o mantenimiento)."
- El mismo estudiante no puede tener ya una cita activa del mismo tipo de clase en la misma fecha y horario. Si ya tiene agendada esa clase en ese slot → **422**.
- Tipo Práctica → siempre enviar `resource_id` (vehículo).
- El estudiante no debe superar el límite de inasistencias (`attendance_no_show_limit`). Si lo supera → **422**.
- Si el estudiante tiene `access_start_date` y `access_end_date` definidos, la fecha de la cita debe estar dentro de ese rango. Si no → **422**.
- Si `student_max_hours_per_period` > 0, la suma de horas ya agendadas del estudiante en el periodo (según `student_hours_period_type`) más la duración del slot no debe superar el límite. Si se supera → **422**.

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
    "status": "scheduled",
    "teacher": { },
    "student": { },
    "classType": { },
    "resource": { }
  }
}
```

**Response 422:**
- `{ "status": "error", "message": "Este tipo de clase requiere un recurso", "errors": [] }`
- `{ "status": "error", "message": "El recurso ya está ocupado en ese horario", "errors": [] }`
- `{ "status": "error", "message": "El recurso no está disponible en ese horario (bloqueo o mantenimiento).", "errors": [] }`
- `{ "status": "error", "message": "Ya tiene agendada una clase de este tipo en ese horario. No puede reservar dos veces el mismo espacio.", "errors": [] }`
- `{ "status": "error", "message": "Ha superado el límite de inasistencias. No puede reservar nuevas clases.", "errors": [] }`
- `{ "status": "error", "message": "La fecha de la cita está fuera de tu periodo de acceso (desde DD/MM/YYYY hasta DD/MM/YYYY).", "errors": [] }`
- `{ "status": "error", "message": "Ha alcanzado el máximo de X horas para este periodo.", "errors": [] }`

---

### 16.3 Mis Reservas
**GET** `/api/student/bookings`

**Autenticación:** Requerida

**Query (opcional):** `studentId` o `student_id` (integer) — ID del estudiante.  
Si no se envía, el backend puede usar el usuario autenticado según implementación.

**Response 200:**
```json
{
  "status": "success",
  "message": "Reservaciones del estudiante obtenidas correctamente",
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
      "teacher": { },
      "classType": { },
      "resource": { }
    }
  ]
}
```

---

### 16.4 Cancelar Reserva
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

**Validaciones:** `appointment_id` y `student_id` requeridos; `reason` opcional.

**Validaciones de negocio:** La cita debe pertenecer al estudiante; no se puede cancelar una clase completada. Si `cancellation_allow_after_limit` = false y la cancelación es tardía → **422**. Si se permite y es tardía, puede aplicarse penalización según `cancellation_late_penalty_enabled` (monto por tipo de clase; se valida que el tipo de clase exista).

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
Si hay multa: `penalty_applied` = true y `penalty`: `{ "id": 1, "amount": 50000, "reason": "Cancelación tardía - Menos de 4 horas antes de la clase" }`. Mensaje alternativo: "Reservación cancelada. Se aplicó una penalización por cancelación tardía."

**Response 422:** `{ "status": "error", "message": "No puede cancelar; ha superado el tiempo límite.", "errors": [] }`

---

### 16.5 Mis Multas
**GET** `/api/student/fines`

**Autenticación:** Requerida

**Query (opcional):** `studentId` o `student_id` — ID del estudiante.

**Response 200:**
```json
{
  "status": "success",
  "message": "Multas del estudiante obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "appointment_id": 5,
      "amount": 50000,
      "reason": "Cancelación tardía",
      "paid": false,
      "paid_at": null,
      "appointment": { }
    }
  ]
}
```

---

### 16.6 Mi Deuda
**GET** `/api/student/debt`

**Autenticación:** Requerida

**Query (opcional):** `studentId` o `student_id` — ID del estudiante.

**Response 200:**
```json
{
  "status": "success",
  "message": "Deuda del estudiante obtenida correctamente",
  "data": {
    "student_id": 1,
    "total_debt": 50000,
    "fines_count": 1,
    "fines": [
      { "id": 1, "amount": 50000, "reason": "Cancelación tardía", "paid": false }
    ]
  }
}
```

---

## 17. Teachers Availability

### 17.1 Listar Disponibilidad
**GET** `/api/teachers/availability/all`

**Autenticación:** Requerida

**Response 200:** `{ "status": "success", "message": "...", "data": [ ... ] }`  
Estructura según implementación del backend.

---

### 17.2 Crear/Actualizar Disponibilidad
**POST** `/api/teachers/availability/all`

**Autenticación:** Requerida

**Body:** según implementación (ej. bloque de disponibilidad por profesor/fecha).

**Response 200/201:** `{ "status": "success", "message": "...", "data": { ... } }`

---

## Resumen y Referencia Rápida

### Estructura de datos clave

**User:** `id`, `name`, `last_name`, `document`, `email`, `number_phone`, `role` (`user` | `docente` | `admin`), `active`, `email_verified_at`, `created_at`, `updated_at`

**Appointment:** `id`, `teacher_id`, `student_id`, `class_type_id`, `resource_id`, `date`, `start_time`, `end_time`, `status` (`scheduled` | `confirmed` | `cancelled` | `completed`), `attendance_status`, `attendance_notes`, `cancellation_reason`, `checked_in_at`, `teacher`, `student`, `classType`, `resource`

**ClassType:** `id`, `name`, `requires_resource`  
Ej.: Teórica `requires_resource: false`, Práctica `requires_resource: true` (siempre enviar `resource_id` al agendar).

**Resource:** `id`, `name`, `type` (`classroom` | `vehicle`), `plate`, `brand`, `model`, `year`, `color`, `active`

**TeacherSchedule:** `id`, `user_id`, `day_of_week` (0–6), `start_time`, `end_time`, `slot_minutes`, `active`

**Penalty:** `id`, `user_id`, `appointment_id`, `amount`, `reason`, `paid`, `paid_at`

### Formatos
- Fechas: `YYYY-MM-DD` (ej. `2026-01-25`)
- Horas: `HH:i` o `HH:i:s` (ej. `09:00`, `09:00:00`)

### Prioridad para el frontend
1. **Alta:** `GET /api/me`, `GET /api/appointments/available-slots`, `POST /api/student/book-class`, `GET /api/student/available-slots`, `GET /api/student/bookings`, `GET /api/teachers/{id}`, `GET /api/students/{id}`, `GET /api/resources/{id}`, `GET /api/classtype`
2. **Media:** Appointments CRUD, Class Types, Teacher Schedules, Student (cancel, fines, debt), Teacher (classes, attendance, cancel), Dashboard
3. **Baja:** System Settings, Teacher Resources, Penalties admin, Vehicles/Classrooms (si se usan vía Resources)

---

**Documento generado para frontend.**  
**Versión:** 2.0 | **Fecha:** 2026-01-23 | **Incluye contratos completos por endpoint.**
