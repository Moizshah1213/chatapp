// src/app/layout.tsx
import "./globals.css";
import { GeistSans } from 'geist/font/sans'; 
import { GeistMono } from 'geist/font/mono'; 
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import {toast, Toaster} from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} antialiased bg-[#0f0f0f] text-white`}>
        <ClientLayout>{children}</ClientLayout>
         <Toaster position="top-right" reverseOrder={false} toastOptions={{
        // 🚀 Yeh style property ensure karegi ke toast har cheez ke upar ho
        style: {
          zIndex: 99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999, 
         
        },
      }}  />
      </body>
    </html>
  );
}