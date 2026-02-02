// src/types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  type Session = {
    user: {
      id: string;
      apiKey?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
}
