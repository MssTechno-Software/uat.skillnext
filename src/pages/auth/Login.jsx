import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    CircleCheck,
} from "lucide-react";
import LoginVisual, { Logo } from "../../components/auth/LoginVisual";
import { loginUser } from "../../api/auth.api";

import { createAuthSession } from "../../services/authSession";

import { getApiErrorMessage } from "../../utils/apiErrorHandler";

const TEAL = "#06424B";
const YELLOW = "#FFAB0B";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setMessage("");
        setIsSubmitting(true);

        try {
            // Send only email and password to the backend.
            const response = await loginUser({
                email: email.trim(),
                password,
            });

            // Read the actual authentication response.
            const authData = response?.data;
            const accessToken = authData?.accessToken;
            const user = authData?.user;

            const authenticatedRole = String(user?.role || "")
                .trim()
                .toLowerCase();

            // Validate the response before creating a session.
            if (
                response?.success !== true ||
                !accessToken ||
                user?.userId == null ||
                !authenticatedRole
            ) {
                setMessage("Invalid login response. Please try again.");
                return;
            }

            // Store the authenticated session centrally.
            createAuthSession({
                accessToken,
                userId: user.userId,
                role: authenticatedRole,
            });

            // Redirect according to the authenticated role.
            if (authenticatedRole === "student") {
                navigate("/student/dashboard", { replace: true });
            } else if (authenticatedRole === "teacher") {
                navigate("/teacher-dashboard", { replace: true });
            } else {
                setMessage("Your account role is not supported.");
            }

        } catch (error) {
            setMessage(
                getApiErrorMessage(
                    error,
                    "Unable to sign in. Please check your credentials and try again."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNavigation = (page) => {
        setMessage(`${page} page will be connected soon.`);
    };

    const inputClass =
        "w-full h-12 pl-12 pr-4 rounded-xl border border-[#D9E2E3] bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200 hover:border-gray-400 focus:border-[#06424B] focus:ring-4 focus:ring-[#FFAB0B]/30";

    return (
        <main
            className="w-screen overflow-hidden bg-white flex"
            style={{ height: "100dvh" }}
        >
            <LoginVisual />

            {/* RIGHT: login */}
            <section
                className="flex-1 overflow-y-auto lg:border-l lg:border-[#DCE6E8] lg:shadow-[-14px_0_40px_rgba(6,66,75,0.07)]"
                style={{ background: "#EEF3F4" }}
            >
                <div className="relative min-h-full overflow-hidden flex items-center justify-center px-6 py-6 sm:px-10">
                    {/* soft brand shapes behind the form card */}
                    <div
                        className="pointer-events-none absolute -bottom-28 -right-24 w-[300px] h-[300px] rounded-full"
                        style={{ background: "rgba(255,171,11,0.22)" }}
                    />
                    <div
                        className="pointer-events-none absolute -top-24 -right-16 w-[240px] h-[240px] rounded-full"
                        style={{ border: "34px solid rgba(6,66,75,0.07)" }}
                    />

                    {/* white form card */}
                    <div className="relative z-10 w-full max-w-[440px] rounded-3xl bg-white border border-[#E1EAEC] shadow-[0_24px_70px_rgba(6,66,75,0.12)] px-7 py-7 sm:px-9 sm:py-8">
                        {/* Mobile logo */}
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

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

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
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className={`${inputClass} pr-12`}
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
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
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

                            {message && (
                                <div
                                    role="status"
                                    className="flex gap-2 items-start rounded-xl bg-[#FFF5DC] border border-[#FFAB0B]/40 p-3 text-sm text-[#06424B]"
                                >
                                    <CircleCheck size={18} className="shrink-0 mt-0.5" />
                                    <span>{message}</span>
                                </div>
                            )}

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
                            </Link>

                            {" "}and{" "}

                            <Link
                                to="/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="!font-bold !text-[#06424B] underline underline-offset-2 transition-colors hover:!text-[#B87800]"
                            >
                                Privacy Policy
                            </Link>.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Login;