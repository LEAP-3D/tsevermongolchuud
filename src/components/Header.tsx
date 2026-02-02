// src/components/Header.tsx
"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";

type HeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
      <div className="text-lg font-semibold text-gray-800">
        Welcome back, {user?.name || "User"}
      </div>

      <div className="flex items-center gap-4">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200" />
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <LogOutIcon className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </header>
  );
}
