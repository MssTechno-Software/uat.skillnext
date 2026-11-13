
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    intro:
      "Welcome to Skill Next Consulting Inc. These Terms and Conditions govern your access to and use of our website, learning management system, courses, educational resources, and related services (collectively, the Platform).",
    points: [
      "By creating an account, accessing a course, or using the Platform, you agree to these Terms.",
      "Please read these Terms together with our Privacy Policy and any course-specific conditions.",
      "If you do not agree with these Terms, you must not create an account or continue using the Platform.",
    ],
  },
  {
    id: "eligibility",
    number: "02",
    title: "Eligibility",
    intro:
      "You must have the legal capacity required under the laws applicable to you to create and use an account.",
    points: [
      "You must provide accurate registration information.",
      "Where parental or guardian consent is required by applicable law, the required consent must be obtained before the account is used.",
      "You must not use the Platform where doing so would violate applicable law or these Terms.",
    ],
  },
  {
    id: "accounts",
    number: "03",
    title: "Account Registration and Security",
    intro:
      "An account is required to access features reserved for registered students and teachers.",
    points: [
      "Provide a valid email address and accurate personal and profile information.",
      "Keep your login credentials confidential and do not share your account with another person.",
      "You are responsible for activity carried out through your account, subject to applicable law.",
      "Notify the Platform support team promptly if you suspect unauthorised access or account misuse.",
      "We may request verification of your email address or account information to protect the Platform.",
    ],
  },
  {
    id: "roles",
    number: "04",
    title: "Student and Teacher Accounts",
    intro:
      "The Platform provides different features according to the role assigned to an account.",
    points: [
      "Students may browse available learning resources, enrol in eligible courses, complete lessons, submit assignments, and view their learning progress.",
      "Teachers may create or manage courses where authorised, provide learning materials, conduct assessments, and support enrolled students.",
      "Users must not misrepresent their role, qualifications, identity, or authority.",
      "Access to specific features may depend on account permissions, course enrolment, or administrative approval.",
    ],
  },
  {
    id: "courses",
    number: "05",
    title: "Course Enrolment and Access",
    intro:
      "Course access is provided according to the course description, enrolment conditions, and permissions displayed on the Platform.",
    points: [
      "Enrolment may be subject to eligibility requirements, available seats, payment where applicable, or teacher and administrator approval.",
      "Course access periods and included learning materials will be described in the relevant course information.",
      "You must not transfer, sell, share, or otherwise make your personal course access available to another person.",
      "We may update course content, lesson arrangements, or learning resources where reasonably necessary, while taking applicable course commitments into account.",
    ],
  },
  {
    id: "intellectual-property",
    number: "06",
    title: "Learning Materials and Intellectual Property",
    intro:
      "The Platform may contain videos, documents, presentations, notes, illustrations, assessments, software, branding, and other educational materials.",
    points: [
      "Platform branding, interface elements, and materials owned by Skill Next Consulting Inc. remain the property of their respective owners.",
      "Unless expressly permitted, course materials are provided for your personal, non-commercial learning only.",
      "You must not copy, reproduce, distribute, sell, publicly display, record, or upload protected course materials without the necessary permission.",
      "A course enrolment does not transfer ownership of the course materials or intellectual property to you.",
      "Third-party materials remain subject to the rights and licence conditions of their respective owners.",
    ],
  },
  {
    id: "student-responsibilities",
    number: "07",
    title: "Student Responsibilities",
    intro:
      "Students are expected to use the Platform honestly, responsibly, and respectfully.",
    points: [
      "Submit your own work unless collaboration is expressly permitted.",
      "Do not plagiarise, impersonate another learner, falsify results, or manipulate assessments.",
      "Do not share examination questions, restricted assessment material, or another student's submitted work without permission.",
      "Communicate respectfully with teachers, other students, and Platform administrators.",
      "Do not upload unlawful, offensive, misleading, harmful, or unauthorised content.",
    ],
  },
  {
    id: "teacher-responsibilities",
    number: "08",
    title: "Teacher Responsibilities",
    intro:
      "Teachers are responsible for the materials and activities they provide through their authorised Platform features.",
    points: [
      "Ensure that uploaded course content is accurate to the best of your knowledge and appropriate for the intended learners.",
      "Only upload materials that you own or are authorised to use and distribute.",
      "Respect student privacy and use learner information only for legitimate educational and Platform-related purposes.",
      "Do not publish misleading qualifications, course outcomes, accreditation claims, or employment guarantees.",
      "Handle assignments, assessments, feedback, and student communications fairly and professionally.",
    ],
  },
  {
    id: "assessments",
    number: "09",
    title: "Assignments, Assessments and Certificates",
    intro:
      "Assessment and course completion requirements may vary between courses.",
    points: [
      "Students must follow the assessment instructions and submission deadlines published for each course.",
      "Grades, feedback, and completion status are determined according to the applicable course criteria.",
      "A certificate may be issued only where the course offers one and the stated completion requirements are satisfied.",
      "A Platform completion certificate must not be represented as a government-recognised qualification, university degree, or professional accreditation unless that status is expressly confirmed.",
      "Course participation or completion does not guarantee employment, promotion, admission, or a specific academic or professional outcome.",
    ],
  },
  {
    id: "payments",
    number: "10",
    title: "Fees, Payments and Refunds",
    intro:
      "Some courses or services may be offered free of charge, while others may require payment.",
    points: [
      "Any applicable course fee, taxes, payment conditions, and included services must be displayed before payment is completed.",
      "Where a course has a specific cancellation or refund policy, that policy will be made available before purchase and will apply to that transaction, subject to applicable law.",
      "You must not use fraudulent payment methods or attempt to interfere with the payment process.",
      "No fixed refund period or refund entitlement is created by this general section. The applicable course-specific policy and mandatory consumer rights will govern.",
    ],
  },
  {
    id: "privacy",
    number: "11",
    title: "Privacy and Personal Information",
    intro:
      "We recognise the importance of protecting personal information associated with your account and learning activity.",
    points: [
      "The collection, use, storage, sharing, and handling of personal information are described in our separate Privacy Policy.",
      "Information may include account details, profile information, course enrolments, learning activity, assignment records, and communications, as described in that policy.",
      "You should review the Privacy Policy to understand how your information is handled and what choices or rights may be available to you.",
      "You must not upload another person's personal information unless you have the necessary permission or lawful authority.",
    ],
  },
  {
    id: "acceptable-use",
    number: "12",
    title: "Acceptable Use and Prohibited Activities",
    intro:
      "You may use the Platform only for lawful purposes and in accordance with these Terms.",
    points: [
      "Do not attempt to access another user's account, restricted data, or administrative functions without authorisation.",
      "Do not hack, probe, disrupt, damage, or interfere with the Platform or its security systems.",
      "Do not introduce malware, harmful scripts, automated abuse, or malicious files.",
      "Do not scrape, copy, extract, or commercially exploit Platform data or course materials without permission.",
      "Do not harass, threaten, discriminate against, impersonate, or defraud other users.",
      "Do not use the Platform to distribute spam, unlawful content, or materials that violate another person's rights.",
    ],
  },
  {
    id: "third-party",
    number: "13",
    title: "Third-Party Services and Links",
    intro:
      "The Platform may contain links, integrations, or services operated by third parties.",
    points: [
      "Third-party services may have their own terms, privacy policies, and security practices.",
      "We do not control independent third-party websites or services and are not responsible for their content or policies.",
      "Your use of a third-party service is subject to the terms provided by that service.",
    ],
  },
  {
    id: "availability",
    number: "14",
    title: "Platform Availability and Changes",
    intro:
      "We aim to keep the Platform useful, secure, and available, but uninterrupted access cannot be guaranteed.",
    points: [
      "Maintenance, upgrades, outages, network failures, or circumstances outside our reasonable control may temporarily affect availability.",
      "We may update, improve, add, or discontinue Platform features where reasonably necessary.",
      "We will endeavour to communicate material changes that significantly affect users or their course access, as appropriate.",
    ],
  },
  {
    id: "suspension",
    number: "15",
    title: "Account Suspension and Termination",
    intro:
      "We may restrict or suspend access where necessary to protect users, courses, or the Platform.",
    points: [
      "This may happen where an account violates these Terms, creates a security risk, engages in fraudulent activity, or violates applicable law.",
      "Where reasonably practicable, we may notify the affected user and provide an opportunity to address the issue.",
      "You may request account closure through the Platform's official support channel.",
      "Account closure does not automatically remove records that must be retained for legitimate purposes or as required by law.",
    ],
  },
  {
    id: "disclaimers",
    number: "16",
    title: "Disclaimers",
    intro:
      "The Platform is provided to support online learning and educational activities.",
    points: [
      "We do not guarantee that every course will meet every user's expectations or produce a particular learning outcome.",
      "Educational information is not a substitute for professional advice where specialist advice is required.",
      "We do not guarantee uninterrupted, error-free, or completely secure operation of the Platform.",
      "Nothing in these Terms limits any protection or right that cannot lawfully be excluded under applicable law.",
    ],
  },
  {
    id: "liability",
    number: "17",
    title: "Limitation of Liability",
    intro:
      "To the extent permitted by applicable law, Skill Next Consulting Inc. will not be responsible for indirect or consequential losses arising from use of the Platform.",
    points: [
      "This may include loss of opportunity, data, business, or expected educational outcomes, where such losses are legally capable of exclusion.",
      "We remain responsible for obligations and liabilities that cannot be excluded or limited under applicable law.",
      "Nothing in this section removes any mandatory consumer rights or other protections available to you.",
    ],
  },
  {
    id: "changes",
    number: "18",
    title: "Changes to These Terms",
    intro:
      "We may revise these Terms as the Platform, services, or applicable requirements change.",
    points: [
      "The latest version will be published on this page with an updated revision date.",
      "Where a change materially affects users, we will provide an appropriate notice where required.",
      "Continued use of the Platform after revised Terms take effect will be subject to the updated Terms, to the extent permitted by law.",
    ],
  },
  {
    id: "governing-law",
    number: "19",
    title: "Governing Law and Disputes",
    intro:
      "These Terms are intended to operate subject to applicable law. The governing country or state, dispute resolution process, and competent courts must be confirmed based on the legal registration and operating jurisdiction of Skill Next Consulting Inc.",
    points: [
      "Users should first contact the official support channel to attempt to resolve a concern.",
      "Any formal dispute will be handled through the legally applicable process and competent forum.",
      "The final version of this section must identify the confirmed governing law and dispute venue before publication.",
    ],
  },
  {
    id: "contact",
    number: "20",
    title: "Contact and Support",
    intro:
      "For questions about these Terms, account access, course content, or Platform-related concerns, contact Skill Next Consulting Inc. through the official support channel published on the Platform.",
    points: [
      "Please include your registered email address and a clear description of your concern.",
      "Do not include your password, verification token, or other confidential login credentials in a support request.",
      "The official company contact details and any required grievance contact information should be published here before launch.",
    ],
  },
];

function TermsAndConditions() {
  return (
    <main className="min-h-dvh bg-[#EEF3F4] text-[#344B4F]">

      {/* Background Decoration */}
      <div className="pointer-events-none fixed -right-36 -top-36 h-[420px] w-[420px] rounded-full bg-[#FFAB0B]/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-36 h-[420px] w-[420px] rounded-full border-[50px] border-[#06424B]/5" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#DCE6E8] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-7 lg:px-10">

          <Link to="/signup" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Skill Next Consulting Inc."
              className="h-[48px] w-auto max-w-[170px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/signup"
              className="hidden items-center gap-2 rounded-xl border border-[#DCE6E8] px-4 py-2.5 text-[11px] font-bold text-[#06424B] transition-all hover:border-[#06424B] hover:bg-[#F5F8F7] sm:flex"
            >
              <ArrowLeft size={14} />
              Back to Sign Up
            </Link>

            <Link
              to="/login"
              style={{ color: "#FFFFFF" }}
              className="flex items-center gap-2 rounded-xl bg-[#06424B] px-4 py-2.5 text-[11px] font-bold !text-white shadow-[0_5px_14px_rgba(6,66,75,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#042E35]"
            >
              <span className="text-white">Sign In</span>

              <ArrowUpRight
                size={14}
                className="shrink-0 text-white"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Page Heading */}
      <section className="relative z-10 mx-auto max-w-[1280px] px-4 pb-5 pt-8 sm:px-7 sm:pt-11 lg:px-10">

        <div className="flex items-center gap-2 text-[9px] font-bold tracking-[2px] text-[#A17B28]">
          <FileText size={14} />
          LEGAL INFORMATION
        </div>

        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-[-1.5px] text-[#06424B] sm:text-[42px]">
              Terms & Conditions
              <span className="text-[#FFAB0B]">.</span>
            </h1>

            <p className="mt-2 max-w-[660px] text-[12px] leading-6 text-[#7B8C8F] sm:text-[13px]">
              Please read these terms carefully before using the Skill Next
              Consulting Inc. learning platform.
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

        {/* Overview Card */}
        <div className="relative mt-7 overflow-hidden rounded-[22px] border border-[#DCE6E8] border-t-[5px] border-t-[#FFAB0B] bg-white p-5 shadow-[0_10px_35px_rgba(6,66,75,0.06)] sm:p-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[17px] bg-[#EEF5F4] text-[#06424B]">
              <BookOpen size={27} />
            </div>

            <div className="flex-1">
              <h2 className="text-[15px] font-bold text-[#06424B]">
                Learning with clarity and confidence
              </h2>

              <p className="mt-1 max-w-[820px] text-[11px] leading-6 text-[#839194]">
                These Terms explain the responsibilities of students,
                teachers, and Skill Next Consulting Inc. when using our
                learning platform, courses, assessments, and educational
                services.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F2F7F4] px-3 py-2.5">
              <ShieldCheck size={17} className="text-[#4D8B4F]" />
              <span className="text-[10px] font-bold text-[#4D7950]">
                Platform Guidelines
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Section Navigation */}
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

      {/* Document Layout */}
      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 pb-12 sm:px-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10">

        {/* Desktop Table of Contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-[20px] border border-[#DCE6E8] bg-white p-4 shadow-[0_8px_30px_rgba(6,66,75,0.05)]">

            <div className="mb-4 flex items-center gap-2 border-b border-[#E8EEEE] pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF5F4] text-[#06424B]">
                <FileText size={16} />
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#06424B]">
                  On this page
                </p>
                <p className="text-[9px] text-[#9AA7A8]">
                  20 sections
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

        {/* Terms Document */}
        <article className="relative overflow-hidden rounded-[22px] border border-[#DCE6E8] bg-white shadow-[0_12px_45px_rgba(6,66,75,0.07)]">

          {/* Curved Gold Top Accent */}
          <div className="pointer-events-none absolute inset-x-[1px] top-[1px] z-10 h-[18px] rounded-t-[20px] border-x-[5px] border-t-[5px] border-[#FFAB0B]" />

          <div className="px-5 pb-7 pt-7 sm:px-8 sm:pb-10 sm:pt-9 lg:px-11">

            {/* Document Intro */}
            <div className="border-b border-[#E8EEEE] pb-7">
              <div className="flex items-center gap-2 text-[9px] font-bold tracking-[1.5px] text-[#A17B28]">
                <GraduationCap size={15} />
                SKILL NEXT CONSULTING INC.
              </div>

              <h2 className="mt-3 text-[19px] font-extrabold tracking-[-0.5px] text-[#06424B]">
                Terms of Use for Students and Teachers
              </h2>

              <p className="mt-3 text-[11px] leading-6 text-[#839194]">
                These Terms apply to the users of our online learning
                environment, including individuals who register as students
                or teachers and access the services made available through
                the Platform.
              </p>
            </div>

            {/* Terms Sections */}
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

            {/* Review Reminder */}
            <div className="mt-5 rounded-[15px] border border-[#EAD9B5] bg-[#FFF9EC] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Scale
                  size={19}
                  className="mt-0.5 shrink-0 text-[#A17B28]"
                />

                <div>
                  <h3 className="text-[11px] font-bold text-[#795B19]">
                    Important before publishing
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-[#8A774E]">
                    Confirm the company's registered legal entity details,
                    governing jurisdiction, official support and grievance
                    contact information, applicable payment terms, and
                    course-specific refund rules. Have the final Terms and
                    the separate Privacy Policy reviewed by a qualified
                    legal professional before accepting users.
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement Footer */}
            <div className="mt-7 flex flex-col gap-4 border-t border-[#E8EEEE] pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="shrink-0 text-[#4D8B4F]"
                />

                <p className="text-[10px] leading-5 text-[#879497]">
                  Thank you for being part of Skill Next Consulting Inc.
                </p>
              </div>

              <Link
                to="/signup"
                style={{ color: "#FFFFFF" }}
                className="inline-flex min-h-[43px] items-center justify-center gap-2 rounded-xl bg-[#06424B] px-5 text-[11px] font-bold !text-white shadow-[0_5px_14px_rgba(6,66,75,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#042E35]"
              >
                <span className="text-white">Back to Registration</span>

                <ArrowUpRight
                  size={15}
                  className="shrink-0 text-white"
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
              to="/signup"
              className="transition-colors hover:text-[#06424B]"
            >
              Sign Up
            </Link>

            <Link
              to="/login"
              className="transition-colors hover:text-[#06424B]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default TermsAndConditions;
