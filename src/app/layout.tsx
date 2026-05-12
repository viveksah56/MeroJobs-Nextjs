import type {Metadata} from "next";
import {Geist_Mono, Inter} from "next/font/google";
import "./globals.css";

import {cn} from "@/lib/utils";
import {TooltipProvider} from "@/components/ui/tooltip";
import React from "react";

const geistMono = Geist_Mono({subsets: ['latin'], variable: '--font-mono'});

const interHeading = Inter({subsets: ['latin'], variable: '--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://merojobs.com"),

  title: {
    default: "Mero Jobs",
    template: "%s | Mero Jobs",
  },

  description:
      "Mero Jobs is a modern job portal platform in Nepal where companies and candidates connect for better career opportunities.",

  keywords: [
    "Mero Jobs",
    "Jobs in Nepal",
    "Nepal Job Portal",
    "IT Jobs Nepal",
    "Hiring Nepal",
    "Career Nepal",
    "Vacancy Nepal",
  ],

  authors: [
    {
      name: "Mero Jobs",
    },
  ],

  creator: "Mero Jobs",
  publisher: "Mero Jobs",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://merojobs.com",
    title: "Mero Jobs",
    description:
        "Find jobs, hire talent, and grow your career with Mero Jobs Nepal.",
    siteName: "Mero Jobs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mero Jobs",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Mero Jobs",
    description:
        "Find jobs, hire talent, and grow your career with Mero Jobs Nepal.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  alternates: {
    canonical: "https://merojobs.com",
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          suppressHydrationWarning
          className={cn("h-dvh antialiased", interHeading.variable, geistMono.variable, "font-sans", inter.variable)}
          data-scroll-behavior="smooth"
      >
      <body
          className="min-h-screen bg-background text-foreground font-sans"
          style={{
            fontFamily: "var(--font-sans), sans-serif",
          }}
      >
      <TooltipProvider>{children}</TooltipProvider>
      </body>
      </html>
  );
}