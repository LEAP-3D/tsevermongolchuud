import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Safe-kid | Parental Control Dashboard",
  description: "Monitor browsing activity, set time limits, and keep kids safe online with Safe-kid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
