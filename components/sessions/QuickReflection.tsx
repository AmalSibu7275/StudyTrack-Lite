"use client";

import {
  Trophy,
  Smile,
  Meh,
  Frown,
  Angry,
  BatteryLow,
  Clock3,
  Target,
} from "lucide-react";

import { Session } from "./Sessions";

type Props = {
  sessions: Session[];
};

export default function QuickReflection({
  sessions,
}: Props) {

  /*
   * NO SESSIONS
   */
  if (sessions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Meh
              size={20}
              className="text-gray-500"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Quick Reflection
            </h2>

            <p className="text-xs text-gray-500">
              Based on your study sessions
            </p>
          </div>

        </div>

        <div className="text-center py-8">

          <p className="text-sm text-gray-500">
            No sessions available for reflection.
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Try clearing your filters or complete a study session.
          </p>

        </div>

      </div>
    );
  }

  /*
   * AVERAGE PRODUCTIVITY
   */
  const scoredSessions =
    sessions.filter(
      (session) =>
        Number(
          session.productivityScore
        ) > 0
    );

  const averageScore =
    scoredSessions.length > 0
      ? scoredSessions.reduce(
          (sum, session) =>
            sum +
            Number(
              session.productivityScore
            ),
          0
        ) /
        scoredSessions.length
      : 0;

  /*
   * TOTAL TIME
   */
  const totalMinutes =
    sessions.reduce(
      (sum, session) =>
        sum +
        (Number(session.duration) ||
          0),
      0
    );

  /*
   * GOALS
   */
  const completedGoals =
    sessions.filter(
      (session) =>
        session.goalCompleted === true
    ).length;

  const goalRate =
    sessions.length > 0
      ? Math.round(
          (completedGoals /
            sessions.length) *
            100
        )
      : 0;

  /*
   * BEST SESSION
   */
  const bestSession =
    scoredSessions.length > 0
      ? [...scoredSessions].sort(
          (a, b) =>
            (Number(
              b.productivityScore
            ) || 0) -
            (Number(
              a.productivityScore
            ) || 0)
        )[0]
      : null;

  /*
   * LONG SESSIONS
   */
  const longSessions =
    sessions.filter(
      (session) =>
        Number(session.duration) >=
        120
    ).length;

  /*
   * REFLECTION
   */
  let icon = <Meh size={21} />;
  let iconClass =
    "bg-yellow-50 text-yellow-600";
  let title = "Keep building consistency";
  let message =
    "Your study data is giving you useful information. Keep tracking your sessions to find patterns.";

  if (averageScore >= 8) {
    icon = <Trophy size={21} />;
    iconClass =
      "bg-green-50 text-green-600";
    title = "Excellent focus!";
    message =
      "Your average productivity is very strong. Try to identify the study conditions that helped you perform this well.";
  } else if (averageScore >= 6) {
    icon = <Smile size={21} />;
    iconClass =
      "bg-blue-50 text-blue-600";
    title = "You're doing well";
    message =
      "Your productivity is in a healthy range. A little more consistency could help push your focus even higher.";
  } else if (
    averageScore >= 4
  ) {
    icon = <Frown size={21} />;
    iconClass =
      "bg-yellow-50 text-yellow-600";
    title = "Room for improvement";
    message =
      "Your focus has been mixed. Consider shorter study blocks, fewer distractions, or changing when you study.";
  } else {
    icon = <Angry size={21} />;
    iconClass =
      "bg-red-50 text-red-600";
    title = "Your focus needs attention";
    message =
      "Your recent productivity scores are low. Try reducing distractions and breaking large sessions into smaller blocks.";
  }

  /*
   * OVERWORK MESSAGE
   */
  if (longSessions >= 2) {
    message +=
      " You also have several long sessions, so remember to take regular breaks.";
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-5">

        <div className="flex items-center gap-3">

          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
          >
            {icon}
          </div>

          <div>

            <h2 className="text-sm font-semibold text-gray-900">
              Quick Reflection
            </h2>

            <p className="text-xs text-gray-500">
              Based on your current sessions
            </p>

          </div>

        </div>

        <span className="text-xs text-gray-400">
          {sessions.length}{" "}
          {sessions.length === 1
            ? "session"
            : "sessions"}
        </span>

      </div>

      {/* MAIN REFLECTION */}

      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-5">

        <h3 className="font-semibold text-gray-900 text-sm mb-1">
          {title}
        </h3>

        <p className="text-xs text-gray-600 leading-5">
          {message}
        </p>

      </div>

      {/* METRICS */}

      <div className="grid grid-cols-2 gap-3">

        {/* PRODUCTIVITY */}

        <div className="border border-gray-100 rounded-xl p-3">

          <div className="flex items-center gap-2 mb-2">

            <Target
              size={15}
              className="text-blue-500"
            />

            <span className="text-xs text-gray-500">
              Avg Focus
            </span>

          </div>

          <p className="text-lg font-bold text-gray-900">
            {averageScore > 0
              ? `${averageScore.toFixed(
                  1
                )}/10`
              : "—"}
          </p>

        </div>

        {/* STUDY TIME */}

        <div className="border border-gray-100 rounded-xl p-3">

          <div className="flex items-center gap-2 mb-2">

            <Clock3
              size={15}
              className="text-blue-500"
            />

            <span className="text-xs text-gray-500">
              Study Time
            </span>

          </div>

          <p className="text-lg font-bold text-gray-900">

            {Math.floor(
              totalMinutes / 60
            )}
            h{" "}
            {totalMinutes % 60}
            m

          </p>

        </div>

        {/* GOALS */}

        <div className="border border-gray-100 rounded-xl p-3">

          <div className="flex items-center gap-2 mb-2">

            <Target
              size={15}
              className="text-green-500"
            />

            <span className="text-xs text-gray-500">
              Goals
            </span>

          </div>

          <p className="text-lg font-bold text-gray-900">
            {goalRate}%
          </p>

        </div>

        {/* BEST SESSION */}

        <div className="border border-gray-100 rounded-xl p-3">

          <div className="flex items-center gap-2 mb-2">

            <Trophy
              size={15}
              className="text-yellow-500"
            />

            <span className="text-xs text-gray-500">
              Best Focus
            </span>

          </div>

          <p className="text-lg font-bold text-gray-900">
            {bestSession
              ? `${bestSession.productivityScore}/10`
              : "—"}
          </p>

        </div>

      </div>

      {/* LONG SESSION WARNING */}

      {longSessions > 0 && (
        <div className="flex items-start gap-3 mt-4 p-3 rounded-xl bg-orange-50 border border-orange-100">

          <BatteryLow
            size={17}
            className="text-orange-500 mt-0.5"
          />

          <div>

            <p className="text-xs font-semibold text-orange-700">
              Take care of your energy
            </p>

            <p className="text-xs text-orange-600 mt-1 leading-5">
              You have {longSessions}{" "}
              session
              {longSessions !== 1
                ? "s"
                : ""}{" "}
              lasting 2+ hours. Consider adding breaks between long study blocks.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}