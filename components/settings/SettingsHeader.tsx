"use client";

import { Bell, Download } from "lucide-react";

export default function SettingsHeader() {
  return (
    <div className="flex items-start justify-between">

      <div>
        <h1 className="text-5xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-2 text-gray-500 text-lg">
          Customize your experience and manage your preferences.
        </p>
      </div>

      <div className="flex items-center gap-5">

        <button className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium shadow-sm hover:bg-gray-50 transition">

          <Download size={18} />

          Export My Data

        </button>

        <button className="relative">

          <Bell
            size={24}
            className="text-gray-600"
          />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />

        </button>

        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
          VK
        </div>

      </div>

    </div>
  );
}