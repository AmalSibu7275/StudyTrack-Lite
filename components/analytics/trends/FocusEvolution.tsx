"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

import useAnalytics, {
  getSessionDate,
  getProductivity,
} from "../useAnalytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function getMonday(date: Date) {
  const result = new Date(date);

  const day = result.getDay();

  const diff =
    day === 0 ? 6 : day - 1;

  result.setDate(
    result.getDate() - diff
  );

  result.setHours(0, 0, 0, 0);

  return result;
}

export default function FocusEvolution() {
  const {
    sessions,
    loading,
  } = useAnalytics();

  const weeks: Record<
    string,
    {
      start: Date;
      scores: number[];
    }
  > = {};

  sessions.forEach((session) => {
    const date =
      getSessionDate(session);

    if (!date) {
      return;
    }

    const score =
      getProductivity(session);

    if (
      score <= 0 ||
      score > 10
    ) {
      return;
    }

    const weekStart =
      getMonday(date);

    const key =
      `${weekStart.getFullYear()}-${String(
        weekStart.getMonth() + 1
      ).padStart(2, "0")}-${String(
        weekStart.getDate()
      ).padStart(2, "0")}`;

    if (!weeks[key]) {
      weeks[key] = {
        start: weekStart,
        scores: [],
      };
    }

    weeks[key].scores.push(
      score
    );
  });

  const sortedWeeks =
    Object.entries(weeks)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .slice(-8);

  const labels =
    sortedWeeks.map(
      ([, data]) =>
        data.start.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        )
    );

  const focusValues =
    sortedWeeks.map(
      ([, data]) => {
        if (
          data.scores.length === 0
        ) {
          return null;
        }

        return Number(
          (
            data.scores.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
            data.scores.length
          ).toFixed(1)
        );
      }
    );

  const allScores = sessions
    .map((session) =>
      getProductivity(session)
    )
    .filter(
      (score) =>
        score > 0 &&
        score <= 10
    );

  const currentFocus =
    focusValues.length > 0
      ? [
          ...focusValues,
        ]
          .reverse()
          .find(
            (
              value
            ): value is number =>
              value !== null
          ) ?? 0
      : 0;

  const averageFocus =
    allScores.length > 0
      ? allScores.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / allScores.length
      : 0;

  const data = {
    labels,

    datasets: [
      {
        label: "Focus Score",
        data: focusValues,
        borderColor: "#8B5CF6",
        backgroundColor: "#8B5CF6",
        tension: 0.4,
        fill: false,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index" as const,
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context: any) =>
            ` Focus Score: ${
              context.parsed.y ?? 0
            }/10`,
        },
      },
    },

    scales: {
      y: {
        min: 0,
        max: 10,
        beginAtZero: true,

        title: {
          display: true,
          text: "Focus Score",
        },
      },

      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <div className="flex justify-between items-start mb-6">

        <div>
          <h2 className="text-lg font-semibold">
            Focus Score Evolution
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Weekly average productivity
          </p>
        </div>

        {!loading && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700">
            Live
          </span>
        )}

      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center text-gray-400">
          Loading focus data...
        </div>
      ) : sortedWeeks.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-gray-400 text-sm text-center">
          Complete sessions with productivity scores to see your focus evolution.
        </div>
      ) : (
        <>
          <div className="h-56">
            <Line
              data={data}
              options={options}
            />
          </div>

          <div className="mt-6 flex justify-between">

            <div>
              <p className="text-gray-400 text-sm">
                Current
              </p>

              <h3 className="text-2xl font-bold">
                {currentFocus > 0
                  ? `${currentFocus.toFixed(
                      1
                    )}`
                  : "—"}
              </h3>

              <p className="text-xs text-gray-400">
                Latest week
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">
                Average
              </p>

              <h3 className="text-2xl font-bold">
                {averageFocus > 0
                  ? averageFocus.toFixed(
                      1
                    )
                  : "—"}
              </h3>

              <p className="text-xs text-gray-400">
                All recorded sessions
              </p>
            </div>

          </div>
        </>
      )}

    </div>
  );
}