"use client";

import { toast } from "sonner";

import useAnalytics from "./useAnalytics";

import {
  exportCSV,
  exportJSON,
  exportPDF,
} from "@/utils/exportData";

export default function ExportPanel() {
  const { sessions, loading } =
    useAnalytics();

  function handleCSV() {
    if (sessions.length === 0) {
      toast.error("No data to export", {
        description:
          "Add some study sessions first.",
      });

      return;
    }

    exportCSV(sessions);
  }

  function handleJSON() {
    if (sessions.length === 0) {
      toast.error("No data to export", {
        description:
          "Add some study sessions first.",
      });

      return;
    }

    exportJSON(sessions);
  }

  function handlePDF() {
    if (sessions.length === 0) {
      toast.error("No data to export", {
        description:
          "Add some study sessions first.",
      });

      return;
    }

    exportPDF(sessions);
  }

  return (
    <div>

      <h2 className="text-2xl font-bold mb-2">
        Export Analytics
      </h2>

      <p className="text-gray-500 mb-6">
        Download your study history and analytics data.
      </p>

      <div className="flex flex-wrap gap-4">

        <button
          onClick={handleCSV}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          Export CSV
        </button>

        <button
          onClick={handlePDF}
          disabled={loading}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl disabled:opacity-50"
        >
          Export PDF
        </button>

        <button
          onClick={handleJSON}
          disabled={loading}
          className="border px-6 py-3 rounded-xl disabled:opacity-50"
        >
          Export JSON
        </button>

      </div>

      <div className="mt-6 text-sm text-gray-500">
        {loading
          ? "Loading sessions..."
          : `${sessions.length} session(s) ready for export`}
      </div>

    </div>
  );
}