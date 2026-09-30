"use client";

import {
  BookOpen,
  Beaker,
  Code2,
  Clock3,
  CalendarDays,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";

import { Session, getSessionDate } from "./Sessions";

type Props = {
  session: Session;
  selected: boolean;
  onClick: () => void;
};

export default function SessionRow({
  session,
  selected,
  onClick,
}: Props) {
  const date = getSessionDate(session);

  const score =
    Number(session.productivityScore) || 0;

  const sessionType =
    session.sessionType || "Study";

  const subject =
    session.subject || "Study";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 transition ${
        selected
          ? "border-blue-500 bg-blue-50/40"
          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
      }`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getSubjectStyle(
            subject
          )}`}
        >
          {getSubjectIcon(subject)}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">

            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {subject}
            </h3>

            <span
              className={`text-[10px] px-2 py-1 rounded-md font-medium whitespace-nowrap ${getTypeStyle(
                sessionType
              )}`}
            >
              {sessionType}
            </span>

          </div>

          <p className="text-xs text-gray-500 truncate mt-0.5">
            {session.taskName ||
              "Study session"}
          </p>

        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 w-20">
          <Clock3 size={14} />
          {session.duration || 0} min
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 w-32">
          <CalendarDays size={14} />

          {date
            ? formatDate(date)
            : "Unknown"}
        </div>

        <div className="w-14 text-right">

          <p
            className={`font-semibold text-sm ${getScoreColor(
              score
            )}`}
          >
            {score}/10
          </p>

          <p className="text-[10px] text-gray-500">
            {getScoreLabel(score)}
          </p>

        </div>

        <CheckCircle2
          size={17}
          className="text-green-600 shrink-0"
        />

        <MoreVertical
          size={17}
          className="text-gray-400 shrink-0"
        />

      </div>

    </button>
  );
}

function formatDate(date: Date) {
  const today = new Date();

  if (
    date.toDateString() ===
    today.toDateString()
  ) {
    return `Today, ${date.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )}`;
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function getScoreColor(score: number) {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-orange-500";
  return "text-red-500";
}

function getScoreLabel(score: number) {
  if (score >= 8) return "High Focus";
  if (score >= 6) return "Good Focus";
  return "Average";
}

function getTypeStyle(type: string) {
  if (type === "Deep Work") {
    return "bg-blue-50 text-blue-600";
  }

  if (type === "Practice") {
    return "bg-purple-50 text-purple-600";
  }

  if (type === "Review") {
    return "bg-green-50 text-green-600";
  }

  return "bg-orange-50 text-orange-600";
}

function getSubjectStyle(subject: string) {
  const value = subject.toLowerCase();

  if (value.includes("physics")) {
    return "bg-purple-50 text-purple-600";
  }

  if (value.includes("chemistry")) {
    return "bg-green-50 text-green-600";
  }

  if (
    value.includes("data") ||
    value.includes("computer")
  ) {
    return "bg-orange-50 text-orange-600";
  }

  return "bg-blue-50 text-blue-600";
}

function getSubjectIcon(subject: string) {
  const value = subject.toLowerCase();

  if (value.includes("physics")) {
    return <Beaker size={20} />;
  }

  if (
    value.includes("data") ||
    value.includes("computer")
  ) {
    return <Code2 size={20} />;
  }

  return <BookOpen size={20} />;
}