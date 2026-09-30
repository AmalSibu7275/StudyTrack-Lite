"use client";

import {
  Clock,
  Target,
  Zap,
  BookOpen,
} from "lucide-react";

import { CalendarDayData } from "./Calendar";

type Props = {
  data: CalendarDayData;
};

export default function SelectedDay({
  data,
}: Props) {
  const formattedDate =
    data.date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

  function formatDuration(
    minutes: number
  ) {
    if (minutes === 0) {
      return "0m";
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remaining =
      minutes % 60;

    if (hours === 0) {
      return `${remaining}m`;
    }

    if (remaining === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remaining}m`;
  }

  function getSessionType(
    session: CalendarDayData["sessions"][number]
  ) {
    return (
      session.sessionType ??
      "Study"
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <p className="text-sm text-gray-500">
            Selected Day
          </p>

          <h2 className="text-2xl font-bold mt-1">
            {formattedDate}
          </h2>
        </div>

        <div className="accent-light-bg rounded-2xl px-5 py-3">

          <p className="text-xs text-gray-500">
            Total Study Time
          </p>

          <p className="text-xl font-bold accent-text">
            {formatDuration(
              data.totalMinutes
            )}
          </p>

        </div>

      </div>

      {/* Daily stats */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <DailyStat
          icon={
            <BookOpen size={18} />
          }
          label="Sessions"
          value={String(
            data.sessions.length
          )}
        />

        <DailyStat
          icon={
            <Target size={18} />
          }
          label="Productivity"
          value={
            data.averageProductivity
              ? `${data.averageProductivity.toFixed(
                  1
                )}/10`
              : "—"
          }
        />

        <DailyStat
          icon={
            <Clock size={18} />
          }
          label="Study Time"
          value={formatDuration(
            data.totalMinutes
          )}
        />

      </div>

      {/* Sessions */}

      {data.sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center">

          <Zap
            size={28}
            className="mx-auto text-gray-300"
          />

          <p className="mt-3 font-medium text-gray-500">
            No study sessions
          </p>

          <p className="text-sm text-gray-400 mt-1">
            You didn't record any study sessions on this day.
          </p>

        </div>
      ) : (
        <div className="space-y-3">

          <h3 className="font-semibold text-lg">
            Study Sessions
          </h3>

          {data.sessions
            .slice()
            .sort((a, b) => {
              const aTime =
                getTime(a);

              const bTime =
                getTime(b);

              return (
                bTime - aTime
              );
            })
            .map((session) => (
              <SessionRow
                key={session.id}
                session={session}
              />
            ))}

        </div>
      )}

    </div>
  );
}

function DailyStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">

      <div className="flex items-center gap-2 text-gray-400">
        {icon}

        <span className="text-sm">
          {label}
        </span>
      </div>

      <p className="text-xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}

function SessionRow({
  session,
}: {
  session: CalendarDayData["sessions"][number];
}) {
  const productivity =
    Number(
      session.productivityScore
    );

  const duration =
    Number(session.duration) || 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition">

      <div className="flex items-center gap-4">

        <div className="w-10 h-10 rounded-xl accent-light-bg flex items-center justify-center">
          <BookOpen
            size={18}
            className="accent-text"
          />
        </div>

        <div>

          <p className="font-semibold">
            {session.taskName ||
              "Study Session"}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-1">

            <span className="text-sm text-gray-500">
              {session.sessionType ||
                "Study"}
            </span>

            {session.energyAfter && (
              <>
                <span className="text-gray-300">
                  •
                </span>

                <span className="text-sm text-gray-500">
                  Energy:{" "}
                  {session.energyAfter}
                </span>
              </>
            )}

          </div>

        </div>

      </div>

      <div className="flex items-center gap-5">

        <div className="text-right">

          <p className="text-sm text-gray-400">
            Duration
          </p>

          <p className="font-semibold">
            {formatMinutes(
              duration
            )}
          </p>

        </div>

        {productivity > 0 && (
          <div className="text-right">

            <p className="text-sm text-gray-400">
              Focus
            </p>

            <p className="font-semibold accent-text">
              {productivity.toFixed(1)}/10
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

function formatMinutes(
  minutes: number
) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  const remaining =
    minutes % 60;

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
}

function getTime(
  session: CalendarDayData["sessions"][number]
) {
  const value = session.createdAt;

  if (!value) {
    return 0;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (
      value as { toDate?: unknown }
    ).toDate === "function"
  ) {
    return (
      value as {
        toDate: () => Date;
      }
    )
      .toDate()
      .getTime();
  }

  const date = new Date(
    value as string | Date
  );

  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime();
}