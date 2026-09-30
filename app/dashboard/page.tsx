"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import SessionForm from "@/components/SessionForm";
import SessionList from "@/components/SessionList";
import WeeklyChart from "@/components/WeeklyChart";
import InsightsPanel from "@/components/InsightsPanel";
import Recommendations from "@/components/Recommendations";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 md:px-8 xl:px-10 py-6 overflow-y-auto">
        <Header />

        {/* Stats */}
        <div className="mt-6">
          <StatsCards />
        </div>

        {/* Main dashboard row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          {/* Session Form */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-full">
              <SessionForm />
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="xl:col-span-5">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 min-h-[450px]">
              <WeeklyChart />
            </div>
          </div>

          {/* Insights */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-full">
              <InsightsPanel />
            </div>
          </div>
        </div>

        {/* Recent sessions + recommendations */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          <div className="xl:col-span-7">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <SessionList />
            </div>
          </div>

          <div className="xl:col-span-5">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <Recommendations />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}