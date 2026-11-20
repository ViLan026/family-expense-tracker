import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chi tiêu gia đình",
  description: "Ghi lại và theo dõi các khoản chi trong gia đình",
};

export const viewport: Viewport = { themeColor: "#710014" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}