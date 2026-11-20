import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "San Bartolome High School | LMS",
  description: "Learning without boundaries.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
