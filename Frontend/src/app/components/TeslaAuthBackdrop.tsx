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
    <div className={`tesla-auth tesla-auth-backdrop ${className ?? ""}`}>
      <div className="tesla-auth__bg" />
      <div className="tesla-auth__grid" />
      <div className="tesla-auth__orb tesla-auth__orb--one" />
      <div className="tesla-auth__orb tesla-auth__orb--two" />
      <div className="tesla-auth__content">{children}</div>
    </div>
  );
}
