"use client";

import {
  BookOpen,
  Clock3,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

type Props = {
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  goalCompletion: number;
  sessionTypeCounts: Record<string, number>;
};

export default function SessionsStats({
  totalSessions,
  totalMinutes,
  averageScore,
  goalCompletion,
  sessionTypeCounts,
}: Props) {
  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes = totalMinutes % 60;

  const totalTypes =
    Object.values(sessionTypeCounts).reduce(
      (a, b) => a + b,
      0
    );

  const types = [
    {
      name: "Deep Work",
      color: "bg-blue-500",
    },
    {
      name: "Practice",
      color: "bg-purple-500",
    },
    {
      name: "Review",
      color: "bg-green-500",
    },
    {
      name: "Light Study",
      color: "bg-orange-400",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5">

        <Stat
          icon={<BookOpen size={22} />}
          iconClass="bg-blue-100 text-blue-600"
          value={totalSessions.toString()}
          label="Total Sessions"
          change="Your completed sessions"
        />

        <Stat
          icon={<Clock3 size={22} />}
          iconClass="bg-purple-100 text-purple-600"
          value={`${hours}h ${minutes}m`}
          label="Total Study Time"
          change="Total recorded time"
        />

        <Stat
          icon={<TrendingUp size={22} />}
          iconClass="bg-green-100 text-green-600"
          value={averageScore.toFixed(1)}
          suffix="/ 10"
          label="Avg Focus Score"
          change="Productivity average"
        />

        <Stat
          icon={<CheckCircle2 size={22} />}
          iconClass="bg-orange-100 text-orange-600"
          value={`${goalCompletion}%`}
          label="Goal Completion"
          change="Sessions completed"
        />

        <div className="flex items-center justify-center gap-5 p-3">

          <div className="relative w-20 h-20 shrink-0">

            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#2563eb 0 42%, #9333ea 42% 70%, #22c55e 70% 88%, #fb923c 88% 100%)",
              }}
            />

            <div className="absolute inset-2 rounded-full bg-white" />

          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Sessions by Type
            </p>

            <div className="space-y-1 mt-2">

              {types.map((type) => {
                const count =
                  sessionTypeCounts[type.name] ||
                  0;

                const percentage =
                  totalTypes > 0
                    ? Math.round(
                        (count /
                          totalTypes) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={type.name}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${type.color}`}
                    />

                    <span className="text-gray-500">
                      {type.name}
                    </span>

                    <span className="font-medium text-gray-700">
                      {percentage}%
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

function Stat({
  icon,
  iconClass,
  value,
  suffix,
  label,
  change,
}: {
  icon: React.ReactNode;
  iconClass: string;
  value: string;
  suffix?: string;
  label: string;
  change: string;
}) {
  return (
    <div className="flex items-center gap-4 p-3 border-b xl:border-b-0 xl:border-r border-gray-200">

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-900">
            {value}
          </span>

          {suffix && (
            <span className="text-sm text-gray-500">
              {suffix}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="text-xs text-green-600 mt-1">
          {change}
        </p>
      </div>

    </div>
  );
}