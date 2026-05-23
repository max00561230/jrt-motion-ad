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

// ── Section Timing ──
const SECTION = {
  title:    { start: 0,    dur: 243 },
  mission:  { start: 243,  dur: 408 },
  products: { start: 651,  dur: 501 },
  services: { start: 1152, dur: 413 },
  trust:    { start: 1565, dur: 438 },
  cta:      { start: 2003, dur: 429 },
  endcard:  { start: 2432, dur: 150 },
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

// ── PARTICLES BACKGROUND ──
const Particles: React.FC<{ opacity?: number }> = ({ opacity = 0.15 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const particles = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      arr.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        size: 2 + Math.random() * 4,
        speed: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <AbsoluteFill style={{ opacity }}>
      {particles.map((p, i) => {
        const y = (p.y + frame * p.speed * 30) % (1080 + 20) - 10;
        const x = p.x + Math.sin(frame * 0.02 + p.phase) * 15;
        const pulse = clamp(frame * 0.05 + i * 0.3, [0, 1], [0.3, 1]);
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
              background: i % 3 === 0 ? C.gold : C.crimsonLight,
              opacity: pulse,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── RED GRADIENT BACKGROUND ──
const GradientBG: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 30% 20%, ${C.crimsonDark}33 0%, ${C.dark} 60%),
                    radial-gradient(ellipse at 70% 80%, ${C.gold}11 0%, ${C.dark} 50%),
                    ${C.dark}`,
    }}
  />
);

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
        {/* Animated red glow behind logo */}
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            background: `radial-gradient(circle, ${C.crimson}66 0%, transparent 70%)`,
            position: "absolute",
            transform: `scale(${1 + 0.1 * Math.sin(frame * 0.08)})`,
            filter: "blur(20px)",
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

// ── SCENE 2: Mission ──
const MissionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - SECTION.mission.start;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);
  const headerY = interpolate(springIn(localFrame, fps, 0), [0, 1], [40, 0]);

  const beliefs = [
    { icon: "🎯", title: "Purpose-Driven", desc: "Every feature solves a real problem" },
    { icon: "🔒", title: "No Subscriptions", desc: "One-time purchase, yours forever" },
    { icon: "📶", title: "Offline-First", desc: "Works without internet, always" },
    { icon: "🛡️", title: "Your Data, Your Device", desc: "Private by design, not by policy" },
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
          Simple tools. <span style={{ color: C.crimsonLight }}>No bloat.</span> No guesswork.
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
            const delay = 40 + i * 12;
            const progress = springIn(localFrame, fps, delay);
            const cardY = interpolate(progress, [0, 1], [60, 0]);
            const cardOpacity = clamp(localFrame - delay, [0, 15], [0, 1]);
            return (
              <div
                key={i}
                style={{
                  background: C.surfaceCard,
                  border: `1px solid ${C.crimsonDark}50`,
                  borderRadius: 16,
                  padding: "32px 28px",
                  width: 240,
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
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

// ── SCENE 3: Products ──
const ProductsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - SECTION.products.start;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  const products = [
    {
      icon: "🌾",
      name: "Farm Land Manager",
      price: "$49",
      tagline: "Track your land, your way",
      features: ["Owner & parcel records", "Activity logging & goals", "Offline-first PWA"],
    },
    {
      icon: "🐄",
      name: "HerdLook",
      price: "$79",
      tagline: "Camera-powered herd management",
      features: ["Photo-based animal ID", "11 record types", "Offline-first PWA"],
    },
    {
      icon: "💡",
      name: "Idea Validator",
      price: "FREE",
      tagline: "Test before you invest",
      features: ["6-question assessment", "Instant scored verdict", "Offline-first PWA"],
    },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.08} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
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
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Ready-made apps. <span style={{ color: C.gold }}>Real solutions.</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 50,
          }}
        >
          {products.map((p, i) => {
            const delay = 30 + i * 18;
            const progress = springIn(localFrame, fps, delay);
            const cardY = interpolate(progress, [0, 1], [80, 0]);
            const cardOpacity = clamp(localFrame - delay, [0, 15], [0, 1]);
            return (
              <div
                key={i}
                style={{
                  background: `linear-gradient(180deg, ${C.surfaceCard} 0%, #14141480 100%)`,
                  border: `1px solid ${p.price === "FREE" ? C.gold + "60" : C.crimsonDark + "40"}`,
                  borderRadius: 16,
                  padding: "36px 28px",
                  width: 280,
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 14 }}>{p.icon}</div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: C.white,
                    marginBottom: 4,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 15, color: C.gray400, marginBottom: 14, lineHeight: 1.5 }}>
                  {p.tagline}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: p.price === "FREE"
                      ? `${C.gold}22`
                      : `${C.crimson}22`,
                    color: p.price === "FREE" ? C.gold : C.crimsonLight,
                    fontSize: 14,
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: 6,
                    marginBottom: 16,
                  }}
                >
                  {p.price === "FREE" ? "FREE" : `One-Time · ${p.price}`}
                </div>
                <div>
                  {p.features.map((f, fi) => {
                    const fDelay = delay + 30 + fi * 6;
                    const fOpacity = clamp(localFrame - fDelay, [0, 10], [0, 1]);
                    return (
                      <div
                        key={fi}
                        style={{
                          fontSize: 15,
                          color: C.gray400,
                          padding: "3px 0",
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
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 4: Custom Build Services ──
const ServicesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - SECTION.services.start;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  const bizTypes = [
    { icon: "🌾", label: "Farms" },
    { icon: "🛒", label: "E-commerce" },
    { icon: "🍳", label: "Restaurants" },
    { icon: "🏠", label: "Real Estate" },
    { icon: "🔧", label: "Contractors" },
    { icon: "📊", label: "Consulting" },
    { icon: "🐾", label: "Pet Services" },
    { icon: "🎨", label: "Creative Studios" },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.08} />
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
        <div
          style={{
            display: "inline-block",
            background: C.gold,
            color: C.dark,
            fontSize: 22,
            fontWeight: 800,
            padding: "12px 36px",
            borderRadius: 10,
            marginTop: 30,
            opacity: clamp(localFrame - 20, [0, 15], [0, 1]),
            boxShadow: `0 0 30px ${C.gold}44`,
          }}
        >
          Starting at $75
        </div>
        <div
          style={{
            fontSize: 20,
            color: C.gray400,
            marginTop: 40,
            marginBottom: 24,
            opacity: clamp(localFrame - 30, [0, 15], [0, 1]),
          }}
        >
          We build for industries like…
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
            maxWidth: 800,
          }}
        >
          {bizTypes.map((b, i) => {
            const delay = 45 + i * 8;
            const progress = springIn(localFrame, fps, delay);
            const opacity = clamp(localFrame - delay, [0, 10], [0, 1]);
            const y = interpolate(progress, [0, 1], [30, 0]);
            return (
              <div
                key={i}
                style={{
                  background: `${C.crimson}15`,
                  border: `1px solid ${C.crimsonDark}40`,
                  borderRadius: 10,
                  padding: "14px 22px",
                  fontSize: 17,
                  fontWeight: 600,
                  color: C.gray200,
                  opacity,
                  transform: `translateY(${y}px)`,
                }}
              >
                <span style={{ fontSize: 22 }}>{b.icon}</span> {b.label}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE 5: Trust ──
const TrustScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - SECTION.trust.start;

  const headerOpacity = clamp(localFrame, [0, 20], [0, 1]);

  const trustItems = [
    { icon: "📶", title: "Offline-Ready", desc: "Works without internet. Always." },
    { icon: "🔒", title: "Data Private", desc: "Your data stays on your device." },
    { icon: "💳", title: "Stripe Secure", desc: "Industry-standard checkout. PCI compliant." },
    { icon: "🛡️", title: "No Subscriptions", desc: "One-time purchase or free. Period." },
  ];

  return (
    <AbsoluteFill>
      <GradientBG />
      <Particles opacity={0.08} />
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
            gap: 28,
            marginTop: 50,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {trustItems.map((t, i) => {
            const delay = 25 + i * 15;
            const progress = springIn(localFrame, fps, delay);
            const y = interpolate(progress, [0, 1], [50, 0]);
            const opacity = clamp(localFrame - delay, [0, 12], [0, 1]);
            return (
              <div
                key={i}
                style={{
                  background: C.surfaceCard,
                  border: `1px solid ${C.gold}25`,
                  borderRadius: 14,
                  padding: "28px 24px",
                  width: 250,
                  opacity,
                  transform: `translateY(${y}px)`,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.gold,
                    marginBottom: 6,
                  }}
                >
                  {t.title}
                </div>
                <div style={{ fontSize: 16, color: C.gray400, lineHeight: 1.5 }}>
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
  const localFrame = frame - SECTION.cta.start;

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
      <Particles opacity={0.12} />
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
          }}
        >
          jaderosetech.com
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
  const localFrame = frame - SECTION.endcard.start;

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
        <div style={{ fontSize: 20, color: C.gray400 }}>
          jaderosetech.com
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

      {/* ── Audio Tracks ── */}
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