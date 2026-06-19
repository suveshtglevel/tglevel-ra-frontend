import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  title: {
    default: "Research Analyst Panel",
    template: "%s | Research Analyst Panel",
  },
  description: "Securely manage trade alerts, subscribers, and research operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the pre-paint script below sets zoom/--app-* on
    // <html> before React hydrates, so its style attribute intentionally differs
    // from the server markup.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the viewport scale before first paint so large screens don't
            flash the unscaled (tiny, top-left) layout before ViewportScaler
            mounts. Must mirror the constants/logic in ViewportScaler.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var s=Math.max(1,window.innerWidth/1440);var r=document.documentElement.style;r.setProperty('zoom',String(s));r.setProperty('--app-w',(window.innerWidth/s)+'px');r.setProperty('--app-h',(window.innerHeight/s)+'px');})();",
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
