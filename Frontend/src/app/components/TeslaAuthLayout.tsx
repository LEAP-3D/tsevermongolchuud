"use client";
/* eslint-disable max-lines */

import type { ReactNode } from "react";
import Link from "next/link";

type TeslaAuthLayoutProps = {
  mode: "signin" | "signup";
  children: ReactNode;
  onModeChange?: (mode: "signin" | "signup") => void;
};

export default function TeslaAuthLayout({
  mode,
  children,
  onModeChange,
}: TeslaAuthLayoutProps) {
  return (
    <div className="tesla-auth tesla-auth-layout" suppressHydrationWarning>
      <div className="tesla-auth__bg" />
      <div className="tesla-auth__grid" />
      <div className="tesla-auth__orb tesla-auth__orb--one" />
      <div className="tesla-auth__orb tesla-auth__orb--two" />

      <div className="tesla-auth__content">
        <section className="tesla-auth__branding">
          <h1 className="tesla-auth__title">Safe Kids</h1>
          <p className="tesla-auth__subtitle">
            Protect your children online with smart parental controls and safe browsing features.
          </p>
        </section>

        <section className="tesla-auth__panel">
          <div className="tesla-auth__card">
            <div className="tesla-auth__toggle" data-mode={mode}>
              {onModeChange ? (
                <>
                  <button
                    type="button"
                    onClick={() => onModeChange("signin")}
                    className={`tesla-auth__toggle-btn ${mode === "signin" ? "is-active" : ""}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => onModeChange("signup")}
                    className={`tesla-auth__toggle-btn ${mode === "signup" ? "is-active" : ""}`}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`tesla-auth__toggle-btn ${mode === "signin" ? "is-active" : ""}`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign"
                    className={`tesla-auth__toggle-btn ${mode === "signup" ? "is-active" : ""}`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <span className="tesla-auth__toggle-indicator" />
            </div>

            <div className="tesla-auth__form">
              <div className="tesla-auth__form-inner" key={mode}>
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .tesla-auth {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #f5f6ff;
          color: #000;
          font-family: var(--font-space-grotesk), "Inter", "Segoe UI", sans-serif;
          overflow-x: hidden;
        }

        .tesla-auth__bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 22% 40%, rgba(124, 92, 255, 0.2) 0%, transparent 52%),
            radial-gradient(circle at 78% 30%, rgba(171, 186, 255, 0.32) 0%, transparent 55%),
            radial-gradient(circle at 60% 85%, rgba(254, 205, 211, 0.25) 0%, transparent 48%);
          animation: gradientShift 18s ease infinite;
        }

        .tesla-auth__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99, 102, 241, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.035) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
        }

        .tesla-auth__orb {
          position: absolute;
          border-radius: 999px;
          opacity: 0.45;
          mix-blend-mode: multiply;
          animation: float 12s ease-in-out infinite;
        }

        .tesla-auth__orb--one {
          width: 360px;
          height: 360px;
          left: -80px;
          bottom: 10%;
          background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.55), rgba(99, 102, 241, 0));
        }

        .tesla-auth__orb--two {
          width: 260px;
          height: 260px;
          right: 6%;
          top: 6%;
          background: radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.4), rgba(236, 72, 153, 0));
          animation-delay: -4s;
        }

        .tesla-auth__content {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          gap: 3.5rem;
          padding: 4.5rem 3.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (min-width: 1024px) {
          .tesla-auth__content {
            grid-template-columns: 1fr 1fr;
          }
        }

        .tesla-auth__branding {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem 2rem;
          animation: slideInLeft 0.8s ease-out;
        }

        .tesla-auth__title {
          font-size: clamp(2.75rem, 6vw, 4.5rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.25rem;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #5c4bff 0%, #8f7cff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .tesla-auth__subtitle {
          font-size: 1.35rem;
          line-height: 1.7;
          color: rgba(15, 23, 42, 0.6);
          max-width: 500px;
          font-weight: 400;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .tesla-auth__panel {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: slideInRight 0.8s ease-out;
        }

        .tesla-auth__card {
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 30px;
          padding: 2.75rem 2.5rem 3rem;
          box-shadow:
            0 28px 80px rgba(99, 102, 241, 0.2),
            0 8px 24px rgba(15, 23, 42, 0.08);
        }

        .tesla-auth__toggle {
          position: relative;
          display: flex;
          background: rgba(99, 102, 241, 0.12);
          border-radius: 14px;
          padding: 6px;
          margin-bottom: 2rem;
          height: 52px;
          border: 1px solid rgba(99, 102, 241, 0.16);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
          align-items: center;
          gap: 6px;
        }

        .tesla-auth__toggle-btn {
          position: relative;
          z-index: 2;
          background: transparent;
          border: none;
          color: rgba(100, 116, 139, 0.9);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0;
          cursor: pointer;
          transition: color 0.3s ease;
          border-radius: 10px;
          text-align: center;
          text-decoration: none;
          display: grid;
          place-items: center;
          line-height: 1.1;
          height: 100%;
          width: 100%;
          flex: 1 1 0%;
        }

        .tesla-auth__toggle-btn.is-active {
          color: #0b1220;
        }

        .tesla-auth__toggle-indicator {
          position: absolute;
          top: 6px;
          left: 6px;
          width: calc(50% - 6px);
          height: calc(100% - 12px);
          background: linear-gradient(180deg, #ffffff 0%, #f7f8ff 100%);
          border-radius: 10px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
          box-shadow:
            0 6px 14px rgba(99, 102, 241, 0.18),
            inset 0 -1px 0 rgba(99, 102, 241, 0.08);
          will-change: left;
        }

        .tesla-auth__toggle[data-mode="signup"] .tesla-auth__toggle-indicator {
          transform: translateX(calc(100% + 6px));
        }

        .tesla-auth__toggle[data-mode="signin"] .tesla-auth__toggle-indicator {
          transform: translateX(0%);
        }

        .tesla-auth__form {
          min-height: 520px;
          display: flex;
          flex-direction: column;
        }



        .tesla-auth__form-inner {
          width: 100%;
          animation: fadeSlide 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .tesla-auth__form :global(.cl-rootBox) {
          width: 100%;
        }

        .tesla-auth__form :global(.cl-card) {
          box-shadow: none;
          border: none;
        }

        .tesla-auth__form :global(.cl-badge),
        .tesla-auth__form :global(.cl-footer),
        .tesla-auth__form :global(.cl-footerAction),
        .tesla-auth__form :global(.cl-footerActionLink),
        .tesla-auth__form :global(.cl-devModeNotice) {
          display: none !important;
        }

        .tesla-auth__form :global(.cl-header) {
          padding-bottom: 0;
        }

        @keyframes gradientShift {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.995);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 1023px) {
          .tesla-auth__content {
            padding: 2.5rem 1.75rem;
          }

          .tesla-auth__branding {
            text-align: center;
            padding: 1rem;
          }

          .tesla-auth__subtitle {
            margin: 0 auto;
          }
        }

        @media (max-width: 640px) {
          .tesla-auth {
            overflow-y: auto;
          }

          .tesla-auth__content {
            padding: 1.5rem max(1rem, env(safe-area-inset-left)) 2rem
              max(1rem, env(safe-area-inset-right));
            gap: 1.5rem;
            min-height: auto;
          }

          .tesla-auth__card {
            padding: 1.5rem 1rem 1.75rem;
            border-radius: 20px;
            width: min(100%, 420px);
            margin: 0 auto;
          }

          .tesla-auth__toggle {
            height: 46px;
            padding: 5px;
            border-radius: 12px;
            margin-bottom: 1.5rem;
          }

          .tesla-auth__toggle-btn {
            font-size: 0.9rem;
          }

          .tesla-auth__form {
            min-height: 0;
          }

          .tesla-auth__branding {
            padding: 0.25rem 0.5rem;
            align-items: center;
          }

          .tesla-auth__title {
            font-size: clamp(2rem, 9vw, 3rem);
            text-align: center;
          }

          .tesla-auth__subtitle {
            font-size: 1.05rem;
            text-align: center;
            max-width: 26rem;
          }

          .tesla-auth__orb {
            display: none;
          }
        }

        @media (max-width: 375px) {
          .tesla-auth__content {
            padding: 1.25rem 0.75rem 1.75rem;
          }

          .tesla-auth__card {
            padding: 1.25rem 0.9rem 1.5rem;
            width: 100%;
          }

          .tesla-auth__toggle {
            height: 44px;
          }

          .tesla-auth__title {
            font-size: 1.9rem;
          }

          .tesla-auth__subtitle {
            font-size: 1rem;
          }
        }

        @media (max-width: 430px) {
          .tesla-auth__content {
            padding-left: max(0.85rem, env(safe-area-inset-left));
            padding-right: max(0.85rem, env(safe-area-inset-right));
          }
        }
      `}</style>
    </div>
  );
}
