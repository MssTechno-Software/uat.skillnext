import { translateValue } from "../../i18n";
import { Award, CalendarDays, CheckCircle2, GraduationCap } from "lucide-react";

 
import StudentPageHeader from "../../components/student/StudentPageHeader";
import { Card, EmptyState, LinkButton, PageShell, SectionHeading } from "../../components/student/ui";
import { courseCategories, myLearningCoursePath, technologies } from "../../data/studentLearningData";
import { useProgress } from "../../data/studentProgress";

function formatIssuedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function Certificates() {
  const progress = useProgress();
  const earnedCertificates = [
    ...courseCategories.filter((course) => course.type === "vocational"),
    ...technologies.map((technology) => ({ ...technology, certificateType: "technology" })),
  ]
    .filter((course) => Boolean(progress.completedCourses?.[course.id]))
    .map((course) => ({
      ...course,
      issuedAt: progress.completedCourses[course.id],
    }))
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

  return (
    
      <PageShell max="max-w-[1100px]">
        <StudentPageHeader title={translateValue("Certificates")} subtitle={translateValue("Your course completion certificates, earned after passing the final assignment.")} />

        {earnedCertificates.length === 0 ? (
          <Card className="p-6 sm:p-9">
            <EmptyState
              icon={Award}
              tone="gold"
              title={translateValue("Your certificates will appear here")}
              text={translateValue("Complete every topic quiz in a course, then score at least 80% in its 15-question final assignment to earn a certificate. Topic quizzes do not have a pass mark.")}
              action={<LinkButton to="/student/topics" variant="gold">{translateValue("Explore courses")}</LinkButton>}
            />
          </Card>
        ) : (
          <>
            <SectionHeading title={translateValue("Certificates earned")} subtitle={earnedCertificates.length === 1
              ? translateValue("{{count}} course certificate issued.", { count: earnedCertificates.length })
              : translateValue("{{count}} course certificates issued.", { count: earnedCertificates.length })} />
            <div className="grid gap-5 md:grid-cols-2">
              {earnedCertificates.map((course) => {
                const issuedDate = formatIssuedDate(course.issuedAt);
                const certificateNumber = `SN-${course.id.toUpperCase()}-${new Date(course.issuedAt).getTime().toString(36).toUpperCase()}`;
                return (
                  <Card key={course.id} className="overflow-hidden border-[#D9E7E3] p-0">
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#06424B] to-[#0E6B73] p-6 text-white">
                      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[24px] border-white/[0.06]" />
                      <div className="relative flex items-center justify-between gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFAB0B] text-[#06424B]"><Award size={25} /></span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-[#C8F0DD]"><CheckCircle2 size={13} /> {translateValue("CERTIFICATE EARNED")}</span>
                      </div>
                      <p className="relative mt-6 text-[10px] font-bold tracking-[1.7px] text-[#FFCB65]">{translateValue("CERTIFICATE OF COMPLETION")}</p>
                      <h2 className="relative mt-2 text-2xl font-extrabold">{translateValue(course.name)}</h2>
                      <p className="relative mt-2 max-w-md text-xs leading-5 text-white/70">{translateValue("Awarded for completing all course topics and achieving at least 80% in the final assignment.")}</p>
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-[#718486]">{translateValue("Issued on")}</span>
                        <strong className="text-[#06424B]">{translateValue(issuedDate)}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-[#718486]">{translateValue("Certificate reference")}</span>
                        <strong className="break-all text-right text-[#06424B]">{translateValue(certificateNumber)}</strong>
                      </div>
                      <div className="flex items-center gap-2 border-t border-[#EAF0EE] pt-3 text-[11px] font-semibold text-[#28765E]">
                        <CalendarDays size={14} /> {translateValue("Final assignment requirement completed")}</div>
                      <LinkButton to={course.certificateType === "technology" ? myLearningCoursePath(null, course.id) : myLearningCoursePath(course.id)} variant="outline" className="w-full">{translateValue("View completed course")}</LinkButton>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#6C8589]">
          <GraduationCap size={15} className="mt-0.5 shrink-0" />{translateValue("Certificate records are currently saved in this browser. Connect the Skill Next certificate service for server-issued, downloadable and cross-device certificates.")}</p>
      </PageShell>
    
  );
}

export default Certificates;
