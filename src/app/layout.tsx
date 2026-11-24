import type { Metadata } from "next";
import "@/styles.css";
import { ClientShell } from "@/components/site/ClientShell";

export const metadata: Metadata = {
  title: "Perfect Jodi — जहाँ रिश्ते बनें खास | A Journey Towards Forever ❤️",
  description:
    "Perfect Jodi — जहाँ रिश्ते बनें खास. A Journey Towards Forever ❤️. India-first matrimony for brides, grooms and families. Verified profiles, detailed search and private connections.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-gold/30 selection:text-foreground">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
