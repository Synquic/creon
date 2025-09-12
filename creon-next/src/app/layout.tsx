import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/utils/providers";

export const metadata: Metadata = {
  title: "Creon - Synquic",
  description:
    "Your Links,Your Story, Creon create a stunning bio page that showcases all your links, products, and social media in one place. Built for creators, businesses, and influencers who want to make an impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
