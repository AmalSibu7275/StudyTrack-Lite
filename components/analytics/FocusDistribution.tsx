"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

import useAnalytics, {
  getProductivity,
} from "./useAnalytics";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function FocusDistribution() {
  const { sessions, loading } =
    useAnalytics();

  const distribution = {
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0,
  };

  sessions.forEach((session) => {
    const score =
      getProductivity(session);

    if (score >= 9) {
      distribution.excellent++;
    } else if (score >= 7) {
      distribution.good++;
    } else if (score >= 5) {
      distribution.average++;
    } else if (score > 0) {
      distribution.poor++;
    }
  });

  const data = {
    labels: [
      "Excellent (9-10)",
      "Good (7-8)",
      "Average (5-6)",
      "Poor (1-4)",
    ],
    datasets: [
      {
        data: [
          distribution.excellent,
          distribution.good,
          distribution.average,
          distribution.poor,
        ],
        backgroundColor: [
          "#22C55E",
          "#3B82F6",
          "#F59E0B",
          "#EF4444",
        ],
        borderWidth: 0,
      },
    ],
  };

  const total =
    distribution.excellent +
    distribution.good +
    distribution.average +
    distribution.poor;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <h2 className="text-xl font-semibold">
        Focus Distribution
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Based on productivity scores
      </p>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          Loading...
        </div>
      ) : total === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No productivity data yet.
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

      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Total Sessions
          </span>

          <span className="font-semibold">
            {loading ? "..." : total}
          </span>
        </div>
      </div>
    </div>
  );
}