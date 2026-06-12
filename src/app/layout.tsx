import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InclusionScore AI Agent",
  description: "Workforce risk management, standards readiness, certification, and underwriting signals."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

