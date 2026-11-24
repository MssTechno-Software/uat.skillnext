import { translateValue } from "../../i18n";
import { CalendarDays, Clock3 } from "lucide-react";
 
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, IconBadge, PageShell } from"../../components/student/ui";

function Calendar() {
  return (
    
      <PageShell max="max-w-[1100px]">
        <StudentPageHeader title={translateValue("Learning Calendar")} subtitle={translateValue("Keep track of scheduled classes, assessments and learning deadlines.")} />
        <Card className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#06424B]">{translateValue("Upcoming schedule")}</h2>
              <p className="mt-1 text-sm text-[#5A7478]">{translateValue("Your planned learning activities.")}</p>
            </div>
            <IconBadge icon={CalendarDays} tone="gold" />
          </div>
          <div className="mt-5 rounded-2xl bg-[#F6FBFA]">
            <EmptyState icon={Clock3} tone="gold" title={translateValue("No events scheduled")} text={translateValue("Live classes, assessments and due dates will show here when they are added to your account.")} />
          </div>
        </Card>
      </PageShell>
    
  );
}

export default Calendar;
