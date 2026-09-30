"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

import useAnalytics from "./useAnalytics";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function SessionTypePerformance() {
  const { sessions, loading } =
    useAnalytics();

  const counts: Record<
    string,
    number
  > = {};

  sessions.forEach((session) => {
    const type =
      session.sessionType ||
      "Other";

    counts[type] =
      (counts[type] || 0) + 1;
  });

  const labels = Object.keys(counts);

  const values = labels.map(
    (label) => counts[label]
  );

  const colors = [
    "#2563EB",
    "#06B6D4",
    "#8B5CF6",
    "#F59E0B",
    "#22C55E",
    "#EF4444",
  ];

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(
          (_, index) =>
            colors[
              index % colors.length
            ]
        ),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <h2 className="text-xl font-semibold">
        Session Type Performance
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Distribution of study sessions
      </p>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          Loading...
        </div>
      ) : labels.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No sessions yet.
        </div>
      ) : (
        <div className="h-64">
          <Doughnut
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "70%",
              plugins: {
                legend: {
                  position: "bottom",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}