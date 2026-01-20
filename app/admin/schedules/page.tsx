"use client";

import { MOCK_INSTRUCTORS } from "@/lib/mockData";
import { InstructorScheduleManager } from "@/components/admin/InstructorScheduleManager";

export default function SchedulesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Gestión de Horarios</h1>
      <InstructorScheduleManager instructors={MOCK_INSTRUCTORS} />
    </div>
  );
}
