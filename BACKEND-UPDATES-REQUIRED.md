# Backend Updates Required

## Summary

This document lists all the changes that need to be implemented in the backend API to fully support the frontend application. These updates are **recommended** for better data completeness and consistency, though the frontend has been adapted to work with the current backend structure.

**Status:** Frontend is fully functional with transformations. These backend updates will improve data completeness and reduce frontend transformation complexity.

**Last Updated:** 2026-01-22

---

## 🔴 Priority 1: Data Completeness (Critical for Full Functionality)

### 1. Dashboard Endpoints - Missing Reservation Arrays

#### 1.1 GET `/api/dashboard/last-month-reservations`

**Current Backend Response:**
```json
{
  "status": "success",
  "message": "Reservas del último mes",
  "data": {
    "total": 45,
    "confirmed": 40,
    "scheduled": 3,
    "cancelled": 2
  }
}
```

**Required Update:**
Add `reservations` array to the response:

```json
{
  "status": "success",
  "message": "Reservas del último mes",
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
      // ... more reservations
    ]
  }
}
```

**Reason:** Frontend displays a detailed reservation list. Currently, the frontend shows an empty array because the backend doesn't provide reservation details.

**Implementation Notes:**
- Include all reservations from the last month (30 days)
- Include related data: teacher, student, classType, resource
- Filter by status if needed (confirmed, scheduled, cancelled)

---

#### 1.2 GET `/api/dashboard/completed-reservations`

**Current Backend Response:**
```json
{
  "status": "success",
  "message": "Clases completadas",
  "data": {
    "total": 120,
    "attended": 118,
    "not_attended": 2,
    "completion_rate": 98.33
  }
}
```

**Required Updates:**

1. **Add `reservations` array** (same structure as above)
2. **Support `teacher` query parameter:**

```
GET /api/dashboard/completed-reservations?teacher=2
```

Should filter completed reservations by teacher ID.

**Updated Response:**
```json
{
  "status": "success",
  "message": "Clases completadas",
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
        "attended": true,
        "teacher": { /* ... */ },
        "student": { /* ... */ },
        "classType": { /* ... */ },
        "resource": { /* ... */ }
      }
      // ... more completed reservations
    ]
  }
}
```

**Reason:** 
- Frontend displays reservation list and needs the data
- Frontend uses `teacher` param for filtering (currently not supported by backend)

**Implementation Notes:**
- Include only reservations with `status = "completed"`
- Include `attended` field (boolean) to indicate if student attended
- Support optional `teacher` query parameter for filtering
- Include related data: teacher, student, classType, resource

---

## 🟡 Priority 2: Response Format Consistency

### 2. Pagination Format Standardization

**Issue:** Some endpoints use Laravel standard pagination format, others use `ResponseHelper::paginated` format.

**Current Inconsistency:**

**Laravel Standard Format** (used by `/vehicles` and `/classrooms`):
```json
{
  "data": [...],
  "current_page": 1,
  "per_page": 10,
  "total": 5,
  "last_page": 1
}
```

**ResponseHelper::paginated Format** (used by `/teachers` and `/students`):
```json
{
  "status": "success",
  "message": "Listado de profesores",
  "data": [...],
  "pagination": {
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```

**Required Update:**

Standardize all list endpoints to use `ResponseHelper::paginated` format:

**Affected Endpoints:**
- `GET /api/vehicles` (Section 13.1)
- `GET /api/classrooms` (Section 14.1)

**Updated Response Format:**
```json
{
  "status": "success",
  "message": "Listado de vehículos",
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
    "last_page": 1
  }
}
```

**Reason:** 
- Consistency across all endpoints
- Frontend can handle both formats, but standardization reduces complexity
- Better error handling with status/message wrapper

---

## 🟢 Priority 3: Optional Enhancements (Nice to Have)

### 3. Response Wrapper Consistency

**Issue:** Some endpoints return data directly, others wrap in `ResponseHelper::success()`.

**Examples:**

**Direct Response** (Section 11.2 - GET `/api/teachers/{id}`):
```json
{
  "id": 2,
  "name": "María",
  "last_name": "García",
  ...
}
```

**Wrapped Response** (Section 11.1 - GET `/api/teachers`):
```json
{
  "status": "success",
  "message": "Listado de profesores",
  "data": [...]
}
```

**Recommendation:** 
- Standardize all endpoints to use `ResponseHelper::success()` wrapper
- This provides consistent error handling and status codes
- Frontend already handles both formats, but consistency is better

**Affected Endpoints:**
- `GET /api/teachers/{id}` (Section 11.2)
- `GET /api/students/{id}` (Section 12.2)
- `GET /api/resources/{id}` (Section 4.2)
- `POST /api/vehicles` (Section 13.2) - Returns direct object
- `POST /api/classrooms` (Section 14.2) - Returns direct object
- `PUT /api/vehicles/{id}` (Section 13.3) - Returns direct object
- `PUT /api/classrooms/{id}` (Section 14.3) - Returns direct object

**Updated Format:**
```json
{
  "status": "success",
  "message": "Profesor obtenido correctamente",
  "data": {
    "id": 2,
    "name": "María",
    "last_name": "García",
    ...
  }
}
```

---

## 📋 Summary of Required Changes

### Critical (Priority 1) - Data Completeness

| Endpoint | Change Required | Status |
|----------|----------------|--------|
| `GET /api/dashboard/last-month-reservations` | Add `reservations` array | ⚠️ **REQUIRED** |
| `GET /api/dashboard/completed-reservations` | Add `reservations` array + support `teacher` query param | ⚠️ **REQUIRED** |

### Important (Priority 2) - Consistency

| Endpoint | Change Required | Status |
|----------|----------------|--------|
| `GET /api/vehicles` | Use `ResponseHelper::paginated` format | 🔄 **RECOMMENDED** |
| `GET /api/classrooms` | Use `ResponseHelper::paginated` format | 🔄 **RECOMMENDED** |

### Optional (Priority 3) - Enhancement

| Endpoint | Change Required | Status |
|----------|----------------|--------|
| `GET /api/teachers/{id}` | Wrap in `ResponseHelper::success()` | 💡 **OPTIONAL** |
| `GET /api/students/{id}` | Wrap in `ResponseHelper::success()` | 💡 **OPTIONAL** |
| `GET /api/resources/{id}` | Wrap in `ResponseHelper::success()` | 💡 **OPTIONAL** |
| `POST /api/vehicles` | Wrap in `ResponseHelper::success()` | 💡 **OPTIONAL** |
| `POST /api/classrooms` | Wrap in `ResponseHelper::success()` | 💡 **OPTIONAL** |
| `PUT /api/vehicles/{id}` | Wrap in `ResponseHelper::success()` | 💡 **OPTIONAL** |
| `PUT /api/classrooms/{id}` | Wrap in `ResponseHelper::success()` | 💡 **OPTIONAL** |

---

## 🔍 Endpoint-by-Endpoint Analysis

### ✅ Endpoints That Match Perfectly (No Changes Needed)

These endpoints work correctly with the frontend:

1. **Authentication:**
   - `POST /api/register` ✅
   - `POST /api/login` ✅
   - `POST /api/logout` ✅
   - `GET /api/me` ✅

2. **Teachers Management:**
   - `GET /api/teachers` ✅ (uses ResponseHelper::paginated)
   - `POST /api/teachers` ✅
   - `PUT /api/teachers/{id}` ✅
   - `DELETE /api/teachers/{id}` ✅
   - `GET /api/teachers/availability` ✅
   - `POST /api/teachers/availability` ✅

3. **Students Management:**
   - `GET /api/students` ✅ (uses ResponseHelper::paginated)
   - `POST /api/students` ✅
   - `PUT /api/students/{id}` ✅
   - `DELETE /api/students/{id}` ✅

4. **Teacher Classes:**
   - `GET /api/teacher/classes` ✅
   - `POST /api/teacher/classes/attendance` ✅
   - `POST /api/teacher/classes/cancel` ✅

5. **Student Dashboard:**
   - `GET /api/student/available-slots` ✅
   - `POST /api/student/book-class` ✅
   - `GET /api/student/bookings` ✅
   - `POST /api/student/cancel-booking` ✅
   - `GET /api/student/fines` ✅
   - `GET /api/student/debt` ✅

6. **Resources:**
   - `GET /api/resources` ✅
   - `GET /api/resources?type=classroom` ✅
   - `GET /api/resources?type=vehicle` ✅

7. **Dashboard:**
   - `GET /api/dashboard/active-students` ✅ (frontend transforms)
   - `GET /api/dashboard/export-runt` ✅ (CSV download works)

---

## 📝 Implementation Guidelines

### For Priority 1 Changes (Dashboard Reservations)

**1. GET `/api/dashboard/last-month-reservations`**

```php
// Controller method should:
// 1. Calculate counts (total, confirmed, scheduled, cancelled)
// 2. Fetch actual reservations from last 30 days
// 3. Include related data (teacher, student, classType, resource)
// 4. Return combined response

public function lastMonthReservations()
{
    $counts = $this->calculateReservationCounts();
    $reservations = Appointment::where('created_at', '>=', now()->subDays(30))
        ->with(['teacher', 'student', 'classType', 'resource'])
        ->get();
    
    return ResponseHelper::success([
        'total' => $counts['total'],
        'confirmed' => $counts['confirmed'],
        'scheduled' => $counts['scheduled'],
        'cancelled' => $counts['cancelled'],
        'reservations' => $reservations
    ], 'Reservas del último mes');
}
```

**2. GET `/api/dashboard/completed-reservations`**

```php
// Controller method should:
// 1. Accept optional 'teacher' query parameter
// 2. Calculate counts and completion rate
// 3. Fetch completed reservations (status = 'completed')
// 4. Filter by teacher if provided
// 5. Include related data

public function completedReservations(Request $request)
{
    $query = Appointment::where('status', 'completed')
        ->with(['teacher', 'student', 'classType', 'resource']);
    
    if ($request->has('teacher')) {
        $query->where('teacher_id', $request->teacher);
    }
    
    $reservations = $query->get();
    $counts = $this->calculateCompletionStats($reservations);
    
    return ResponseHelper::success([
        'total' => $counts['total'],
        'attended' => $counts['attended'],
        'not_attended' => $counts['not_attended'],
        'completion_rate' => $counts['completion_rate'],
        'reservations' => $reservations
    ], 'Clases completadas');
}
```

### For Priority 2 Changes (Pagination Format)

**Update Vehicle and Classroom Controllers:**

```php
// Before (Laravel standard):
return Vehicle::paginate(10);

// After (ResponseHelper::paginated):
return ResponseHelper::paginated(
    Vehicle::paginate(10),
    'Listado de vehículos'
);
```

---

## 🧪 Testing Checklist

After implementing these changes, verify:

### Priority 1:
- [ ] `GET /api/dashboard/last-month-reservations` returns `reservations` array
- [ ] `GET /api/dashboard/completed-reservations` returns `reservations` array
- [ ] `GET /api/dashboard/completed-reservations?teacher=2` filters by teacher
- [ ] Reservation objects include all related data (teacher, student, classType, resource)

### Priority 2:
- [ ] `GET /api/vehicles` uses `ResponseHelper::paginated` format
- [ ] `GET /api/classrooms` uses `ResponseHelper::paginated` format
- [ ] Pagination metadata is consistent across all list endpoints

### Priority 3:
- [ ] All GET by ID endpoints wrap responses in `ResponseHelper::success()`
- [ ] All POST/PUT endpoints wrap responses in `ResponseHelper::success()`

---

## 📞 Notes for Backend Team

1. **Frontend Compatibility:** The frontend has been adapted to work with the current backend structure. These updates are **recommendations** to improve data completeness and consistency, not blockers.

2. **Backward Compatibility:** If you implement these changes, ensure they don't break existing integrations. Consider versioning if needed.

3. **Performance:** When adding `reservations` arrays to dashboard endpoints, consider:
   - Pagination if the list is large
   - Caching for frequently accessed data
   - Database query optimization (eager loading relationships)

4. **Documentation:** Update `BACKEND-API.md` after implementing these changes to reflect the new response formats.

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-22  
**Status:** Ready for Backend Team Review
