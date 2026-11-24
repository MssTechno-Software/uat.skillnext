import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import QuickActions from "./QuickActions";
import LanguageSwitcher from "../common/LanguageSwitcher";

function StudentLayout() {
  const { pathname } = useLocation();

  // Final assessment should open without the student layout.
  const isFinalAssessmentPage = pathname.startsWith(
    "/student/final-assessment"
  );

  // Standalone exam page: no sidebar and no quick actions.
  if (isFinalAssessmentPage) {
    return (
      <main className="min-h-screen w-full">
        <div className="fixed right-4 top-4 z-[10000] sm:right-6 sm:top-6">
          <LanguageSwitcher variant="floating" />
        </div>
        <Outlet />
      </main>
    );
  }

  // Normal student pages retain the existing layout.
  return (
    <Sidebar>
      <Outlet />
      <QuickActions />
    </Sidebar>
  );
}

export default StudentLayout;