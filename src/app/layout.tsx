import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { MainLayout } from "@/components/layout/MainLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { defaultSiteMetadata } from "@/lib/seo/metadata";
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = defaultSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} d-flex flex-column min-vh-100`}>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <AppProviders>
          <MainLayout>{children}</MainLayout>
        </AppProviders>
      </body>
    </html>
  );
}
