import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resendVerification } from "../../api/auth.api";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Loader2,
  LockKeyhole,
  Mail,
  Pencil,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";

const RESEND_SECONDS = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const styles = `
@keyframes fp-pop {
  0% { transform: scale(.55); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes fp-ripple {
  0% { transform: scale(.75); opacity: .55; }
  100% { transform: scale(1.45); opacity: 0; }
}
@keyframes fp-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
@keyframes fp-fly {
  0% { transform: translate(-38px, 38px) scale(.3); opacity: 0; }
  70% { transform: translate(3px, -3px) scale(1.12); opacity: 1; }
  100% { transform: translate(0, 0) scale(1); opacity: 1; }
}
@keyframes fp-rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.fp-core { animation: fp-pop .7s cubic-bezier(.2,.8,.3,1) both; }
.fp-ripple { animation: fp-ripple 1.8s ease-out both; }
.fp-ripple-2 { animation-delay: .35s; }
.fp-flap {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: fp-draw .6s ease-out .55s forwards;
}
.fp-plane { animation: fp-fly .7s cubic-bezier(.2,.8,.3,1) 1s both; }
.fp-rise { animation: fp-rise .35s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fp-core, .fp-ripple, .fp-plane, .fp-rise { animation: none; }
  .fp-flap { animation: none; stroke-dashoffset: 0; }
}
`;

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resentNotice, setResentNotice] = useState(false);

  const trimmedEmail = email.trim();
  const emailError = !trimmedEmail
    ? "Enter your registered email address."
    : !EMAIL_PATTERN.test(trimmedEmail)
    ? "Enter a valid email address, like name@company.com."
    : "";
  const showEmailError = touched && emailError;
  const emailValid = trimmedEmail !== "" && !emailError;

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const requestResetLink = async (address) => {
    // Resend the account verification email through the existing auth API.
    return resendVerification(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setFormError("");

    if (emailError) return;

    setSubmitting(true);

    try {
      await requestResetLink(trimmedEmail);
      setSentTo(trimmedEmail);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setFormError("We couldn't send the email. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || submitting) return;

    setSubmitting(true);
    setResentNotice(false);

    try {
      await requestResetLink(sentTo);
      setCooldown(RESEND_SECONDS);
      setResentNotice(true);
    } catch (err) {
      setFormError("We couldn't resend the email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeEmail = () => {
    setSentTo("");
    setResentNotice(false);
    setFormError("");
    setCooldown(0);
  };

  const isSent = Boolean(sentTo);

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-[#EEF3F4] px-3 py-5 sm:px-5">
      <style>{styles}</style>

      {/* Background Decorations */}
      <div className="pointer-events-none fixed -right-28 -top-32 h-[320px] w-[320px] rounded-full border-[28px] border-[#FFAB0B]/[0.12]" />
      <div className="pointer-events-none fixed -right-44 -top-48 h-[460px] w-[460px] rounded-full border border-[#06424B]/10" />
      <div className="pointer-events-none fixed -bottom-40 -left-32 h-[380px] w-[380px] rounded-full border-[45px] border-[#06424B]/5" />

      <div className="relative z-10 w-full max-w-[570px]">

        {/* Header */}
        <header className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="group flex items-center gap-2 text-[11px] font-semibold text-[#06424B] transition-colors hover:text-[#A87500] sm:text-xs"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to sign in
          </button>

          <span className="text-[9px] font-bold tracking-[1.5px] text-[#06424B]/60 sm:text-[10px]">
            ACCOUNT RECOVERY
          </span>
        </header>

        {/* Main Card */}
        <section className="relative overflow-hidden rounded-[25px] border border-[#DCE6E8] bg-white shadow-[0_20px_65px_rgba(6,66,75,0.12)] sm:rounded-[30px]">

          {/* Curved Gold Top Accent */}
          <div className="pointer-events-none absolute inset-x-[1px] top-[1px] z-20 h-[18px] rounded-t-[23px] border-x-[5px] border-t-[5px] border-[#FFAB0B] sm:rounded-t-[28px]" />

          <div className="px-5 pb-7 pt-7 text-center sm:px-10 sm:pb-9 sm:pt-9">

            {/* Logo */}
            <img
              src="/logo.png"
              alt="Skill Next Consulting Inc."
              className="mx-auto h-[56px] w-auto max-w-[190px] object-contain sm:h-[62px]"
            />

            {!isSent ? (
              <div key="request" className="fp-rise">

                {/* Illustration */}
                <div
                  className="relative mx-auto mt-5 flex h-[104px] w-[130px] items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="absolute h-[104px] w-[104px] rounded-full border border-dashed border-[#06424B]/15" />

                  <div className="relative z-10 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-br from-[#0A5560] to-[#06424B] text-white shadow-[0_12px_26px_rgba(6,66,75,0.22)]">
                    <span className="absolute inset-[5px] rounded-full border border-white/20" />
                    <LockKeyhole size={32} strokeWidth={1.7} />

                    <span className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#FFAB0B] text-[#06424B]">
                      <Mail size={15} strokeWidth={2.5} />
                    </span>
                  </div>
                </div>

                {/* Heading */}
                <div className="mt-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF5DC] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
                    <span className="text-[9px] font-bold tracking-[1.5px] text-[#795B19]">
                      PASSWORD RECOVERY
                    </span>
                  </div>

                  <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-[-1.1px] text-[#06424B] sm:text-[32px]">
                    Forgot your password
                    <span className="text-[#FFAB0B]">?</span>
                  </h1>

                  <p className="mx-auto mt-3 max-w-[380px] text-[11px] leading-6 text-[#839194] sm:text-[12px]">
                    Enter the email address linked to your account and we'll
                    send you a link to reset your password.
                  </p>
                </div>

                {/* Email Form */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mx-auto mt-7 max-w-[420px] text-left"
                >
                  <label
                    htmlFor="recovery-email"
                    className="mb-2 block text-[11px] font-bold text-[#344B4F]"
                  >
                    Registered Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                        showEmailError ? "text-[#C2553F]" : "text-[#829496]"
                      }`}
                    />

                    <input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFormError("");
                      }}
                      onBlur={() => setTouched(true)}
                      placeholder="Enter your registered email"
                      autoComplete="email"
                      disabled={submitting}
                      aria-invalid={Boolean(showEmailError)}
                      aria-describedby={
                        showEmailError ? "recovery-email-error" : undefined
                      }
                      className={`h-[51px] w-full rounded-xl border bg-[#FAFCFC] pl-11 pr-11 text-[12px] font-medium text-[#06424B] outline-none transition-all placeholder:text-[#A5B0B1] disabled:opacity-60 ${
                        showEmailError
                          ? "border-[#E3A99D] bg-[#FFF8F6] focus:border-[#C2553F] focus:ring-4 focus:ring-[#C2553F]/10"
                          : emailValid
                          ? "border-[#A9D2AF] focus:border-[#4D9658] focus:ring-4 focus:ring-[#4D9658]/10"
                          : "border-[#DCE6E8] focus:border-[#06424B] focus:ring-4 focus:ring-[#06424B]/5"
                      }`}
                    />

                    {emailValid && (
                      <span className="absolute right-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#4D9658] text-white">
                        <Check size={12} strokeWidth={3.5} />
                      </span>
                    )}
                  </div>

                  {showEmailError && (
                    <p
                      id="recovery-email-error"
                      role="alert"
                      className="fp-rise mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#C2553F]"
                    >
                      <AlertCircle size={12} className="shrink-0" />
                      {emailError}
                    </p>
                  )}

                  {formError && (
                    <div
                      role="alert"
                      className="mt-3 flex items-start gap-2 rounded-xl border border-[#E3A99D] bg-[#FFF8F6] px-3 py-2.5 text-[10px] leading-5 text-[#C2553F]"
                    >
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-5 flex min-h-[51px] w-full items-center justify-center gap-3 rounded-xl bg-[#06424B] px-5 text-[12px] font-bold text-white shadow-[0_9px_22px_rgba(6,66,75,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#042E35] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        Sending link
                        <Loader2 size={17} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowUpRight size={17} />
                      </>
                    )}
                  </button>
                </form>

                {/* Security note */}
                <div className="mx-auto mt-6 flex max-w-[420px] items-start gap-3 rounded-xl border border-[#E8EEEE] bg-[#FAFCFC] p-3.5 text-left">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#06424B]"
                  />

                  <div>
                    <p className="text-[10px] font-bold text-[#344B4F]">
                      Your account security matters
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-[#89979A]">
                      For your safety, the reset link is only sent to the email
                      address registered with your account.
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-[10px] font-medium text-[#89979A]">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-[#06424B] transition-colors hover:text-[#A87500]"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            ) : (
              <div key="sent" className="fp-rise">

                {/* Email sent illustration */}
                <div
                  className="relative mx-auto mt-5 flex h-[112px] w-[150px] items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="fp-ripple absolute h-[88px] w-[88px] rounded-full border-2 border-[#FFAB0B]/60" />
                  <span className="fp-ripple fp-ripple-2 absolute h-[88px] w-[88px] rounded-full border border-[#06424B]/30" />
                  <span className="absolute h-[108px] w-[108px] rounded-full border border-dashed border-[#06424B]/15" />

                  <div className="fp-core relative z-10 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-gradient-to-br from-[#0A5560] to-[#06424B] shadow-[0_14px_28px_rgba(6,66,75,0.28)]">
                    <span className="absolute inset-[5px] rounded-full border border-white/20" />

                    <svg
                      viewBox="0 0 48 48"
                      className="relative z-10 h-[42px] w-[42px]"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="6" y="11" width="36" height="26" rx="5" />
                      <path
                        className="fp-flap"
                        pathLength="1"
                        d="M8.5 15.5 L24 27 L39.5 15.5"
                      />
                    </svg>
                  </div>

                  <div className="fp-plane absolute right-[30px] top-[6px] z-20 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#FFAB0B] text-[#06424B] shadow-md">
                    <Send size={15} strokeWidth={2.4} className="-ml-px mt-px" />
                  </div>
                </div>

                {/* Heading */}
                <div className="mt-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF5DC] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
                    <span className="text-[9px] font-bold tracking-[1.5px] text-[#795B19]">
                      EMAIL SENT
                    </span>
                  </div>

                  <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-[-1.1px] text-[#06424B] sm:text-[32px]">
                    Check your inbox
                    <span className="text-[#FFAB0B]">.</span>
                  </h1>

                  <p className="mx-auto mt-3 max-w-[390px] text-[11px] leading-6 text-[#839194] sm:text-[12px]">
                    If an account exists for this email, we've sent a link to
                    reset your password.
                  </p>
                </div>

                {/* Address */}
                <div className="mx-auto mt-5 flex max-w-[420px] items-center gap-3 rounded-[13px] border border-[#DCE6E8] bg-[#F8FAF9] p-3 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F4] text-[#06424B]">
                    <Mail size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-bold tracking-[1.3px] text-[#8A9899]">
                      SENT TO
                    </p>
                    <p className="mt-1 truncate text-[12px] font-semibold text-[#06424B] sm:text-[13px]">
                      {sentTo}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#06424B] transition-colors hover:bg-[#EEF3F4]"
                  >
                    <Pencil size={12} />
                    Change
                  </button>
                </div>

                {resentNotice && (
                  <div
                    role="status"
                    className="fp-rise mx-auto mt-3 flex max-w-[420px] items-center gap-2 rounded-xl border border-[#BFDCC4] bg-[#EAF4EB] px-3 py-2.5 text-left text-[10px] text-[#3F7A49]"
                  >
                    <Check size={14} strokeWidth={3} className="shrink-0" />
                    A new link has been sent.
                  </div>
                )}

                {formError && (
                  <div
                    role="alert"
                    className="mx-auto mt-3 flex max-w-[420px] items-start gap-2 rounded-xl border border-[#E3A99D] bg-[#FFF8F6] px-3 py-2.5 text-left text-[10px] leading-5 text-[#C2553F]"
                  >
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Actions */}
                <div className="mx-auto mt-4 grid max-w-[420px] grid-cols-1 gap-2 min-[430px]:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || submitting}
                    className="group flex min-h-[47px] items-center justify-center gap-2 rounded-xl bg-[#06424B] px-3 text-[11px] font-bold text-white shadow-[0_7px_18px_rgba(6,66,75,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#042E35] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        Sending
                        <Loader2 size={14} className="animate-spin" />
                      </>
                    ) : cooldown > 0 ? (
                      `Resend in ${cooldown}s`
                    ) : (
                      <>
                        Resend link
                        <RefreshCw
                          size={14}
                          className="transition-transform duration-500 group-hover:rotate-180"
                        />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="flex min-h-[47px] items-center justify-center gap-2 rounded-xl border border-[#DCE6E8] bg-white px-3 text-[11px] font-bold text-[#06424B] transition-all hover:border-[#06424B] hover:bg-[#F4F8F7]"
                  >
                    Back to Sign In
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                {/* Help */}
                <div className="mx-auto mt-5 flex max-w-[420px] items-start gap-3 rounded-xl border border-[#E8EEEE] bg-[#FAFCFC] p-3.5 text-left">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#06424B]"
                  />

                  <div>
                    <p className="text-[10px] font-bold text-[#344B4F]">
                      Didn't receive the email?
                    </p>
                    <p className="mt-1 text-[9px] leading-5 text-[#89979A]">
                      Check your spam or junk folder, and make sure the address
                      above is the one you registered with.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-[#E7ECEC] bg-[#FAFCFC] px-4 py-3 text-center">
            <p className="flex items-center justify-center gap-2 text-[9px] text-[#879497]">
              <ShieldCheck size={13} className="text-[#06424B]" />
              © 2026 Skill Next Consulting Inc. · Learning without limits.
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;