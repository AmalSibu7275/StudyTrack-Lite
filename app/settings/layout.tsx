"use client";

import Sidebar from "@/components/Sidebar";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { LanguageProvider } from "@/components/language/LanguageProvider";
import { AppearanceProvider } from "@/components/settings/AppearanceProvider";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AppearanceProvider>
        <div className="flex min-h-screen bg-gray-50">

          <Sidebar />

          <main className="flex-1 overflow-y-auto p-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              <div className="lg:col-span-3">
                <SettingsSidebar />
              </div>

              <div className="lg:col-span-9">
                {children}
              </div>

            </div>

          </main>

        </div>
      </AppearanceProvider>
    </LanguageProvider>
  );
}