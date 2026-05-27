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

// ── JRT Brand Colors (Red-Dominant Palette) ──
const C = {
  dark: "#0a0a0a",
  darkAlt: "#1a1a1a",
  crimson: "#C82828",
  crimsonLight: "#E03C3C",
  crimsonDark: "#8B1A1A",
  gold: "#d4a843",
  goldLight: "#e8c96a",
  goldBright: "#FFD700",
  white: "#ffffff",
  gray100: "#f5f5f5",
  gray200: "#e0e0e0",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  surface: "#141414",
  surfaceCard: "#1e1e1e",
};

// ── Section Timing (7 products, synced to narration) ──
// Visual sections are CONTINUOUS (no gaps) — audio and visuals always aligned.
// Each section = audio duration + tail buffer for fade-out transitions.
// title 4.968s+3s buf=239fr → mission 12.168s+1.5s=410fr → products 50.064s+2s=1562fr
// → services 9.72s+1.5s=337fr → trust 14.304s+2s=489fr → cta 10.896s+3s=417fr
const SECTION = {
  title:    { start: 0,    dur: 239 },
  mission:  { start: 239,  dur: 410 },
  products: { start: 649,  dur: 1562 },
  services: { start: 2211, dur: 337 },
  trust:    { start: 2548, dur: 489 },
  cta:      { start: 3037, dur: 417 },
  endcard:  { start: 3454, dur: 150 },
};

// ── Animation Helpers ──
const clamp = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const springIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });

// ── Shared Styles ──
const sectionLabel: React.CSSProperties = {
  fontSize: 28,
  color: C.gold,
  letterSpacing: 10,
  textTransform: "uppercase",
  fontWeight: 700,
};
const headline: React.CSSProperties = {
  fontSize: 58,
  color: C.white,
  fontWeight: 800,
  lineHeight: 1.15,
};
const bodyText: React.CSSProperties = {
  fontSize: 26,
  color: C.gray300,
  lineHeight: 1.6,
  maxWidth: 900,
};

// ── PARTICLES BACKGROUND (upbeat: faster particles, warm glow) ──
const Particles: React.FC<{ opacity?: number }> = ({ opacity = 0.15 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const particles = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 50; i++) {  // more particles for upbeat vibe
      arr.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        size: 2 + Math.random() * 5,  // slightly larger
        speed: 0.5 + Math.random() * 1.2,  // faster
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <AbsoluteFill style={{ opacity }}>
      {particles.map((p, i) => {
        const y = (p.y + frame * p.speed * 30) % (1080 + 20) - 10;
        const x = p.x + Math.sin(frame * 0.03 + p.phase) * 20;  // wider sway
        const pulse = clamp(frame * 0.06 + i * 0.2, [0, 1], [0.4, 1]);  // brighter pulse
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
              background: i % 3 === 0 ? C.gold : i % 3 === 1 ? C.crimsonLight : C.goldLight,  // more gold/crimson mix
              opacity: pulse,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── RED GRADIENT BACKGROUND (warmer glow) ──
const GradientBG: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 30% 20%, ${C.crimson}22 0%, ${C.dark} 60%),
                    radial-gradient(ellipse at 70% 80%, ${C.gold}18 0%, ${C.dark} 50%),
                    ${C.dark}`,
    }}
  />
);

// ── SCROLLING SCREENSHOT COMPONENT ──
// Updated: larger viewport (520×780), slower scroll (0.8px/frame)
const ScrollingScreenshot: React.FC<{
  src: string;
  x: number;
  width: number;
  height: number;
  localFrame: number;
  startFrame: number;
  scrollSpeed?: number;
}> = ({ src, x, width, height, localFrame, startFrame, scrollSpeed = 0.8 }) => {
  const fadeIn = clamp(localFrame - startFrame, [0, 15], [0, 1]);
  const scrollOffset = Math.max(0, localFrame - startFrame - 10) * scrollSpeed;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 80,
        width,
        height,
        overflow: "hidden",
        borderRadius: 16,
        border: `2px solid ${C.crimsonDark}60`,
        opacity: fadeIn,
        boxShadow: `0 12px 50px ${C.dark}cc, 0 0 30px ${C.gold}22`,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width,
          transform: `translateY(-${scrollOffset}px)`,
        }}
      />
    </div>
  );
};

// ── SCENE 1: Title Intro ──
const TitleIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = springIn(frame, fps, 0);
  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);

  const nameProgress = springIn(frame, fps, 15);
  const nameY = interpolate(nameProgress, [0, 1], [40, 0]);
  const nameOpacity = clamp(frame - 15, [0, 15], [0, 1]);

  const tagProgress = springIn(frame, fps, 30);
  const tagY = interpolate(tagProgress, [0, 1], [30, 0]);
  const tagOpacity = clamp(frame - 30, [0, 15], [0, 1]);

  const fadeOut = clamp(frame, [SECTION.title.dur - 30, SECTION.title.dur], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GradientBG />
      <Particles />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Warm gold glow behind logo */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            background: `radial-gradient(circle, ${C.gold}44 0%, ${C.crimson}33 40%, transparent 70%)`,
            position: "absolute",
            transform: `scale(${1 + 0.12 * Math.sin(frame * 0.08)})`,
            filter: "blur(25px)",
          }}
        />
        <Img
          src={staticFile("images/jrt-logo.png")}
          style={{
            width: 140,
            height: 140,
            borderRadius: 20,
            transform: `scale(${logoScale})`,
            opacity: logoProgress,
          }}
        />
        <div
          style={{
            ...headline,
            fontSize: 52,
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
            color: C.gold,
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            fontWeight: 600,
            transform: `translateY(${tagY}px)`,
            opacity: tagOpacity,
          }}
        >
          Digital Products That Work For You
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 2: Mission (UPDATED: business-benefit language) ──
const MissionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);
  const headerY = interpolate(springIn(localFrame, fps, 0), [0, 1], [40, 0]);

  // UPDATED beliefs: business-benefit language, no "No bloat" or "Offline-First"
  // Pop-out timing synced to narration — each card pops when mentioned, holds until next, then shrinks
  const beliefs = [
    { icon: "🎯", title: "Purpose-Driven", desc: "Every feature solves a real problem", popFrame: 40 },
    { icon: "📈", title: "Grow Your Revenue", desc: "Tools that help you earn more, effortlessly", popFrame: 75 },
    { icon: "🔄", title: "Easy Workflow", desc: "Designed so you can focus on your business", popFrame: 110 },
    { icon: "🛡️", title: "Your Data, Your Device", desc: "Private by design, not by policy", popFrame: 150 },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.12} />
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
          Our Mission
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
          Simple tools. <span style={{ color: C.gold }}>Real results.</span> No guesswork.
        </div>
        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 60,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {beliefs.map((b, i) => {
            const delay = b.popFrame;
            const cardOpacity = clamp(localFrame - delay, [0, 15], [0, 1]);
            const cardY = interpolate(springIn(localFrame, fps, delay), [0, 1], [60, 0]);

            // Pop-out animation — stays enlarged while narrated, shrinks when next card pops
            const POP_UP = 12;
            const MIN_HOLD = 30;
            const nextPop = (i + 1 < beliefs.length) ? beliefs[i + 1].popFrame : b.popFrame + 130;
            const narrationDur = nextPop - b.popFrame;
            const POP_DOWN = 12;
            const POP_HOLD = Math.max(narrationDur - POP_UP - POP_DOWN, MIN_HOLD);
            const POP_TOTAL = POP_UP + POP_HOLD + POP_DOWN;
            const relFrame = localFrame - b.popFrame;

            let popScale = 1;
            let popGlow = 0;

            if (relFrame >= 0 && relFrame < POP_TOTAL) {
              if (relFrame < POP_UP) {
                const t = relFrame / POP_UP;
                popScale = interpolate(t, [0, 0.5, 1], [1, 1.35, 1.2]);
                popGlow = interpolate(t, [0, 1], [0, 40]);
              } else if (relFrame < POP_UP + POP_HOLD) {
                const holdFrame = relFrame - POP_UP;
                const pulse = Math.sin(holdFrame / POP_HOLD * Math.PI * 2) * 0.03;
                popScale = 1.2 + pulse;
                popGlow = 40;
              } else {
                const shrinkFrame = relFrame - POP_UP - POP_HOLD;
                const t = shrinkFrame / POP_DOWN;
                popScale = interpolate(t, [0, 1], [1.2, 1]);
                popGlow = interpolate(t, [0, 1], [40, 8]);
              }
            } else if (relFrame >= POP_TOTAL) {
              popScale = 1;
              popGlow = 8;
            }

            return (
              <div
                key={i}
                style={{
                  background: popScale > 1.05
                    ? `linear-gradient(135deg, ${C.crimson}22 0%, ${C.surfaceCard} 100%)`
                    : C.surfaceCard,
                  border: `1px solid ${popScale > 1.05 ? C.crimsonLight + "60" : C.gold + "30"}`,
                  borderRadius: 16,
                  padding: "32px 28px",
                  width: 240,
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px) scale(${popScale})`,
                  boxShadow: `0 0 ${popGlow}px ${C.crimson}33, 0 4px 20px rgba(0,0,0,0.3)`,
                  transformOrigin: "center bottom",
                  transition: "none",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{b.icon}</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.white,
                    marginBottom: 6,
                  }}
                >
                  {b.title}
                </div>
                <div style={{ fontSize: 16, color: C.gray400, lineHeight: 1.5 }}>
                  {b.desc}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 3: Products with Scrolling Screenshots (6 apps, bigger/slower) ──
const ProductsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  // UPDATED: 7 products — syncing cards to narration (narration starts immediately)
  // Header fades in frames 0-20, cards start appearing at frame 30
  const products = [
    {
      icon: "🍔",
      name: "Food Vendor",
      price: "starts at $79",
      tagline: "Serve fast, sell smart",
      features: ["Order management dashboard", "Menu & pricing control", "Custom built for each vendor"],
      screenshots: [
        "images/apps/food-vendor-dashboard.png",
        "images/apps/food-vendor-orders.png",
      ],
      screenshotStart: 40,
      cardStart: 30,
    },
    {
      icon: "🌿",
      name: "LawnCare Manager",
      price: "starts at $79",
      tagline: "Manage jobs, grow your business",
      features: ["Job scheduling & tracking", "Customer management", "Custom built for each vendor"],
      screenshots: [
        "images/apps/lawncare-dashboard.png",
        "images/apps/lawncare-customers.png",
      ],
      screenshotStart: 210,
      cardStart: 195,
    },
    {
      icon: "🥬",
      name: "Fresh Market Vendor",
      price: "starts at $79",
      tagline: "From farm stand to online storefront",
      features: ["Online vendor storefront", "Customer shopping page", "Custom built for each vendor"],
      screenshots: [
        "images/apps/fm-vendor-shop.png",
        "images/apps/fm-customer-store.png",
      ],
      screenshotStart: 380,
      cardStart: 365,
    },
    {
      icon: "🌾",
      name: "Farm Land Manager",
      price: "$29",
      tagline: "Track your land, your way",
      features: ["Parcel & field tracking", "Goal planning & analytics", "Built for farm owners"],
      screenshots: [
        "images/apps/flm-dashboard.png",
        "images/apps/flm-farms.png",
      ],
      screenshotStart: 560,
      cardStart: 545,
    },
    {
      icon: "🐄",
      name: "HerdLook",
      price: "$39",
      tagline: "Camera-powered herd management",
      features: ["Visual herd tracking", "Health & location alerts", "Built for livestock owners"],
      screenshots: [
        "images/apps/herdlook-home.png",
        "images/apps/herdlook-cattle.png",
      ],
      screenshotStart: 720,
      cardStart: 705,
    },
    {
      icon: "🤝",
      name: "FLM + HerdLook Bundle",
      price: "$59",
      tagline: "Farm & herd, one toolbox",
      features: ["All Farm Land Manager features", "All HerdLook features", "Save $9 vs buying separately"],
      screenshots: [
        "images/apps/flm-dashboard.png",
        "images/apps/herdlook-home.png",
      ],
      screenshotStart: 890,
      cardStart: 875,
    },
    {
      icon: "💡",
      name: "Idea Validator",
      price: "FREE",
      tagline: "Test before you invest",
      features: ["6-question assessment", "Instant scored verdict", "Free for everyone"],
      screenshots: [
        "images/apps/idea-validator.png",
        "images/apps/idea-validator-results.png",
      ],
      screenshotStart: 1060,
      cardStart: 1045,
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
          App Store
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
          Ready-made apps. <span style={{ color: C.gold }}>Real solutions.</span>
        </div>

        {/* Products area — cards on left, screenshots scroll on right */}
        <div
          style={{
            display: "flex",
            marginTop: 30,
            width: "100%",
            gap: 30,
            flex: 1,
          }}
        >
          {/* Left: Product cards stacked — compact to fit all 7, pop-out on narration */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 280, maxHeight: 950, overflow: "hidden" }}>
            {products.map((p, i) => {
              const delay = p.cardStart;
              const cardOpacity = clamp(localFrame - delay, [0, 12], [0, 1]);

              // Pop-out animation synced to narration — stays enlarged entire narration, shrinks when next product starts
              const POP_UP = 12;
              const nextPopFrame = (i + 1 < products.length) ? products[i + 1].screenshotStart : p.screenshotStart + 170;
              const narrationDuration = nextPopFrame - p.screenshotStart;
              const POP_DOWN = 15;
              const POP_HOLD = narrationDuration - POP_UP - POP_DOWN;  // hold for entire narration window
              const POP_TOTAL = POP_UP + POP_HOLD + POP_DOWN;
              const popFrame = p.screenshotStart;  // pop when narrator says this product name
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

              // Highlight the currently featured product
              const isFeatured = localFrame >= p.screenshotStart - 15 && localFrame < p.screenshotStart + 170;

              return (
                <div
                  key={i}
                  style={{
                    background: isFeatured
                      ? `linear-gradient(135deg, ${C.crimson}22 0%, ${C.surfaceCard} 100%)`
                      : `linear-gradient(180deg, ${C.surfaceCard} 0%, #14141480 100%)`,
                    border: `1px solid ${p.price === "FREE" ? C.gold + "60" : isFeatured ? C.crimsonLight + "80" : C.crimsonDark + "40"}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    opacity: cardOpacity * popOpacity,
                    transform: `scale(${popScale}) translateY(${popYBounce}px)`,
                    boxShadow: `0 0 ${popGlow}px ${C.crimson}44, 0 4px 20px rgba(0,0,0,0.3)`,
                    transformOrigin: "left center",
                    transition: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 22 }}>{p.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: C.gray400 }}>
                        {p.tagline}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                      <div
                        style={{
                          display: "inline-block",
                          background: p.price === "FREE"
                            ? `${C.gold}22`
                            : `${C.crimson}22`,
                          color: p.price === "FREE" ? C.gold : C.crimsonLight,
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.price === "FREE" ? "FREE" : p.price}
                      </div>
                      {p.price2 && (
                        <div
                          style={{
                            display: "inline-block",
                            background: `${C.gold}15`,
                            color: C.gold,
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: 4,
                            whiteSpace: "nowrap",
                          }}
                        >
                          2 Devices: {p.price2}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {p.features.map((f, fi) => {
                      const fDelay = delay + 12 + fi * 4;
                      const fOpacity = clamp(localFrame - fDelay, [0, 6], [0, 1]);
                      return (
                        <div
                          key={fi}
                          style={{
                            fontSize: 11,
                            color: C.gray400,
                            padding: "1px 0",
                            opacity: fOpacity,
                          }}
                        >
                          ✓ {f}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Large showcase screenshot area — fills remaining width */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative", height: "100%", padding: "30px 40px 30px 10px" }}>
            {products.map((p, i) => {
              const screenshotStartFrame = p.screenshotStart;
              const appearOpacity = clamp(localFrame - screenshotStartFrame, [0, 20], [0, 1]);
              const disappearFrame = i < products.length - 1
                ? products[i + 1].screenshotStart - 20
                : SECTION.products.dur;
              const disappearOpacity = i < products.length - 1
                ? clamp(localFrame - disappearFrame, [0, 15], [1, 0])
                : 1;
              const totalOpacity = Math.min(appearOpacity, disappearOpacity);

              if (totalOpacity <= 0) return null;

              // Scroll through each screenshot sequentially — slower (0.8px/frame)
              const screenshotPhase = localFrame - screenshotStartFrame;
              const totalScreens = p.screenshots.length;
              const framesPerScreen = 80;
              const currentScreenIdx = Math.min(
                Math.floor(screenshotPhase / framesPerScreen),
                totalScreens - 1
              );
              const screenLocalFrame = screenshotPhase - currentScreenIdx * framesPerScreen;
              const scrollOffset = Math.max(0, (screenLocalFrame - 15) * 0.8);  // slower scroll

              const currentSrc = p.screenshots[currentScreenIdx];

              return (
                <div key={`ss-${i}`} style={{ position: "absolute", opacity: totalOpacity, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Product name label */}
                  <div
                    style={{
                      fontSize: 28,
                      color: C.gold,
                      fontWeight: 700,
                      letterSpacing: 2,
                      marginBottom: 16,
                      opacity: totalOpacity,
                    }}
                  >
                    {p.icon} {p.name}
                  </div>
                  {/* Large showcase screenshot — auto-sizes to fill available space */}
                  <div
                    style={{
                      width: "100%",
                      flex: 1,
                      borderRadius: 20,
                      overflow: "hidden",
                      border: `3px solid ${C.crimsonDark}60`,
                      background: C.darkAlt,
                      boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${C.crimsonDark}44`,
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

// ── SCENE 4: Custom Build Services ($79) ──
// Audio: "Need something custom built?" (0-2s), "We make apps for farms, e-commerce, restaurants and more." (2-6.5s), "Starting at just $79." (6.5-9s)
// 4 tools pop outward & enlarge as narrator mentions each, then shrink back
const ServicesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  // 4 tools — timed to when narrator says each one
  // Farms at ~2.2s (frame 66), E-commerce at ~3.5s (frame 105), Restaurants at ~4.8s (frame 144), And More at ~5.8s (frame 174)
  const toolCards = [
    { icon: "🌾", label: "Farms", popFrame: 66 },
    { icon: "🛒", label: "E-commerce", popFrame: 105 },
    { icon: "🍳", label: "Restaurants", popFrame: 144 },
    { icon: "➕", label: "And More", popFrame: 174 },
  ];

  // Pop animation: scale up, hold enlarged until next tool is mentioned, then shrink back
  const POP_UP = 15;
  const POP_DOWN = 20;
  const MIN_HOLD = 45;  // minimum hold so card stays visibly enlarged for ~1.5s
  // Each tool's hold is dynamic — stays enlarged until the next tool pops (with minimum hold)
  const toolPopDuration = (i: number) => {
    if (i + 1 < toolCards.length) {
      const gap = toolCards[i + 1].popFrame - toolCards[i].popFrame;
      return Math.max(gap, POP_UP + MIN_HOLD + POP_DOWN);
    }
    return POP_UP + MIN_HOLD + POP_DOWN + 55; // last tool: longer hold
  };
  const POP_TOTAL = (i: number) => toolPopDuration(i);

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
          Custom Build Services
        </div>
        <div
          style={{
            ...headline,
            opacity: headerOpacity,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Need something built? <span style={{ color: C.crimsonLight }}>We'll build it.</span>
        </div>

        {/* 4 tool cards in a row — pop outward & enlarge as mentioned */}
        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 60,
          }}
        >
          {toolCards.map((tool, i) => {
            const relFrame = localFrame - tool.popFrame;
            const totalFrames = POP_TOTAL(i);
            const holdFrames = toolPopDuration(i) - POP_UP - POP_DOWN;

            // Default: card is visible but dim/small
            const baseOpacity = clamp(localFrame - (tool.popFrame - 30), [0, 20], [0, 0.35]);
            const baseScale = 0.7;

            let activeScale = 0;
            let activeOpacity = 0;
            let activeGlow = 0;
            let yBounce = 0;

            if (relFrame >= 0 && relFrame < totalFrames) {
              if (relFrame < POP_UP) {
                // Phase 1: Pop up (scale from 1x → 1.5x)
                const t = relFrame / POP_UP;
                activeScale = interpolate(t, [0, 0.4, 1], [1, 1.7, 1.5]);
                activeOpacity = interpolate(t, [0, 1], [0.35, 1]);
                activeGlow = interpolate(t, [0, 1], [0, 60]);
                yBounce = interpolate(t, [0, 0.5, 1], [0, -25, -15]);
              } else if (relFrame < POP_UP + holdFrames) {
                // Phase 2: Hold enlarged (slight pulse) — stays big until next card
                const holdFrame = relFrame - POP_UP;
                const pulse = Math.sin(holdFrame / holdFrames * Math.PI * 2) * 0.05;
                activeScale = 1.5 + pulse;
                activeOpacity = 1;
                activeGlow = 60;
                yBounce = -15;
              } else {
                // Phase 3: Shrink back to normal
                const shrinkFrame = relFrame - POP_UP - holdFrames;
                const t = shrinkFrame / POP_DOWN;
                activeScale = interpolate(t, [0, 1], [1.5, 1]);
                activeOpacity = interpolate(t, [0, 1], [1, 0.85]);
                activeGlow = interpolate(t, [0, 1], [60, 20]);
                yBounce = interpolate(t, [0, 1], [-15, 0]);
              }
            } else if (relFrame >= totalFrames) {
              // After pop: stay at normal size, slightly brighter
              activeScale = 1;
              activeOpacity = 0.85;
              activeGlow = 20;
              yBounce = 0;
            }

            const finalScale = relFrame >= 0 ? baseScale + (1 - baseScale) * activeScale : baseScale;
            const finalOpacity = relFrame >= 0 ? activeOpacity : baseOpacity;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 160,
                  height: 200,
                  background: `${C.crimson}20`,
                  border: `2px solid ${C.crimsonDark}60`,
                  borderRadius: 20,
                  opacity: finalOpacity,
                  transform: `scale(${finalScale}) translateY(${yBounce}px)`,
                  boxShadow: `0 0 ${activeGlow}px ${C.crimson}44, 0 20px 60px rgba(0,0,0,0.4)`,
                  transition: "none",
                }}
              >
                <div style={{ fontSize: 56 }}>{tool.icon}</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.white,
                    marginTop: 12,
                    textAlign: "center",
                  }}
                >
                  {tool.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Price badge — appears after all tools have popped (~frame 230 = 7.7s, narrator says "Starting at just $79" at 6.5s) */}
        <div
          style={{
            display: "inline-block",
            background: C.gold,
            color: C.dark,
            fontSize: 24,
            fontWeight: 800,
            padding: "14px 44px",
            borderRadius: 12,
            marginTop: 50,
            opacity: clamp(localFrame - 220, [0, 15], [0, 1]),
            boxShadow: `0 0 30px ${C.gold}44`,
            transform: `scale(${springIn(localFrame, fps, 225).valueOf()})`,
          }}
        >
          Starting at $79
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 5: Trust — 4 items pop outward & enlarge as narrator mentions each ──
// Audio: "YJRT" (0-2s), "Smooth, intuitive experience." (2-5s), "DataStaysPrivate." (5-7s), 
//        "Secure Stripe Checkout." (7-9s), "And no subscriptions ever." (9-11s), 
//        "One purchase, yours forever." (11-14s)
const TrustScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  // 4 trust items — timed to when narrator says each one
  // "Smooth experience" at ~2s (frame 60), "Data stays private" at ~5s (frame 150), 
  // "Secure Stripe" at ~7s (frame 210), "No subscriptions" at ~9s (frame 270)
  const trustItems = [
    { icon: "⚡", title: "Smooth Experience", desc: "Intuitive design that just works", popFrame: 60 },
    { icon: "🔒", title: "Data Stays Private", desc: "Your data stays on your device", popFrame: 150 },
    { icon: "💳", title: "Secure Stripe Checkout", desc: "Industry-standard payment processing", popFrame: 210 },
    { icon: "🛡️", title: "No Subscriptions", desc: "One purchase, yours forever", popFrame: 270 },
  ];

  // Pop animation: scale up, hold enlarged until next trust item is mentioned, then shrink back
  const POP_UP = 15;
  const POP_DOWN = 20;
  const MIN_HOLD = 45;  // minimum hold so card stays visibly enlarged for ~1.5s
  const trustPopDuration = (i: number) => {
    if (i + 1 < trustItems.length) {
      const gap = trustItems[i + 1].popFrame - trustItems[i].popFrame;
      return Math.max(gap, POP_UP + MIN_HOLD + POP_DOWN);
    }
    return POP_UP + MIN_HOLD + POP_DOWN + 55; // last item: longer hold
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
          Why JRT
        </div>
        <div
          style={{
            ...headline,
            opacity: headerOpacity,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Trust built <span style={{ color: C.gold }}>into everything.</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 36,
            marginTop: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {trustItems.map((t, i) => {
            const relFrame = localFrame - t.popFrame;
            const totalFrames = POP_TOTAL(i);
            const holdFrames = trustPopDuration(i) - POP_UP - POP_DOWN;

            // Default: card is visible but dim
            const baseOpacity = clamp(localFrame - (t.popFrame - 30), [0, 20], [0, 0.3]);

            let activeScale = 0;
            let activeOpacity = 0;
            let activeGlow = 0;
            let yBounce = 0;

            if (relFrame >= 0 && relFrame < totalFrames) {
              if (relFrame < POP_UP) {
                // Phase 1: Pop up
                const tt = relFrame / POP_UP;
                activeScale = interpolate(tt, [0, 0.4, 1], [1, 1.6, 1.45]);
                activeOpacity = interpolate(tt, [0, 1], [0.3, 1]);
                activeGlow = interpolate(tt, [0, 1], [0, 50]);
                yBounce = interpolate(tt, [0, 0.5, 1], [0, -18, -12]);
              } else if (relFrame < POP_UP + holdFrames) {
                // Phase 2: Hold enlarged — stays big until next item
                const holdFrame = relFrame - POP_UP;
                const pulse = Math.sin(holdFrame / holdFrames * Math.PI * 2) * 0.04;
                activeScale = 1.45 + pulse;
                activeOpacity = 1;
                activeGlow = 50;
                yBounce = -12;
              } else {
                // Phase 3: Shrink back
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
                  padding: "28px 24px",
                  width: 230,
                  textAlign: "center",
                  opacity: finalOpacity,
                  transform: `scale(${finalScale}) translateY(${yBounce}px)`,
                  boxShadow: `0 0 ${activeGlow}px ${C.gold}33, 0 20px 60px rgba(0,0,0,0.4)`,
                  transition: "none",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>{t.icon}</div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: C.gold,
                    marginBottom: 6,
                  }}
                >
                  {t.title}
                </div>
                <div style={{ fontSize: 15, color: C.gray400, lineHeight: 1.5 }}>
                  {t.desc}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 6: CTA ──
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

  const urlOpacity = clamp(localFrame - 60, [0, 20], [0, 1]);

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
          }}
        >
          Ready to build something <span style={{ color: C.crimsonLight }}>great?</span>
        </div>
        <div
          style={{
            ...bodyText,
            color: C.gray300,
            textAlign: "center",
            opacity: nameOpacity,
          }}
        >
          Visit us today and get started.
        </div>
        <div
          style={{
            transform: `translateY(${ctaY}px) scale(${pulse})`,
            opacity: ctaOpacity,
            background: C.gold,
            color: C.dark,
            fontSize: 24,
            fontWeight: 800,
            padding: "16px 48px",
            borderRadius: 12,
            marginTop: 20,
            boxShadow: `0 0 40px ${C.gold}44`,
            letterSpacing: 2,
          }}
        >
          Jade Rose Tech .com
        </div>
        <div
          style={{
            fontSize: 22,
            color: C.gold,
            marginTop: 12,
            opacity: urlOpacity,
            letterSpacing: 3,
          }}
        >
          🌾 DIGITAL PRODUCTS THAT WORK FOR YOU
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 7: End Card ──
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const localFrame = frame;

  const fade = clamp(localFrame, [0, 30], [0, 1]);
  const breathe = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.95, 1.05]);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <GradientBG />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Img
          src={staticFile("images/jrt-logo.png")}
          style={{
            width: 100,
            height: 100,
            borderRadius: 14,
            transform: `scale(${breathe})`,
          }}
        />
        <div style={{ fontSize: 28, color: C.gold, fontWeight: 700, letterSpacing: 4 }}>
          JADE ROSE TECHNOLOGY
        </div>
        <div style={{ fontSize: 20, color: C.gray400, letterSpacing: 3 }}>
          jade rose tech · com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN COMPOSITION ──
export const JRTAdVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.dark }}>
      <Sequence from={SECTION.title.start} durationInFrames={SECTION.title.dur}>
        <TitleIntro />
      </Sequence>
      <Sequence from={SECTION.mission.start} durationInFrames={SECTION.mission.dur}>
        <MissionScene />
      </Sequence>
      <Sequence from={SECTION.products.start} durationInFrames={SECTION.products.dur}>
        <ProductsScene />
      </Sequence>
      <Sequence from={SECTION.services.start} durationInFrames={SECTION.services.dur}>
        <ServicesScene />
      </Sequence>
      <Sequence from={SECTION.trust.start} durationInFrames={SECTION.trust.dur}>
        <TrustScene />
      </Sequence>
      <Sequence from={SECTION.cta.start} durationInFrames={SECTION.cta.dur}>
        <CTAScene />
      </Sequence>
      <Sequence from={SECTION.endcard.start} durationInFrames={SECTION.endcard.dur}>
        <EndCard />
      </Sequence>

      {/* ── Audio Tracks (sections continuous → always in sync) ── */}
      <Audio src={staticFile("audio/bg-music.mp3")} volume={0.5} />
      <Audio src={staticFile("audio/01-title.mp3")} volume={1} />
      <Sequence from={SECTION.mission.start}>
        <Audio src={staticFile("audio/02-mission.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.products.start}>
        <Audio src={staticFile("audio/03-products.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.services.start}>
        <Audio src={staticFile("audio/04-services.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.trust.start}>
        <Audio src={staticFile("audio/05-trust.mp3")} volume={1} />
      </Sequence>
      <Sequence from={SECTION.cta.start}>
        <Audio src={staticFile("audio/06-cta.mp3")} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};