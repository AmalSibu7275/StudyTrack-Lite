"use client";

import { useState } from "react";

import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";

// Pages
import Overview from "@/components/analytics/overview/Overview";
import Trends from "@/components/analytics/trends/Trends";
import Patterns from "@/components/analytics/patterns/Patterns";
import Performance from "@/components/analytics/performance/Performance";
import Export from "@/components/analytics/export/Export";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">

        <AnalyticsHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="mt-8">

          {activeTab === "overview" && <Overview />}

          {activeTab === "trends" && <Trends />}

          {activeTab === "patterns" && <Patterns />}

          {activeTab === "performance" && <Performance />}

          {activeTab === "export" && <Export />}

        </div>

      </main>

    </div>
  );
}