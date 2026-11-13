import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import { getApiErrorMessage } from "../../utils/apiErrorHandler";
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Building2,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    ChevronDown,
    GraduationCap,
    Globe2,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Search,
    ShieldCheck,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";

import {
    getCountries,
    getStatesOfCountry,
    getCitiesOfState,
} from "@countrystatecity/countries-browser";

const ALLOWED_COUNTRIES = ["US", "CA"];
const VERIFY_ROUTE = "/email-sent";
const REDIRECT_SECONDS = 4;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' .-]*$/;
const NANP_PATTERN = /^[2-9]\d{2}[2-9]\d{6}$/;

const FIELD_LABELS = {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    country: "Country",
    state: "State / Province",
    city: "City",
    institution: "Institution",
    educationLevel: "Education level",
    course: "Course",
    technology: "Technology",
    department: "Department",
    subject: "Subject",
    designation: "Designation",
    terms: "Terms",
};

const EDUCATION_LEVELS = [
    "School",
    "Diploma",
    "Undergraduate",
    "Postgraduate",
    "Doctorate",
    "Other",
].map((value) => ({ value, label: value }));

const ACADEMIC_YEARS = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
    "Completed",
].map((value) => ({ value, label: value }));

const TECHNOLOGIES = ["A", "B", "C", "D"].map((value) => ({
    value,
    label: value,
}));

const styles = `
@keyframes sg-pop {
  0% { transform: scale(.6); opacity: 0; }
  60% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes sg-ripple {
  0% { transform: scale(.8); opacity: .5; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes sg-draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
@keyframes sg-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes sg-drain {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
@keyframes sg-rise {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.sg-overlay { animation: sg-fade .25s ease-out both; }
.sg-modal { animation: sg-pop .45s cubic-bezier(.2,.8,.3,1) both; }
.sg-badge { animation: sg-pop .6s cubic-bezier(.2,.8,.3,1) .15s both; }
.sg-ripple { animation: sg-ripple 1.6s ease-out .3s both; }
.sg-tick {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: sg-draw .5s ease-out .6s forwards;
}
.sg-drain {
  transform-origin: left;
  animation: sg-drain ${REDIRECT_SECONDS}s linear forwards;
}
.sg-rise { animation: sg-rise .2s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .sg-overlay, .sg-modal, .sg-badge, .sg-ripple, .sg-rise { animation: none; }
  .sg-tick { animation: none; stroke-dashoffset: 0; }
}
`;

const labelClass = "mb-2 block text-[12px] font-semibold text-[#344B4F]";

const formatPhone = (raw) => {
    let digits = raw.replace(/\D/g, "");
    if (digits.length > 10 && digits.startsWith("1")) digits = digits.slice(1);
    digits = digits.slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const nameError = (value, label) => {
    const text = value.trim();
    if (!text) return `Enter your ${label}.`;
    if (text.length < 2) return `Your ${label} must be at least 2 characters.`;
    if (!NAME_PATTERN.test(text))
        return `Your ${label} can only include letters, spaces, hyphens and apostrophes.`;
    return "";
};

const requiredText = (value, message) => {
    const text = value.trim();
    if (!text) return message;
    if (text.length < 2) return "Enter at least 2 characters.";
    return "";
};

/* =========================================
   SMALL SHARED PIECES
========================================= */

function FieldError({ id, message }) {
    return (
        <p
            id={`${id}-error`}
            role="alert"
            className="sg-rise mt-1.5 flex items-start gap-1.5 text-[10px] font-medium text-[#C2553F]"
        >
            <AlertCircle size={12} className="mt-px shrink-0" />
            {message}
        </p>
    );
}

function RequiredMark() {
    return <span className="text-[#C2553F]">*</span>;
}

function SectionHeader({ icon: Icon, title, subtitle, number }) {
    return (
        <div className="mb-[19px] flex items-center gap-3 border-b border-[#E8EEEE] pb-[15px] max-[640px]:gap-[9px]">
            <div className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[10px] bg-[#EEF3F4] text-[#06424B]">
                <Icon size={19} />
            </div>

            <div>
                <h3 className="text-[13px] font-[750] text-[#06424B]">{title}</h3>
                <p className="mt-1 text-[11px] text-[#929FA1] max-[640px]:text-[10px]">
                    {subtitle}
                </p>
            </div>

            <span className="ml-auto text-[11px] font-extrabold tracking-[1.5px] text-[#C38A13]">
                {number}
            </span>
        </div>
    );
}

function TextField({
    id,
    label,
    icon: Icon,
    value,
    onChange,
    onBlur,
    placeholder,
    type = "text",
    autoComplete,
    inputMode,
    error,
    hint,
    required = true,
}) {
    return (
        <div>
            <label htmlFor={id} className={labelClass}>
                {label} {required && <RequiredMark />}
            </label>

            <div
                className={`flex h-[53px] w-full items-center gap-3 rounded-[10px] border px-[15px] transition-[border-color,box-shadow,background] duration-200 [&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-200 ${error
                    ? "border-[#E3A99D] bg-[#FFF8F6] text-[#C2553F] focus-within:border-[#C2553F] focus-within:shadow-[0_0_0_4px_rgba(194,85,63,.12)]"
                    : "border-[#D9E2E3] bg-white text-[#899B9D] focus-within:border-[#06424B] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(255,171,11,.25)] [&:focus-within>svg]:text-[#06424B]"
                    }`}
            >
                <Icon size={18} />

                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className="m-0 block h-full w-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[13px] text-[#33464A] !border-0 !outline-none !shadow-none placeholder:text-[#A5B0B2] focus:!border-0 focus:bg-transparent focus:!shadow-none focus:!outline-none"
                />
            </div>

            {error ? (
                <FieldError id={id} message={error} />
            ) : (
                hint && <p className="mt-1.5 text-[10px] text-[#98A3A4]">{hint}</p>
            )}
        </div>
    );
}

function ModalShell({ children, labelledBy, onClose }) {
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

    useEffect(() => {
        if (!onClose) return undefined;
        const handleKey = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div
            className="sg-overlay fixed inset-0 z-[300] flex items-center justify-center bg-[#06424B]/45 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose?.();
            }}
        >
            {children}
        </div>
    );
}

/* =========================================
   CUSTOM SEARCHABLE DROPDOWN
========================================= */

function SearchableDropdown({
    id,
    value,
    options = [],
    onChange,
    onBlur,
    placeholder = "Select an option",
    searchPlaceholder = "Search...",
    icon: Icon = Globe2,
    loading = false,
    disabled = false,
    allowCustom = false,
    error = "",
    emptyMessage = "No matching results found",
    maxVisibleOptions = 100,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const rootRef = useRef(null);
    const menuRef = useRef(null);
    const wasOpen = useRef(false);

    const selectedOption = options.find(
        (option) => String(option.value) === String(value)
    );

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(search.trim().toLowerCase())
    );

    const visibleOptions = filteredOptions.slice(0, maxVisibleOptions);

    // Report "touched" when the menu closes
    useEffect(() => {
        if (wasOpen.current && !open) onBlur?.();
        wasOpen.current = open;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        menuRef.current?.animate?.(
            [
                { opacity: 0, transform: "translateY(-5px)" },
                { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 160, easing: "ease-out" }
        );

        const handleOutsideClick = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
                setSearch("");
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    const selectOption = (option) => {
        onChange(option.value);
        setOpen(false);
        setSearch("");
    };

    const selectCustomValue = () => {
        if (!allowCustom || !search.trim()) return;

        onChange(search.trim());
        setOpen(false);
        setSearch("");
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();

            if (filteredOptions.length > 0) {
                selectOption(filteredOptions[0]);
            } else if (allowCustom) {
                selectCustomValue();
            }
        }
    };

    const showError = Boolean(error) && !open;

    return (
        <div className={`relative z-auto w-full ${open ? "z-[100]" : ""}`} ref={rootRef}>
            <button
                id={id}
                type="button"
                disabled={disabled || loading}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                onClick={() => {
                    setOpen((previous) => !previous);
                    setSearch("");
                }}
                className={`flex h-[53px] w-full items-center gap-3 rounded-[10px] border px-[15px] text-left outline-none shadow-none transition-[border-color,box-shadow,background] duration-200 enabled:hover:border-[#A8BCBD] disabled:cursor-not-allowed disabled:bg-[#F1F4F4] disabled:text-[#A3ADAE] focus-visible:!border-[#06424B] focus-visible:!shadow-[0_0_0_4px_rgba(255,171,11,.25)] ${showError
                    ? "border-[#E3A99D] bg-[#FFF8F6] text-[#C2553F] enabled:hover:!border-[#C2553F]"
                    : "border-[#D9E2E3] bg-white text-[#899B9D] enabled:hover:bg-[#FCFEFE]"
                    } ${open ? "!border-[#06424B] !bg-white !shadow-[0_0_0_4px_rgba(255,171,11,.25)]" : ""}`}
            >
                <Icon
                    size={18}
                    className={`shrink-0 transition-colors duration-200 ${open ? "text-[#06424B]" : showError ? "text-[#C2553F]" : "text-[#899B9D]"
                        }`}
                />

                <span
                    className={`block min-w-0 flex-1 truncate whitespace-nowrap text-[13px] text-[#A5B0B2] ${selectedOption || (allowCustom && value)
                        ? "font-medium text-[#33464A]"
                        : ""
                        }`}
                >
                    {loading
                        ? "Loading..."
                        : selectedOption?.label || (allowCustom && value ? value : placeholder)}
                </span>

                {value && !disabled && !loading && (
                    <span
                        role="button"
                        aria-label="Clear selection"
                        tabIndex={0}
                        className="flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full text-[#8A9897] transition-all duration-200 hover:bg-[#EEF3F4] hover:text-[#06424B]"
                        onClick={(event) => {
                            event.stopPropagation();
                            onChange("");
                            setSearch("");
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                onChange("");
                                setSearch("");
                            }
                        }}
                    >
                        <X size={14} />
                    </span>
                )}

                <ChevronDown
                    size={17}
                    className={`shrink-0 transition-[transform,color] duration-200 ${open ? "rotate-180 text-[#06424B]" : "text-[#889899]"
                        }`}
                />
            </button>

            {open && (
                <div
                    ref={menuRef}
                    className="absolute left-0 top-[calc(100%+8px)] z-[200] w-full min-w-[220px] rounded-[14px] border border-[#E1E9E6] bg-white p-[9px] shadow-[0_18px_45px_rgba(6,66,75,.14),0_4px_12px_rgba(6,66,75,.05)] max-[640px]:min-w-0"
                >
                    <div className="flex h-[43px] items-center gap-[10px] rounded-[9px] border border-[#E3EAE5] bg-[#F7FAF7] px-3 text-[#859593] transition-[border-color,box-shadow] duration-200 focus-within:border-[#06424B] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(255,171,11,.20)]">
                        <Search size={17} />

                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder={searchPlaceholder}
                            className="h-full w-full min-w-0 border-0 bg-transparent text-[12px] text-[#33464A] !border-0 !outline-none !shadow-none placeholder:text-[#9BA8A5] focus:!border-0 focus:bg-transparent focus:!shadow-none focus:!outline-none"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="flex items-center justify-center text-[#8A9897]"
                                aria-label="Clear search"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <div className="px-[9px] pb-[7px] pt-3 text-[9px] font-extrabold tracking-[1.2px] text-[#9AA7A1]">
                        {filteredOptions.length}{" "}
                        {filteredOptions.length === 1 ? "RESULT" : "RESULTS"}
                    </div>

                    <div
                        className="max-h-[225px] overflow-y-auto overscroll-contain p-[3px] [scrollbar-width:thin] [scrollbar-color:#D7E1DC_transparent] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[#D7E1DC] [&::-webkit-scrollbar-track]:bg-transparent"
                        role="listbox"
                    >
                        {visibleOptions.map((option, index) => {
                            const isSelected = String(value) === String(option.value);

                            return (
                                <button
                                    key={option.key ?? `${option.value}-${index}`}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => selectOption(option)}
                                    className={`flex min-h-[39px] w-full items-center justify-between rounded-lg border-0 bg-transparent px-[10px] py-2 text-left text-[12px] text-[#536360] transition-[background,color] duration-150 hover:bg-[#F1F6F2] hover:text-[#06424B] ${isSelected ? "bg-[#EEF4EF] font-bold text-[#06424B]" : ""
                                        }`}
                                >
                                    <span className="flex min-w-0 items-center gap-[9px]">
                                        {option.emoji && (
                                            <span className="w-[22px] shrink-0 text-[16px]">
                                                {option.emoji}
                                            </span>
                                        )}
                                        {option.label}
                                    </span>

                                    {isSelected && (
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#06424B] text-white">
                                            <Check size={13} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {allowCustom &&
                            search.trim() &&
                            !options.some(
                                (option) =>
                                    option.label.toLowerCase() === search.trim().toLowerCase()
                            ) && (
                                <button
                                    type="button"
                                    onClick={selectCustomValue}
                                    className="mt-[5px] flex w-full items-center gap-2 rounded-lg border-0 bg-[#FFF7E7] p-[11px] text-left text-[11px] font-bold text-[#795B19] hover:bg-[#FFF0CD]"
                                >
                                    <MapPin size={15} />
                                    Use "{search.trim()}"
                                </button>
                            )}

                        {filteredOptions.length === 0 && !allowCustom && (
                            <div className="px-3 py-[22px] text-center text-[11px] text-[#8D9A95]">
                                {emptyMessage}
                            </div>
                        )}

                        {filteredOptions.length > visibleOptions.length && (
                            <p className="p-2 text-center text-[10px] text-[#8D9A95]">
                                Showing {visibleOptions.length} of {filteredOptions.length}. Type
                                more to narrow your search.
                            </p>
                        )}
                    </div>

                    <div className="mt-[7px] flex items-center gap-[7px] border-t border-[#EDF1EC] px-2 pb-0 pt-[10px] text-[9px] text-[#9AA6A0]">
                        <Globe2 size={12} />
                        Search and select an option
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================================
   MAIN SIGNUP PAGE
========================================= */

function Signup() {
    const navigate = useNavigate();

    const [role, setRole] = useState("student");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [city, setCity] = useState("");

    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [locationError, setLocationError] = useState("");

    const [institution, setInstitution] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [course, setCourse] = useState("");
    const [studyYear, setStudyYear] = useState("");
    const [technology, setTechnology] = useState("");

    const [department, setDepartment] = useState("");
    const [subject, setSubject] = useState("");
    const [designation, setDesignation] = useState("");

    const [agreed, setAgreed] = useState(false);

    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
    const [leaveTarget, setLeaveTarget] = useState("");

    const isStudent = role === "student";

    /* =====================================
       LOAD ONLY USA AND CANADA
    ====================================== */

    const loadCountries = async () => {
        try {
            setLoadingCountries(true);
            setLocationError("");

            const result = await getCountries();

            const countryList = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : [];

            const orderedCountries = countryList
                .filter((country) =>
                    ALLOWED_COUNTRIES.includes(String(country.iso2).toUpperCase())
                )
                .sort(
                    (a, b) =>
                        ALLOWED_COUNTRIES.indexOf(a.iso2.toUpperCase()) -
                        ALLOWED_COUNTRIES.indexOf(b.iso2.toUpperCase())
                );

            setCountries(orderedCountries);

            if (orderedCountries.length !== 2) {
                setLocationError(
                    "Unable to load USA and Canada correctly. Please retry."
                );
            }
        } catch (error) {
            console.error("Country loading error:", error);
            setLocationError(
                "Unable to load countries. Please check your internet connection."
            );
        } finally {
            setLoadingCountries(false);
        }
    };

    useEffect(() => {
        loadCountries();
    }, []);

    useEffect(() => {
        if (!countryCode) {
            setStates([]);
            return undefined;
        }

        let active = true;

        async function loadStates() {
            try {
                setLoadingStates(true);
                setStates([]);
                setCities([]);

                const result = await getStatesOfCountry(countryCode);

                if (active) {
                    setStates(
                        [...(result || [])].sort((a, b) => a.name.localeCompare(b.name))
                    );
                }
            } catch (error) {
                console.error("State loading error:", error);
                if (active) setStates([]);
            } finally {
                if (active) setLoadingStates(false);
            }
        }

        loadStates();

        return () => {
            active = false;
        };
    }, [countryCode]);

    useEffect(() => {
        if (!countryCode || !stateCode) {
            setCities([]);
            return undefined;
        }

        let active = true;

        async function loadCities() {
            try {
                setLoadingCities(true);
                setCities([]);

                const result = await getCitiesOfState(countryCode, stateCode);

                if (active) {
                    setCities(
                        [...(result || [])].sort((a, b) => a.name.localeCompare(b.name))
                    );
                }
            } catch (error) {
                console.error("City loading error:", error);
                if (active) setCities([]);
            } finally {
                if (active) setLoadingCities(false);
            }
        }

        loadCities();

        return () => {
            active = false;
        };
    }, [countryCode, stateCode]);

    const countryOptions = countries.map((item) => ({
        value: item.iso2,
        label: item.iso2 === "US" ? "USA" : item.name,
        emoji: item.emoji || "",
    }));

    const stateOptions = states
        .filter((item) => item.iso2)
        .map((item) => ({ value: item.iso2, label: item.name }));

    const cityOptions = cities.map((item, index) => ({
        value: item.name,
        label: item.name,
        key: item.id ?? `${item.name}-${index}`,
    }));

    /* =====================================
       VALIDATION
    ====================================== */

    const errors = {};

    const addError = (key, message) => {
        if (message) errors[key] = message;
    };

    addError("firstName", nameError(firstName, "first name"));
    addError("lastName", nameError(lastName, "last name"));

    addError(
        "email",
        !email.trim()
            ? "Enter your email address."
            : !EMAIL_PATTERN.test(email.trim())
                ? "Enter a valid email address, like name@example.com."
                : ""
    );

    const phoneDigits = phone.replace(/\D/g, "");
    addError(
        "phone",
        !phoneDigits
            ? "Enter your phone number."
            : !NANP_PATTERN.test(phoneDigits)
                ? "Enter a valid 10-digit US or Canada phone number."
                : ""
    );

    addError("country", !countryCode ? "Select your country." : "");

    if (countryCode) {
        addError(
            "state",
            loadingStates
                ? "States are still loading. Please wait a moment."
                : stateOptions.length > 0 && !stateCode
                    ? "Select your state or province."
                    : ""
        );
    }

    if (
        countryCode &&
        !loadingStates &&
        (stateCode || stateOptions.length === 0)
    ) {
        addError("city", !city.trim() ? "Select or enter your city." : "");
    }

    addError(
        "institution",
        requiredText(
            institution,
            isStudent
                ? "Enter your school, college or university."
                : "Enter your institution or organization."
        )
    );

    if (isStudent) {
        addError("educationLevel", !educationLevel ? "Select your education level." : "");
        addError("course", requiredText(course, "Enter your course or program."));
        addError("technology", !technology ? "Select a technology option." : "");
    } else {
        addError("department", requiredText(department, "Enter your department."));
        addError("subject", requiredText(subject, "Enter your teaching subject."));
        addError(
            "designation",
            requiredText(designation, "Enter your designation.")
        );
    }

    addError(
        "terms",
        !agreed
            ? "Please accept the Terms of Service and Privacy Policy to continue."
            : ""
    );

    const fieldOrder = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "country",
        "state",
        "city",
        "institution",
        ...(isStudent
            ? ["educationLevel", "course", "technology"]
            : ["department", "subject", "designation"]),
        "terms",
    ];

    const invalidFields = fieldOrder.filter((key) => errors[key]);

    const touch = (key) =>
        setTouched((previous) => (previous[key] ? previous : { ...previous, [key]: true }));

    const showError = (key) => (touched[key] || submitted ? errors[key] || "" : "");

    const focusField = (key) => {
        const element = document.getElementById(key);
        if (!element) return;

        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus({ preventScroll: true });
    };

    /* =====================================
       HANDLERS
    ====================================== */

    const clearFormError = () => setFormError("");

    const handleCountryChange = (value) => {
        setCountryCode(value);
        setStateCode("");
        setCity("");
        setStates([]);
        setCities([]);
        setLocationError("");
        clearFormError();
    };

    const handleStateChange = (value) => {
        setStateCode(value);
        setCity("");
        setCities([]);
        clearFormError();
    };

    const handleRoleChange = (value) => {
        if (value === role) return;

        setRole(value);
        setSubmitted(false);
        clearFormError();

        setInstitution("");
        setEducationLevel("");
        setCourse("");
        setStudyYear("");
        setTechnology("");
        setDepartment("");
        setSubject("");
        setDesignation("");

        setTouched((previous) => ({
            ...previous,
            institution: false,
            educationLevel: false,
            course: false,
            technology: false,
            department: false,
            subject: false,
            designation: false,
        }));
    };

    const isDirty = [
        firstName,
        lastName,
        email,
        phone,
        countryCode,
        city,
        institution,
        educationLevel,
        course,
        studyYear,
        technology,
        department,
        subject,
        designation,
    ].some(Boolean);

    const requestLeave = (path) => {
        if (isDirty && !success) {
            setLeaveTarget(path);
        } else {
            navigate(path);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) return;

        setSubmitted(true);
        clearFormError();

        // Existing frontend validations
        if (invalidFields.length > 0) {
            focusField(invalidFields[0]);
            return;
        }

        const selectedCountry = countries.find(
            (item) => item.iso2 === countryCode
        );

        const selectedState = states.find(
            (item) => item.iso2 === stateCode
        );

        // Actual user-entered registration data
        const registrationDetails = {
            role,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.replace(/\D/g, ""),
            country: selectedCountry?.name || "",
            countryCode,
            state: selectedState?.name || "",
            stateCode,
            city: city.trim(),
            institution: institution.trim(),

            ...(isStudent
                ? {
                    educationLevel,
                    course: course.trim(),
                    studyYear,
                    technology,
                }
                : {
                    department: department.trim(),
                    subject: subject.trim(),
                    designation: designation.trim(),
                }),
        };

        setSubmitting(true);

        try {
            // Actual backend registration request
            await registerUser(registrationDetails);

            // Only on successful API response
            setCountdown(REDIRECT_SECONDS);
            setSuccess(true);

        } catch (error) {
            // Centralized backend/API error message
            setFormError(
                getApiErrorMessage(
                    error,
                    "We couldn't complete your registration. Please try again."
                )
            );

        } finally {
            setSubmitting(false);
        }
    };

    const goToVerification = () =>
        navigate(VERIFY_ROUTE, {
            replace: true,
            state: { email: email.trim(), role, firstName: firstName.trim() },
        });

    useEffect(() => {
        if (!success) return undefined;

        if (countdown === 0) {
            goToVerification();
            return undefined;
        }

        const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success, countdown]);

    const cityDisabled =
        !countryCode ||
        loadingStates ||
        loadingCities ||
        (!stateCode && stateOptions.length > 0);

    return (
        <main className="relative min-h-screen bg-[#EEF3F4] px-4 py-6 sm:px-6 sm:py-10">
            <style>{styles}</style>

            {/* Background decoration */}
            <div className="pointer-events-none fixed -right-28 -top-32 h-[320px] w-[320px] rounded-full border-[28px] border-[#FFAB0B]/[0.12]" />
            <div className="pointer-events-none fixed -right-44 -top-48 h-[460px] w-[460px] rounded-full border border-[#06424B]/10" />
            <div className="pointer-events-none fixed -bottom-48 -left-36 h-[320px] w-[320px] rounded-full border-[34px] border-[#06424B]/[0.06]" />

            <div className="relative z-10 mx-auto w-full max-w-[1000px]">
                {/* Back navigation */}
                <div className="mb-5 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => requestLeave("/login")}
                        className="group flex items-center gap-2 text-xs font-semibold text-[#06424B] transition-colors hover:text-[#A87500]"
                    >
                        <ArrowLeft
                            size={16}
                            className="transition-transform group-hover:-translate-x-1"
                        />
                        Back to login
                    </button>

                    <span className="text-[10px] font-bold tracking-[1.8px] text-[#06424B]/60">
                        ACCOUNT REGISTRATION
                    </span>
                </div>

                {/* Main Card */}
                <section className="relative isolate overflow-visible rounded-[26px] border border-[#DCE6E8] bg-white shadow-[0_24px_70px_rgba(6,66,75,0.12)] sm:rounded-[30px]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-[35px] rounded-t-[26px] border-t-[5px] border-[#FFAB0B] sm:rounded-t-[30px]"
                    />

                    {/* Header */}
                    <header className="border-b border-[#EDF0F0] px-6 pb-7 pt-7 text-center sm:px-12 sm:pb-9 sm:pt-9">
                        <img
                            src="/logo.png"
                            alt="Skill Next Consulting Inc."
                            className="mx-auto h-[82px] w-auto max-w-[230px] object-contain"
                        />

                        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFF5DC] px-3.5 py-2">
                            <Sparkles size={14} className="text-[#9E700C]" />
                            <span className="text-[10px] font-bold tracking-[1.5px] text-[#795B19]">
                                START YOUR JOURNEY
                            </span>
                        </div>

                        <h1 className="mt-4 text-[31px] font-bold tracking-[-1px] text-[#06424B] sm:text-[37px]">
                            Create your account
                            <span className="text-[#FFAB0B]">.</span>
                        </h1>

                        <p className="mt-2.5 text-[13px] text-[#839194] sm:text-sm">
                            Enter your details to join the Skill Next learning community.
                        </p>
                    </header>

                    <div className="px-6 py-8 sm:px-12 sm:py-10 md:px-16 lg:px-20">
                        {/* Role selection */}
                        <div className="mb-9">
                            <p className="mb-4 text-center text-[10px] font-bold tracking-[1.7px] text-[#647B7F]">
                                CHOOSE YOUR ACCOUNT TYPE
                            </p>

                            <div className="mx-auto grid max-w-[530px] grid-cols-2 gap-4">
                                {[
                                    { value: "student", label: "Student", icon: GraduationCap },
                                    { value: "teacher", label: "Teacher", icon: BookOpen },
                                ].map(({ value, label, icon: RoleIcon }) => {
                                    const active = role === value;

                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() => handleRoleChange(value)}
                                            className={`relative !flex !h-[62px] !w-full !appearance-none !items-center gap-[11px] !rounded-[11px] !border !px-[17px] !text-left !text-[13px] !font-[650] !leading-normal transition-all duration-200 max-[640px]:gap-2 max-[640px]:!px-3 ${active
                                                ? "!border-[#06424B] !bg-[#06424B] !text-white shadow-[0_5px_14px_rgba(6,66,75,.15)] hover:!bg-[#042E35]"
                                                : "!border-[#DDE6E7] !bg-[#F7FAFA] !text-[#647477] hover:!border-[#A4BABC] hover:!bg-white"
                                                }`}
                                        >
                                            <RoleIcon size={21} />
                                            <span>{label}</span>

                                            {active && (
                                                <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFAB0B] text-[#06424B]">
                                                    <Check size={13} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <fieldset
                                disabled={submitting}
                                className="m-0 min-w-0 space-y-9 border-0 p-0"
                            >
                                {/* PERSONAL INFORMATION */}
                                <section>
                                    <SectionHeader
                                        icon={UserRound}
                                        title="Personal Information"
                                        subtitle="Provide your basic contact details."
                                        number="01"
                                    />

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <TextField
                                            id="firstName"
                                            label="First Name"
                                            icon={UserRound}
                                            value={firstName}
                                            onChange={(e) => {
                                                setFirstName(e.target.value);
                                                clearFormError();
                                            }}
                                            onBlur={() => touch("firstName")}
                                            placeholder="Enter your first name"
                                            autoComplete="given-name"
                                            error={showError("firstName")}
                                        />

                                        <TextField
                                            id="lastName"
                                            label="Last Name"
                                            icon={UserRound}
                                            value={lastName}
                                            onChange={(e) => {
                                                setLastName(e.target.value);
                                                clearFormError();
                                            }}
                                            onBlur={() => touch("lastName")}
                                            placeholder="Enter your last name"
                                            autoComplete="family-name"
                                            error={showError("lastName")}
                                        />

                                        <TextField
                                            id="email"
                                            label="Email Address"
                                            icon={Mail}
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                clearFormError();
                                            }}
                                            onBlur={() => touch("email")}
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            error={showError("email")}
                                            hint="We'll send your verification link here."
                                        />

                                        <TextField
                                            id="phone"
                                            label="Phone Number"
                                            icon={Phone}
                                            type="tel"
                                            inputMode="tel"
                                            value={phone}
                                            onChange={(e) => {
                                                setPhone(formatPhone(e.target.value));
                                                clearFormError();
                                            }}
                                            onBlur={() => touch("phone")}
                                            placeholder="(555) 123-4567"
                                            autoComplete="tel"
                                            error={showError("phone")}
                                            hint="US or Canada number."
                                        />
                                    </div>
                                </section>

                                {/* LOCATION DETAILS */}
                                <section>
                                    <SectionHeader
                                        icon={Globe2}
                                        title="Location Details"
                                        subtitle="Select your country and current location."
                                        number="02"
                                    />

                                    {locationError && (
                                        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#FFAB0B]/35 bg-[#FFF5DC] p-3">
                                            <p className="text-xs text-[#795B19]">{locationError}</p>

                                            <button
                                                type="button"
                                                onClick={loadCountries}
                                                className="shrink-0 text-xs font-bold text-[#06424B] underline"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="country" className={labelClass}>
                                                Country <RequiredMark />
                                            </label>

                                            <SearchableDropdown
                                                id="country"
                                                value={countryCode}
                                                options={countryOptions}
                                                onChange={handleCountryChange}
                                                onBlur={() => touch("country")}
                                                placeholder="Select your country"
                                                searchPlaceholder="Search country..."
                                                icon={Globe2}
                                                loading={loadingCountries}
                                                disabled={loadingCountries}
                                                maxVisibleOptions={2}
                                                emptyMessage="Country not available"
                                                error={showError("country")}
                                            />

                                            {showError("country") ? (
                                                <FieldError id="country" message={showError("country")} />
                                            ) : (
                                                <p className="mt-1.5 text-[10px] text-[#98A3A4]">
                                                    Available: USA and Canada
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="state" className={labelClass}>
                                                State / Province <RequiredMark />
                                            </label>

                                            <SearchableDropdown
                                                id="state"
                                                value={stateCode}
                                                options={stateOptions}
                                                onChange={handleStateChange}
                                                onBlur={() => touch("state")}
                                                placeholder={
                                                    countryCode === "US"
                                                        ? "Select US state"
                                                        : countryCode === "CA"
                                                            ? "Select Canadian province"
                                                            : "Select country first"
                                                }
                                                searchPlaceholder="Search state / province..."
                                                icon={MapPin}
                                                loading={loadingStates}
                                                disabled={!countryCode || loadingStates}
                                                maxVisibleOptions={stateOptions.length || 100}
                                                emptyMessage="No states or provinces found"
                                                error={showError("state")}
                                            />

                                            {showError("state") && (
                                                <FieldError id="state" message={showError("state")} />
                                            )}

                                            {!showError("state") &&
                                                !loadingStates &&
                                                countryCode &&
                                                stateOptions.length === 0 && (
                                                    <p className="mt-1.5 text-[10px] text-[#98A3A4]">
                                                        No region data available. You can enter your city
                                                        directly.
                                                    </p>
                                                )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label htmlFor="city" className={labelClass}>
                                                City <RequiredMark />
                                            </label>

                                            <SearchableDropdown
                                                id="city"
                                                value={city}
                                                options={cityOptions}
                                                onChange={(value) => {
                                                    setCity(value);
                                                    clearFormError();
                                                }}
                                                onBlur={() => touch("city")}
                                                placeholder="Search or select your city"
                                                searchPlaceholder="Type your city name..."
                                                icon={MapPin}
                                                loading={loadingCities}
                                                disabled={cityDisabled}
                                                allowCustom
                                                maxVisibleOptions={100}
                                                emptyMessage="No cities found"
                                                error={showError("city")}
                                            />

                                            {showError("city") ? (
                                                <FieldError id="city" message={showError("city")} />
                                            ) : (
                                                <p className="mt-1.5 text-[10px] text-[#98A3A4]">
                                                    Search available cities or enter your city manually.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* ROLE SPECIFIC INFORMATION */}
                                <section>
                                    <SectionHeader
                                        icon={isStudent ? GraduationCap : BriefcaseBusiness}
                                        title={
                                            isStudent ? "Academic Information" : "Professional Information"
                                        }
                                        subtitle={
                                            isStudent
                                                ? "Tell us about your education."
                                                : "Tell us about your teaching profile."
                                        }
                                        number="03"
                                    />

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <TextField
                                                id="institution"
                                                label={
                                                    isStudent
                                                        ? "School / College / University"
                                                        : "Institution / Organization"
                                                }
                                                icon={Building2}
                                                value={institution}
                                                onChange={(e) => {
                                                    setInstitution(e.target.value);
                                                    clearFormError();
                                                }}
                                                onBlur={() => touch("institution")}
                                                placeholder={
                                                    isStudent
                                                        ? "Enter your school / college name"
                                                        : "Enter your institution name"
                                                }
                                                error={showError("institution")}
                                            />
                                        </div>

                                        {isStudent ? (
                                            <>
                                                <div>
                                                    <label htmlFor="educationLevel" className={labelClass}>
                                                        Education Level <RequiredMark />
                                                    </label>

                                                    <SearchableDropdown
                                                        id="educationLevel"
                                                        value={educationLevel}
                                                        options={EDUCATION_LEVELS}
                                                        onChange={(value) => {
                                                            setEducationLevel(value);
                                                            clearFormError();
                                                        }}
                                                        onBlur={() => touch("educationLevel")}
                                                        placeholder="Select education level"
                                                        searchPlaceholder="Search education level..."
                                                        icon={GraduationCap}
                                                        maxVisibleOptions={10}
                                                        error={showError("educationLevel")}
                                                    />

                                                    {showError("educationLevel") && (
                                                        <FieldError
                                                            id="educationLevel"
                                                            message={showError("educationLevel")}
                                                        />
                                                    )}
                                                </div>

                                                <TextField
                                                    id="course"
                                                    label="Course / Program"
                                                    icon={BookOpen}
                                                    value={course}
                                                    onChange={(e) => {
                                                        setCourse(e.target.value);
                                                        clearFormError();
                                                    }}
                                                    onBlur={() => touch("course")}
                                                    placeholder="e.g. Computer Science"
                                                    error={showError("course")}
                                                />

                                                <div>
                                                    <label htmlFor="studyYear" className={labelClass}>
                                                        Academic Year{" "}
                                                        <span className="font-normal text-[#98A3A4]">
                                                            (optional)
                                                        </span>
                                                    </label>

                                                    <SearchableDropdown
                                                        id="studyYear"
                                                        value={studyYear}
                                                        options={ACADEMIC_YEARS}
                                                        onChange={setStudyYear}
                                                        placeholder="Select academic year"
                                                        searchPlaceholder="Search academic year..."
                                                        icon={CalendarDays}
                                                        maxVisibleOptions={10}
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="technology" className={labelClass}>
                                                        Technology <RequiredMark />
                                                    </label>

                                                    <SearchableDropdown
                                                        id="technology"
                                                        value={technology}
                                                        options={TECHNOLOGIES}
                                                        onChange={(value) => {
                                                            setTechnology(value);
                                                            clearFormError();
                                                        }}
                                                        onBlur={() => touch("technology")}
                                                        placeholder="Select technology"
                                                        searchPlaceholder="Search technology..."
                                                        icon={Sparkles}
                                                        maxVisibleOptions={4}
                                                        error={showError("technology")}
                                                    />

                                                    {showError("technology") && (
                                                        <FieldError
                                                            id="technology"
                                                            message={showError("technology")}
                                                        />
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <TextField
                                                    id="department"
                                                    label="Department"
                                                    icon={Building2}
                                                    value={department}
                                                    onChange={(e) => {
                                                        setDepartment(e.target.value);
                                                        clearFormError();
                                                    }}
                                                    onBlur={() => touch("department")}
                                                    placeholder="Enter department"
                                                    error={showError("department")}
                                                />

                                                <TextField
                                                    id="subject"
                                                    label="Teaching Subject"
                                                    icon={BookOpen}
                                                    value={subject}
                                                    onChange={(e) => {
                                                        setSubject(e.target.value);
                                                        clearFormError();
                                                    }}
                                                    onBlur={() => touch("subject")}
                                                    placeholder="e.g. Mathematics"
                                                    error={showError("subject")}
                                                />

                                                <TextField
                                                    id="designation"
                                                    label="Designation"
                                                    icon={BriefcaseBusiness}
                                                    value={designation}
                                                    onChange={(e) => {
                                                        setDesignation(e.target.value);
                                                        clearFormError();
                                                    }}
                                                    onBlur={() => touch("designation")}
                                                    placeholder="e.g. Assistant Professor"
                                                    error={showError("designation")}
                                                />
                                            </>
                                        )}
                                    </div>
                                </section>

                                {/* TERMS */}
                                <div className="border-t border-[#E8ECEC] pt-7">
                                    <label className="flex cursor-pointer items-start gap-3">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => {
                                                setAgreed(e.target.checked);
                                                touch("terms");
                                                clearFormError();
                                            }}
                                            aria-invalid={Boolean(showError("terms"))}
                                            aria-describedby={showError("terms") ? "terms-error" : undefined}
                                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#06424B]"
                                        />

                                        <span className="text-[12px] leading-6 text-[#829092]">
                                            I agree to the{" "}
                                            <Link
                                                to="/terms-and-conditions"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-[#06424B] hover:text-[#B87800]"
                                            >
                                                Terms of Service
                                            </Link>
                                            {" "}and{" "}
                                            <Link
                                                to="/privacy-policy"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-[#06424B] hover:text-[#B87800]"
                                            >
                                                Privacy Policy
                                            </Link>
                                            {" "}of Skill Next Consulting Inc.
                                        </span>
                                    </label>

                                    {showError("terms") && (
                                        <FieldError id="terms" message={showError("terms")} />
                                    )}
                                </div>

                                {/* Error summary */}
                                {submitted && invalidFields.length > 0 && (
                                    <div
                                        role="alert"
                                        className="sg-rise rounded-xl border border-[#E3A99D] bg-[#FFF8F6] p-4"
                                    >
                                        <p className="flex items-center gap-2 text-[12px] font-bold text-[#C2553F]">
                                            <AlertCircle size={16} className="shrink-0" />
                                            {invalidFields.length === 1
                                                ? "1 field needs your attention"
                                                : `${invalidFields.length} fields need your attention`}
                                        </p>

                                        <div className="mt-2.5 flex flex-wrap gap-2">
                                            {invalidFields.map((key) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => focusField(key)}
                                                    className="rounded-full border border-[#E3A99D] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#C2553F] transition-colors hover:bg-[#FFEFEA]"
                                                >
                                                    {FIELD_LABELS[key]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Request failure */}
                                {formError && (
                                    <div
                                        role="alert"
                                        className="sg-rise flex items-start gap-2 rounded-xl border border-[#E3A99D] bg-[#FFF8F6] p-4 text-xs leading-6 text-[#C2553F]"
                                    >
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="group flex h-[56px] w-full items-center justify-center gap-[14px] rounded-[11px] border-0 bg-[#FFAB0B] text-[13px] font-extrabold text-[#06424B] shadow-[0_9px_22px_rgba(255,171,11,.25)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#F5A000] hover:shadow-[0_13px_27px_rgba(255,171,11,.32)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <span>Creating your account</span>
                                            <Loader2 size={19} className="animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            <span>
                                                Continue with {isStudent ? "Student" : "Teacher"} Registration
                                            </span>
                                            <ArrowRight
                                                size={19}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </>
                                    )}
                                </button>

                                <p className="pt-1 text-center text-[13px] text-gray-500">
                                    Already have an account?
                                    <button
                                        type="button"
                                        onClick={() => requestLeave("/login")}
                                        className="ml-1.5 font-bold text-[#06424B] hover:text-[#B87800]"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </fieldset>
                        </form>
                    </div>

                    {/* Footer */}
                    <footer className="border-t border-[#E7ECEC] bg-[#FAFCFC] px-5 py-5 text-center">
                        <p className="flex items-center justify-center gap-2 text-[10px] text-[#879497]">
                            <ShieldCheck size={15} className="text-[#06424B]" />
                            © 2026 Skill Next Consulting Inc. · Learning without limits.
                        </p>
                    </footer>
                </section>
            </div>

            {/* Leave confirmation */}
            {leaveTarget && (
                <ModalShell labelledBy="leave-title" onClose={() => setLeaveTarget("")}>
                    <div className="sg-modal w-full max-w-[400px] rounded-[26px] bg-white px-7 pb-7 pt-8 text-center shadow-[0_30px_80px_rgba(6,66,75,0.35)]">
                        <div className="sg-badge mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#FFF5DC] text-[#B87800]">
                            <AlertTriangle size={30} strokeWidth={1.8} />
                        </div>

                        <h2
                            id="leave-title"
                            className="mt-5 text-[20px] font-bold tracking-[-0.5px] text-[#06424B]"
                        >
                            Leave registration?
                        </h2>

                        <p className="mx-auto mt-2 max-w-[290px] text-[11px] leading-5 text-[#839194]">
                            Your details haven't been saved. If you leave now, you'll need to
                            enter them again.
                        </p>

                        <div className="mt-6 grid gap-2">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => setLeaveTarget("")}
                                className="flex min-h-[47px] items-center justify-center rounded-xl bg-[#06424B] text-[12px] font-bold text-white shadow-[0_9px_22px_rgba(6,66,75,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#042E35]"
                            >
                                Stay and continue
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(leaveTarget)}
                                className="flex min-h-[47px] items-center justify-center rounded-xl border border-[#DCE6E8] bg-white text-[12px] font-bold text-[#647477] transition-all hover:border-[#06424B] hover:text-[#06424B]"
                            >
                                Leave page
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}

            {/* Success popup */}
            {success && (
                <ModalShell labelledBy="success-title">
                    <div className="sg-modal relative w-full max-w-[400px] overflow-hidden rounded-[26px] bg-white px-7 pb-8 pt-9 text-center shadow-[0_30px_80px_rgba(6,66,75,0.35)]">
                        <div className="relative mx-auto flex h-[96px] w-[96px] items-center justify-center">
                            <span className="sg-ripple absolute h-[80px] w-[80px] rounded-full border-2 border-[#4D9658]/50" />

                            <div className="sg-badge relative flex h-[80px] w-[80px] items-center justify-center rounded-full bg-gradient-to-br from-[#58A463] to-[#3F8F52] shadow-[0_14px_28px_rgba(63,143,82,0.35)]">
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
                                        className="sg-tick"
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
                            Registration complete
                        </h2>

                        <p className="mx-auto mt-2 max-w-[290px] text-[11px] leading-5 text-[#839194]">
                            {firstName.trim()
                                ? `Thanks, ${firstName.trim()}. Next, verify your email to activate your account.`
                                : "Next, verify your email to activate your account."}
                        </p>

                        <button
                            type="button"
                            onClick={goToVerification}
                            className="mt-6 flex min-h-[47px] w-full items-center justify-center gap-2 rounded-xl bg-[#06424B] text-[12px] font-bold text-white shadow-[0_9px_22px_rgba(6,66,75,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#042E35]"
                        >
                            Continue to verification
                            <ArrowRight size={16} />
                        </button>

                        <p className="mt-3 text-[10px] text-[#879497]" aria-live="polite">
                            Redirecting in {countdown}s
                        </p>

                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[#E3ECEC]">
                            <div className="sg-drain h-full bg-[#FFAB0B]" />
                        </div>
                    </div>
                </ModalShell>
            )}
        </main>
    );
}

export default Signup;