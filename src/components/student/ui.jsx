import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


export const cx = (...parts) => parts.filter(Boolean).join(" ");

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition duration-200 !no-underline focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFAB0B]/40";

const variants = {
  primary:
    "bg-[#06424B] !text-white hover:bg-[#0B5C68] hover:-translate-y-0.5 shadow-[0_8px_18px_rgba(6,66,75,0.22)]",
  gold:
    "bg-[#FFAB0B] !text-[#06424B] hover:bg-[#FFBE3D] hover:-translate-y-0.5 shadow-[0_8px_18px_rgba(255,171,11,0.35)]",
  outline:
    "border-2 border-[#CFE2E0] bg-white !text-[#06424B] hover:border-[#06424B] hover:bg-[#F0F8F7]",
  light:
    "bg-white/15 !text-white border border-white/30 hover:bg-white/25",
  soft:
    "bg-[#E3F3F1] !text-[#06424B] hover:bg-[#D2ECE8]",
};

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

function inner(Icon, IconRight, children) {
  return (
    <>
      {Icon && <Icon size={16} />}
      {children}
      {IconRight && <IconRight size={16} />}
    </>
  );
}

export function LinkButton({ to, href, variant = "primary", size = "md", icon, iconRight, className, children, ...rest }) {
  const classes = cx(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes} {...rest}>
        {inner(icon, iconRight, children)}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} {...rest}>
      {inner(icon, iconRight, children)}
    </Link>
  );
}

export function Btn({ variant = "primary", size = "md", icon, iconRight, className, children, type = "button", ...rest }) {
  return (
    <button
      type={type}
      className={cx(base, variants[variant], sizes[size], "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0", className)}
      {...rest}
    >
      {inner(icon, iconRight, children)}
    </button>
  );
}

export function PageShell({ children, max = "max-w-[1400px]" }) {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#FFF9EA] via-[#F3FAF9] to-[#EEF7F6] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
      <div className={cx("mx-auto", max)}>{children}</div>
    </main>
  );
}

export function Card({ children, className, ...rest }) {
  return (
    <div
      className={cx("rounded-2xl border border-[#D9E8E6] bg-white shadow-[0_2px_10px_rgba(6,66,75,0.05)]", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

const tones = {
  teal: "bg-[#E1F2F0] text-[#06424B]",
  gold: "bg-[#FFEFC2] text-[#8A5700]",
  solidTeal: "bg-[#06424B] text-[#FFAB0B]",
  solidGold: "bg-[#FFAB0B] text-[#06424B]",
};

export function IconBadge({ icon: Icon, tone = "teal", size = "md", className }) {
  const box = size === "lg" ? "h-14 w-14 rounded-2xl" : size === "sm" ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-xl";
  const iconSize = size === "lg" ? 26 : size === "sm" ? 17 : 21;
  return (
    <span className={cx("flex shrink-0 items-center justify-center", box, tones[tone], className)}>
      <Icon size={iconSize} strokeWidth={1.9} />
    </span>
  );
}

export function Hero({ eyebrow, title, text, icon: Icon, children }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06424B] via-[#0A515C] to-[#0E6B73] px-6 py-8 shadow-[0_18px_40px_rgba(6,66,75,0.20)] sm:px-9 sm:py-10">
      <div className="pointer-events-none absolute -right-20 -top-28 h-[300px] w-[300px] rounded-full border-[40px] border-white/[0.07]" />
      <div className="pointer-events-none absolute -bottom-24 right-[18%] h-[220px] w-[220px] rounded-full bg-[#FFAB0B]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#FFAB0B] via-[#FFC94D] to-transparent" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[720px]">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FFAB0B] px-3.5 py-1.5 text-[11px] font-bold tracking-[1px] text-[#06424B]">
              {Icon && <Icon size={14} />} {eyebrow}
            </span>
          )}
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-[-0.5px] text-white sm:text-[36px]">{title}</h2>
          {text && <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-white/85">{text}</p>}
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </div>
        {Icon && (
          <div className="hidden h-[140px] w-[140px] shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] lg:flex">
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full border-[5px] border-[#FFAB0B] bg-[#0A5962]">
              <Icon size={46} className="text-white" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
export function SectionHeading({ title, subtitle, right }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-[#06424B]">
          <span className="h-5 w-1.5 rounded-full bg-[#FFAB0B]" />
          {title}
        </h2>
        {subtitle && <p className="mt-1 pl-3.5 text-sm text-[#5A7478]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Note({ icon: Icon, children, tone = "gold", className }) {
  const toneClass =
    tone === "teal"
      ? "border-[#BFDCD8] bg-[#EAF6F4] text-[#1B5159]"
      : "border-[#F3D78B] bg-[#FFF7DF] text-[#7A5410]";
  return (
    <div className={cx("flex items-start gap-3 rounded-xl border p-4 text-[13px] leading-6", toneClass, className)}>
      {Icon && <Icon size={18} className="mt-0.5 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action, tone = "teal" }) {
  return (
    <div className="mx-auto flex min-h-[280px] max-w-[500px] flex-col items-center justify-center px-4 py-8 text-center">
      <IconBadge icon={Icon} tone={tone} size="lg" />
      <h3 className="mt-5 text-xl font-bold text-[#06424B]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5A7478]">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value = 0, className }) {
  return (
    <div className={cx("h-2.5 overflow-hidden rounded-full bg-[#E3EEEC]", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#FFAB0B] to-[#FFC94D] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mb-5 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold !text-[#06424B] !no-underline shadow-sm ring-1 ring-[#D9E8E6] transition hover:ring-[#06424B]"
    >
      <ArrowLeft size={15} /> {children}
    </Link>
  );
}
