import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "NoToDrugs-Recovery-AI — AI-Powered Crisis & Prevention",
  description:
    "A multi-modal, GenAI-powered recovery and prevention platform for individuals navigating substance use disorders and their caregivers.",
  keywords: [
    "recovery",
    "substance use",
    "crisis support",
    "caregiver",
    "naloxone",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${inter.className} h-full bg-slate-950 overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
