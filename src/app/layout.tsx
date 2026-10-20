import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../lib/auth";
import HashHandler from "@/components/hash-handler";

export const metadata: Metadata = {
  title: "Medscope — Complete postgraduate medical exam preparation.",
  description:
    "Real past-exam recall questions, timed mocks, and analytics for NPMCN, WACP, WACS and Primaries.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col">
        <HashHandler />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
