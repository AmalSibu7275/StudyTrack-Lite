"use client";

import { Flame, Smile } from "lucide-react";
import { Session, getSessionDate } from "./Sessions";

type Props = {
  sessions: Session[];
};

export default function SessionActivity({
  sessions,
}: Props) {
  const weeks = 16;

  const days = 7;

  const grid = Array.from(
    { length: weeks },
    (_, week) =>
      Array.from({ length: days }, (_, day) => {
        const now = new Date();

        const date = new Date(now);

        date.setDate(
          now.getDate() -
            ((weeks - 1 - week) * 7 +
              (6 - day))
        );

        return getActivityLevel(
          date,
          sessions
        );
      })
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

      <div className="flex items-center justify-between mb-4">

        <div>

          <h2 className="text-sm font-semibold">
            Session Activity
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Your recent study consistency
          </p>

        </div>

      </div>

      <div className="flex gap-1.5 overflow-hidden">

        <div className="flex flex-col gap-1.5 pt-0">

          {["M", "T", "W", "T", "F", "S", "S"].map(
            (day, index) => (
              <div
                key={index}
                className="h-3 text-[9px] text-gray-400 flex items-center"
              >
                {day}
              </div>
            )
          )}

        </div>

        <div className="flex gap-1.5 overflow-hidden">

          {grid.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="flex flex-col gap-1.5"
            >
              {week.map((level, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${getActivityColor(
                    level
                  )}`}
                  title={`Activity: ${level}`}
                />
              ))}
            </div>
          ))}

        </div>

      </div>

      <div className="flex items-center gap-2 mt-4">

        <span className="text-[10px] text-gray-400">
          Less
        </span>

        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-3 h-3 rounded-sm ${getActivityColor(
              level
            )}`}
          />
        ))}

        <span className="text-[10px] text-gray-400">
          More
        </span>

      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">

        <div className="border border-orange-100 bg-orange-50 rounded-xl p-3">

          <div className="flex items-center gap-2">
            <Flame
              size={17}
              className="text-orange-500"
            />

            <span className="text-[10px] text-orange-600">
              Longest Streak
            </span>
          </div>

          <p className="font-bold mt-1">
            {calculateLongestStreak(
              sessions
            )} days
          </p>

        </div>

        <div className="border border-green-100 bg-green-50 rounded-xl p-3">

          <div className="flex items-center gap-2">

            <Smile
              size={17}
              className="text-green-600"
            />

            <span className="text-[10px] text-green-600">
              Current Streak
            </span>

          </div>

          <p className="font-bold mt-1">
            {calculateCurrentStreak(
              sessions
            )} days
          </p>

        </div>

      </div>

    </div>
  );
}

function getActivityLevel(
  date: Date,
  sessions: Session[]
) {
  const count = sessions.filter((session) => {
    const sessionDate =
      getSessionDate(session);

    if (!sessionDate) return false;

    return (
      sessionDate.toDateString() ===
      date.toDateString()
    );
  }).length;

  return Math.min(count, 4);
}

function getActivityColor(level: number) {
  switch (level) {
    case 1:
      return "bg-blue-100";
    case 2:
      return "bg-blue-300";
    case 3:
      return "bg-blue-500";
    case 4:
      return "bg-blue-600";
    default:
      return "bg-gray-100";
  }
}

function getStudyDates(sessions: Session[]) {
  return new Set(
    sessions
      .map(getSessionDate)
      .filter(Boolean)
      .map((date) => date!.toDateString())
  );
}

function calculateCurrentStreak(
  sessions: Session[]
) {
  const dates = getStudyDates(sessions);

  let streak = 0;

  const today = new Date();

  while (true) {
    const date = new Date(today);

    date.setDate(
      today.getDate() - streak
    );

    if (!dates.has(date.toDateString())) {
      break;
    }

    streak++;
  }

  return streak;
}

function calculateLongestStreak(
  sessions: Session[]
) {
  const dates = Array.from(
    getStudyDates(sessions)
  )
    .map((value) => new Date(value))
    .sort(
      (a, b) =>
        a.getTime() - b.getTime()
    );

  if (dates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const difference =
      dates[i].getTime() -
      dates[i - 1].getTime();

    if (
      difference <=
      24 * 60 * 60 * 1000
    ) {
      current++;
      longest = Math.max(
        longest,
        current
      );
    } else {
      current = 1;
    }
  }

  return longest;
}