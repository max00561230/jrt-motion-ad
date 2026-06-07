import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ── removeVideoPrices() safety filter ──
// Strips any accidental price mentions from video text.
// Product card prices on the website are NOT affected.
const PRICE_PATTERNS = [
  /\$?\d{2,3}(?=\s|$|\.)/g,           // dollar amounts
  /starts?\s+at\s+\$/gi,              // "starts at $"
  /begin?s?\s+at\s+\$/gi,             // "begins at $"
  /bundle\s+options?\s+from\s+\$/gi,  // "bundle options from $"
  /free(?!\s+for\s+everyone)/gi,       // "FREE" except "free for everyone"
];

function removeVideoPrices(text: string): string {
  let safe = text;
  PRICE_PATTERNS.forEach((pat) => {
    safe = safe.replace(pat, "");
  });
  return safe.trim();
}

// ── JRT Brand Colors — Spring/Green Palette ──
const C = {
  dark: "#0c1a0f",
  darkAlt: "#142318",
  green: "#2d8a4e",
  greenLight: "#4CAF50",
  greenBright: "#66bb6a",
  greenSoft: "#a5d6a7",
  gold: "#d4a843",
  goldLight: "#e8c96a",
  goldBright: "#FFD700",
  crimson: "#b91c1c",
  crimsonLight: "#dc2626",
  crimsonDark: "#7f1d1d",
  white: "#ffffff",
  cream: "#fafdf6",
  gray100: "#f5f8f4",
  gray200: "#e0e8dd",
  gray300: "#c8d4c0",
  gray400: "#8a9a82",
  gray500: "#5a6b52",
  gray600: "#3a4a34",
  surface: "#111f14",
  surfaceCard: "#1a2e1e",
  surfaceCardHover: "#223828",
};

// ── Section Timing (8 sections, ~120s at 30fps) ──
// Synced to regenerated TTS narration durations
const SECTION = {
  opening:   { start: 0,    dur: 260 },   // 0:00–0:09 (8.7s)
  problem:   { start: 260,  dur: 340 },   // 0:09–0:20 (11.3s)
  solution:  { start: 600,  dur: 430 },   // 0:20–0:34 (14.3s)
  appTypes:  { start: 1030, dur: 900 },   // 0:34–1:04 (30.0s)
  workflow:  { start: 1930, dur: 300 },   // 1:04–1:14 (10.0s)
  demo:      { start: 2230, dur: 410 },   // 1:14–1:28 (13.7s)
  trust:     { start: 2640, dur: 520 },   // 1:28–1:45 (17.3s)
  cta:       { start: 3160, dur: 430 },   // 1:45–2:00 (14.3s)
};

// ── Animation Helpers ──
const clamp = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const springIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });

// ── Shared Styles (larger text, better contrast) ──
const sectionLabel: React.CSSProperties = {
  fontSize: 32,
  color: C.gold,
  letterSpacing: 12,
  textTransform: "uppercase",
  fontWeight: 700,
};
const headline: React.CSSProperties = {
  fontSize: 62,
  color: C.white,
  fontWeight: 800,
  lineHeight: 1.15,
};
const bodyText: React.CSSProperties = {
  fontSize: 28,
  color: C.cream,
  lineHeight: 1.6,
  maxWidth: 1000,
};

// ── Brighter Gradient Background ──
const GradientBG: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 30% 20%, ${C.green}25 0%, ${C.dark} 60%),
                    radial-gradient(ellipse at 70% 80%, ${C.gold}18 0%, ${C.dark} 50%),
                    ${C.dark}`,
    }}
  />
);

// ── Particle Background ──
const Particles: React.FC<{ opacity?: number }> = ({ opacity = 0.12 }) => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      arr.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        size: 2 + Math.random() * 4,
        speed: 0.4 + Math.random() * 1,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <AbsoluteFill style={{ opacity }}>
      {particles.map((p, i) => {
        const y = (p.y + frame * p.speed * 30) % (1080 + 20) - 10;
        const x = p.x + Math.sin(frame * 0.03 + p.phase) * 20;
        const pulse = clamp(frame * 0.06 + i * 0.2, [0, 1], [0.4, 1]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 3 === 0 ? C.gold : i % 3 === 1 ? C.greenLight : C.greenSoft,
              opacity: pulse,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── SCENE 1: Opening / Brand Hook ──
const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = springIn(frame, fps, 0);
  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);

  const nameProgress = springIn(frame, fps, 15);
  const nameY = interpolate(nameProgress, [0, 1], [40, 0]);
  const nameOpacity = clamp(frame - 15, [0, 15], [0, 1]);

  const tagProgress = springIn(frame, fps, 35);
  const tagY = interpolate(tagProgress, [0, 1], [30, 0]);
  const tagOpacity = clamp(frame - 35, [0, 15], [0, 1]);

  const fadeOut = clamp(frame, [SECTION.opening.dur - 30, SECTION.opening.dur], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBG />
      <Particles />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Warm glow behind logo */}
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            background: `radial-gradient(circle, ${C.greenLight}40 0%, ${C.gold}30 40%, transparent 70%)`,
            position: "absolute",
            transform: `scale(${1 + 0.12 * Math.sin(frame * 0.08)})`,
            filter: "blur(30px)",
          }}
        />
        <Img
          src={staticFile("images/jrt-logo.png")}
          style={{
            width: 160,
            height: 160,
            borderRadius: 24,
            transform: `scale(${logoScale})`,
            opacity: logoProgress,
          }}
        />
        <div
          style={{
            ...headline,
            fontSize: 58,
            color: C.white,
            transform: `translateY(${nameY}px)`,
            opacity: nameOpacity,
            textAlign: "center",
          }}
        >
          JADE ROSE TECHNOLOGY
        </div>
        <div
          style={{
            ...bodyText,
            color: C.greenBright,
            fontSize: 26,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
            transform: `translateY(${tagY}px)`,
            opacity: tagOpacity,
            textAlign: "center",
          }}
        >
          {removeVideoPrices("Simple web apps for small businesses, farms, and vendors.")}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 2: The Problem ──
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);
  const headerY = interpolate(springIn(localFrame, fps, 0), [0, 1], [40, 0]);

  const problems = [
    { icon: "📝", title: "Paper Notes", desc: "Orders get lost in notebooks", popFrame: 50 },
    { icon: "📋", title: "Missed Orders", desc: "No simple way to capture requests", popFrame: 90 },
    { icon: "📁", title: "Scattered Records", desc: "Info spread across too many tools", popFrame: 130 },
    { icon: "📱", title: "No Customer Page", desc: "Hard for customers to find you", popFrame: 170 },
    { icon: "🔧", title: "Too Many Tools", desc: "Nothing works together", popFrame: 210 },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.1} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            ...sectionLabel,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          THE PROBLEM
        </div>
        <div
          style={{
            ...headline,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
            marginTop: 16,
            textAlign: "center",
            fontSize: 52,
          }}
        >
          {removeVideoPrices("Running a small business")}
          <br />
          <span style={{ color: C.gold }}>
            {removeVideoPrices("should not feel scattered.")}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 40,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {problems.map((p, i) => {
            const delay = p.popFrame;
            const cardOpacity = clamp(localFrame - delay, [0, 15], [0, 1]);
            const cardY = interpolate(springIn(localFrame, fps, delay), [0, 1], [50, 0]);

            return (
              <div
                key={i}
                style={{
                  background: C.surfaceCard,
                  border: `1px solid ${C.green}40`,
                  borderRadius: 14,
                  padding: "20px 18px",
                  width: 190,
                  textAlign: "center",
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
                  boxShadow: `0 0 30px ${C.green}22, 0 4px 16px rgba(0,0,0,0.3)`,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.white, marginBottom: 4 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 14, color: C.gray300, lineHeight: 1.4 }}>
                  {p.desc}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 3: The Solution ──
const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);
  const headerY = interpolate(springIn(localFrame, fps, 0), [0, 1], [40, 0]);

  const steps = [
    { icon: "🛒", title: "Pick a starter app", popFrame: 60 },
    { icon: "📤", title: "Send your business details", popFrame: 120 },
    { icon: "🔍", title: "We prepare your custom build", popFrame: 180 },
    { icon: "🚀", title: "Launch and start using it", popFrame: 240 },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.1} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            ...sectionLabel,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          THE SOLUTION
        </div>
        <div
          style={{
            ...headline,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          {removeVideoPrices("Ready-made apps")}
          <br />
          <span style={{ color: C.greenBright }}>
            {removeVideoPrices("customized for your business.")}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {steps.map((s, i) => {
            const delay = s.popFrame;
            const cardOpacity = clamp(localFrame - delay, [0, 15], [0, 1]);
            const cardY = interpolate(springIn(localFrame, fps, delay), [0, 1], [50, 0]);

            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    background: C.surfaceCard,
                    border: `2px solid ${C.green}60`,
                    borderRadius: 16,
                    padding: "28px 24px",
                    width: 200,
                    textAlign: "center",
                    opacity: cardOpacity,
                    transform: `translateY(${cardY}px)`,
                    boxShadow: `0 0 30px ${C.green}22, 0 8px 24px rgba(0,0,0,0.3)`,
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.white, lineHeight: 1.3 }}>
                    {removeVideoPrices(s.title)}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      fontSize: 28,
                      color: C.gold,
                      opacity: cardOpacity,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 4: App Types (Product showcase) ──
const AppTypesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  const apps = [
    {
      icon: "🍔",
      name: "Food Vendor",
      benefit: "Menus, order requests, and customer pages.",
      screenshots: ["images/apps/food-vendor-dashboard.png", "images/apps/food-vendor-orders.png"],
      screenshotStart: 40,
      cardStart: 30,
    },
    {
      icon: "🌿",
      name: "LawnCare Manager",
      benefit: "Booking requests and service workflows.",
      screenshots: ["images/apps/lawncare-dashboard.png", "images/apps/lawncare-customers.png"],
      screenshotStart: 160,
      cardStart: 145,
    },
    {
      icon: "🥬",
      name: "Fresh Market Vendor",
      benefit: "Products, pickup details, and vendor info.",
      screenshots: ["images/apps/fm-vendor-shop.png", "images/apps/fm-customer-store.png"],
      screenshotStart: 275,
      cardStart: 260,
    },
    {
      icon: "🌾",
      name: "Farm Land Manager",
      benefit: "Fields, land notes, and farm records.",
      screenshots: ["images/apps/flm-dashboard.png", "images/apps/flm-farms.png"],
      screenshotStart: 390,
      cardStart: 375,
    },
    {
      icon: "🐄",
      name: "HerdLook",
      benefit: "Animal records, photos, and herd notes.",
      screenshots: ["images/apps/herdlook-home.png", "images/apps/herdlook-cattle.png"],
      screenshotStart: 505,
      cardStart: 490,
    },
    {
      icon: "💡",
      name: "Idea Validator",
      benefit: "Test your idea before building.",
      screenshots: ["images/apps/idea-validator.png", "images/apps/idea-validator-results.png"],
      screenshotStart: 620,
      cardStart: 605,
    },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.08} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "40px 60px",
          flexDirection: "column",
        }}
      >
        <div style={{ ...sectionLabel, opacity: headerOpacity }}>
          APP STORE
        </div>
        <div
          style={{
            ...headline,
            opacity: headerOpacity,
            marginTop: 12,
            textAlign: "center",
            fontSize: 52,
          }}
        >
          {removeVideoPrices("Ready-made apps.")}{" "}
          <span style={{ color: C.greenBright }}>{removeVideoPrices("Real solutions.")}</span>
        </div>

        {/* Products area — cards on left, screenshots on right */}
        <div
          style={{
            display: "flex",
            marginTop: 24,
            width: "100%",
            gap: 30,
            flex: 1,
          }}
        >
          {/* Left: Product cards stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 280, maxHeight: 950, overflow: "hidden" }}>
            {apps.map((p, i) => {
              const delay = p.cardStart;
              const cardOpacity = clamp(localFrame - delay, [0, 12], [0, 1]);

              const POP_UP = 12;
              const nextPopFrame = (i + 1 < apps.length) ? apps[i + 1].screenshotStart : p.screenshotStart + 130;
              const narrationDuration = nextPopFrame - p.screenshotStart;
              const POP_DOWN = 15;
              const POP_HOLD = narrationDuration - POP_UP - POP_DOWN;
              const POP_TOTAL = POP_UP + POP_HOLD + POP_DOWN;
              const popFrame = p.screenshotStart;
              const relFrame = localFrame - popFrame;

              let popScale = 1;
              let popYBounce = 0;
              let popGlow = 0;
              let popOpacity = 1;

              if (relFrame >= 0 && relFrame < POP_TOTAL) {
                if (relFrame < POP_UP) {
                  const t = relFrame / POP_UP;
                  popScale = interpolate(t, [0, 0.5, 1], [1, 1.35, 1.25]);
                  popYBounce = interpolate(t, [0, 0.5, 1], [0, -12, -8]);
                  popGlow = interpolate(t, [0, 1], [0, 40]);
                  popOpacity = 1;
                } else if (relFrame < POP_UP + POP_HOLD) {
                  const holdFrame = relFrame - POP_UP;
                  const pulse = Math.sin(holdFrame / POP_HOLD * Math.PI * 2) * 0.03;
                  popScale = 1.25 + pulse;
                  popYBounce = -8;
                  popGlow = 40;
                  popOpacity = 1;
                } else {
                  const shrinkFrame = relFrame - POP_UP - POP_HOLD;
                  const t = shrinkFrame / POP_DOWN;
                  popScale = interpolate(t, [0, 1], [1.25, 1]);
                  popYBounce = interpolate(t, [0, 1], [-8, 0]);
                  popGlow = interpolate(t, [0, 1], [40, 8]);
                  popOpacity = 1;
                }
              } else if (relFrame >= POP_TOTAL) {
                popScale = 1;
                popYBounce = 0;
                popGlow = 8;
                popOpacity = 1;
              }

              const isFeatured = localFrame >= p.screenshotStart - 15 && localFrame < p.screenshotStart + 130;
              const borderColor = isFeatured ? C.greenLight + "80" : C.green + "30";

              return (
                <div
                  key={i}
                  style={{
                    background: isFeatured
                      ? `linear-gradient(135deg, ${C.green}22 0%, ${C.surfaceCard} 100%)`
                      : `linear-gradient(180deg, ${C.surfaceCard} 0%, #0c1a0f80 100%)`,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    opacity: cardOpacity * popOpacity,
                    transform: `scale(${popScale}) translateY(${popYBounce}px)`,
                    boxShadow: `0 0 ${popGlow}px ${C.green}44, 0 4px 20px rgba(0,0,0,0.3)`,
                    transformOrigin: "left center",
                    transition: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 22 }}>{p.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>
                        {removeVideoPrices(p.name)}
                      </div>
                      <div style={{ fontSize: 12, color: C.gray300 }}>
                        {removeVideoPrices(p.benefit)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Large showcase screenshot area */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative", height: "100%", padding: "30px 40px 30px 10px" }}>
            {apps.map((p, i) => {
              const screenshotStartFrame = p.screenshotStart;
              const appearOpacity = clamp(localFrame - screenshotStartFrame, [0, 20], [0, 1]);
              const disappearFrame = i < apps.length - 1
                ? apps[i + 1].screenshotStart - 20
                : SECTION.appTypes.dur;
              const disappearOpacity = i < apps.length - 1
                ? clamp(localFrame - disappearFrame, [0, 15], [1, 0])
                : 1;
              const totalOpacity = Math.min(appearOpacity, disappearOpacity);

              if (totalOpacity <= 0) return null;

              const screenshotPhase = localFrame - screenshotStartFrame;
              const totalScreens = p.screenshots.length;
              const framesPerScreen = 70;
              const currentScreenIdx = Math.min(
                Math.floor(screenshotPhase / framesPerScreen),
                totalScreens - 1
              );
              const screenLocalFrame = screenshotPhase - currentScreenIdx * framesPerScreen;
              const scrollOffset = Math.max(0, (screenLocalFrame - 15) * 0.8);

              const currentSrc = p.screenshots[currentScreenIdx];

              return (
                <div key={`ss-${i}`} style={{ position: "absolute", opacity: totalOpacity, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* App name label */}
                  <div
                    style={{
                      fontSize: 30,
                      color: C.gold,
                      fontWeight: 700,
                      letterSpacing: 2,
                      marginBottom: 16,
                      opacity: totalOpacity,
                    }}
                  >
                    {p.icon} {removeVideoPrices(p.name)}
                  </div>
                  {/* Benefit tagline below name */}
                  <div
                    style={{
                      fontSize: 18,
                      color: C.cream,
                      marginBottom: 16,
                      opacity: totalOpacity * 0.9,
                    }}
                  >
                    {removeVideoPrices(p.benefit)}
                  </div>
                  {/* Large showcase screenshot */}
                  <div
                    style={{
                      width: "100%",
                      flex: 1,
                      borderRadius: 20,
                      overflow: "hidden",
                      border: `3px solid ${C.green}40`,
                      background: C.darkAlt,
                      boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${C.green}22`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                    }}
                  >
                    <Img
                      src={staticFile(currentSrc)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transform: `translateY(-${scrollOffset}px)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 5: Workflow (4-step process) ──
const WorkflowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);
  const headerY = interpolate(springIn(localFrame, fps, 0), [0, 1], [40, 0]);

  const steps = [
    { icon: "1️⃣", title: "Choose Your App", desc: "Pick a ready-made starter", popFrame: 50 },
    { icon: "2️⃣", title: "Send Your Details", desc: "Share your business info", popFrame: 100 },
    { icon: "3️⃣", title: "Review Your Build", desc: "We customize it for you", popFrame: 150 },
    { icon: "4️⃣", title: "Launch", desc: "Start using your app", popFrame: 200 },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.1} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            ...sectionLabel,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          HOW IT WORKS
        </div>
        <div
          style={{
            ...headline,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Choose. Customize. Review.{" "}
          <span style={{ color: C.gold }}>Launch.</span>
        </div>

        {/* 4 workflow steps */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {steps.map((s, i) => {
            const delay = s.popFrame;
            const cardOpacity = clamp(localFrame - delay, [0, 15], [0, 1]);
            const cardY = interpolate(springIn(localFrame, fps, delay), [0, 1], [60, 0]);

            const POP_UP = 15;
            const POP_DOWN = 15;
            const MIN_HOLD = 60;
            const POP_TOTAL = POP_UP + MIN_HOLD + POP_DOWN;
            const relFrame = localFrame - delay;

            let popScale = 1;
            let popGlow = 0;

            if (relFrame >= 0 && relFrame < POP_TOTAL) {
              if (relFrame < POP_UP) {
                const t = relFrame / POP_UP;
                popScale = interpolate(t, [0, 0.5, 1], [0.8, 1.1, 1.05]);
                popGlow = interpolate(t, [0, 1], [0, 50]);
              } else if (relFrame < POP_UP + MIN_HOLD) {
                popScale = 1.05;
                popGlow = 50;
              } else {
                const t = (relFrame - POP_UP - MIN_HOLD) / POP_DOWN;
                popScale = interpolate(t, [0, 1], [1.05, 1]);
                popGlow = interpolate(t, [0, 1], [50, 10]);
              }
            } else if (relFrame >= POP_TOTAL) {
              popScale = 1;
              popGlow = 10;
            }

            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    background: C.surfaceCard,
                    border: `2px solid ${C.green}50`,
                    borderRadius: 20,
                    padding: "32px 28px",
                    width: 200,
                    textAlign: "center",
                    opacity: cardOpacity,
                    transform: `translateY(${cardY}px) scale(${popScale})`,
                    boxShadow: `0 0 ${popGlow}px ${C.green}44, 0 12px 40px rgba(0,0,0,0.4)`,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{s.icon}</div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: C.white,
                      marginBottom: 8,
                    }}
                  >
                    {removeVideoPrices(s.title)}
                  </div>
                  <div style={{ fontSize: 16, color: C.gray300, lineHeight: 1.4 }}>
                    {removeVideoPrices(s.desc)}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      fontSize: 28,
                      color: C.gold,
                      opacity: cardOpacity,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 6: Screenshots / Demo ──
const DemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  // 3 key demo screenshots with labels
  const demos = [
    {
      label: "Customer Order Page",
      sublabel: "Simple requests from any phone",
      src: "images/apps/food-vendor-orders.png",
      popFrame: 40,
    },
    {
      label: "Admin Dashboard",
      sublabel: "Manage your app from one place",
      src: "images/apps/flm-dashboard.png",
      popFrame: 160,
    },
    {
      label: "Records Manager",
      sublabel: "Keep business or farm records organized",
      src: "images/apps/herdlook-cattle.png",
      popFrame: 280,
    },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.08} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "60px 80px",
          flexDirection: "column",
        }}
      >
        <div style={{ ...sectionLabel, opacity: headerOpacity }}>
          SEE IT IN ACTION
        </div>
        <div
          style={{
            ...headline,
            opacity: headerOpacity,
            marginTop: 12,
            textAlign: "center",
            fontSize: 48,
          }}
        >
          {removeVideoPrices("Apps that work.")}
        </div>

        <div
          style={{
            display: "flex",
            gap: 36,
            marginTop: 40,
            justifyContent: "center",
            alignItems: "flex-start",
            flex: 1,
          }}
        >
          {demos.map((d, i) => {
            const cardOpacity = clamp(localFrame - d.popFrame, [0, 20], [0, 1]);
            const cardY = interpolate(springIn(localFrame, fps, d.popFrame), [0, 1], [60, 0]);
            const cardScale = interpolate(clamp(localFrame - d.popFrame, [0, 15], [0.85, 1]), [0, 1], [0.85, 1]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px) scale(${cardScale})`,
                  width: 400,
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.gold,
                    marginBottom: 6,
                    textAlign: "center",
                  }}
                >
                  {removeVideoPrices(d.label)}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: C.gray300,
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  {removeVideoPrices(d.sublabel)}
                </div>
                <div
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `2px solid ${C.green}40`,
                    background: C.darkAlt,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${C.green}18`,
                  }}
                >
                  <Img
                    src={staticFile(d.src)}
                    style={{
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 7: Trust / Why JRT ──
const TrustScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  const trustItems = [
    { icon: "⚡", title: "Simple Setup", desc: "Ready to use, no complex configuration", popFrame: 60 },
    { icon: "🎨", title: "Custom Details", desc: "Your branding and business info built in", popFrame: 120 },
    { icon: "📱", title: "Mobile-Friendly", desc: "Works on any device, any screen", popFrame: 180 },
    { icon: "💳", title: "Stripe-Ready", desc: "Industry-standard payment processing", popFrame: 240 },
    { icon: "🛡️", title: "No Subscriptions", desc: "One purchase, yours forever", popFrame: 300 },
  ];

  const POP_UP = 15;
  const POP_DOWN = 20;
  const MIN_HOLD = 45;
  const trustPopDuration = (i: number) => {
    if (i + 1 < trustItems.length) {
      const gap = trustItems[i + 1].popFrame - trustItems[i].popFrame;
      return Math.max(gap, POP_UP + MIN_HOLD + POP_DOWN);
    }
    return POP_UP + MIN_HOLD + POP_DOWN + 55;
  };
  const POP_TOTAL = (i: number) => trustPopDuration(i);

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.1} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          flexDirection: "column",
        }}
      >
        <div style={{ ...sectionLabel, opacity: headerOpacity }}>
          WHY JRT
        </div>
        <div
          style={{
            ...headline,
            opacity: headerOpacity,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          {removeVideoPrices("Built for practical")}
          <br />
          <span style={{ color: C.gold }}>{removeVideoPrices("business use.")}</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {trustItems.map((t, i) => {
            const relFrame = localFrame - t.popFrame;
            const totalFrames = POP_TOTAL(i);
            const holdFrames = trustPopDuration(i) - POP_UP - POP_DOWN;

            const baseOpacity = clamp(localFrame - (t.popFrame - 30), [0, 20], [0, 0.3]);

            let activeScale = 0;
            let activeOpacity = 0;
            let activeGlow = 0;
            let yBounce = 0;

            if (relFrame >= 0 && relFrame < totalFrames) {
              if (relFrame < POP_UP) {
                const tt = relFrame / POP_UP;
                activeScale = interpolate(tt, [0, 0.4, 1], [1, 1.6, 1.45]);
                activeOpacity = interpolate(tt, [0, 1], [0.3, 1]);
                activeGlow = interpolate(tt, [0, 1], [0, 50]);
                yBounce = interpolate(tt, [0, 0.5, 1], [0, -18, -12]);
              } else if (relFrame < POP_UP + holdFrames) {
                const holdFrame = relFrame - POP_UP;
                const pulse = Math.sin(holdFrame / holdFrames * Math.PI * 2) * 0.04;
                activeScale = 1.45 + pulse;
                activeOpacity = 1;
                activeGlow = 50;
                yBounce = -12;
              } else {
                const shrinkFrame = relFrame - POP_UP - holdFrames;
                const tt = shrinkFrame / POP_DOWN;
                activeScale = interpolate(tt, [0, 1], [1.45, 1]);
                activeOpacity = interpolate(tt, [0, 1], [1, 0.85]);
                activeGlow = interpolate(tt, [0, 1], [50, 15]);
                yBounce = interpolate(tt, [0, 1], [-12, 0]);
              }
            } else if (relFrame >= totalFrames) {
              activeScale = 1;
              activeOpacity = 0.85;
              activeGlow = 15;
              yBounce = 0;
            }

            const finalScale = relFrame >= 0 ? 0.6 + (1 - 0.6) * activeScale : 0.6;
            const finalOpacity = relFrame >= 0 ? activeOpacity : baseOpacity;

            return (
              <div
                key={i}
                style={{
                  background: C.surfaceCard,
                  border: `1px solid ${C.gold}25`,
                  borderRadius: 14,
                  padding: "24px 20px",
                  width: 210,
                  textAlign: "center",
                  opacity: finalOpacity,
                  transform: `scale(${finalScale}) translateY(${yBounce}px)`,
                  boxShadow: `0 0 ${activeGlow}px ${C.gold}33, 0 20px 60px rgba(0,0,0,0.4)`,
                  transition: "none",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{t.icon}</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.gold,
                    marginBottom: 4,
                  }}
                >
                  {removeVideoPrices(t.title)}
                </div>
                <div style={{ fontSize: 14, color: C.gray300, lineHeight: 1.4 }}>
                  {removeVideoPrices(t.desc)}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 8: CTA ──
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const logoProgress = springIn(localFrame, fps, 0);
  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);

  const nameProgress = springIn(localFrame, fps, 20);
  const nameY = interpolate(nameProgress, [0, 1], [40, 0]);
  const nameOpacity = clamp(localFrame - 20, [0, 15], [0, 1]);

  const ctaProgress = springIn(localFrame, fps, 40);
  const ctaY = interpolate(ctaProgress, [0, 1], [30, 0]);
  const ctaOpacity = clamp(localFrame - 40, [0, 15], [0, 1]);

  const phoneOpacity = clamp(localFrame - 70, [0, 20], [0, 1]);

  const pulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.97, 1.03]);

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.14} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Img
          src={staticFile("images/jrt-logo.png")}
          style={{
            width: 120,
            height: 120,
            borderRadius: 16,
            transform: `scale(${logoScale})`,
            opacity: logoProgress,
          }}
        />
        <div
          style={{
            ...headline,
            transform: `translateY(${nameY}px)`,
            opacity: nameOpacity,
            textAlign: "center",
          }}
        >
          {removeVideoPrices("Ready to build something useful?")}
        </div>
        <div
          style={{
            ...bodyText,
            color: C.gray300,
            textAlign: "center",
            opacity: nameOpacity,
          }}
        >
          Visit jaderosetech.com and start your app build.
        </div>
        <div
          style={{
            transform: `translateY(${ctaY}px) scale(${pulse})`,
            opacity: ctaOpacity,
            background: C.green,
            color: C.cream,
            fontSize: 26,
            fontWeight: 800,
            padding: "18px 52px",
            borderRadius: 14,
            marginTop: 20,
            boxShadow: `0 0 40px ${C.green}44`,
            letterSpacing: 2,
          }}
        >
          jaderosetech.com
        </div>
        <div
          style={{
            fontSize: 24,
            color: C.gold,
            marginTop: 12,
            opacity: phoneOpacity,
            letterSpacing: 2,
          }}
        >
          📞 252-592-1266
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN COMPOSITION ──
export const JRTAdVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.dark }}>
      <Sequence from={SECTION.opening.start} durationInFrames={SECTION.opening.dur}>
        <OpeningScene />
      </Sequence>
      <Sequence from={SECTION.problem.start} durationInFrames={SECTION.problem.dur}>
        <ProblemScene />
      </Sequence>
      <Sequence from={SECTION.solution.start} durationInFrames={SECTION.solution.dur}>
        <SolutionScene />
      </Sequence>
      <Sequence from={SECTION.appTypes.start} durationInFrames={SECTION.appTypes.dur}>
        <AppTypesScene />
      </Sequence>
      <Sequence from={SECTION.workflow.start} durationInFrames={SECTION.workflow.dur}>
        <WorkflowScene />
      </Sequence>
      <Sequence from={SECTION.demo.start} durationInFrames={SECTION.demo.dur}>
        <DemoScene />
      </Sequence>
      <Sequence from={SECTION.trust.start} durationInFrames={SECTION.trust.dur}>
        <TrustScene />
      </Sequence>
      <Sequence from={SECTION.cta.start} durationInFrames={SECTION.cta.dur}>
        <CTAScene />
      </Sequence>

      {/* ── Audio Tracks ── */}
      <Audio src={staticFile("audio/bg-music.mp3")} volume={0.5} />
      <Audio src={staticFile("audio/01-opening.mp3")} volume={1} />
      <Sequence from={SECTION.problem.start}>
        <Audio src={staticFile("audio/02-problem.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.solution.start}>
        <Audio src={staticFile("audio/03-solution.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.appTypes.start}>
        <Audio src={staticFile("audio/04-apptypes.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.workflow.start}>
        <Audio src={staticFile("audio/05-workflow.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.demo.start}>
        <Audio src={staticFile("audio/06-demo.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.trust.start}>
        <Audio src={staticFile("audio/07-trust.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.cta.start}>
        <Audio src={staticFile("audio/08-cta.mp3")} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};