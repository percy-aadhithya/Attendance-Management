import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Academy Manager",
  description: "Attendance and Admission Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <div className="flex min-h-screen w-full flex-col md:flex-row">
          <Sidebar />
          <div className="flex flex-col flex-1 sm:gap-4 lg:gap-6">
            <MobileHeader />
            <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:py-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
