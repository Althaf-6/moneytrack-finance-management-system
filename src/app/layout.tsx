import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: {
    default: "MoneyTrack — Personal Finance Management",
    template: "%s · MoneyTrack",
  },
  description:
    "Track income, expenses, budgets and savings goals. A premium personal finance dashboard for students, freelancers and small business owners.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body className="bg-ink font-sans text-zinc-100 antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#101013",
              border: "1px solid #202027",
              color: "#f4f4f5",
            },
          }}
        />
      </body>
    </html>
  );
}
