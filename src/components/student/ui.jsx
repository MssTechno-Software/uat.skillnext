
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// ============================================
// COMMON UTILITIES
// ============================================

export const cx = (...parts) => parts.filter(Boolean).join(" ");

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFAB0B]/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none !no-underline";

const variants = {
  primary:
    "bg-[#06424B] !text-white hover:bg-[#0A5963] hover:-translate-y-0.5 shadow-[0_5px_14px_rgba(6,66,75,0.16)]",

  gold:
    "bg-[#FFAB0B] !text-[#06424B] hover:bg-[#FFC13D] hover:-translate-y-0.5 shadow-[0_5px_14px_rgba(255,171,11,0.22)]",

  outline:
    "border border-[#D5E0E2] bg-white !text-[#06424B] hover:border-[#06424B] hover:bg-[#F5F9F9]",

  light:
    "border border-white/20 bg-white/10 !text-white hover:bg-white/20",

  soft:
    "border border-[#DCE9E9] bg-[#E8F0F1] !text-[#06424B] hover:bg-[#DDE9EA]",
};

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

function inner(Icon, IconRight, children) {
  return (
    <>
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
      {IconRight && <IconRight size={16} strokeWidth={2} />}
    </>
  );
}

// ============================================
// LINK BUTTON
// ============================================

export function LinkButton({
  to,
  href,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  ...rest
}) {
  const classes = cx(
    base,
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={classes}
        {...rest}
      >
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

// ============================================
// BUTTON
// ============================================

export function Btn({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(
        base,
        variants[variant],
        sizes[size],
        "hover:-translate-y-0.5 disabled:hover:translate-y-0",
        className
      )}
      {...rest}
    >
      {inner(icon, iconRight, children)}
    </button>
  );
}

// ============================================
// PAGE SHELL
// Common background for all pages
// ============================================

export function PageShell({
  children,
  max = "max-w-[1400px]",
}) {
  return (
    <main className="
      min-h-dvh w-full
      bg-[#EEF3F4]
      px-4 py-5
      sm:px-6 sm:py-7
      lg:px-10 lg:py-8
    ">
      <div className={cx("mx-auto", max)}>
        {children}
      </div>
    </main>
  );
}

// ============================================
// CARD
// ============================================

export function Card({
  children,
  className,
  ...rest
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-[#E0E8E9] bg-white",
        "shadow-[0_3px_14px_rgba(6,66,75,0.045)]",
        "transition-shadow duration-200",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ============================================
// ICON BADGE
// ============================================

const tones = {
  teal: "bg-[#E8F0F1] text-[#06424B]",
  gold: "bg-[#FFF4D9] text-[#986400]",
  solidTeal: "bg-[#06424B] text-[#FFAB0B]",
  solidGold: "bg-[#FFAB0B] text-[#06424B]",
};

export function IconBadge({
  icon: Icon,
  tone = "teal",
  size = "md",
  className,
}) {
  const box =
    size === "lg"
      ? "h-14 w-14 rounded-2xl"
      : size === "sm"
        ? "h-9 w-9 rounded-xl"
        : "h-11 w-11 rounded-xl";

  const iconSize =
    size === "lg" ? 26 : size === "sm" ? 17 : 21;

  return (
    <span
      className={cx(
        "flex shrink-0 items-center justify-center",
        box,
        tones[tone],
        className
      )}
    >
      <Icon
        size={iconSize}
        strokeWidth={1.9}
      />
    </span>
  );
}

// ============================================
// HERO
// ============================================

export function Hero({
  eyebrow,
  title,
  text,
  icon: Icon,
  children,
}) {
  return (
    <section className="
      relative isolate overflow-hidden
      rounded-[26px]
      border border-[#0A5963]
      bg-gradient-to-br
      from-[#06424B] via-[#0A515C] to-[#105F68]
      px-6 py-8
      shadow-[0_12px_30px_rgba(6,66,75,0.13)]
      sm:px-9 sm:py-10
    ">

      {/* Decorative Elements */}
      <div className="
        pointer-events-none absolute
        -right-20 -top-28
        h-[300px] w-[300px]
        rounded-full border-[40px]
        border-white/[0.06]
      " />

      <div className="
        pointer-events-none absolute
        -bottom-24 right-[18%]
        h-[220px] w-[220px]
        rounded-full bg-[#FFAB0B]/15 blur-3xl
      " />

      <div className="
        pointer-events-none absolute
        bottom-0 left-0
        h-1 w-full
        bg-gradient-to-r
        from-[#FFAB0B] via-[#FFC94D] to-transparent
      " />

      <div className="
        relative flex flex-col gap-6
        md:flex-row md:items-center
        md:justify-between
      ">

        <div className="max-w-[720px]">

          {eyebrow && (
            <span className="
              inline-flex items-center gap-2
              rounded-full
              border border-[#FFAB0B]/30
              bg-[#FFAB0B]
              px-3.5 py-1.5
              text-[11px] font-bold
              tracking-[1px]
              text-[#06424B]
            ">
              {Icon && <Icon size={14} />}
              {eyebrow}
            </span>
          )}

          <h2 className="
            mt-4
            text-[28px] font-extrabold
            leading-tight tracking-[-0.6px]
            text-white sm:text-[36px]
          ">
            {title}
          </h2>

          {text && (
            <p className="
              mt-3 max-w-[620px]
              text-[15px] leading-7
              text-white/80
            ">
              {text}
            </p>
          )}

          {children && (
            <div className="mt-6 flex flex-wrap gap-3">
              {children}
            </div>
          )}

        </div>

        {Icon && (
          <div className="
            hidden h-[140px] w-[140px]
            shrink-0 items-center justify-center
            rounded-full border border-white/20
            bg-white/[0.07] lg:flex
          ">
            <div className="
              flex h-[104px] w-[104px]
              items-center justify-center
              rounded-full border-[4px]
              border-[#FFAB0B]
              bg-[#0A5962]
              shadow-[0_8px_24px_rgba(0,0,0,0.12)]
            ">
              <Icon
                size={46}
                className="text-white"
                strokeWidth={1.5}
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

// ============================================
// SECTION HEADING
// ============================================

export function SectionHeading({
  title,
  subtitle,
  right,
}) {
  return (
    <div className="
      mb-5 flex flex-col
      gap-3 sm:flex-row
      sm:items-end sm:justify-between
    ">
      <div>

        <h2 className="
          flex items-center gap-2.5
          text-xl font-bold
          tracking-[-0.3px]
          text-[#06424B]
        ">
          <span className="
            h-5 w-1.5 rounded-full
            bg-[#FFAB0B]
          " />
          {title}
        </h2>

        {subtitle && (
          <p className="
            mt-1.5 pl-4
            text-sm leading-6
            text-[#718589]
          ">
            {subtitle}
          </p>
        )}

      </div>

      {right}
    </div>
  );
}

// ============================================
// NOTE
// ============================================

export function Note({
  icon: Icon,
  children,
  tone = "gold",
  className,
}) {
  const toneClass =
    tone === "teal"
      ? "border-[#D2E2E4] bg-[#E8F0F1] text-[#24535A]"
      : "border-[#F1DCA9] bg-[#FFF8E8] text-[#795A18]";

  return (
    <div
      className={cx(
        "flex items-start gap-3 rounded-xl border p-4",
        "text-[13px] leading-6",
        toneClass,
        className
      )}
    >
      {Icon && (
        <Icon
          size={18}
          className="mt-0.5 shrink-0"
        />
      )}

      <div>{children}</div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  tone = "teal",
}) {
  return (
    <div className="
      mx-auto flex min-h-[280px]
      max-w-[500px] flex-col
      items-center justify-center
      rounded-2xl
      px-5 py-8 text-center
    ">

      <IconBadge
        icon={Icon}
        tone={tone}
        size="lg"
      />

      <h3 className="
        mt-5 text-xl font-bold
        tracking-[-0.3px]
        text-[#06424B]
      ">
        {title}
      </h3>

      <p className="
        mt-2 max-w-[420px]
        text-sm leading-6
        text-[#718589]
      ">
        {text}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}

    </div>
  );
}

// ============================================
// PROGRESS BAR
// ============================================

export function ProgressBar({
  value = 0,
  className,
}) {
  const safeValue = Math.min(
    100,
    Math.max(0, Number(value) || 0)
  );

  return (
    <div
      className={cx(
        "h-2.5 overflow-hidden rounded-full",
        "bg-[#E5ECEE]",
        className
      )}
    >
      <div
        className="
          h-full rounded-full
          bg-gradient-to-r
          from-[#06424B] to-[#0D7780]
          transition-all duration-500
        "
        style={{
          width: `${safeValue}%`,
        }}
      />
    </div>
  );
}

// ============================================
// BACK LINK
// ============================================

export function BackLink({
  to,
  children,
}) {
  return (
    <Link
      to={to}
      className="
        mb-5 inline-flex items-center gap-2
        rounded-xl border border-[#E0E8E9]
        bg-white px-4 py-2.5
        text-[13px] font-semibold
        !text-[#06424B] !no-underline
        shadow-[0_2px_8px_rgba(6,66,75,0.04)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-[#06424B]
        hover:shadow-[0_4px_12px_rgba(6,66,75,0.08)]
      "
    >
      <ArrowLeft size={15} />
      {children}
    </Link>
  );
}
