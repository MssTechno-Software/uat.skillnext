
import { GraduationCap, Clock3, Sparkles } from "lucide-react";
import Sidebar from "../../components/Sidebar";

function TeacherDashboard() {
  return (
    <Sidebar>
      <div className="min-h-dvh bg-[#EEF3F4] font-sans">

        {/* Dashboard Content */}
        <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10">

          {/* Welcome Section */}
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-[#B98217]">
              TEACHER WORKSPACE
            </p>

            <h1 className="text-3xl font-bold text-[#06424B]">
              Teacher Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Welcome to your Skill Next teaching workspace.
            </p>
          </div>

          {/* Main Dashboard Card */}
          <div className="
            flex min-h-[380px]
            flex-col items-center justify-center
            rounded-3xl border border-[#E1EAEC]
            bg-white p-8 text-center
            shadow-sm sm:p-14
          ">

            {/* Icon */}
            <div className="
              mb-6 flex h-20 w-20
              items-center justify-center
              rounded-2xl bg-[#EEF3F4]
            ">
              <GraduationCap
                size={38}
                className="text-[#06424B]"
                strokeWidth={1.6}
              />
            </div>

            {/* Coming Soon */}
            <div className="mb-4 flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-[#D99A17]"
              />

              <span className="
                text-xs font-bold
                tracking-wider text-[#B98217]
              ">
                COMING SOON
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-[#06424B]">
              Your Teaching Workspace
            </h2>

            {/* Description */}
            <p className="
              mt-3 max-w-lg
              text-sm leading-7 text-gray-500
            ">
              We're currently working on the Teacher Portal.
              Teaching features and tools will be available here
              in upcoming updates.
            </p>

            {/* Status */}
            <div className="
              mt-7 inline-flex items-center gap-2
              rounded-xl bg-[#F4F7F7]
              px-5 py-3
              text-sm font-medium text-[#06424B]
            ">
              <Clock3 size={17} />
              More features are being implemented
            </div>

          </div>

          {/* Footer */}
          <p className="
            mt-8 text-center
            text-xs text-gray-400
          ">
            © 2026 Skill Next Consulting Inc. All rights reserved.
          </p>

        </main>
      </div>
    </Sidebar>
  );
}

export default TeacherDashboard;
