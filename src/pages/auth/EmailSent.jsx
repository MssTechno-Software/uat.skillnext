import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { resendVerification } from "../../api/auth.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";

const styles = `
@keyframes es-pop {
  0% { transform: scale(.55); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes es-ripple {
  0% { transform: scale(.75); opacity: .55; }
  100% { transform: scale(1.45); opacity: 0; }
}
@keyframes es-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
@keyframes es-fly {
  0% { transform: translate(-38px, 38px) scale(.3); opacity: 0; }
  70% { transform: translate(3px, -3px) scale(1.12); opacity: 1; }
  100% { transform: translate(0, 0) scale(1); opacity: 1; }
}
.es-core { animation: es-pop .7s cubic-bezier(.2,.8,.3,1) both; }
.es-ripple { animation: es-ripple 1.8s ease-out both; }
.es-ripple-2 { animation-delay: .35s; }
.es-flap {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: es-draw .6s ease-out .55s forwards;
}
.es-plane { animation: es-fly .7s cubic-bezier(.2,.8,.3,1) 1s both; }
@media (prefers-reduced-motion: reduce) {
  .es-core, .es-ripple, .es-plane { animation: none; }
  .es-flap { animation: none; stroke-dashoffset: 0; }
}
`;

const RESEND_COOLDOWN_SECONDS = 30;

function EmailSent() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const role = location.state?.role || "student";
  const firstName = location.state?.firstName || "";

  const [emailInput, setEmailInput] = useState(email);
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(
    RESEND_COOLDOWN_SECONDS
  );

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const handleResend = async () => {
    const trimmedEmail = emailInput.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (isResending || resendCountdown > 0) return;

    setIsResending(true);
    setMessage("");

    try {
      await resendVerification(trimmedEmail);
      setResendSuccess(true);
      setMessage("Verification email sent successfully. Please check your inbox.");
      setResendCountdown(30);
    } catch (error) {
      setResendSuccess(false);
      setMessage(
        getApiErrorMessage(
          error,
          "We couldn't resend the verification email. Please try again."
        )
      );
    } finally {
      setIsResending(false);
    }
  };
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#EEF3F4] px-3 py-2 sm:px-5 sm:py-3">
      <style>{styles}</style>

      {/* Background Decorations */}
      <div className="pointer-events-none absolute -right-28 -top-32 h-[320px] w-[320px] rounded-full border-[28px] border-[#FFAB0B]/[0.12]" />
      <div className="pointer-events-none absolute -right-44 -top-48 h-[460px] w-[460px] rounded-full border border-[#06424B]/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full border-[45px] border-[#06424B]/5" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1080px] flex-col">

        {/* Top Navigation */}
        <header className="mb-2 flex h-8 shrink-0 items-center justify-between sm:mb-3">

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="group flex items-center gap-2 text-[11px] font-semibold text-[#06424B] transition-colors hover:text-[#A87500] sm:text-xs"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to registration
          </button>

          <span className="text-[9px] font-bold tracking-[1.5px] text-[#06424B]/60 sm:text-[10px] sm:tracking-[2px]">
            EMAIL VERIFICATION
          </span>
        </header>

        {/* Main Card */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#DCE6E8] border-t-[5px] border-t-[#FFAB0B] bg-white shadow-[0_20px_65px_rgba(6,66,75,0.12)] sm:rounded-[30px]">

          {/* Main Content */}
          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">

            {/* Left Section */}
            <div className="flex min-h-0 flex-col justify-center px-5 py-2 sm:px-9 md:px-10 lg:px-14">

              {/* Logo */}
              <img
                src="/logo.png"
                alt="Skill Next Consulting Inc."
                className="mx-auto h-[clamp(38px,6vh,55px)] w-auto max-w-[190px] shrink-0 object-contain"
              />

              {/* Email Sent Illustration */}
              <div
                className="relative mx-auto mt-1 flex h-[clamp(92px,16vh,135px)] w-[175px] shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                {/* Ripples, play once */}
                <span className="es-ripple absolute h-[96px] w-[96px] rounded-full border-2 border-[#FFAB0B]/60" />
                <span className="es-ripple es-ripple-2 absolute h-[96px] w-[96px] rounded-full border border-[#06424B]/30" />

                {/* Resting halo */}
                <span className="absolute h-[118px] w-[118px] rounded-full border border-dashed border-[#06424B]/15" />

                {/* Core */}
                <div className="es-core relative z-10 flex h-[84px] w-[84px] items-center justify-center rounded-full bg-gradient-to-br from-[#0A5560] to-[#06424B] shadow-[0_14px_28px_rgba(6,66,75,0.28)]">
                  <span className="absolute inset-[5px] rounded-full border border-white/20" />

                  <svg
                    viewBox="0 0 48 48"
                    className="relative z-10 h-[44px] w-[44px]"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="11" width="36" height="26" rx="5" />
                    <path
                      className="es-flap"
                      pathLength="1"
                      d="M8.5 15.5 L24 27 L39.5 15.5"
                    />
                  </svg>
                </div>

                {/* Paper plane badge */}
                <div className="es-plane absolute right-[26px] top-[6px] z-20 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#FFAB0B] text-[#06424B] shadow-md">
                  <Send size={15} strokeWidth={2.4} className="-ml-px mt-px" />
                </div>
              </div>

              {/* Heading */}
              <div className="mt-0 text-center">

                <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF5DC] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />

                  <span className="text-[9px] font-bold tracking-[1.5px] text-[#795B19]">
                    EMAIL SENT
                  </span>
                </div>

                <h1 className="mt-2 text-[27px] font-bold leading-tight tracking-[-1.1px] text-[#06424B] sm:text-[32px]">
                  Check your inbox
                  <span className="text-[#FFAB0B]">.</span>
                </h1>

                <p className="mx-auto mt-2 max-w-[390px] text-[11px] leading-5 text-[#839194] sm:text-[12px]">
                  {firstName
                    ? `You're almost there, ${firstName}! We've sent a verification link to complete your ${role} registration.`
                    : "You're almost there! We've sent a verification link to complete your registration."}
                </p>
              </div>

              {/* Email Address */}
              <div className="mx-auto mt-4 flex w-full max-w-[440px] items-center gap-3 rounded-[13px] border border-[#DCE6E8] bg-[#F8FAF9] p-3 transition-all hover:border-[#A9BEC0] sm:mt-5 sm:p-3.5">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F4] text-[#06424B]">
                  <Mail size={20} />
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[8px] font-bold tracking-[1.3px] text-[#8A9899]">
                    VERIFICATION EMAIL
                  </p>

                  <input
                    type="email"
                    value={emailInput}
                    onChange={(event) => {
                      setEmailInput(event.target.value);
                      setMessage("");
                    }}
                    placeholder="Enter your email address"
                    aria-label="Verification email address"
                    autoComplete="email"
                    className="mt-1 w-full min-w-0 bg-transparent text-[12px] font-semibold text-[#06424B] outline-none placeholder:font-normal placeholder:text-[#A0ABAD] sm:text-[13px]"
                  />
                </div>

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF4EB] text-[#41794A]">
                  <Check size={15} />
                </div>
              </div>

              {/* Mobile Next Steps */}
              <div className="mt-3 grid grid-cols-3 gap-2 md:hidden">
                {["Open email", "Verify email", "Set password"].map(
                  (step, index) => (
                    <div
                      key={step}
                      className="flex flex-col items-center gap-1.5 rounded-xl bg-[#F5F8F7] px-1.5 py-2"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#06424B] text-[10px] font-bold text-white">
                        {index + 1}
                      </span>

                      <span className="text-center text-[9px] font-semibold text-[#52686B]">
                        {step}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Feedback */}
              {message && (
                <div
                  role="status"
                  className={`mx-auto mt-2 w-full max-w-[440px] rounded-lg border px-3 py-2 text-[10px] leading-4 ${resendSuccess
                    ? "border-[#B7E4C7] bg-[#EAF7EE] text-[#247A45]"
                    : "border-[#FFAB0B]/40 bg-[#FFF5DC] text-[#795B19]"
                    }`}
                >
                  {message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mx-auto mt-3 grid w-full max-w-[440px] grid-cols-1 gap-2 min-[430px]:grid-cols-2 md:mt-4">

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || resendCountdown > 0 || !isValidEmail}
                  className="group flex min-h-[43px] items-center justify-center gap-2 rounded-xl bg-[#06424B] px-3 text-[11px] font-bold text-white shadow-[0_7px_18px_rgba(6,66,75,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#042E35] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {isResending
                      ? "Sending..."
                      : resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : "Resend verification"}
                  </span>

                  <RefreshCw
                    size={14}
                    className={
                      isResending
                        ? "animate-spin"
                        : resendCountdown > 0
                          ? ""
                          : "transition-transform duration-500 group-hover:rotate-180"
                    }
                  />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex min-h-[43px] items-center justify-center gap-2 rounded-xl border border-[#DCE6E8] bg-white px-3 text-[11px] font-bold text-[#06424B] transition-all hover:border-[#06424B] hover:bg-[#F4F8F7]"
                >
                  Back to Sign In
                  <ArrowUpRight size={14} />
                </button>
              </div>

            </div>

            {/* Right Section - Desktop */}
            <div className="relative hidden min-h-0 flex-col justify-center border-l border-[#E8EEEE] bg-[#FAFCFC] px-8 py-7 md:flex lg:px-12">

              <div className="mb-7">
                <span className="text-[9px] font-bold tracking-[2px] text-[#A17B28]">
                  YOUR JOURNEY STARTS HERE
                </span>

                <h2 className="mt-3 text-[25px] font-bold leading-tight tracking-[-0.8px] text-[#06424B]">
                  Just a few steps
                  <br />
                  to get started.
                </h2>

                <p className="mt-3 max-w-[300px] text-[12px] leading-6 text-[#89979A]">
                  Complete your email verification and get ready to explore your learning journey.
                </p>
              </div>

              {/* Steps */}
              <div className="relative space-y-5">

                <div className="absolute bottom-8 left-[17px] top-8 w-px bg-[#DCE6E8]" />

                {[
                  {
                    title: "Open your email",
                    description: "Find the verification message in your inbox.",
                  },
                  {
                    title: "Verify your email address",
                    description:
                      "Click the secure verification link in the email.",
                  },
                  {
                    title: "Create your password",
                    description:
                      "Set your password to complete your account setup.",
                  },
                ].map((step, index) => (
                  <div
                    key={step.title}
                    className="relative flex items-start gap-4"
                  >
                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#DCE6E8] bg-white text-[11px] font-bold text-[#06424B] shadow-sm">
                      {index + 1}
                    </div>

                    <div className="pt-0.5">
                      <h3 className="text-[12px] font-bold text-[#344B4F]">
                        {step.title}
                      </h3>

                      <p className="mt-1 max-w-[245px] text-[10px] leading-5 text-[#89979A]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Help Section */}
              <div className="mt-8 rounded-[14px] border border-[#E8EEEE] bg-white p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[#06424B]" />

                  <p className="text-[11px] font-bold text-[#344B4F]">
                    Didn't receive the email?
                  </p>
                </div>

                <p className="mt-2 text-[10px] leading-5 text-[#89979A]">
                  Check your spam or junk folder. Make sure you entered the correct email address during registration.
                </p>
              </div>

              {/* Bottom Accent */}
              <div className="mt-6 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
                <span className="text-[9px] font-semibold tracking-[1px] text-[#8A9899]">
                  LEARNING WITHOUT LIMITS
                </span>
              </div>
            </div>

          </div>

          {/* Footer */}
          <footer className="flex h-9 shrink-0 items-center justify-center border-t border-[#E7ECEC] bg-[#FAFCFC] px-3">
            <p className="flex items-center gap-2 text-center text-[9px] text-[#879497]">
              <ShieldCheck size={13} className="shrink-0 text-[#06424B]" />

              © 2026 Skill Next Consulting Inc. · Learning without limits.
            </p>
          </footer>

        </section>
      </div>
    </main>
  );
}

export default EmailSent;