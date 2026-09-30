"use client";

import {
  HardDrive,
  Download,
  Upload,
  Trash2,
} from "lucide-react";

export default function DataStorage() {
  const used = 68;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <HardDrive className="text-indigo-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Data & Storage
          </h2>

          <p className="text-sm text-gray-500">
            Manage your study data
          </p>
        </div>

      </div>

      {/* Storage */}

      <div className="mb-6">

        <div className="flex justify-between mb-2">

          <span className="font-medium">
            Storage Used
          </span>

          <span className="text-blue-600 font-semibold">
            {used}%
          </span>

        </div>

        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${used}%` }}
          />

        </div>

        <p className="text-sm text-gray-500 mt-2">
          680 MB of 1 GB used
        </p>

      </div>

      {/* Buttons */}

      <div className="space-y-3">

        <button className="w-full flex items-center justify-center gap-3 rounded-xl bg-blue-600 text-white py-3 hover:bg-blue-700 transition">

          <Download size={18} />

          Export My Data

        </button>

        <button className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 py-3 hover:bg-gray-50 transition">

          <Upload size={18} />

          Create Backup

        </button>

        <button className="w-full flex items-center justify-center gap-3 rounded-xl border border-red-200 text-red-600 py-3 hover:bg-red-50 transition">

          <Trash2 size={18} />

          Clear Cache

        </button>

      </div>

    </div>
  );
}