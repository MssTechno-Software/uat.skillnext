import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    CircleAlert,
    X,
} from "lucide-react";
import LoginVisual, { Logo } from "../../components/auth/LoginVisual";
import { loginUser } from "../../api/auth.api";

import { createAuthSession } from "../../services/authSession";

import { getApiErrorMessage } from "../../utils/apiErrorHandler";

const TEAL = "#06424B";
const YELLOW = "#FFAB0B";

// Defines the minimum loader visibility duration to prevent brief flashes.
const MIN_LOADER_MS = 600;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Validation and Utility Functions ---------- */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Validates individual form fields before submission.
const validateField = (name, value) => {
    const v = value.trim();

    if (name === "email") {
        if (!v) return "Email address is required.";
        if (!EMAIL_REGEX.test(v)) return "Please enter a valid email address.";
    }

    if (name === "password") {
        if (!value) return "Password is required.";
    }

    return "";
};

// Uses the backend response as the source of truth; handles only network failures on the frontend.
const extractBackendError = (error) => {
    const res = error?.response;

    if (!res) {
        return {
            title: "Connection problem",
            message:
                "Unable to reach the server. Please check your internet connection and try again.",
            fieldErrors: {},
        };
    }

    const data = res.data;

    const message =
        (typeof data === "string" ? data : null) ||
        data?.message ||
        data?.error ||
        data?.detail ||
        getApiErrorMessage(
            error,
            "Unable to sign in. Please check your credentials and try again."
        );

    // Extracts optional field-level validation errors from the backend response.
    const fieldErrors = {};
    if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
        ["email", "password"].forEach((key) => {
            const val = data.errors[key];
            if (val) fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
        });
    }

    return {
        title: data?.title || "Sign in failed",
        message,
        fieldErrors,
    };
};

/* ---------- Loading Overlay ---------- */

function LoaderOverlay({ open, text = "Signing you in..." }) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            {/* Applies the loading backdrop and prevents interaction with the page. */}
            <div className="absolute inset-0 bg-[#06424B]/25 backdrop-blur-[6px]" />
            {/* Groups the loader indicator and its status message. */}
            <div className="relative flex flex-col items-center gap-3">
                {/* Displays the existing animated loading indicator. */}
                <div className="relative h-16 w-16 animate-[loaderIn_.18s_ease-out]">
                    <div
                        className="absolute inset-0 rounded-full border-[5px]"
                        style={{ borderColor: "rgba(255,255,255,0.55)" }}
                    />
                    <div
                        className="absolute inset-0 animate-spin rounded-full border-[5px] border-transparent"
                        style={{ borderTopColor: YELLOW, borderRightColor: TEAL }}
                    />
                </div>

                {/* Displays the loading status message using the brand color palette. */}
                <p className="text-sm font-semibold tracking-wide">
                    <span className="text-[#FFAB0B]">Loading</span>
                    <span className="text-[#06424B]">, please wait...</span>
                </p>
            </div>

            <span className="sr-only">{text}</span>

            <style>{`
                @keyframes loaderIn {
                    from { opacity: 0; transform: scale(.9); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

/* ---------- Authentication Error Dialog ---------- */

function AlertDialog({ open, title, message, onClose }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);
        // Moves keyboard focus to the dialog when it opens.
        dialogRef.current?.focus();

        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="presentation"
        >
            {/* Provides the dialog backdrop and outside-click handling. */}
            <div
                className="absolute inset-0 bg-[#06424B]/30 backdrop-blur-[3px]"
                onClick={onClose}
            />

            {/* Renders the authentication error dialog. */}
            <div
                ref={dialogRef}
                tabIndex={-1}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="login-alert-title"
                aria-describedby="login-alert-message"
                className="relative flex w-full max-w-[320px] flex-col items-center rounded-[26px] bg-white px-6 py-6 text-center shadow-[0_16px_45px_rgba(6,66,75,0.16)] outline-none animate-[fadeIn_.18s_ease-out]"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#06424B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFAB0B]"
                >
                    <X size={20} />
                </button>

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                    <CircleAlert size={32} className="text-red-500" />
                </div>

                <h3
                    id="login-alert-title"
                    className="text-xl font-bold"
                    style={{ color: TEAL }}
                >
                    {title}
                </h3>

                <p
                    id="login-alert-message"
                    className="mt-2 max-w-[300px] text-[15px] leading-6 text-gray-500"
                >
                    {message}
                </p>

                {/* Closes the dialog without submitting another authentication request. */}
                <button
                    type="button"
                    onClick={onClose}
                    className="mt-7 inline-flex h-11 min-w-[160px] items-center justify-center rounded-xl px-6 text-sm font-semibold text-[#06424B] shadow-sm transition-all hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06424B] focus-visible:ring-offset-2"
                    style={{ background: YELLOW }}
                >
                    Try again
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px) scale(.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}

/* ---------- Login Component ---------- */

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [dialog, setDialog] = useState({ open: false, title: "", message: "" });
    const navigate = useNavigate();

    const showDialog = (title, message) =>
        setDialog({ open: true, title, message });

    const closeDialog = () => {
        setDialog((d) => ({ ...d, open: false }));
        // Restores focus to the password field to support a quick retry.
        setTimeout(() => document.getElementById("password")?.focus(), 0);
    };

    const handleChange = (name, value) => {
        if (name === "email") setEmail(value);
        if (name === "password") setPassword(value);

        // Clears the field error when the user updates its value.
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleBlur = (name, value) => {
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const validateForm = () => {
        const nextErrors = {
            email: validateField("email", email),
            password: validateField("password", password),
        };
        setErrors(nextErrors);

        // Moves focus to the first field that fails validation.
        if (nextErrors.email) document.getElementById("email")?.focus();
        else if (nextErrors.password) document.getElementById("password")?.focus();

        return !nextErrors.email && !nextErrors.password;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        if (!validateForm()) return;

        const startedAt = Date.now();
        setIsSubmitting(true);

        // Maintains the minimum loader visibility duration.
        const waitForMinLoader = async () => {
            const elapsed = Date.now() - startedAt;
            if (elapsed < MIN_LOADER_MS) await sleep(MIN_LOADER_MS - elapsed);
        };

        // Ends the loading state and displays the error dialog.
        const failWith = async (title, message) => {
            await waitForMinLoader();
            setIsSubmitting(false);
            showDialog(title, message);
        };

        try {
            // Sends the email address and password to the authentication endpoint.
            const response = await loginUser({
                email: email.trim(),
                password,
            });

            // Extracts the authentication data returned by the backend.
            const authData = response?.data;
            const accessToken = authData?.accessToken;
            const user = authData?.user;

            const authenticatedRole = String(user?.role || "")
                .trim()
                .toLowerCase();

            // Verifies the authentication response before creating a session.
            if (
                response?.success !== true ||
                !accessToken ||
                user?.userId == null ||
                !authenticatedRole
            ) {
                await failWith(
                    "Sign in failed",
                    response?.message || "Invalid login response. Please try again."
                );
                return;
            }

            // Allows only supported user roles before creating a session.
            if (authenticatedRole !== "student" && authenticatedRole !== "teacher") {
                await failWith("Access denied", "Your account role is not supported.");
                return;
            }

            // Persists the authenticated session through the shared session service.
            createAuthSession({
                accessToken,
                userId: user.userId,
                role: authenticatedRole,
            });

            await waitForMinLoader();

            // Keeps the loading overlay visible until navigation completes.
            navigate(`/${authenticatedRole}/dashboard`, { replace: true });
        } catch (error) {
            const { title, message, fieldErrors } = extractBackendError(error);

            // Applies any field-level validation errors returned by the backend.
            if (Object.keys(fieldErrors).length) {
                setErrors((prev) => ({ ...prev, ...fieldErrors }));
            }

            // Displays the backend authentication error in the dialog.
            await failWith(title, message);
        }
    };

    const inputClass = (hasError) =>
        `w-full h-12 pl-12 pr-4 rounded-xl border bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${hasError
            ? "border-red-400 hover:border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-200"
            : "border-[#D9E2E3] hover:border-gray-400 focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/30"
        }`;

    return (
        <main
            className="w-screen overflow-hidden bg-white flex"
            style={{ height: "100dvh" }}
        >
            <LoginVisual />

            {/* Renders the login panel. */}
            <section
                className="flex-1 overflow-y-auto lg:border-l lg:border-[#DCE6E8] lg:shadow-[-14px_0_40px_rgba(6,66,75,0.07)]"
                style={{ background: "#EEF3F4" }}
            >
                <div className="relative min-h-full overflow-hidden flex items-center justify-center px-6 py-6 sm:px-10">
                    {/* Adds subtle decorative brand elements behind the form card. */}
                    <div
                        className="pointer-events-none absolute -bottom-28 -right-24 w-[300px] h-[300px] rounded-full"
                        style={{ background: "rgba(255,171,11,0.22)" }}
                    />
                    <div
                        className="pointer-events-none absolute -top-24 -right-16 w-[240px] h-[240px] rounded-full"
                        style={{ border: "34px solid rgba(6,66,75,0.07)" }}
                    />

                    {/* Contains the login form and related actions. */}
                    <div className="relative z-10 w-full max-w-[440px] rounded-3xl bg-white border border-[#E1EAEC] shadow-[0_24px_70px_rgba(6,66,75,0.12)] px-7 py-7 sm:px-9 sm:py-8">
                        {/* Displays the logo on smaller screens. */}
                        <div className="lg:hidden mb-4 flex justify-center">
                            <Logo style={{ width: 210 }} />
                        </div>

                        <div className="mb-6">
                            <div
                                className="h-1.5 w-12 rounded-full mb-4"
                                style={{ background: YELLOW }}
                            />
                            <h2
                                className="text-3xl font-bold tracking-tight"
                                style={{ color: TEAL }}
                            >
                                Welcome back
                            </h2>
                            <p className="text-gray-500 text-sm mt-1.5">
                                Sign in to continue your learning journey.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {/* Email address input and validation feedback. */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                                >
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email ? "text-red-400" : "text-gray-400"
                                            }`}
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        disabled={isSubmitting}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        onBlur={(e) => handleBlur("email", e.target.value)}
                                        placeholder="Enter your email address"
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                        className={inputClass(!!errors.email)}
                                    />
                                </div>
                                {errors.email && (
                                    <p
                                        id="email-error"
                                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                                    >
                                        <CircleAlert size={14} className="shrink-0" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password input and visibility control. */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-semibold text-[#06424B] transition-colors hover:text-[#B87800]"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.password ? "text-red-400" : "text-gray-400"
                                            }`}
                                    />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        disabled={isSubmitting}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        onBlur={(e) => handleBlur("password", e.target.value)}
                                        placeholder="Enter your password"
                                        aria-invalid={!!errors.password}
                                        aria-describedby={
                                            errors.password ? "password-error" : undefined
                                        }
                                        className={`${inputClass(!!errors.password)} pr-12`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#06424B]"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p
                                        id="password-error"
                                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                                    >
                                        <CircleAlert size={14} className="shrink-0" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        disabled={isSubmitting}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 accent-[#06424B] cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <ShieldCheck size={14} />
                                    Protected access
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group w-full h-12 rounded-xl text-[#06424B] font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-[#FFAB0B]/30 hover:brightness-95 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ background: YELLOW }}
                            >
                                {isSubmitting ? "Signing in..." : "Sign in"}

                                {!isSubmitting && (
                                    <ArrowRight
                                        size={18}
                                        className="transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                )}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-gray-500">
                            New to Skill Next?
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="ml-1.5 font-bold text-[#06424B] hover:text-[#B87800] transition-colors"
                            >
                                Create an account
                            </button>
                        </p>

                        <p className="mt-5 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400 leading-5">
                            By signing in, you agree to our{" "}
                            <Link
                                to="/terms-and-conditions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="!font-bold !text-[#06424B] underline underline-offset-2 transition-colors hover:!text-[#B87800]"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                to="/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="!font-bold !text-[#06424B] underline underline-offset-2 transition-colors hover:!text-[#B87800]"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </section>

            <LoaderOverlay open={isSubmitting} />

            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                onClose={closeDialog}
            />
        </main>
    );
}

export default Login;