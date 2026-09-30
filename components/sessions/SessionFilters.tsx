"use client";

import {
  Filter,
  List,
  CalendarDays,
  RotateCcw,
} from "lucide-react";

import { Session } from "./Sessions";

type Props = {
  sessionType: string;
  setSessionType: (
    value: string
  ) => void;

  subject: string;
  setSubject: (
    value: string
  ) => void;

  score: string;
  setScore: (
    value: string
  ) => void;

  duration: string;
  setDuration: (
    value: string
  ) => void;

  view: "list" | "calendar";
  setView: (
    value: "list" | "calendar"
  ) => void;

  clearFilters: () => void;

  sessions?: Session[];
};

export default function SessionFilters({
  sessionType,
  setSessionType,
  subject,
  setSubject,
  score,
  setScore,
  duration,
  setDuration,
  view,
  setView,
  clearFilters,
  sessions = [],
}: Props) {

  /*
   * Get unique subjects from Firestore sessions
   */
  const subjects = Array.from(
    new Set(
      sessions
        .map(
          (session) =>
            session.subject
        )
        .filter(Boolean)
    )
  );

  const hasFilters =
    sessionType !==
      "All Session Types" ||
    subject !== "All Subjects" ||
    score !== "All Scores" ||
    duration !==
      "All Durations";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

        {/* LEFT FILTERS */}

        <div className="flex flex-wrap items-center gap-2">

          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mr-1">

            <Filter size={17} />

            Filters

          </div>

          {/* SESSION TYPE */}

          <select
            value={sessionType}
            onChange={(e) =>
              setSessionType(
                e.target.value
              )
            }
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>
              All Session Types
            </option>

            <option>
              Deep Work
            </option>

            <option>
              Practice
            </option>

            <option>
              Light Study
            </option>

            <option>
              Passive
            </option>
          </select>

          {/* SUBJECT */}

          <select
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>
              All Subjects
            </option>

            {subjects.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

          {/* SCORE */}

          <select
            value={score}
            onChange={(e) =>
              setScore(
                e.target.value
              )
            }
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>
              All Scores
            </option>

            <option value="9-10">
              9–10
            </option>

            <option value="7-8">
              7–8
            </option>

            <option value="5-6">
              5–6
            </option>

            <option value="1-4">
              1–4
            </option>
          </select>

          {/* DURATION */}

          <select
            value={duration}
            onChange={(e) =>
              setDuration(
                e.target.value
              )
            }
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>
              All Durations
            </option>

            <option>
              Under 30 min
            </option>

            <option>
              30-60 min
            </option>

            <option>
              1-2 hours
            </option>

            <option>
              Over 2 hours
            </option>
          </select>

          {/* CLEAR */}

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition"
            >
              <RotateCcw size={15} />

              Clear
            </button>
          )}

        </div>

        {/* VIEW SWITCHER */}

        <div className="flex items-center bg-gray-100 rounded-xl p-1">

          <button
            type="button"
            onClick={() =>
              setView("list")
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={16} />

            List
          </button>

          <button
            type="button"
            onClick={() =>
              setView("calendar")
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === "calendar"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CalendarDays size={16} />

            Calendar
          </button>

        </div>

      </div>

    </div>
  );
}