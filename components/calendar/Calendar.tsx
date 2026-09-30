"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Target,
  CalendarDays,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import CalendarDay from "./CalendarDay";

export interface CalendarSession {
  id: string;
  userId: string;
  subject?: string;
  taskName?: string;
  duration?: number;
  productivityScore?: number;
  sessionType?: string;
  energyAfter?: string;
  createdAt?: any;
}

export interface CalendarDayData {
  date: Date;
  sessions: CalendarSession[];
  totalMinutes: number;
  averageProductivity: number;
}

function getSessionDate(createdAt: any): Date | null {
  if (!createdAt) return null;

  try {
    if (typeof createdAt.toDate === "function") {
      return createdAt.toDate();
    }

    const date = new Date(createdAt);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        const user = auth.currentUser;

        if (!user) {
          if (!cancelled) {
            setSessions([]);
            setLoading(false);
          }
          return;
        }

        const sessionsQuery = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(sessionsQuery);

        if (cancelled) return;

        const data: CalendarSession[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CalendarSession, "id">),
        }));

        setSessions(data);
      } catch (error) {
        console.error("Error loading calendar sessions:", error);

        if (!cancelled) {
          setSessions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();

    // Convert Sunday-first to Monday-first.
    const startingDay =
      firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [year, month]);

  const monthSessions = useMemo(() => {
    return sessions.filter((session) => {
      const date = getSessionDate(session.createdAt);

      if (!date) return false;

      return (
        date.getFullYear() === year &&
        date.getMonth() === month
      );
    });
  }, [sessions, year, month]);

  const dayData = useMemo(() => {
    const map = new Map<string, CalendarDayData>();

    monthSessions.forEach((session) => {
      const date = getSessionDate(session.createdAt);

      if (!date) return;

      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!map.has(key)) {
        map.set(key, {
          date,
          sessions: [],
          totalMinutes: 0,
          averageProductivity: 0,
        });
      }

      const existing = map.get(key)!;

      existing.sessions.push(session);

      existing.totalMinutes +=
        Number(session.duration) || 0;
    });

    map.forEach((data) => {
      const scores = data.sessions
        .map((session) =>
          Number(session.productivityScore)
        )
        .filter((score) => !isNaN(score) && score > 0);

      data.averageProductivity =
        scores.length > 0
          ? scores.reduce(
              (sum, score) => sum + score,
              0
            ) / scores.length
          : 0;
    });

    return map;
  }, [monthSessions]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;

    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;

    return dayData.get(key) ?? null;
  }, [selectedDate, dayData]);

  const totalMinutes = monthSessions.reduce(
    (sum, session) =>
      sum + (Number(session.duration) || 0),
    0
  );

  const averageProductivity =
    monthSessions.length > 0
      ? monthSessions.reduce(
          (sum, session) =>
            sum +
            (Number(session.productivityScore) || 0),
          0
        ) / monthSessions.length
      : 0;

  function previousMonth() {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
    setSelectedDate(
      new Date(year, month - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
    setSelectedDate(
      new Date(year, month + 1, 1)
    );
  }

  function goToToday() {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDate(today);
  }

  function selectDay(day: number) {
    setSelectedDate(
      new Date(year, month, day)
    );
  }

  function getDayData(day: number) {
    const key = `${year}-${month}-${day}`;

    return dayData.get(key);
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">
            <CalendarDays
              className="accent-text"
              size={28}
            />

            <h1 className="text-3xl font-bold">
              Calendar
            </h1>
          </div>

          <p className="text-gray-500 mt-2">
            View your real study sessions by day.
          </p>
        </div>

        <button
          onClick={goToToday}
          className="accent-bg text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition"
        >
          Today
        </button>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <StatCard
          icon={<Clock3 size={20} />}
          label="Study Time"
          value={`${Math.floor(totalMinutes / 60)}h ${
            totalMinutes % 60
          }m`}
        />

        <StatCard
          icon={<Target size={20} />}
          label="Sessions"
          value={monthSessions.length.toString()}
        />

        <StatCard
          icon={<Target size={20} />}
          label="Avg Productivity"
          value={
            monthSessions.length > 0
              ? `${averageProductivity.toFixed(1)}/10`
              : "—"
          }
        />

      </div>

      {/* Calendar */}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Month navigation */}

        <div className="flex items-center justify-between p-6 border-b border-gray-100">

          <button
            onClick={previousMonth}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-xl font-semibold">
            {monthName} {year}
          </h2>

          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ChevronRight size={20} />
          </button>

        </div>

        {/* Weekdays */}

        <div className="grid grid-cols-7 border-b border-gray-100">

          {[
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-4"
            >
              {day}
            </div>
          ))}

        </div>

        {/* Calendar days */}

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading sessions...
          </div>
        ) : (
          <div className="grid grid-cols-7">

            {calendarDays.map((day, index) => {

              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[120px] border-r border-b border-gray-100 bg-gray-50/50"
                  />
                );
              }

              return (
                <CalendarDay
                  key={day}
                  date={new Date(year, month, day)}
                  data={getDayData(day)}
                  selected={
                    selectedDate?.getFullYear() === year &&
                    selectedDate?.getMonth() === month &&
                    selectedDate?.getDate() === day
                  }
                  onClick={() => selectDay(day)}
                />
              );
            })}

          </div>
        )}

      </div>

      {/* Selected day */}

      <SelectedDayPanel
        date={selectedDate}
        data={selectedDayData}
      />

    </div>
  );
}

function SelectedDayPanel({
  date,
  data,
}: {
  date: Date | null;
  data: CalendarDayData | null;
}) {
  if (!date) return null;

  const sessions = data?.sessions ?? [];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

      <div className="flex items-center justify-between mb-5">

        <div>
          <h2 className="text-xl font-semibold">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {sessions.length}{" "}
            {sessions.length === 1
              ? "session"
              : "sessions"}
          </p>
        </div>

        {data && data.totalMinutes > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Study time
            </p>

            <p className="font-bold text-lg">
              {Math.floor(
                data.totalMinutes / 60
              )}
              h{" "}
              {data.totalMinutes % 60}
              m
            </p>
          </div>
        )}

      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No study sessions recorded for this day.
        </div>
      ) : (
        <div className="space-y-3">

          {sessions.map((session) => {

            const score =
              Number(
                session.productivityScore
              ) || 0;

            return (
              <div
                key={session.id}
                className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
              >

                <div>
                  <p className="font-semibold">
                    {session.taskName ||
                      session.subject ||
                      "Study Session"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {session.sessionType ||
                      "Study"}
                  </p>
                </div>

                <div className="text-right">

                  <p className="font-semibold">
                    {Number(session.duration) || 0} min
                  </p>

                  <p className="text-sm accent-text">
                    {score > 0
                      ? `${score}/10`
                      : "No score"}
                  </p>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl accent-light-bg accent-text flex items-center justify-center">
          {icon}
        </div>

        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-xl font-bold">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
}