const TEAL = "#06424B";

const THEME_NAME = "mint";

const THEMES = {
    /* fresh: soft teal tint + white arch, yellow accents (matches the white form side) */
    mint: {
        panelBg: "#FFFFFF",
        stageFrom: "#E8F3F4",
        stageTo: "#CBE2E5",
        archOuter: "#FFFFFF",
        archInner: "#EDF6F7",
        desk: "#06424B",
        deskApron: "#042E35",
        deskLeg: "#042E35",
        tw: "#FFAB0B",
        steam: "#06424B",
        floor: "#06424B",
        shadow: "#06424B",
        headline: TEAL,
        accent: "#C77D00",
        sub: "rgba(6,66,75,0.7)",
        dot: "rgba(6,66,75,0.16)",
        blob: "rgba(255,171,11,0.30)",
        ring: "rgba(6,66,75,0.07)",
        nShape: "rgba(6,66,75,0.06)",
    },
    /* warm: cream-yellow with deep teal arch */
    cream: {
        panelBg: "#F2F6F6",
        stageFrom: "#FFF6DC",
        stageTo: "#FFE7A8",
        archOuter: "#06424B",
        archInner: "#0B5A66",
        desk: "#1A7A88",
        deskApron: "#0B5560",
        deskLeg: "#0B5560",
        tw: "#E69500",
        steam: "#FFFFFF",
        floor: "#06424B",
        shadow: "#06424B",
        headline: TEAL,
        accent: "#D98A00",
        sub: "rgba(6,66,75,0.7)",
        dot: "rgba(6,66,75,0.18)",
        blob: "rgba(255,255,255,0.45)",
        ring: "rgba(6,66,75,0.06)",
        nShape: "rgba(6,66,75,0.06)",
    },
    /* neutral: soft grey with deep teal arch */
    grey: {
        panelBg: "#FFFFFF",
        stageFrom: "#F3F5F6",
        stageTo: "#D9E1E3",
        archOuter: "#06424B",
        archInner: "#0B5A66",
        desk: "#1A7A88",
        deskApron: "#0B5560",
        deskLeg: "#0B5560",
        tw: "#E69500",
        steam: "#FFFFFF",
        floor: "#06424B",
        shadow: "#06424B",
        headline: TEAL,
        accent: "#D98A00",
        sub: "rgba(6,66,75,0.7)",
        dot: "rgba(6,66,75,0.16)",
        blob: "rgba(255,171,11,0.25)",
        ring: "rgba(6,66,75,0.06)",
        nShape: "rgba(6,66,75,0.06)",
    },
};
const T = THEMES[THEME_NAME];

export function Logo({ style, className = "" }) {
    return (
        <div
            className={`aspect-[17/10] overflow-hidden ${className}`}
            style={style}
        >
            <img
                src="/logo.png"
                alt="Skill Next Consulting Inc."
                className="w-full h-full object-cover mix-blend-multiply"
            />
        </div>
    );
}

/* Student learning skills in an online class (animated SVG) */
function StudentScene() {
    return (
        <div className="flex-1 min-h-0 w-full">
            <svg viewBox="0 0 560 440" className="w-full h-full" role="img" aria-label="A student learning new skills in an online class">
                <style>{`
  @keyframes sn-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
  @keyframes sn-blink { 0%,93%,100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
  @keyframes sn-nod { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(1.6deg); } }
  @keyframes sn-pop { 0% { transform: scale(0); } 6% { transform: scale(1.2); } 9%,88% { transform: scale(1); } 96%,100% { transform: scale(0); } }
  @keyframes sn-grow { 0% { transform: scaleX(0.03); } 12%,88% { transform: scaleX(1); } 96%,100% { transform: scaleX(0.03); } }
  @keyframes sn-prog { 0% { transform: scaleX(0.1); } 80%,100% { transform: scaleX(1); } }
  @keyframes sn-live { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
  @keyframes sn-steam { 0% { opacity: 0; transform: translateY(4px); } 40% { opacity: .7; } 100% { opacity: 0; transform: translateY(-10px); } }
  @keyframes sn-twinkle { 0%,100% { opacity: .15; } 50% { opacity: .9; } }
  .sn-float { animation: sn-float 6s ease-in-out infinite; }
  .sn-d2 { animation-delay: -2s; } .sn-d3 { animation-delay: -4s; } .sn-d1 { animation-delay: -1s; }
  .sn-blink { transform-box: fill-box; transform-origin: center; animation: sn-blink 4.5s infinite; }
  .sn-nod { transform-box: fill-box; transform-origin: 50% 100%; animation: sn-nod 5s ease-in-out infinite; }
  .sn-pop { transform-box: fill-box; transform-origin: center; animation: sn-pop 9s ease-in-out infinite both; }
  .sn-grow { transform-box: fill-box; transform-origin: left center; animation: sn-grow 9s ease-in-out infinite both; }
  .sn-prog { transform-box: fill-box; transform-origin: left center; animation: sn-prog 7s ease-in-out infinite; }
  .sn-live { animation: sn-live 1.4s ease-in-out infinite; }
  .sn-steam { animation: sn-steam 3s ease-out infinite; }
  .sn-steam2 { animation: sn-steam 3s ease-out infinite 1.4s; }
  .sn-tw { animation: sn-twinkle 3s ease-in-out infinite; }
  .sn-tw2 { animation: sn-twinkle 3s ease-in-out infinite 1s; }
  .sn-tw3 { animation: sn-twinkle 3s ease-in-out infinite 2s; }
  .sn-p1 { animation-delay: 0.6s; } .sn-p2 { animation-delay: 2.4s; } .sn-p3 { animation-delay: 4.2s; }
  @keyframes sn-showraise { 0%,54% { opacity: 0; transform: translateY(10px); } 58%,76% { opacity: 1; transform: none; } 80%,100% { opacity: 0; transform: translateY(10px); } }
  @keyframes sn-hideraise { 0%,54% { opacity: 1; } 57%,77% { opacity: 0; } 80%,100% { opacity: 1; } }
  @keyframes sn-burst { 0%,56% { opacity: 0; transform: scale(0.4); } 61% { opacity: 1; transform: scale(1.15); } 76% { opacity: 1; transform: scale(1); } 80%,100% { opacity: 0; transform: scale(0.4); } }
  @keyframes sn-type { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
  .sn-raise { animation: sn-showraise 9s ease-in-out infinite; opacity: 0; }
  .sn-hideraise { animation: sn-hideraise 9s ease-in-out infinite; }
  .sn-burst { transform-box: fill-box; transform-origin: center; animation: sn-burst 9s ease-in-out infinite; opacity: 0; }
  .sn-typeR { animation: sn-type 0.45s ease-in-out infinite; }
  .sn-typeL { animation: sn-type 0.45s ease-in-out infinite 0.22s; }

        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } .sn-raise, .sn-burst { opacity: 0; } }
      `}</style>
                <defs>
                    <linearGradient id="snTeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0E6573" /><stop offset="1" stopColor="#06424B" /></linearGradient>
                    <linearGradient id="snLid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBFDFD" /><stop offset="1" stopColor="#E4ECEE" /></linearGradient>
                    <filter id="snShadow" x="-50%" y="-50%" width="200%" height="230%"><feDropShadow dx="0" dy="10" stdDeviation="9" floodColor={T.shadow} floodOpacity="0.22" /></filter>
                </defs>
                {/* backdrop */}
                <path d="M110 350 V188 A170 170 0 0 1 450 188 V350Z" fill={T.archOuter} />
                <path d="M155 350 V190 A125 125 0 0 1 405 190 V350Z" fill={T.archInner} />
                <g fill={T.tw}><circle className="sn-tw" cx="215" cy="62" r="3" /><circle className="sn-tw2" cx="345" cy="40" r="2.5" /><circle className="sn-tw3" cx="30" cy="190" r="2.5" /><circle className="sn-tw" cx="530" cy="270" r="3" /><circle className="sn-tw2" cx="200" cy="170" r="2" /></g>

                {/* floor shadow */}
                <ellipse cx="280" cy="432" rx="215" ry="8" fill={T.floor} fillOpacity="0.2" />

                {/* STUDENT */}
                <g className="sn-nod">
                    {/* torso */}
                    <path d="M190 350 L190 294 Q190 252 234 246 L326 246 Q370 252 370 294 L370 350Z" fill="#FFAB0B" />
                    <path d="M328 246 Q370 252 370 294 L370 350 L338 350 Q352 300 328 246Z" fill="#E69500" fillOpacity="0.7" />
                    {/* arms */}
                    <g className="sn-hideraise"><g className="sn-typeL"><path d="M203 272 Q190 314 224 338" stroke="#F29E00" strokeWidth="24" strokeLinecap="round" fill="none" /></g></g>
                    <g className="sn-typeR"><path d="M357 272 Q370 314 336 338" stroke="#E69500" strokeWidth="24" strokeLinecap="round" fill="none" /></g>
                    <g className="sn-raise">
                        <path d="M205 272 Q166 282 160 228" stroke="#F29E00" strokeWidth="24" strokeLinecap="round" fill="none" />
                        <rect x="154" y="190" width="9" height="26" rx="4.5" fill="#F3CCA6" />
                        <rect x="148" y="208" width="26" height="24" rx="9" fill="#F3CCA6" />
                        <path d="M150 218 h20 M150 224 h20" stroke="#E0AB82" strokeWidth="1.6" strokeLinecap="round" />
                    </g>
                    <g className="sn-burst" fill="#FFAB0B"><path d="M132 188 l3 -9 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3z" /><circle cx="186" cy="196" r="3" /><circle cx="140" cy="168" r="2.5" /><circle cx="182" cy="172" r="2" /></g>
                    {/* neck */}
                    <rect x="267" y="214" width="26" height="40" rx="11" fill="#E0AB82" />
                    <path d="M260 247 Q280 266 300 247" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" fill="none" />
                    {/* ears */}
                    <circle cx="243" cy="188" r="7.5" fill="#EBBB93" /><circle cx="317" cy="188" r="7.5" fill="#EBBB93" />
                    {/* head */}
                    <ellipse cx="280" cy="184" rx="37" ry="42" fill="#F3CCA6" />
                    {/* hair */}
                    <path d="M242 182 C236 140 260 126 282 126 C308 126 326 142 318 182 C313 163 300 154 284 154 C268 154 252 160 242 182Z" fill="#1F1A2E" />
                    <path d="M262 136 Q282 128 302 136" stroke="#3A3358" strokeWidth="3" strokeLinecap="round" fill="none" />
                    {/* headphones */}
                    <path d="M239 184 C236 106 324 106 321 184" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <rect x="230" y="176" width="17" height="36" rx="8.5" fill="#FFFFFF" /><rect x="233.5" y="181" width="10" height="26" rx="5" fill="#1A7A88" />
                    <rect x="313" y="176" width="17" height="36" rx="8.5" fill="#FFFFFF" /><rect x="316.5" y="181" width="10" height="26" rx="5" fill="#1A7A88" />
                    {/* face */}
                    <path d="M260 178 Q267 174 274 178" stroke="#1F1A2E" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                    <path d="M286 178 Q293 174 300 178" stroke="#1F1A2E" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                    <g className="sn-blink"><ellipse cx="267" cy="190" rx="3.3" ry="3.9" fill="#1F1A2E" /><ellipse cx="293" cy="190" rx="3.3" ry="3.9" fill="#1F1A2E" /></g>
                    <circle cx="268.2" cy="188.6" r="1" fill="#fff" /><circle cx="294.2" cy="188.6" r="1" fill="#fff" />
                    <path d="M280 194 Q277 202 282 203" stroke="#D49F78" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M269 209 Q280 219 291 209" stroke="#8A4B3A" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                    <circle cx="258" cy="205" r="5.5" fill="#F08A7A" fillOpacity="0.35" /><circle cx="302" cy="205" r="5.5" fill="#F08A7A" fillOpacity="0.35" />
                </g>

                {/* LAPTOP (back of lid, facing student) */}
                <rect x="205" y="254" width="150" height="86" rx="9" fill="url(#snLid)" />
                <rect x="205" y="254" width="150" height="86" rx="9" fill="none" stroke="#C5D1D4" strokeWidth="1.5" />
                <svg x="236" y="272" width="88" height="51.5" viewBox="60 310 1135 665"><image href="/logo.png" width="1254" height="1254" style={{ mixBlendMode: "multiply" }} /></svg>
                <rect x="193" y="338" width="174" height="7" rx="3.5" fill="#B7C4C8" />

                {/* DESK */}
                <rect x="48" y="345" width="464" height="15" rx="7.5" fill={T.desk} />
                <rect x="72" y="360" width="416" height="9" fill={T.deskApron} />
                <rect x="84" y="369" width="11" height="62" rx="3" fill={T.deskLeg} />
                <rect x="465" y="369" width="11" height="62" rx="3" fill={T.deskLeg} />

                {/* books */}
                <rect x="72" y="325" width="72" height="20" rx="3" fill="#FFAB0B" /><rect x="80" y="331" width="22" height="3" rx="1.5" fill="#06424B" fillOpacity="0.5" />
                <rect x="78" y="306" width="62" height="19" rx="3" fill="#06424B" /><rect x="86" y="312" width="20" height="3" rx="1.5" fill="#FFAB0B" />
                <rect x="74" y="288" width="68" height="18" rx="3" fill="#2A93A3" /><rect x="82" y="294" width="24" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.7" />

                {/* mug */}
                <rect x="416" y="318" width="27" height="27" rx="6" fill="#FFAB0B" />
                <path d="M443 324 q11 0 11 9 q0 9 -11 9" stroke="#FFAB0B" strokeWidth="4" fill="none" />
                <path className="sn-steam" d="M424 310 q-4 -6 0 -12" stroke={T.steam} strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path className="sn-steam2" d="M435 310 q-4 -6 0 -12" stroke={T.steam} strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                {/* plant */}
                <path d="M486 318 C470 300 468 282 480 268 C492 282 494 302 486 318Z" fill="#2FA88A" />
                <path d="M486 318 C500 304 512 296 524 298 C516 312 504 320 486 318Z" fill="#43C2A0" />
                <path d="M486 318 C478 306 462 302 452 304 C458 316 470 322 486 318Z" fill="#2FA88A" />
                <path d="M470 318 L502 318 L498 345 L474 345Z" fill="#FFAB0B" />

                {/* CARD: live class */}
                <g transform="translate(14 38)"><g className="sn-float" filter="url(#snShadow)">
                    <rect width="172" height="124" rx="14" fill="#fff" />
                    <rect x="10" y="10" width="152" height="68" rx="9" fill="url(#snTeal)" />
                    <circle cx="44" cy="40" r="11" fill="#F3CCA6" />
                    <path d="M33 38 Q34 26 44 26 Q55 26 55 38 Q50 32 44 32 Q38 32 33 38Z" fill="#1F1A2E" />
                    <path d="M26 78 Q26 58 44 55 Q62 58 62 78Z" fill="#FFAB0B" />
                    <rect x="80" y="22" width="74" height="48" rx="5" fill="#fff" fillOpacity="0.12" />
                    <rect x="88" y="31" width="40" height="5" rx="2.5" fill="#fff" fillOpacity="0.85" />
                    <rect x="88" y="42" width="56" height="5" rx="2.5" fill="#fff" fillOpacity="0.5" />
                    <rect x="88" y="53" width="30" height="5" rx="2.5" fill="#FFAB0B" />
                    <rect x="16" y="15" width="36" height="14" rx="7" fill="#000" fillOpacity="0.3" />
                    <circle className="sn-live" cx="25" cy="22" r="3" fill="#FF5A5A" />
                    <text x="31" y="25.5" fontSize="8" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">LIVE</text>
                    <text x="12" y="97" fontSize="11" fontWeight="700" fill="#06424B" fontFamily="system-ui, sans-serif">Live class</text>
                    <rect x="12" y="105" width="148" height="5" rx="2.5" fill="#E6ECEC" />
                    <rect className="sn-prog" x="12" y="105" width="148" height="5" rx="2.5" fill="#FFAB0B" />
                </g></g>

                {/* CARD: skills */}
                <g transform="translate(388 34)"><g className="sn-float sn-d2" filter="url(#snShadow)">
                    <rect width="160" height="136" rx="14" fill="#fff" />
                    <text x="14" y="24" fontSize="10.5" fontWeight="800" fill="#06424B" fontFamily="system-ui, sans-serif">Skills in progress</text>
                    <g>
                        <circle cx="22" cy="46" r="8" fill="#E6ECEC" />
                        <g className="sn-pop sn-p1"><circle cx="22" cy="46" r="8" fill="#FFAB0B" /><path d="M18 46 l3 3 l6 -6" stroke="#06424B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
                        <text x="38" y="45" fontSize="10" fontWeight="600" fill="#33454A" fontFamily="system-ui, sans-serif">Communication</text>
                        <rect x="38" y="51" width="108" height="4" rx="2" fill="#E6ECEC" /><rect className="sn-grow sn-p1" x="38" y="51" width="108" height="4" rx="2" fill="#06424B" />
                    </g>
                    <g>
                        <circle cx="22" cy="80" r="8" fill="#E6ECEC" />
                        <g className="sn-pop sn-p2"><circle cx="22" cy="80" r="8" fill="#FFAB0B" /><path d="M18 80 l3 3 l6 -6" stroke="#06424B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
                        <text x="38" y="79" fontSize="10" fontWeight="600" fill="#33454A" fontFamily="system-ui, sans-serif">Data analysis</text>
                        <rect x="38" y="85" width="108" height="4" rx="2" fill="#E6ECEC" /><rect className="sn-grow sn-p2" x="38" y="85" width="108" height="4" rx="2" fill="#06424B" />
                    </g>
                    <g>
                        <circle cx="22" cy="114" r="8" fill="#E6ECEC" />
                        <g className="sn-pop sn-p3"><circle cx="22" cy="114" r="8" fill="#FFAB0B" /><path d="M18 114 l3 3 l6 -6" stroke="#06424B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
                        <text x="38" y="113" fontSize="10" fontWeight="600" fill="#33454A" fontFamily="system-ui, sans-serif">Leadership</text>
                        <rect x="38" y="119" width="108" height="4" rx="2" fill="#E6ECEC" /><rect className="sn-grow sn-p3" x="38" y="119" width="108" height="4" rx="2" fill="#06424B" />
                    </g>
                </g></g>


                {/* BADGE */}
                <g transform="translate(88 232)"><g className="sn-float sn-d3" filter="url(#snShadow)">
                    <circle r="30" fill="#fff" /><circle r="23" fill="#FFAB0B" />
                    <polygon points="0,-13 4,-4 13,-3 6,3 8,12 0,7 -8,12 -6,3 -13,-3 -4,-4" fill="#06424B" />
                    <rect x="-27" y="31" width="54" height="17" rx="8.5" fill="#fff" />
                    <text y="43" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#06424B" fontFamily="system-ui, sans-serif">Level 4</text>
                </g></g>

                {/* XP */}
                <g transform="translate(414 200)"><g className="sn-float sn-d1" filter="url(#snShadow)">
                    <rect width="120" height="38" rx="19" fill="#fff" />
                    <circle cx="21" cy="19" r="12" fill="#FFAB0B" />
                    <path d="M22 11 l-6 9 h5 l-1 7 l7 -10 h-5z" fill="#06424B" />
                    <text x="40" y="24" fontSize="12.5" fontWeight="800" fill="#06424B" fontFamily="system-ui, sans-serif">+120 XP</text>
                </g></g>
            </svg>
        </div>
    );
}

export default function LoginVisual() {
    return (
            <section
                className="hidden lg:flex lg:w-[56%] flex-col items-center gap-3 p-5 xl:p-7"
                style={{
                    background: "linear-gradient(145deg, #EEF3F4 0%, #E8EFF0 100%)",
                }}
            >
                {/* Big logo, blended into the panel */}
                <Logo className="shrink-0" style={{ width: "min(420px, 52vh)" }} />

                {/* Stage */}
                <div
                    className="relative flex-1 min-h-0 w-full rounded-[28px] overflow-hidden flex flex-col"
                    style={{
                        background: `linear-gradient(160deg, ${T.stageFrom} 0%, ${T.stageTo} 100%)`,
                    }}
                >
                    {/* brand pattern: soft yellow sun, teal ring, dot grid, big N */}
                    <div
                        className="absolute -top-28 -right-24 w-[320px] h-[320px] rounded-full"
                        style={{ background: T.blob }}
                    />
                    <div
                        className="absolute -bottom-36 -left-28 w-[360px] h-[360px] rounded-full"
                        style={{ border: `42px solid ${T.ring}` }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(${T.dot} 1.5px, transparent 1.5px)`,
                            backgroundSize: "24px 24px",
                            WebkitMaskImage: "linear-gradient(135deg, #000 0%, transparent 45%)",
                            maskImage: "linear-gradient(135deg, #000 0%, transparent 45%)",
                        }}
                    />
                    <svg
                        className="absolute -right-14 -bottom-20 w-[360px]"
                        viewBox="0 0 300 330"
                        fill={T.nShape}
                        aria-hidden="true"
                    >
                        <polygon points="0,0 55,0 245,130 245,0 300,0 300,330 245,330 55,200 55,330 0,330" />
                    </svg>

                    <div className="relative z-10 flex flex-col flex-1 min-h-0 px-6 pt-6 pb-6">
                        <StudentScene />

                        <div className="text-center pt-3 shrink-0">
                            <h1
                                className="text-2xl xl:text-3xl font-bold tracking-tight"
                                style={{ color: T.headline }}
                            >
                                Learn smart.{" "}
                                <span style={{ color: T.accent }}>Grow next.</span>
                            </h1>
                            <p className="mt-1.5 text-sm" style={{ color: T.sub }}>
                                Your digital classroom for learning, teaching and achieving more.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
    );
}
