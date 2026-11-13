
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  Globe2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const sections = [
  {
    id: "introduction",
    number: "01",
    title: "Introduction",
    intro:
      "Skill Next Consulting Inc. (we, our, or us) values your privacy. This Privacy Policy explains how personal information may be collected, used, stored, and shared when you access our website, learning management system, courses, and related educational services (the Platform).",
    points: [
      "This Policy applies to students, teachers, and other authorised users of the Platform.",
      "It should be read together with our Terms and Conditions.",
      "The information described below depends on the features you use and the services enabled on the Platform.",
    ],
  },
  {
    id: "information-collected",
    number: "02",
    title: "Information We Collect",
    intro:
      "We may collect the following categories of information when you register, use the Platform, communicate with us, or access our services.",
    points: [
      "Personal details: First name, last name, email address, and phone number.",
      "Location details: Country, state or province, and city, as provided through registration.",
      "Student profile details: Institution, education level, course, and academic year.",
      "Teacher profile details: Institution, department, teaching subject, and designation.",
      "Account details: User role, account preferences, verification status, and account-related records.",
      "Learning activity: Course enrolments, lesson progress, assignment submissions, assessment results, feedback, and certificates, where those features are enabled.",
      "Communications: Messages, support requests, and other information you choose to share with us.",
      "Technical information: Device, browser, IP address, access logs, and related diagnostic information, where collected by our hosting or security services.",
    ],
  },
  {
    id: "how-we-use",
    number: "03",
    title: "How We Use Your Information",
    intro:
      "Information may be used for the following educational, operational, and security-related purposes.",
    points: [
      "To create, manage, and maintain student and teacher accounts.",
      "To verify email addresses and support account authentication and recovery.",
      "To provide course access, learning resources, assignments, and assessments.",
      "To track learning progress and display relevant academic information.",
      "To support teacher and student interactions where those features are available.",
      "To communicate account updates, important service notices, and support responses.",
      "To maintain Platform security, prevent misuse, investigate technical issues, and protect users.",
      "To improve Platform functionality, usability, and service performance.",
      "To comply with applicable legal obligations.",
    ],
  },
  {
    id: "legal-basis",
    number: "04",
    title: "Why We Process Personal Information",
    intro:
      "We will process personal information only where there is an applicable lawful basis and for specified purposes.",
    points: [
      "To provide services that you request, including account creation and course access.",
      "Based on valid consent where consent is required.",
      "For other lawful purposes permitted by applicable law.",
      "Where necessary to meet legal obligations or respond to valid legal requests.",
      "Where required, we will explain the purpose of data collection and provide appropriate choices or consent mechanisms.",
    ],
  },
  {
    id: "sharing",
    number: "05",
    title: "How We Share Information",
    intro:
      "We do not make personal information publicly available merely because you register on the Platform. Information may be shared only where reasonably necessary for the purposes described in this Policy or as permitted by law.",
    points: [
      "Authorised administrators: To manage accounts, course access, and Platform operations.",
      "Teachers: Relevant student profile and learning information needed to deliver courses, provide feedback, and assess learning.",
      "Service providers: Hosting, infrastructure, email delivery, security, analytics, and technical support providers, where engaged.",
      "Payment providers: Relevant transaction information may be processed by authorised payment providers if paid courses or services are introduced.",
      "Legal authorities: Where disclosure is required or permitted by applicable law.",
      "Business changes: Where information is lawfully required as part of a merger, restructuring, or transfer of business operations, subject to applicable safeguards.",
    ],
  },
  {
    id: "storage",
    number: "06",
    title: "Data Storage and Retention",
    intro:
      "We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, subject to applicable legal requirements.",
    points: [
      "Account information may be retained while your account remains active.",
      "Learning records may be retained to support course history, assessments, and certificates.",
      "Support and communication records may be retained to resolve requests and maintain appropriate records.",
      "Certain information may need to be retained longer where required by law or for legitimate dispute resolution and security purposes.",
      "When information is no longer required, we will take appropriate steps to delete or anonymise it, subject to applicable law.",
    ],
  },
  {
    id: "security",
    number: "07",
    title: "Data Security",
    intro:
      "We take reasonable technical and organisational measures designed to protect personal information against unauthorised access, misuse, loss, alteration, or disclosure.",
    points: [
      "Access to personal information should be restricted to authorised personnel and systems.",
      "Appropriate authentication and access controls should be used to protect accounts and services.",
      "Security safeguards should be reviewed and improved as the Platform develops.",
      "No online system or method of transmission can be guaranteed to be completely secure.",
      "Please notify us through the official support channel if you suspect unauthorised access to your account.",
    ],
  },
  {
    id: "cookies",
    number: "08",
    title: "Cookies and Similar Technologies",
    intro:
      "The Platform or its service providers may use cookies or similar technologies, depending on the configuration of the website and services.",
    points: [
      "Essential technologies may be used to support login sessions, authentication, and basic Platform functionality.",
      "Security-related technologies may help identify suspicious activity and protect user accounts.",
      "Analytics technologies may be used to understand Platform usage and improve performance, where enabled.",
      "You can manage certain cookies through your browser settings. Disabling essential cookies may affect some Platform features.",
      "Any non-essential tracking or analytics technologies will be handled according to applicable consent and legal requirements.",
    ],
  },
  {
    id: "student-teacher",
    number: "09",
    title: "Student and Teacher Information",
    intro:
      "Different information may be visible to authorised users depending on their role and responsibilities.",
    points: [
      "Students may see their own profile, enrolled courses, learning progress, assessments, and feedback.",
      "Teachers may access relevant student information required to conduct their authorised educational activities.",
      "Administrators may access relevant account and Platform records to manage the service and provide support.",
      "Users must not access, copy, or disclose another person's information without proper authority.",
    ],
  },
  {
    id: "children",
    number: "10",
    title: "Children's Privacy",
    intro:
      "We recognise that additional protections may apply when personal information relates to children.",
    points: [
      "Where applicable law requires parental or guardian consent, the required consent and safeguards must be implemented before collecting or processing a child's information.",
      "We do not intend to collect children's personal information in a manner that violates applicable law.",
      "If you believe a child's information has been collected improperly, please contact us through the official support channel.",
      "Age verification, parental consent, and related safeguards must be configured appropriately before allowing minors to register where legally required.",
    ],
  },
  {
    id: "third-party",
    number: "11",
    title: "Third-Party Services",
    intro:
      "The Platform may integrate with external websites, applications, or service providers.",
    points: [
      "Third-party services may have separate privacy policies and terms of use.",
      "We do not control the privacy practices of independent third-party websites.",
      "You should review the relevant third-party privacy policy before using those services.",
      "Information shared with an external provider will depend on the integration and the purpose for which it is used.",
    ],
  },
  {
    id: "international",
    number: "12",
    title: "International Data Transfers",
    intro:
      "Some Platform infrastructure or service providers may process information in locations outside your country of residence.",
    points: [
      "Any international transfer will be subject to applicable legal requirements and restrictions.",
      "Appropriate safeguards will be considered where required.",
      "The actual locations and service providers involved will depend on the Platform's hosting and operational configuration.",
    ],
  },
  {
    id: "rights",
    number: "13",
    title: "Your Privacy Rights and Choices",
    intro:
      "Depending on applicable law, you may have rights and choices regarding your personal information.",
    points: [
      "Request access to information about personal data associated with you.",
      "Request correction or updating of inaccurate or incomplete information.",
      "Request erasure of personal information where legally available and applicable.",
      "Withdraw consent where processing is based on consent, subject to applicable law.",
      "Raise a privacy concern or grievance through the official support channel.",
      "Exercise any additional rights made available under applicable law.",
      "Some information may need to be retained where legally required or necessary for legitimate purposes.",
    ],
  },
  {
    id: "account-closure",
    number: "14",
    title: "Account Closure and Data Deletion",
    intro:
      "You may request account closure or deletion of personal information through the official support channel.",
    points: [
      "We may need to verify your identity before acting on a request.",
      "Account closure may affect your access to courses, learning history, and other Platform services.",
      "Certain records may need to be retained for legal, security, or legitimate operational purposes.",
      "Any deletion request will be handled according to applicable law and relevant retention requirements.",
    ],
  },
  {
    id: "changes",
    number: "15",
    title: "Changes to This Privacy Policy",
    intro:
      "We may update this Policy as our Platform, services, data practices, or legal requirements change.",
    points: [
      "The updated version will be published on this page with a revised date.",
      "Where significant changes affect how personal information is handled, appropriate notice will be provided where required.",
      "You should periodically review this page to understand our current privacy practices.",
    ],
  },
  {
    id: "contact",
    number: "16",
    title: "Contact and Privacy Support",
    intro:
      "For privacy-related questions, requests, or concerns, contact Skill Next Consulting Inc. through the official contact channel published on the Platform.",
    points: [
      "Include your registered email address and a clear description of your request.",
      "Do not include passwords, verification tokens, or other confidential login credentials.",
      "The official privacy contact, grievance contact, and applicable response process must be published before production launch.",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <main className="min-h-dvh bg-[#EEF3F4] text-[#344B4F]">

      {/* Background */}
      <div className="pointer-events-none fixed -right-36 -top-36 h-[420px] w-[420px] rounded-full bg-[#FFAB0B]/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-36 h-[420px] w-[420px] rounded-full border-[50px] border-[#06424B]/5" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#DCE6E8] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-7 lg:px-10">

          <Link to="/signup">
            <img
              src="/logo.png"
              alt="Skill Next Consulting Inc."
              className="h-[48px] w-auto max-w-[170px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/terms-and-conditions"
              className="hidden items-center gap-2 rounded-xl border border-[#DCE6E8] px-4 py-2.5 text-[11px] font-bold text-[#06424B] transition-all hover:border-[#06424B] hover:bg-[#F5F8F7] sm:flex"
            >
              <FileText size={14} />
              Terms & Conditions
            </Link>

            <Link
              to="/login"
              style={{ color: "#FFFFFF" }}
              className="flex items-center gap-2 rounded-xl bg-[#06424B] px-4 py-2.5 text-[11px] font-bold !text-white shadow-[0_5px_14px_rgba(6,66,75,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#042E35]"
            >
              <span className="!text-white">Sign In</span>
              <ArrowUpRight
                size={14}
                className="shrink-0 !text-white"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Heading */}
      <section className="relative z-10 mx-auto max-w-[1280px] px-4 pb-5 pt-8 sm:px-7 sm:pt-11 lg:px-10">

        <div className="flex items-center gap-2 text-[9px] font-bold tracking-[2px] text-[#A17B28]">
          <ShieldCheck size={14} />
          PRIVACY & DATA PROTECTION
        </div>

        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-[-1.5px] text-[#06424B] sm:text-[42px]">
              Privacy Policy
              <span className="text-[#FFAB0B]">.</span>
            </h1>

            <p className="mt-2 max-w-[670px] text-[12px] leading-6 text-[#7B8C8F] sm:text-[13px]">
              Understand how Skill Next Consulting Inc. may collect,
              use, protect, and manage your personal information.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-[#DCE6E8] bg-white px-3 py-2 text-[9px] font-bold text-[#647B7F]">
              VERSION 1.0
            </span>
            <span className="rounded-full bg-[#FFF5DC] px-3 py-2 text-[9px] font-bold text-[#795B19]">
              LAST UPDATED · NOV 12, 2026
            </span>
          </div>
        </div>

        {/* Overview */}
        <div className="relative mt-7 overflow-hidden rounded-[22px] border border-[#DCE6E8] border-t-[5px] border-t-[#FFAB0B] bg-white p-5 shadow-[0_10px_35px_rgba(6,66,75,0.06)] sm:p-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[17px] bg-[#EEF5F4] text-[#06424B]">
              <LockKeyhole size={26} />
            </div>

            <div className="flex-1">
              <h2 className="text-[15px] font-bold text-[#06424B]">
                Your privacy matters to us
              </h2>

              <p className="mt-1 max-w-[820px] text-[11px] leading-6 text-[#839194]">
                We aim to handle your information responsibly while
                providing a secure learning environment for students
                and teachers.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F2F7F4] px-3 py-2.5">
              <CheckCircle2 size={17} className="text-[#4D8B4F]" />
              <span className="text-[10px] font-bold text-[#4D7950]">
                Privacy Guidelines
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="mt-6 lg:hidden">
          <p className="mb-2 text-[9px] font-bold tracking-[1.5px] text-[#849496]">
            JUMP TO SECTION
          </p>

          <nav className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="shrink-0 rounded-full border border-[#DCE6E8] bg-white px-3 py-2 text-[10px] font-semibold text-[#06424B] transition-colors hover:border-[#06424B]"
              >
                {section.number}. {section.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Document */}
      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 pb-12 sm:px-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10">

        {/* Table of Contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-[20px] border border-[#DCE6E8] bg-white p-4 shadow-[0_8px_30px_rgba(6,66,75,0.05)]">

            <div className="mb-4 flex items-center gap-2 border-b border-[#E8EEEE] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF5F4] text-[#06424B]">
                <Database size={16} />
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#06424B]">
                  Privacy Sections
                </p>
                <p className="text-[9px] text-[#9AA7A8]">
                  16 sections
                </p>
              </div>
            </div>

            <nav className="max-h-[calc(100vh-190px)] space-y-0.5 overflow-y-auto">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex items-start gap-2 rounded-lg px-2.5 py-2 text-[10px] font-medium text-[#718386] transition-all hover:bg-[#F1F6F5] hover:text-[#06424B]"
                >
                  <span className="mt-0.5 text-[9px] font-bold text-[#B5A06B]">
                    {section.number}
                  </span>

                  <span className="flex-1 leading-4">
                    {section.title}
                  </span>

                  <ChevronRight
                    size={12}
                    className="mt-0.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Policy Document */}
        <article className="relative overflow-hidden rounded-[22px] border border-[#DCE6E8] bg-white shadow-[0_12px_45px_rgba(6,66,75,0.07)]">

          {/* Curved Gold Accent */}
          <div className="pointer-events-none absolute inset-x-[1px] top-[1px] z-10 h-[18px] rounded-t-[20px] border-x-[5px] border-t-[5px] border-[#FFAB0B]" />

          <div className="px-5 pb-7 pt-7 sm:px-8 sm:pb-10 sm:pt-9 lg:px-11">

            {/* Introduction */}
            <div className="border-b border-[#E8EEEE] pb-7">
              <div className="flex items-center gap-2 text-[9px] font-bold tracking-[1.5px] text-[#A17B28]">
                <UserRound size={15} />
                SKILL NEXT CONSULTING INC.
              </div>

              <h2 className="mt-3 text-[19px] font-extrabold tracking-[-0.5px] text-[#06424B]">
                Personal Information and Data Protection Policy
              </h2>

              <p className="mt-3 text-[11px] leading-6 text-[#839194]">
                This Policy describes the information that may be handled
                when you register, participate in courses, interact with
                teachers, or use the Platform and its related services.
              </p>
            </div>

            {/* Policy Sections */}
            <div className="divide-y divide-[#E8EEEE]">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8 py-6 first:pt-7"
                >
                  <div className="flex items-start gap-3">

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF5F4] text-[10px] font-extrabold text-[#06424B]">
                      {section.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-bold leading-6 text-[#06424B] sm:text-[15px]">
                        {section.title}
                      </h3>

                      <p className="mt-2 text-[11px] leading-[1.85] text-[#75878A] sm:text-[12px]">
                        {section.intro}
                      </p>

                      {section.points.length > 0 && (
                        <ul className="mt-3 space-y-2.5">
                          {section.points.map((point, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2.5 text-[11px] leading-[1.8] text-[#647B7F] sm:text-[12px]"
                            >
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFAB0B]" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Important Note */}
            <div className="mt-5 rounded-[15px] border border-[#EAD9B5] bg-[#FFF9EC] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-[#A17B28]"
                />

                <div>
                  <h3 className="text-[11px] font-bold text-[#795B19]">
                    Important privacy information
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-[#8A774E]">
                    This Policy must reflect the actual data collected,
                    service providers used, storage locations, retention
                    practices, and consent mechanisms of the live Platform.
                    Please review these details and confirm the official
                    privacy contact before production launch.
                  </p>
                </div>
              </div>
            </div>

            {/* Related Policy */}
            <div className="mt-7 flex flex-col gap-4 border-t border-[#E8EEEE] pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">
                <FileText size={16} className="shrink-0 text-[#06424B]" />

                <p className="text-[10px] leading-5 text-[#879497]">
                  Please also review our Terms and Conditions.
                </p>
              </div>
              <Link
                to="/terms-and-conditions"
                style={{ color: "#FFFFFF" }}
                className="inline-flex min-h-[43px] items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 text-[11px] font-bold !text-white shadow-[0_5px_14px_rgba(6,66,75,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#042E35]"
              >
                <span className="!text-white">View Terms & Conditions</span>

                <ArrowUpRight
                  size={15}
                  className="shrink-0 !text-white"
                  strokeWidth={2.5}
                />
              </Link>
            </div>
          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#DCE6E8] bg-white px-4 py-5">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 sm:flex-row sm:px-3">

          <p className="flex items-center gap-2 text-[10px] text-[#879497]">
            <ShieldCheck size={14} className="text-[#06424B]" />
            © 2026 Skill Next Consulting Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-[10px] font-semibold text-[#718386]">
            <Link
              to="/terms-and-conditions"
              className="transition-colors hover:text-[#06424B]"
            >
              Terms & Conditions
            </Link>

            <Link
              to="/login"
              className="!text-[#718386] transition-colors duration-200 hover:!text-[#06424B]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default PrivacyPolicy;
