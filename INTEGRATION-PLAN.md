# Integration Plan: Missing Endpoints

This document outlines all changes needed to integrate the 41 missing API endpoints into the frontend application.

---

## 📋 Overview

**Total Missing Endpoints:** 41  
**Priority:** High (8), Medium (28), Low (5)

---

## 🔧 Part 1: API Layer Changes

### 1.1 New API Client Files

Create new files in `src/api/` for endpoints not yet implemented:

#### **`src/api/auth.ts`** (NEW)
- `getCurrentUser()` - `GET /api/me`
  - Returns current authenticated user
  - Used for session management

#### **`src/api/appointments.ts`** (NEW)
- `getAppointments(filters?)` - `GET /api/appointments`
- `getAppointmentById(id)` - `GET /api/appointments/{id}`
- `createAppointment(data)` - `POST /api/appointments`
- `updateAppointment(id, data)` - `PUT /api/appointments/{id}`
- `deleteAppointment(id)` - `DELETE /api/appointments/{id}`
- `getAllAppointments(filters?)` - `GET /api/appointments-all`
- `updateAppointmentStatus(id, status)` - `PATCH /api/appointments/{id}/status`
- `getAvailableSlots(filters)` - `GET /api/appointments/available-slots`

#### **`src/api/resources.ts`** (UPDATE - Add missing methods)
- `getResourceById(id)` - `GET /api/resources/{id}` ✅ Already exists, verify implementation
- `createResource(data)` - `POST /api/resources` (NEW)
- `updateResource(id, data)` - `PUT /api/resources/{id}` (NEW)
- `deleteResource(id)` - `DELETE /api/resources/{id}` (NEW)
- `assignTeachersToResource(id, teacherIds)` - `POST /api/resources/{id}/teachers` (NEW)

#### **`src/api/classtype.ts`** (NEW)
- `getClassTypes()` - `GET /api/classtype`
- `getClassTypeById(id)` - `GET /api/classtype/{id}`
- `createClassType(data)` - `POST /api/classtype`
- `updateClassType(id, data)` - `PUT /api/classtype/{id}`
- `deleteClassType(id)` - `DELETE /api/classtype/{id}`

#### **`src/api/teacher-resources.ts`** (NEW)
- `getTeacherResources()` - `GET /api/teacher-resources`
- `getTeacherResourceById(id)` - `GET /api/teacher-resources/{id}`
- `createTeacherResource(data)` - `POST /api/teacher-resources`
- `updateTeacherResource(id, data)` - `PUT /api/teacher-resources/{id}`
- `deleteTeacherResource(id)` - `DELETE /api/teacher-resources/{id}`

#### **`src/api/teacher-schedules.ts`** (NEW)
- `getTeacherSchedules(teacherId)` - `GET /api/teacher-schedules?teacher_id={id}`
- `createTeacherSchedule(data)` - `POST /api/teacher-schedules`
- `updateTeacherSchedule(id, data)` - `PUT /api/teacher-schedules/{id}`
- `deleteTeacherSchedule(id)` - `DELETE /api/teacher-schedules/{id}`
- `toggleTeacherSchedule(id)` - `PATCH /api/teacher-schedules/{id}/toggle`

#### **`src/api/system-settings.ts`** (NEW)
- `getSystemSettings()` - `GET /api/system-settings`
- `getSystemSettingByKey(key)` - `GET /api/system-settings/{key}`
- `createSystemSetting(data)` - `POST /api/system-settings`
- `updateSystemSetting(key, data)` - `PUT /api/system-settings/{key}`
- `deleteSystemSetting(key)` - `DELETE /api/system-settings/{key}`

#### **`src/api/penalties.ts`** (NEW)
- `getPenalties(userId?)` - `GET /api/penalties?user_id={id}`
- `createPenalty(data)` - `POST /api/penalties`
- `markPenaltyAsPaid(id)` - `POST /api/penalties/{id}/pay`
- `getUserDebt(userId)` - `GET /api/penalties/user/{userId}/debt`

#### **`src/api/users.ts`** (NEW)
- `createOrUpdateUser(data)` - `POST /api/users`

#### **`src/api/teachers.ts`** (UPDATE - Add missing method)
- `getTeacherById(id)` - `GET /api/teachers/{id}` (NEW)

#### **`src/api/students.ts`** (UPDATE - Add missing method)
- `getStudentById(id)` - `GET /api/students/{id}` (NEW)

---

### 1.2 New Wrapper Files

Create wrapper files in `src/api/wrappers/` to route between mock and real API:

#### **`src/api/wrappers/auth.ts`** (NEW)
- Wraps `getCurrentUser()` from `src/api/auth.ts`

#### **`src/api/wrappers/appointments.ts`** (NEW)
- Wraps all appointment functions
- Routes to mock or real API based on config

#### **`src/api/wrappers/classtype.ts`** (NEW)
- Wraps all class type functions

#### **`src/api/wrappers/teacher-resources.ts`** (NEW)
- Wraps all teacher-resource assignment functions

#### **`src/api/wrappers/teacher-schedules.ts`** (NEW)
- Wraps all teacher schedule functions

#### **`src/api/wrappers/system-settings.ts`** (NEW)
- Wraps all system settings functions

#### **`src/api/wrappers/penalties.ts`** (NEW)
- Wraps all penalty functions

#### **`src/api/wrappers/users.ts`** (NEW)
- Wraps user management functions

#### **`src/api/wrappers/resources.ts`** (UPDATE)
- Add wrappers for new resource methods

#### **`src/api/wrappers/teachers.ts`** (UPDATE)
- Add wrapper for `getTeacherById()`

#### **`src/api/wrappers/students.ts`** (UPDATE)
- Add wrapper for `getStudentById()`

---

### 1.3 Update Main API Index

**File:** `src/api/index.ts`

**Changes:**
```typescript
// Add new exports
export * from "./wrappers/auth";
export * from "./wrappers/appointments";
export * from "./wrappers/classtype";
export * from "./wrappers/teacher-resources";
export * from "./wrappers/teacher-schedules";
export * from "./wrappers/system-settings";
export * from "./wrappers/penalties";
export * from "./wrappers/users";
```

---

### 1.4 Type Definitions

**File:** `src/mocks/types.ts` (UPDATE)

**New Types Needed:**
```typescript
// Appointment types
export interface Appointment {
  id: string;
  teacher_id: string;
  student_id: string;
  class_type_id: string;
  resource_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  teacher?: Teacher;
  student?: Student;
  classType?: ClassType;
  resource?: Resource;
}

// Class Type
export interface ClassType {
  id: string;
  name: string;
  requires_resource: boolean;
  created_at?: string;
  updated_at?: string;
}

// Resource (extend existing)
export interface Resource {
  id: string;
  name: string;
  type: "classroom" | "vehicle";
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  active: boolean;
  teachers?: Teacher[];
  created_at?: string;
  updated_at?: string;
}

// Teacher Resource Assignment
export interface TeacherResource {
  id: string;
  user_id: string;
  resource_id: string;
  user?: Teacher;
  resource?: Resource;
  created_at?: string;
  updated_at?: string;
}

// Teacher Schedule
export interface TeacherSchedule {
  id: string;
  user_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  slot_minutes: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// System Setting
export interface SystemSetting {
  id: string;
  setting_key: string;
  type: "string" | "int" | "bool" | "json";
  value: string | number | boolean;
  created_at?: string;
  updated_at?: string;
}

// Penalty
export interface Penalty {
  id: string;
  user_id: string;
  appointment_id?: string;
  amount: number;
  reason: string;
  paid: boolean;
  paid_at?: string | null;
  user?: User;
  appointment?: Appointment;
  created_at?: string;
  updated_at?: string;
}

// Available Slot
export interface AvailableSlot {
  start: string;
  end: string;
}
```

---

### 1.5 Response Transformers

**File:** `src/utils/responseTransformers.ts` (UPDATE)

**New Transformers Needed:**
- `transformAppointments()` - Transform backend appointment format to frontend
- `transformClassTypes()` - Transform class type responses
- `transformResources()` - Transform resource responses (if needed)
- `transformTeacherSchedules()` - Transform schedule responses
- `transformPenalties()` - Transform penalty responses
- `transformSystemSettings()` - Transform settings responses

---

## 🎨 Part 2: UI/UX Changes

### 2.1 New Admin Pages

#### **`app/admin/appointments/page.tsx`** (NEW - High Priority)
**Purpose:** Manage all appointments (CRUD operations)

**Features:**
- List all appointments with filters (teacher, student, date, status)
- Create new appointment dialog
- Edit appointment dialog
- Delete appointment (with confirmation)
- Change appointment status
- View appointment details
- Export appointments

**Components Needed:**
- `AppointmentsTable` - Display appointments in table
- `AppointmentFilters` - Filter by teacher, student, date, status
- `AppointmentDialog` - Create/Edit appointment form
- `AppointmentStatusBadge` - Visual status indicator

**API Calls:**
- `getAppointments()`, `getAllAppointments()`
- `createAppointment()`, `updateAppointment()`, `deleteAppointment()`
- `updateAppointmentStatus()`
- `getTeachers()`, `getStudents()`, `getClassTypes()`, `getResources()`

---

#### **`app/admin/class-types/page.tsx`** (NEW - Medium Priority)
**Purpose:** Manage class types (Theoretical, Practical, etc.)

**Features:**
- List all class types
- Create new class type
- Edit class type
- Delete class type (with validation - can't delete if has appointments)
- Toggle `requires_resource` flag

**Components Needed:**
- `ClassTypesTable` - Display class types
- `ClassTypeDialog` - Create/Edit form

**API Calls:**
- `getClassTypes()`, `getClassTypeById()`
- `createClassType()`, `updateClassType()`, `deleteClassType()`

---

#### **`app/admin/teacher-resources/page.tsx`** (NEW - Low Priority)
**Purpose:** Manage teacher-resource assignments

**Features:**
- List all assignments
- Assign resource to teacher
- Remove assignment
- Filter by teacher or resource

**Components Needed:**
- `TeacherResourcesTable` - Display assignments
- `AssignResourceDialog` - Assign resource to teacher

**API Calls:**
- `getTeacherResources()`, `createTeacherResource()`, `deleteTeacherResource()`

---

#### **`app/admin/system-settings/page.tsx`** (NEW - Low Priority)
**Purpose:** Manage system configuration

**Features:**
- List all settings
- Edit setting values
- Create new settings (admin only)
- Delete settings

**Components Needed:**
- `SystemSettingsTable` - Display settings
- `SystemSettingDialog` - Edit setting form

**API Calls:**
- `getSystemSettings()`, `getSystemSettingByKey()`
- `createSystemSetting()`, `updateSystemSetting()`, `deleteSystemSetting()`

---

#### **`app/admin/penalties/page.tsx`** (NEW - Medium Priority)
**Purpose:** Manage penalties (admin view)

**Features:**
- List all penalties with filters (user, paid/unpaid)
- Create penalty manually
- Mark penalty as paid
- View user debt totals
- Export penalties report

**Components Needed:**
- `PenaltiesTable` - Display penalties
- `PenaltyFilters` - Filter by user, status
- `CreatePenaltyDialog` - Create penalty form
- `MarkPaidDialog` - Mark as paid confirmation

**API Calls:**
- `getPenalties()`, `createPenalty()`, `markPenaltyAsPaid()`
- `getUserDebt()`, `getStudents()`, `getTeachers()`

---

### 2.2 Updated Admin Pages

#### **`app/admin/bookings/page.tsx`** (UPDATE - High Priority)
**Current State:** Uses mock data

**Changes Needed:**
- Replace `getAllBookingsWithDetails()` with real API calls
- Use `getAllAppointments()` instead of mock
- Add filters for status, date range
- Add ability to change appointment status
- Add ability to create/edit/delete appointments
- Integrate with real teacher/student data

**API Calls:**
- `getAllAppointments()` - Replace mock
- `updateAppointmentStatus()` - Add status change
- `getAppointmentById()` - For detail view

---

#### **`app/admin/schedules/page.tsx`** (UPDATE - Medium Priority)
**Current State:** Basic schedule management

**Changes Needed:**
- Integrate with `teacher-schedules` API
- Add ability to create/edit/delete schedules
- Add toggle active/inactive
- Display schedules by teacher
- Add day-of-week selector

**API Calls:**
- `getTeacherSchedules()` - Load schedules
- `createTeacherSchedule()`, `updateTeacherSchedule()`, `deleteTeacherSchedule()`
- `toggleTeacherSchedule()` - Toggle active status

---

#### **`app/admin/teachers/page.tsx`** (UPDATE - Medium Priority)
**Changes Needed:**
- Add "View Details" button that uses `getTeacherById()`
- Add teacher detail modal/page
- Show teacher's schedules, resources, appointments

**API Calls:**
- `getTeacherById()` - View teacher details

---

#### **`app/admin/students/page.tsx`** (UPDATE - Medium Priority)
**Changes Needed:**
- Add "View Details" button that uses `getStudentById()`
- Add student detail modal/page
- Show student's appointments, penalties, debt

**API Calls:**
- `getStudentById()` - View student details

---

#### **`app/admin/dashboard/page.tsx`** (UPDATE - Low Priority)
**Changes Needed:**
- Ensure all dashboard endpoints are properly integrated
- Add links to detailed views (appointments, penalties, etc.)

---

### 2.3 New Components

#### **`components/admin/AppointmentsTable.tsx`** (NEW)
- Display appointments in table format
- Show teacher, student, date, time, status
- Actions: Edit, Delete, Change Status

#### **`components/admin/AppointmentDialog.tsx`** (NEW)
- Form to create/edit appointments
- Fields: Teacher, Student, Class Type, Resource, Date, Time
- Validation for required fields
- Resource selection based on class type

#### **`components/admin/AppointmentFilters.tsx`** (NEW)
- Filter by teacher, student, date, status
- Clear filters button

#### **`components/admin/ClassTypesTable.tsx`** (NEW)
- Display class types
- Show name, requires_resource flag
- Actions: Edit, Delete

#### **`components/admin/ClassTypeDialog.tsx`** (NEW)
- Form to create/edit class types
- Fields: Name, Requires Resource (checkbox)

#### **`components/admin/TeacherSchedulesManager.tsx`** (UPDATE)
- Enhance existing component with full CRUD
- Add day-of-week selector
- Add time slot configuration
- Add active/inactive toggle

#### **`components/admin/PenaltiesTable.tsx`** (NEW)
- Display penalties
- Show user, amount, reason, paid status
- Actions: Mark as Paid, View Details

#### **`components/admin/SystemSettingsTable.tsx`** (NEW)
- Display system settings
- Show key, type, value
- Actions: Edit, Delete

---

### 2.4 Updated Components

#### **`components/admin/AdminSidebar.tsx`** (UPDATE)
**Add New Menu Items:**
- Appointments (High Priority)
- Class Types (Medium Priority)
- Teacher Resources (Low Priority)
- System Settings (Low Priority)
- Penalties (Medium Priority)

---

### 2.5 Student Dashboard Updates

#### **`app/student/dashboard/page.tsx`** (UPDATE - High Priority)
**Changes Needed:**
- Integrate `GET /api/me` for user session
- Ensure all student endpoints are properly connected
- Add appointment detail view
- Add ability to view appointment details before canceling

**API Calls:**
- `getCurrentUser()` - Get current user info
- `getAppointmentById()` - View appointment details

---

### 2.6 Teacher Dashboard Updates

#### **`app/teacher/dashboard/page.tsx`** (UPDATE - Medium Priority)
**Changes Needed:**
- Add ability to view appointment details
- Add schedule management (if not already present)
- Integrate with teacher schedules API

**API Calls:**
- `getAppointmentById()` - View appointment details
- `getTeacherSchedules()` - View/edit schedules

---

### 2.7 Authentication Updates

#### **`lib/auth.ts`** (UPDATE - High Priority)
**Changes Needed:**
- Add `getCurrentUser()` function that calls `GET /api/me`
- Update user session management
- Refresh user data on page load
- Handle token expiration

**API Calls:**
- `getCurrentUser()` - Fetch current user from API

---

## 📝 Part 3: Implementation Order

### Phase 1: High Priority (Week 1)
1. ✅ **Authentication**
   - Implement `GET /api/me`
   - Update `lib/auth.ts`
   - Test session management

2. ✅ **Appointments - Core**
   - Implement `GET /api/appointments/available-slots`
   - Implement `GET /api/appointments`
   - Create appointments API client
   - Create appointments wrapper

3. ✅ **Detail Views**
   - Implement `GET /api/teachers/{id}`
   - Implement `GET /api/students/{id}`
   - Implement `GET /api/resources/{id}`
   - Add detail modals to existing pages

4. ✅ **Class Types - List**
   - Implement `GET /api/classtype`
   - Create class types API client
   - Add to booking flows

### Phase 2: Medium Priority (Week 2)
5. ✅ **Appointments - Full CRUD**
   - Implement all appointment endpoints
   - Create appointments admin page
   - Add appointment management UI

6. ✅ **Class Types - Full CRUD**
   - Implement all class type endpoints
   - Create class types admin page

7. ✅ **Teacher Schedules**
   - Implement all schedule endpoints
   - Update schedules page
   - Enhance schedule manager component

8. ✅ **Penalties Admin**
   - Implement penalty admin endpoints
   - Create penalties admin page

### Phase 3: Low Priority (Week 3)
9. ✅ **Resources - Full CRUD**
   - Implement missing resource endpoints
   - Add resource management UI

10. ✅ **Teacher Resources**
    - Implement all endpoints
    - Create admin page

11. ✅ **System Settings**
    - Implement all endpoints
    - Create admin page

12. ✅ **Users Management**
    - Implement user creation/update
    - Add to admin panel

---

## 🧪 Part 4: Testing Checklist

### API Layer Testing
- [ ] All API client functions handle errors correctly
- [ ] Response transformers work for all endpoints
- [ ] Wrappers route correctly between mock and real API
- [ ] Type definitions match backend responses

### UI Testing
- [ ] All new pages load correctly
- [ ] Forms validate input properly
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Success notifications appear
- [ ] Filters work correctly
- [ ] Pagination works (if applicable)

### Integration Testing
- [ ] Create appointment flow works
- [ ] Edit appointment flow works
- [ ] Delete appointment with confirmation works
- [ ] Status change flow works
- [ ] Class type management works
- [ ] Schedule management works
- [ ] Penalty management works

---

## 📊 Part 5: File Structure Summary

### New Files to Create (API)
```
src/api/
  ├── auth.ts (NEW)
  ├── appointments.ts (NEW)
  ├── classtype.ts (NEW)
  ├── teacher-resources.ts (NEW)
  ├── teacher-schedules.ts (NEW)
  ├── system-settings.ts (NEW)
  ├── penalties.ts (NEW)
  ├── users.ts (NEW)
  └── resources.ts (UPDATE - add methods)

src/api/wrappers/
  ├── auth.ts (NEW)
  ├── appointments.ts (NEW)
  ├── classtype.ts (NEW)
  ├── teacher-resources.ts (NEW)
  ├── teacher-schedules.ts (NEW)
  ├── system-settings.ts (NEW)
  ├── penalties.ts (NEW)
  ├── users.ts (NEW)
  ├── resources.ts (UPDATE)
  ├── teachers.ts (UPDATE)
  └── students.ts (UPDATE)
```

### New Files to Create (UI)
```
app/admin/
  ├── appointments/
  │   └── page.tsx (NEW)
  ├── class-types/
  │   └── page.tsx (NEW)
  ├── teacher-resources/
  │   └── page.tsx (NEW)
  ├── system-settings/
  │   └── page.tsx (NEW)
  └── penalties/
      └── page.tsx (NEW)

components/admin/
  ├── AppointmentsTable.tsx (NEW)
  ├── AppointmentDialog.tsx (NEW)
  ├── AppointmentFilters.tsx (NEW)
  ├── ClassTypesTable.tsx (NEW)
  ├── ClassTypeDialog.tsx (NEW)
  ├── PenaltiesTable.tsx (NEW)
  └── SystemSettingsTable.tsx (NEW)
```

### Files to Update
```
src/api/index.ts (add exports)
src/mocks/types.ts (add types)
src/utils/responseTransformers.ts (add transformers)
app/admin/bookings/page.tsx (integrate real API)
app/admin/schedules/page.tsx (integrate real API)
app/admin/teachers/page.tsx (add detail view)
app/admin/students/page.tsx (add detail view)
components/admin/AdminSidebar.tsx (add menu items)
lib/auth.ts (add getCurrentUser)
```

---

## 🎯 Part 6: Key Considerations

### Error Handling
- All API calls should handle 401 (unauthorized) and redirect to login
- All API calls should handle 422 (validation errors) and display field-specific errors
- All API calls should handle 404 (not found) gracefully
- Network errors should show user-friendly messages

### Loading States
- All pages should show loading indicators while fetching data
- Forms should disable submit buttons while processing
- Tables should show skeleton loaders

### Data Validation
- Frontend should validate required fields before API calls
- Display backend validation errors clearly
- Prevent duplicate submissions

### User Experience
- Success notifications for all create/update/delete operations
- Confirmation dialogs for destructive actions
- Clear error messages
- Intuitive navigation
- Responsive design for mobile

### Performance
- Use pagination for large lists
- Implement debouncing for search/filter inputs
- Cache frequently accessed data (teachers, students, class types)
- Lazy load detail views

---

## 📈 Part 7: Success Metrics

### Completion Criteria
- [ ] All 41 missing endpoints integrated
- [ ] All new admin pages functional
- [ ] All existing pages updated to use real API
- [ ] Error handling implemented throughout
- [ ] Loading states implemented throughout
- [ ] User feedback (toasts) implemented
- [ ] Responsive design verified
- [ ] No console errors
- [ ] TypeScript compilation successful

### Quality Criteria
- [ ] Code follows existing patterns
- [ ] Components are reusable
- [ ] API layer is well-organized
- [ ] Types are properly defined
- [ ] Error messages are user-friendly
- [ ] UI is consistent with existing design

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-23  
**Estimated Implementation Time:** 3 weeks (with 1 developer)
