import { Award, GraduationCap } from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, LinkButton, PageShell } from"../../components/student/ui";

function Certificates() {
  return (
    <StudentSidebar>
      <PageShell max="max-w-[1100px]">
        <StudentPageHeader title="Certificates" subtitle="View certificates earned after meeting course completion requirements." />
        <Card className="p-6 sm:p-9">
          <EmptyState
            icon={Award}
            tone="gold"
            title="Your achievements will live here"
            text="Certificates appear after you complete an eligible course and meet its published assessment requirements."
            action={<LinkButton to="/student/topics" variant="gold">Explore learning paths</LinkButton>}
          />
        </Card>
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#6C8589]"><GraduationCap size={15} className="mt-0.5 shrink-0" />Certificate eligibility, verification and issuing rules should be configured by the Skill Next course administrator.</p>
      </PageShell>
    </StudentSidebar>
  );
}

export default Certificates;
