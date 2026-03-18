interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "oklch(6% 0.012 280)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
      }}
    >
      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.92); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 40px) scale(0.9); }
          66% { transform: translate(35px, -35px) scale(1.08); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 50px) scale(1.05); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px 4px oklch(62% 0.25 320 / 0.5), 0 0 60px 8px oklch(55% 0.28 290 / 0.3); }
          50% { box-shadow: 0 0 32px 8px oklch(62% 0.25 320 / 0.8), 0 0 80px 16px oklch(55% 0.28 290 / 0.5); }
        }
        .landing-brand { animation: fadeDown 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.1s; }
        .landing-tagline { animation: slideUp 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.4s; }
        .landing-badge-1 { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 0.7s; }
        .landing-badge-2 { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 0.85s; }
        .landing-badge-3 { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 1.0s; }
        .landing-badge-4 { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 1.15s; }
        .landing-btn { animation-name: slideUp, glowPulse; animation-duration: 0.6s, 2.5s; animation-timing-function: cubic-bezier(0.22,1,0.36,1), ease-in-out; animation-fill-mode: both, none; animation-delay: 1.3s, 1.9s; animation-iteration-count: 1, infinite; }
        .landing-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          border: 1.5px solid;
          cursor: default;
          user-select: none;
          transition: transform 0.2s;
        }
        .landing-badge:hover { transform: scale(1.07); }
        .landing-btn-el {
          cursor: pointer;
          border: none;
          outline: none;
          padding: 18px 52px;
          border-radius: 9999px;
          font-size: 18px;
          font-weight: 800;
          font-family: inherit;
          letter-spacing: 0.04em;
          background: linear-gradient(135deg, oklch(55% 0.3 320), oklch(50% 0.3 290), oklch(55% 0.28 15));
          color: #fff;
          transition: transform 0.2s, filter 0.2s;
        }
        .landing-btn-el:hover { transform: scale(1.05); filter: brightness(1.15); }
        .landing-btn-el:active { transform: scale(0.97); }
      `}</style>

      {/* Animated blobs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "oklch(50% 0.28 290 / 0.15)",
          filter: "blur(80px)",
          animation: "blob1 14s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "12%",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "oklch(55% 0.3 320 / 0.18)",
          filter: "blur(70px)",
          animation: "blob2 17s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "55%",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "oklch(55% 0.25 15 / 0.12)",
          filter: "blur(60px)",
          animation: "blob3 11s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        {/* Brand */}
        <div className="landing-brand" style={{ lineHeight: 1 }}>
          <div
            style={{
              fontSize: "clamp(52px, 13vw, 120px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background:
                "linear-gradient(135deg, #fff 30%, oklch(75% 0.18 320) 65%, oklch(72% 0.22 290))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ZENETHIC
          </div>
          <div
            style={{
              fontSize: "clamp(10px, 1.8vw, 14px)",
              letterSpacing: "0.35em",
              color: "oklch(60% 0.05 280)",
              fontWeight: 500,
              marginTop: "4px",
              textTransform: "uppercase",
            }}
          >
            Fashion · Drip · Vibe
          </div>
        </div>

        {/* Tagline */}
        <div
          className="landing-tagline"
          style={{
            fontSize: "clamp(20px, 4vw, 36px)",
            fontWeight: 700,
            color: "oklch(90% 0.04 280)",
            lineHeight: 1.25,
            maxWidth: "520px",
          }}
        >
          no cap. only drip.{" "}
          <span
            style={{
              background:
                "linear-gradient(90deg, oklch(72% 0.25 320), oklch(68% 0.28 290))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ur vibe, ur store.
          </span>
        </div>

        {/* Badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            marginTop: "4px",
          }}
        >
          <span
            className="landing-badge landing-badge-1"
            style={{
              borderColor: "oklch(68% 0.28 290 / 0.5)",
              color: "oklch(78% 0.18 290)",
              background: "oklch(68% 0.28 290 / 0.08)",
            }}
          >
            #fashion
          </span>
          <span
            className="landing-badge landing-badge-2"
            style={{
              borderColor: "oklch(68% 0.28 320 / 0.5)",
              color: "oklch(78% 0.18 320)",
              background: "oklch(68% 0.28 320 / 0.08)",
            }}
          >
            #aesthetic
          </span>
          <span
            className="landing-badge landing-badge-3"
            style={{
              borderColor: "oklch(65% 0.23 15 / 0.5)",
              color: "oklch(72% 0.2 15)",
              background: "oklch(65% 0.23 15 / 0.08)",
            }}
          >
            #streetwear
          </span>
          <span
            className="landing-badge landing-badge-4"
            style={{
              borderColor: "oklch(72% 0.2 200 / 0.5)",
              color: "oklch(78% 0.16 200)",
              background: "oklch(72% 0.2 200 / 0.08)",
            }}
          >
            #trending
          </span>
        </div>

        {/* CTA */}
        <div className="landing-btn" style={{ marginTop: "16px" }}>
          <button
            type="button"
            className="landing-btn-el"
            data-ocid="landing.primary_button"
            onClick={onStart}
          >
            Start Now →
          </button>
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "oklch(45% 0.02 280)",
            marginTop: "4px",
            animation: "slideUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "1.5s",
          }}
        >
          no login needed · free to browse
        </p>
      </div>
    </div>
  );
}
