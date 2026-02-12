"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 opacity-30">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px] animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-[120px] animate-pulse delay-1000"></div>
    </div>
  );
}
