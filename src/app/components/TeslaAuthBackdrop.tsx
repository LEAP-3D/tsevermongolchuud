"use client";

import type { ReactNode } from "react";

type TeslaAuthBackdropProps = {
  children: ReactNode;
  className?: string;
};

export default function TeslaAuthBackdrop({
  children,
  className,
}: TeslaAuthBackdropProps) {
  return (
    <div className={`tesla-auth ${className ?? ""}`}>
      <div className="tesla-auth__bg" />
      <div className="tesla-auth__grid" />
      <div className="tesla-auth__orb tesla-auth__orb--one" />
      <div className="tesla-auth__orb tesla-auth__orb--two" />
      <div className="tesla-auth__content">{children}</div>

      <style jsx>{`
        .tesla-auth {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #f5f6ff;
          color: #000;
          font-family: var(--font-space-grotesk), "Inter", "Segoe UI", sans-serif;
          overflow-x: hidden;
          isolation: isolate;
        }

        .tesla-auth__bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 22% 40%, rgba(124, 92, 255, 0.2) 0%, transparent 52%),
            radial-gradient(circle at 78% 30%, rgba(171, 186, 255, 0.32) 0%, transparent 55%),
            radial-gradient(circle at 60% 85%, rgba(254, 205, 211, 0.25) 0%, transparent 48%);
          animation: gradientShift 18s ease infinite;
        }

        .tesla-auth__grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
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
          pointer-events: none;
          z-index: 0;
        }

        .tesla-auth__content {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          pointer-events: auto;
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

        @media (max-width: 640px) {
          .tesla-auth {
            overflow-y: auto;
          }

          .tesla-auth__orb {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
