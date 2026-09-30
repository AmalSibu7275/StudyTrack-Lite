"use client";

import Insights from "@/components/insights/Insights";

export default function InsightsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      <main className="flex-1 overflow-y-auto p-6 md:p-8">

        <div className="mt-8">
          <Insights />
        </div>

      </main>

    </div>
  );
}