import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SomniaGuard — Real-time Bot & Sybil Detection",
  description:
    "Real-time bot and Sybil detection dashboard for Somnia Network quest rewards. Powered by Somnia Reactivity.",
  keywords: ["Somnia", "Sybil", "bot detection", "blockchain", "reactivity", "web3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ background: "#06000f" }}
      >
        {children}
      </body>
    </html>
  );
}
