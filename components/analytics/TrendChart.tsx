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

import { Chart } from "react-chartjs-2";

import useAnalytics, {
  getSessionDate,
  getDuration,
  getProductivity,
} from "./useAnalytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type WeekData = {
  minutes: number;
  scores: number[];
  days: Set<string>;
};

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

export default function TrendChart() {
  const {
    sessions,
    loading,
  } = useAnalytics();

  const weeks: Record<
    string,
    WeekData
  > = {};

  sessions.forEach((session) => {
    const date =
      getSessionDate(session);

    if (!date) {
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
        minutes: 0,
        scores: [],
        days: new Set<string>(),
      };
    }

    weeks[key].minutes +=
      getDuration(session);

    const score =
      getProductivity(session);

    if (
      score > 0 &&
      score <= 10
    ) {
      weeks[key].scores.push(score);
    }

    weeks[key].days.add(
      date.toDateString()
    );
  });

  const sortedWeeks =
    Object.entries(weeks)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .slice(-12);

  const labels =
    sortedWeeks.map(
      ([key]) => {
        const [year, month, day] =
          key.split("-").map(Number);

        const date = new Date(
          year,
          month - 1,
          day
        );

        return date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        );
      }
    );

  const studyHours =
    sortedWeeks.map(
      ([, data]) =>
        Number(
          (
            data.minutes / 60
          ).toFixed(2)
        )
    );

  const focusScores =
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
              (sum, score) =>
                sum + score,
              0
            ) /
            data.scores.length
          ).toFixed(1)
        );
      }
    );

  /*
   * Weekly consistency:
   * percentage of 7 days on which
   * the user studied.
   */
  const consistency =
    sortedWeeks.map(
      ([, data]) =>
        Math.round(
          (data.days.size / 7) *
            100
        )
    );

  const data = {
    labels,

    datasets: [
      {
        label: "Study Hours",
        data: studyHours,
        borderColor: "#2563EB",
        backgroundColor:
          "rgba(37, 99, 235, 0.08)",
        tension: 0.45,
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: "y",
        fill: false,
      },

      {
        label: "Focus Score",
        data: focusScores,
        borderColor: "#7C3AED",
        backgroundColor:
          "#7C3AED",
        tension: 0.45,
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: "y1",
        spanGaps: true,
        fill: false,
      },

      {
        label: "Consistency",
        data: consistency,
        borderColor: "#16A34A",
        backgroundColor:
          "#16A34A",
        tension: 0.45,
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: "y2",
        fill: false,
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
        position: "top" as const,
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value =
              context.parsed.y;

            if (
              context.dataset
                .label ===
              "Study Hours"
            ) {
              return ` Study Hours: ${Number(
                value
              ).toFixed(2)}h`;
            }

            if (
              context.dataset
                .label ===
              "Focus Score"
            ) {
              return ` Focus Score: ${
                value ?? 0
              }/10`;
            }

            return ` Consistency: ${
              value ?? 0
            }%`;
          },
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Study Hours",
        },
      },

      y1: {
        position:
          "right" as const,
        min: 0,
        max: 10,

        grid: {
          drawOnChartArea: false,
        },

        title: {
          display: true,
          text: "Focus",
        },
      },

      y2: {
        display: false,
        min: 0,
        max: 100,
      },

      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold">
            Overall Progress Over Time
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Your study hours, focus, and consistency
            over the last 12 active weeks
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium">
          Live
        </span>
      </div>

      <div className="h-[420px]">

        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Loading trends...
          </div>
        ) : sortedWeeks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Add study sessions to see your trends.
          </div>
        ) : (
          <Chart
            type="line"
            data={data}
            options={options}
          />
        )}

      </div>

    </div>
  );
}