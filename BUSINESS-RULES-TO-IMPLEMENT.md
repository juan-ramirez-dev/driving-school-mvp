# Business Rules to Implement in Frontend

Based on analysis of `API_CONTRACTS.md` and `ENDPOINTS-FRONTEND.md`, here are the business rules that need to be applied in the current endpoints:

## 1. Cancellation Rules (Parametrizable via System Settings)

### System Settings Required:
- `cancellation_hours_limit` (int, default: 4) - Minimum hours before appointment to cancel "on time"
- `cancellation_allow_after_limit` (bool, default: true) - Whether cancellation is allowed after the limit
- `cancellation_late_penalty_enabled` (bool, default: true) - Whether there's a penalty for late cancellation
- `cancellation_late_penalty_amount` (int, default: 50000) - Penalty amount for late cancellation

### Rules to Implement:

#### A. Student Cancellation (`POST /api/student/cancel-booking`)
**Current Status:** Basic validation exists, but missing:
1. ✅ Check if appointment belongs to student
2. ✅ Check if appointment is completed (cannot cancel)
3. ❌ **MISSING:** Check if cancellation is late (< `cancellation_hours_limit` hours before)
4. ❌ **MISSING:** If `cancellation_allow_after_limit` = false and late → return 422 error
5. ❌ **MISSING:** If allowed and late, apply penalty when `cancellation_late_penalty_enabled` = true
6. ❌ **MISSING:** Response should include `penalty_applied` (bool) and `penalty` object when applied

**Implementation Needed:**
- Fetch system settings before cancellation
- Calculate hours until appointment
- Apply business logic based on settings
- Handle penalty creation if needed

#### B. Appointment Status Update (`PATCH /api/appointments/{id}/status`)
**Current Status:** Not fully implemented
1. ❌ **MISSING:** Cannot modify appointment with status `completed`
2. ❌ **MISSING:** If `status` = `cancelled` and has `student_id`: apply cancellation rules
3. ❌ **MISSING:** Same late cancellation logic as student cancellation

#### C. Teacher Class Cancellation (`POST /api/teacher/classes/cancel`)
**Current Status:** Basic validation exists
1. ✅ Check if class can be cancelled (not completed)
2. ❌ **MISSING:** Should validate that only `scheduled` or `confirmed` status can be cancelled
3. ❌ **MISSING:** Should use `reason` field (currently uses `justification` in some places)

---

## 2. Attendance Rules (Parametrizable via System Settings)

### System Settings Required:
- `attendance_tolerance_minutes` (int, default: 10) - Tolerance in minutes (late vs attended)
- `attendance_count_absent_as_no_show` (bool, default: true) - Mark "absent" as no-show for penalty and limit
- `attendance_no_show_penalty_enabled` (bool, default: true) - Whether there's a penalty for no-show
- `attendance_no_show_penalty_amount` (int, default: 50000) - Penalty amount for no-show
- `attendance_no_show_limit` (int, default: 3) - Limit of no-shows; when exceeded, student cannot book new classes

### Rules to Implement:

#### A. Teacher Attendance Registration (`POST /api/teacher/classes/attendance`)
**Current Status:** Basic implementation exists, but missing:
1. ✅ `student_id` is now included (fixed)
2. ❌ **MISSING:** If `attended` = false: mark `attendance_status` = `absent`
3. ❌ **MISSING:** If `attendance_count_absent_as_no_show` = true and `attendance_no_show_penalty_enabled` = true, apply penalty
4. ❌ **MISSING:** Response should include `penalty_applied` (bool) when `attended` = false
5. ❌ **MISSING:** Validate that student belongs to the appointment

**Implementation Needed:**
- Fetch system settings before marking attendance
- Apply penalty logic when `attended` = false
- Return `penalty_applied` in response

#### B. Student Booking (`POST /api/student/book-class`)
**Current Status:** Basic validation exists, but missing:
1. ✅ Check slot availability
2. ✅ Check resource availability
3. ❌ **MISSING:** Check if student has exceeded `attendance_no_show_limit`
4. ❌ **MISSING:** If exceeded → return 422: "Ha superado el límite de inasistencias. No puede reservar nuevas clases."
5. ❌ **MISSING:** Check if student has unpaid debt (should prevent booking)

**Implementation Needed:**
- Fetch student's no-show count before booking
- Fetch student's debt before booking
- Block booking if limit exceeded or debt exists
- Show appropriate error messages

---

## 3. Appointment Status Rules

### Rules to Implement:

#### A. Cannot Modify Completed Appointments
**Current Status:** Not implemented
1. ❌ **MISSING:** `PUT /api/appointments/{id}` - Cannot update if status = `completed`
2. ❌ **MISSING:** `PATCH /api/appointments/{id}/status` - Cannot change status if current status = `completed`
3. ❌ **MISSING:** `DELETE /api/appointments/{id}` - Cannot delete if status = `completed`

**Error Response:** `{ "status": "error", "message": "No se puede modificar una clase finalizada", "errors": [] }`

#### B. Resource Validation
**Current Status:** Partially implemented
1. ✅ Check if resource is occupied when creating appointment
2. ❌ **MISSING:** If `class_type.requires_resource = true`, then `resource_id` is **mandatory**
3. ❌ **MISSING:** Validate this in `POST /api/appointments` and `POST /api/student/book-class`

**Error Response:** `{ "status": "error", "message": "Este tipo de clase requiere un recurso", "errors": [] }`

---

## 4. Class Type Deletion Rules

### Rules to Implement:

#### A. Cannot Delete Class Type with Associated Appointments
**Current Status:** Not implemented
1. ❌ **MISSING:** `DELETE /api/classtype/{id}` - Check if class type has appointments
2. ❌ **MISSING:** If has appointments → return 422

**Error Response:** `{ "message": "No se puede eliminar un tipo de clase con citas asociadas" }`

---

## 5. Teacher Schedule Rules

### Rules to Implement:

#### A. No Overlapping Schedules
**Current Status:** Not implemented in frontend (backend should handle, but frontend should show appropriate errors)
1. ❌ **MISSING:** When creating/updating schedule, handle 422 error for overlapping schedules
2. ❌ **MISSING:** Show user-friendly error message: "El horario se cruza con otro existente"

**Error Response:** `{ "message": "The given data was invalid.", "errors": { "schedule": ["El horario se cruza con otro existente"] } }`

---

## 6. Student Debt Rules

### Rules to Implement:

#### A. Block Booking if Debt Exists
**Current Status:** Not implemented
1. ❌ **MISSING:** Check `GET /api/student/debt` before allowing booking
2. ❌ **MISSING:** If `total_debt > 0` or `can_book = false` → prevent booking
3. ❌ **MISSING:** Show message: "No puede reservar clases mientras tenga deuda pendiente"

**Implementation Needed:**
- Check debt before showing booking UI
- Disable booking button if debt exists
- Show informative message to user

---

## 7. Teacher Resource Assignment Rules

### Rules to Implement:

#### A. No Duplicate Assignments
**Current Status:** Not implemented in frontend
1. ❌ **MISSING:** Handle 422 error when trying to create duplicate assignment
2. ❌ **MISSING:** Show user-friendly error: "El recurso ya está asignado a este profesor"

**Error Response:** `{ "status": "error", "message": "El recurso ya está asignado a este profesor", "errors": [] }`

---

## 8. Response Format Enhancements

### Rules to Implement:

#### A. Attendance Response Should Include Penalty Info
**Current Status:** Not implemented
1. ❌ **MISSING:** `POST /api/teacher/classes/attendance` response should include:
   ```json
   {
     "status": "success",
     "message": "Asistencia actualizada correctamente",
     "data": {
       "appointment_id": 1,
       "student_id": 1,
       "attended": true,
       "notes": "Llegó a tiempo",
       "penalty_applied": false  // ← MISSING
     }
   }
   ```

#### B. Cancellation Response Should Include Penalty Info
**Current Status:** Not implemented
1. ❌ **MISSING:** `POST /api/student/cancel-booking` response should include:
   ```json
   {
     "status": "success",
     "message": "Reservación cancelada correctamente",
     "data": {
       "id": 1,
       "status": "cancelled",
       "penalty_applied": false,  // ← MISSING
       "penalty": {                // ← MISSING (when applied)
         "id": 1,
         "amount": 50000,
         "reason": "Cancelación tardía - Menos de 4 horas antes de la clase"
       }
     }
   }
   ```

---

## Implementation Priority

### High Priority (Core Business Logic):
1. ✅ Student cancellation with late penalty logic
2. ✅ Attendance registration with no-show penalty logic
3. ✅ Student booking validation (no-show limit, debt check)
4. ✅ Appointment status update validation (cannot modify completed)

### Medium Priority (Data Integrity):
5. Resource validation (required_resource check)
6. Class type deletion validation
7. Teacher schedule overlap handling

### Low Priority (UX Enhancements):
8. Response format enhancements (penalty_applied flags)
9. Teacher resource duplicate assignment handling

---

## Notes

- Most of these rules are **parametrizable via System Settings**, so the frontend should:
  1. Fetch relevant system settings before applying rules
  2. Cache settings for performance
  3. Re-fetch when settings are updated
  4. Handle cases where settings don't exist (use defaults)

- The backend should handle most validation, but the frontend should:
  1. Show appropriate error messages
  2. Prevent invalid actions before API calls (UX improvement)
  3. Handle API error responses gracefully

- Some rules require checking multiple endpoints:
  - Booking: Check debt + no-show limit + slot availability
  - Cancellation: Check time limit + apply penalty if needed
  - Attendance: Check settings + apply penalty if needed
