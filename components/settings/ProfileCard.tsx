"use client";

import {
  Camera,
  Mail,
  Globe,
  Star,
} from "lucide-react";

export default function ProfileCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <h2 className="text-xl font-bold mb-6">
        Profile Information
      </h2>

      {/* Avatar + Name */}
      <div className="flex items-start gap-5">

        <div className="relative">

          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-bold">
            VK
          </div>

          <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center">
            <Camera size={18} />
          </button>

        </div>

        <div className="flex-1">

          <div className="flex items-center gap-3">

            <h3 className="text-2xl font-bold">
              Amal Sibu.
            </h3>

            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
              <Star size={14} />
              Pro User
            </span>

          </div>

          <p className="mt-3 text-gray-600">
            You're on a <strong>6 day streak</strong>. Keep it up! 🔥
          </p>

        </div>

      </div>

      {/* Email */}

      <div className="mt-8">

        <label className="text-sm text-gray-500">
          Email
        </label>

        <div className="mt-2 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Mail size={18} className="text-gray-500" />

            <span className="font-medium">
              amalsibu7@gmail.com
            </span>

          </div>

          <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition">
            Change Email
          </button>

        </div>

      </div>

      {/* Timezone */}

      <div className="mt-6">

        <label className="text-sm text-gray-500">
          Timezone
        </label>

        <div className="mt-2 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Globe size={18} className="text-gray-500" />

            <span className="font-medium">
              (GMT-05:00) Toronto
            </span>

          </div>

          <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition">
            Change
          </button>

        </div>

      </div>

    </div>
  );
}