"use client";

import {
  Shield,
  Lock,
  LogOut,
  Trash2,
} from "lucide-react";

export default function AccountActions() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

      <h2 className="text-xl font-bold mb-6">
        Account Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 py-8 hover:bg-gray-50 transition">

          <Shield
            className="text-yellow-500"
            size={28}
          />

          <span className="font-semibold">
            Upgrade Plan
          </span>

        </button>

        <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 py-8 hover:bg-gray-50 transition">

          <Lock
            className="text-blue-600"
            size={28}
          />

          <span className="font-semibold">
            Change Password
          </span>

        </button>

        <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 py-8 hover:bg-gray-50 transition">

          <LogOut
            className="text-orange-500"
            size={28}
          />

          <span className="font-semibold">
            Log Out
          </span>

        </button>

        <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 py-8 text-red-600 hover:bg-red-50 transition">

          <Trash2 size={28} />

          <span className="font-semibold">
            Delete Account
          </span>

        </button>

      </div>

    </div>
  );
}