import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "Sable — Transportation spend, understood.",
    description:
      "Freight invoice audit for mid-market shippers. Sable finds recoverable transportation overcharges and shows the evidence behind every finding.",
    metadataBase: new URL(origin),
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Sable — Transportation spend, understood.",
      description: "Freight audits with evidence attached.",
      images: [{ url: `${origin}/og.png`, width: 1730, height: 909, alt: "Sable — Transportation spend, understood." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Sable — Transportation spend, understood.",
      description: "Freight audits with evidence attached.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
