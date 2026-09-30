"use client";

interface AnalyticsHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AnalyticsHeader({
  activeTab,
  setActiveTab,
}: AnalyticsHeaderProps) {
  const tabs = [
    "Overview",
    "Trends",
    "Patterns",
    "Performance",
    "Export",
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      <div>
        <h1 className="text-3xl font-bold">
          Analytics
        </h1>

        <p className="text-gray-500 mt-2">
          Analyze your study habits and productivity.
        </p>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(tab.toLowerCase())
            }
            className={`px-5 py-2 rounded-lg transition font-medium ${
              activeTab === tab.toLowerCase()
                ? "bg-white shadow text-blue-600"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

    </div>
  );
}