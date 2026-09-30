"use client";

import Sidebar from "@/components/Sidebar";
import { AppearanceProvider } from "@/components/settings/AppearanceProvider";
import ToastProvider from "@/components/ui/ToastProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppearanceProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 min-w-0">
          {children}
        </main>

        <ToastProvider />
      </div>
    </AppearanceProvider>
  );
}