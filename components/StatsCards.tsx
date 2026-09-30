"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  Clock,
  CheckCircle,
  TrendingUp,
  Flame,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

type Session = {
  duration?: number;
  productivityScore?: number;
  createdAt?: any;
};

function getSessionDate(createdAt: any): Date | null {
  if (!createdAt) return null;

  try {
    if (typeof createdAt.toDate === "function") {
      return createdAt.toDate();
    }

    const date = new Date(createdAt);

    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function calculateStreak(sessions: Session[]) {
  const dates = new Set<string>();

  sessions.forEach((session) => {
    const date = getSessionDate(session.createdAt);

    if (date) {
      dates.add(getDateKey(date));
    }
  });

  if (dates.size === 0) return 0;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const todayKey = getDateKey(today);

  let current = new Date(today);

  if (!dates.has(todayKey)) {
    current.setDate(current.getDate() - 1);

    if (!dates.has(getDateKey(current))) {
      return 0;
    }
  }

  let streak = 0;

  while (dates.has(getDateKey(current))) {
    streak++;

    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export default function StatsCards() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(
      (user) => {
        if (!user) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid)
        );

        const unsubscribeSessions = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map(
              (doc) =>
                doc.data() as Session
            );

            setSessions(data);
            setLoading(false);
          },
          (error) => {
            console.error(
              "Error loading dashboard stats:",
              error
            );

            setLoading(false);
          }
        );

        return unsubscribeSessions;
      }
    );

    return () => unsubscribeAuth();
  }, []);

  const totalMinutes = sessions.reduce(
    (sum, session) =>
      sum + (Number(session.duration) || 0),
    0
  );

  const averageScore =
    sessions.length > 0
      ? sessions.reduce(
          (sum, session) =>
            sum +
            (Number(
              session.productivityScore
            ) || 0),
          0
        ) / sessions.length
      : 0;

  const streak = calculateStreak(sessions);

  function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  }

  const stats = [
    {
      title: "Total Study Time",
      value: loading
        ? "..."
        : formatDuration(totalMinutes),
      description:
        sessions.length === 0
          ? "No sessions yet"
          : `${sessions.length} sessions recorded`,
      icon: Clock,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Sessions Completed",
      value: loading
        ? "..."
        : String(sessions.length),
      description:
        sessions.length === 1
          ? "Keep going!"
          : "Study sessions recorded",
      icon: CheckCircle,
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Focus Score",
      value: loading
        ? "..."
        : `${averageScore.toFixed(1)} / 10`,
      description:
        sessions.length === 0
          ? "No score yet"
          : "Average productivity",
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Streak",
      value: loading
        ? "..."
        : `${streak} ${
            streak === 1 ? "day" : "days"
          }`,
      description:
        streak === 0
          ? "Start your streak today!"
          : "Keep it going!",
      icon: Flame,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
              >
                <Icon size={23} />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-gray-500">
                  {stat.title}
                </p>

                <h2 className="text-2xl md:text-3xl font-bold mt-1 text-gray-900">
                  {stat.value}
                </h2>

                <p className="text-gray-500 text-xs mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
