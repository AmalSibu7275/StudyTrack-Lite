"use client";

import { Moon, Sun, Monitor } from "lucide-react";

export default function StudyPreferences() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <h2 className="text-xl font-bold mb-6">
        Study Preferences
      </h2>

      {/* Default Session */}
      <div className="mb-5">
        <label className="text-sm text-gray-500">
          Default Session Type
        </label>

        <select className="mt-2 w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Deep Work</option>
          <option>Revision</option>
          <option>Practice</option>
          <option>Reading</option>
        </select>
      </div>

      {/* Break */}
      <div className="mb-5">
        <label className="text-sm text-gray-500">
          Default Break Duration
        </label>

        <select className="mt-2 w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>5 Minutes</option>
          <option>10 Minutes</option>
          <option>15 Minutes</option>
          <option>20 Minutes</option>
        </select>
      </div>

      {/* Week */}
      <div className="mb-5">
        <label className="text-sm text-gray-500">
          Week Starts On
        </label>

        <select className="mt-2 w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Monday</option>
          <option>Sunday</option>
        </select>
      </div>

      {/* Time */}
      <div className="mb-6">
        <label className="text-sm text-gray-500">
          Time Format
        </label>

        <select className="mt-2 w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>12 Hour</option>
          <option>24 Hour</option>
        </select>
      </div>

      {/* Theme */}

      <h3 className="font-semibold mb-3">
        Theme
      </h3>

      <div className="grid grid-cols-3 gap-3">

        <button className="rounded-xl border-2 border-blue-500 bg-blue-50 py-4 flex flex-col items-center gap-2">

          <Sun size={22} />

          <span className="text-sm font-medium">
            Light
          </span>

        </button>

        <button className="rounded-xl border border-gray-200 py-4 flex flex-col items-center gap-2 hover:bg-gray-50">

          <Moon size={22} />

          <span className="text-sm">
            Dark
          </span>

        </button>

        <button className="rounded-xl border border-gray-200 py-4 flex flex-col items-center gap-2 hover:bg-gray-50">

          <Monitor size={22} />

          <span className="text-sm">
            System
          </span>

        </button>

      </div>

    </div>
  );
}