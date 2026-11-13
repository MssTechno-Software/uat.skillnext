import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { setUserPassword } from "../../api/auth.api";

import { getApiErrorMessage } from "../../utils/apiErrorHandler";
const REDIRECT_SECONDS = 5;
const RING_LENGTH = 2 * Math.PI * 42;

const STRENGTH_LEVELS = [
  { label: "Too weak", color: "#D9634C" },
  { label: "Weak", color: "#D9634C" },
  { label: "Fair", color: "#E58A2B" },
  { label: "Good", color: "#C9A21A" },
  { label: "Strong", color: "#4D9658" },
  { label: "Excellent", color: "#3F8F52" },
];

const styles = `
@keyframes sp-pop {
  0% { transform: scale(.55); opacity: 0; }
  60% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes sp-ripple {
  0% { transform: scale(.8); opacity: .5; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes sp-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
@keyframes sp-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes sp-drain {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
@keyframes sp-rise {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.sp-overlay { animation: sp-fade .25s ease-out both; }
.sp-modal { animation: sp-pop .45s cubic-bezier(.2,.8,.3,1) both; }
.sp-badge { animation: sp-pop .6s cubic-bezier(.2,.8,.3,1) .15s both; }
.sp-ripple { animation: sp-ripple 1.6s ease-out .3s both; }
.sp-tick {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: sp-draw .5s ease-out .6s forwards;
}
.sp-drain {
  transform-origin: left;
  animation: sp-drain ${REDIRECT_SECONDS}s linear forwards;
}
.sp-error { animation: sp-rise .2s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .sp-overlay, .sp-modal, .sp-badge, .sp-ripple, .sp-error { animation: none; }
  .sp-tick { animation: none; stroke-dashoffset: 0; }
}
`;

function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  onKeyUp,
  placeholder,
  show,
  onToggle,
  error,
  valid,
  disabled,
}) {
  const hasError = Boolean(error);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-bold text-[#344B4F]"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={17}
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${hasError ? "text-[#C2553F]" : "text-[#829496]"
            }`}
        />

        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          placeholder={placeholder}
          autoComplete="new-password"
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`h-[49px] w-full rounded-xl border bg-[#FAFCFC] pl-11 pr-12 text-[12px] font-medium text-[#06424B] outline-none transition-all placeholder:text-[#A5B0B1] disabled:opacity-60 ${hasError
            ? "border-[#E3A99D] bg-[#FFF8F6] focus:border-[#C2553F] focus:ring-4 focus:ring-[#C2553F]/10"
            : valid
              ? "border-[#A9D2AF] focus:border-[#4D9658] focus:ring-4 focus:ring-[#4D9658]/10"
              : "border-[#DCE6E8] focus:border-[#06424B] focus:ring-4 focus:ring-[#06424B]/5"
            }`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#829496] transition-colors hover:text-[#06424B]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {hasError && (
        <p
          id={`${id}-error`}
          role="alert"
          className="sp-error mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#C2553F]"
        >
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function SetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = new URLSearchParams(location.search).get("token");
  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [capsOn, setCapsOn] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const requirements = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase", valid: /[A-Z]/.test(password) },
    { label: "Lowercase", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
    { label: "Symbol", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const strength = requirements.filter((item) => item.valid).length;
  const allMet = strength === requirements.length;
  const level = STRENGTH_LEVELS[password ? strength : 0];
  const passwordsMatch = confirmPassword !== "" && password === confirmPassword;

  const errors = {
    password: !password
      ? "Enter a new password."
      : !allMet
        ? "Your password doesn't meet all the requirements yet."
        : "",
    confirm: !confirmPassword
      ? "Re-enter your password to confirm it."
      : password !== confirmPassword
        ? "Passwords don't match."
        : "",
  };

  const showPasswordError = touched.password && errors.password;
  const showConfirmError = touched.confirm && errors.confirm;
  const isPasswordFormDisabled = submitting || !token;

  const goToLogin = () =>
    navigate("/login", { replace: true, state: { email, passwordSet: true } });

  // Redirect to login after password is successfully set.
  useEffect(() => {
    if (!success) return undefined;

    if (countdown <= 0) {
      navigate("/login", {
        replace: true,
        state: {
          email,
          passwordSet: true,
        },
      });

      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [success, countdown, navigate, email]);

  const handleCaps = (e) => setCapsOn(e.getModifierState?.("CapsLock"));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setTouched({
      password: true,
      confirm: true,
    });

    if (!token) {
      setFormError("Password setup token is missing. Please verify your email again.");
      return;
    }
    if (errors.password || errors.confirm) return;

    setSubmitting(true);

    try {
      await setUserPassword({
        token,
        password,
        confirmPassword,
      });

      setCountdown(REDIRECT_SECONDS);
      setSuccess(true);
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "We couldn't save your password. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

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
            ACCOUNT SECURITY
          </span>
        </header>

        {/* Card */}
        <section className="relative overflow-hidden rounded-[25px] border border-[#DCE6E8] bg-white shadow-[0_20px_65px_rgba(6,66,75,0.12)] sm:rounded-[30px]">

          {/* Curved Gold Top Accent */}
          <div className="pointer-events-none absolute inset-x-[1px] top-[1px] z-20 h-[18px] rounded-t-[23px] border-x-[5px] border-t-[5px] border-[#FFAB0B] sm:rounded-t-[28px]" />

          <div className="px-5 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-8">

            {/* Logo */}
            <img
              src="/logo.png"
              alt="Skill Next Consulting Inc."
              className="mx-auto h-[52px] w-auto max-w-[180px] object-contain"
            />

            {/* Illustration with strength ring */}
            <div
              className="relative mx-auto mt-3 flex h-[96px] w-[96px] items-center justify-center"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 96 96"
                className="absolute inset-0 h-full w-full -rotate-90"
              >
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke="#E3ECEC"
                  strokeWidth="3"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke={level.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={RING_LENGTH}
                  strokeDashoffset={RING_LENGTH * (1 - (password ? strength : 0) / 5)}
                  className="transition-all duration-500"
                />
              </svg>

              <div className="relative z-10 flex h-[66px] w-[66px] items-center justify-center rounded-full bg-gradient-to-br from-[#0A5560] to-[#06424B] text-white shadow-[0_10px_24px_rgba(6,66,75,0.22)]">
                {allMet ? (
                  <ShieldCheck size={30} strokeWidth={1.7} />
                ) : (
                  <LockKeyhole size={30} strokeWidth={1.7} />
                )}

                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#FFAB0B] text-[#06424B]">
                  <KeyRound size={13} strokeWidth={2.5} />
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF5DC] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
                <span className="text-[9px] font-bold tracking-[1.5px] text-[#795B19]">
                  CREATE YOUR PASSWORD
                </span>
              </div>

              <h1 className="mt-3 text-[27px] font-bold leading-tight tracking-[-1.1px] text-[#06424B] sm:text-[31px]">
                Set a new password
                <span className="text-[#FFAB0B]">.</span>
              </h1>

              <p className="mx-auto mt-2 max-w-[380px] text-[11px] leading-5 text-[#839194] sm:text-[12px]">
                Choose a strong password to secure your Skill Next account.
              </p>

              {email && (
                <p className="mx-auto mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#F4F8F7] px-3 py-1 text-[11px] font-semibold text-[#06424B]">
                  <span className="truncate">{email}</span>
                </p>
              )}
            </div>

            {/* Invalid link notice */}
            {!token && (
              <div
                role="alert"
                className="mt-5 flex gap-3 rounded-xl border border-[#E8D6BA] bg-[#FFF8EC] p-3.5"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-[#94671B]"
                />
                <div>
                  <p className="text-[11px] font-bold text-[#94671B]">
                    This link is incomplete
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-[#94671B]/90">
                    Open the password link from your verification email, or
                    request a new one from sign in.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">

              <div>
                <PasswordField
                  id="new-password"
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  onKeyUp={handleCaps}
                  placeholder="Enter your new password"
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  error={showPasswordError}
                  valid={allMet}
                  disabled={isPasswordFormDisabled}
                />

                {capsOn && (
                  <p className="mt-1.5 text-[10px] font-medium text-[#94671B]">
                    Caps Lock is on.
                  </p>
                )}

                {/* Strength meter, appears once typing starts */}
                <div
                  aria-live="polite"
                  className={`grid transition-all duration-300 ease-out ${password
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="pt-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-1 gap-1">
                          {requirements.map((item, index) => (
                            <div
                              key={item.label}
                              className="h-1 flex-1 rounded-full transition-colors duration-300"
                              style={{
                                backgroundColor:
                                  index < strength ? level.color : "#DCE6E8",
                              }}
                            />
                          ))}
                        </div>

                        <span
                          className="min-w-[52px] text-right text-[10px] font-bold transition-colors"
                          style={{ color: level.color }}
                        >
                          {level.label}
                        </span>
                      </div>

                      {/* Chips hide once every rule is met */}
                      <div
                        className={`grid transition-all duration-300 ease-out ${allMet
                          ? "grid-rows-[0fr] opacity-0"
                          : "grid-rows-[1fr] opacity-100"
                          }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex flex-wrap gap-1.5 pt-2.5">
                            {requirements.map((item) => (
                              <span
                                key={item.label}
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold transition-colors ${item.valid
                                  ? "border-[#BFDCC4] bg-[#EAF4EB] text-[#3F7A49]"
                                  : "border-[#E3ECEC] bg-[#F4F8F7] text-[#7A8E91]"
                                  }`}
                              >
                                {item.valid ? (
                                  <Check size={9} strokeWidth={3.5} />
                                ) : (
                                  <Circle size={5} fill="currentColor" />
                                )}
                                {item.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <PasswordField
                  id="confirm-password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                  onKeyUp={handleCaps}
                  placeholder="Re-enter your new password"
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((v) => !v)}
                  error={showConfirmError}
                  valid={passwordsMatch}
                  disabled={isPasswordFormDisabled}
                />

                {passwordsMatch && !showConfirmError && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-[#3F7A49]">
                    <Check size={12} strokeWidth={3} />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Form-level error */}
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-[#E3A99D] bg-[#FFF8F6] px-3 py-2.5 text-[10px] leading-5 text-[#C2553F]"
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPasswordFormDisabled}
                className="flex min-h-[49px] w-full items-center justify-center gap-3 rounded-xl bg-[#06424B] px-5 text-[12px] font-bold text-white shadow-[0_9px_22px_rgba(6,66,75,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#042E35] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    Saving password
                    <Loader2 size={17} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Set New Password
                    <ArrowUpRight size={17} />
                  </>
                )}
              </button>
            </form>
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

      {/* Success Modal */}
      {success && (
        <div
          className="sp-overlay fixed inset-0 z-50 flex items-center justify-center bg-[#06424B]/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="sp-modal relative w-full max-w-[400px] overflow-hidden rounded-[26px] bg-white px-7 pb-7 pt-9 text-center shadow-[0_30px_80px_rgba(6,66,75,0.35)]">

            <div className="relative mx-auto flex h-[96px] w-[96px] items-center justify-center">
              <span className="sp-ripple absolute h-[80px] w-[80px] rounded-full border-2 border-[#4D9658]/50" />

              <div className="sp-badge relative flex h-[80px] w-[80px] items-center justify-center rounded-full bg-gradient-to-br from-[#58A463] to-[#3F8F52] shadow-[0_14px_28px_rgba(63,143,82,0.35)]">
                <span className="absolute inset-[5px] rounded-full border border-white/30" />
                <svg
                  viewBox="0 0 80 80"
                  className="relative h-[46px] w-[46px]"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    className="sp-tick"
                    pathLength="1"
                    d="M20 41 L34 55 L60 26"
                  />
                </svg>
              </div>
            </div>

            <h2
              id="success-title"
              className="mt-5 text-[22px] font-bold tracking-[-0.6px] text-[#06424B]"
            >
              Password set successfully
            </h2>

            <p className="mx-auto mt-2 max-w-[290px] text-[11px] leading-5 text-[#839194]">
              Your account is ready. Sign in with your new password to get started.
            </p>

            <button
              type="button"
              onClick={goToLogin}
              className="mt-6 flex min-h-[47px] w-full items-center justify-center gap-2 rounded-xl bg-[#06424B] text-[12px] font-bold text-white shadow-[0_9px_22px_rgba(6,66,75,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#042E35]"
            >
              Continue to Sign In
              <ArrowUpRight size={16} />
            </button>

            <p className="mt-3 text-[10px] text-[#879497]" aria-live="polite">
              Redirecting in {countdown}s
            </p>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-[#E3ECEC]">
              <div className="sp-drain h-full bg-[#FFAB0B]" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default SetPassword;