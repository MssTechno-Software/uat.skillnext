import { CalendarDays, Clock3 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, IconBadge, PageShell } from"../../components/student/ui";

function Calendar() {
  return (
    <Sidebar>
      <PageShell max="max-w-[1100px]">
        <StudentPageHeader title="Learning Calendar" subtitle="Keep track of scheduled classes, assessments and learning deadlines." />
        <Card className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#06424B]">Upcoming schedule</h2>
              <p className="mt-1 text-sm text-[#5A7478]">Your planned learning activities.</p>
            </div>
            <IconBadge icon={CalendarDays} tone="gold" />
          </div>
          <div className="mt-5 rounded-2xl bg-[#F6FBFA]">
            <EmptyState icon={Clock3} tone="gold" title="No events scheduled" text="Live classes, assessments and due dates will show here when they are added to your account." />
          </div>
        </Card>
      </PageShell>
    </Sidebar>
  );
}

export default Calendar;
