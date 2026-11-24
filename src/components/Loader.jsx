import { translateValue } from "../i18n";

const TEAL = "#06424B";
const YELLOW = "#FFAB0B";

export default function Loader({
    open = false,
    text = "Please wait...",
    blur = true,
}) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            {blur && (
            <div className="absolute inset-0 bg-[#06424B]/10 backdrop-blur-[1px]" />
            )}

            <div className="relative flex flex-col items-center gap-3">
                <div className="relative h-16 w-16">
                    <div
                        className="absolute inset-0 rounded-full border-[5px]"
                        style={{
                            borderColor: "rgba(255,255,255,0.55)",
                        }}
                    />

                    <div
                        className="absolute inset-0 animate-spin rounded-full border-[5px] border-transparent"
                        style={{
                            borderTopColor: YELLOW,
                            borderRightColor: TEAL,
                        }}
                    />
                </div>

                <p className="text-sm font-semibold tracking-wide text-center">
                    <span className="text-[#FFAB0B]">
                        {translateValue(text.split(" ")[0])}
                    </span>{translateValue(" ")}
                    <span className="text-[#06424B]">
                        {translateValue(text.split(" ").slice(1).join(" "))}
                    </span>
                </p>
            </div>

            <span className="sr-only">{translateValue(text)}</span>
        </div>
    );
}
