"use client";

import { Activity } from "lucide-react";

const settings = [
  {
    title: "Track Productivity",
    description: "Record productivity score after each session",
    enabled: true,
  },
  {
    title: "Track Energy Level",
    description: "Log your energy before studying",
    enabled: true,
  },
  {
    title: "Track Distractions",
    description: "Record distractions during sessions",
    enabled: false,
  },
  {
    title: "Auto Session Detection",
    description: "Automatically detect long study sessions",
    enabled: true,
  },
  {
    title: "Show Weekly Insights",
    description: "Generate AI-powered study recommendations",
    enabled: true,
  },
];

export default function TrackingSettings() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
          <Activity className="text-purple-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Tracking Settings
          </h2>

          <p className="text-sm text-gray-500">
            Control what StudyTrack records
          </p>
        </div>

      </div>

      <div className="space-y-5">

        {settings.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between"
          >
            <div>

              <h3 className="font-semibold">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500">
                {item.description}
              </p>

            </div>

            <button
              className={`w-12 h-7 rounded-full transition ${
                item.enabled
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                  item.enabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}