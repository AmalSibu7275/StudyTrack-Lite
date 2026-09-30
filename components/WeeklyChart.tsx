"use client";

import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function WeeklyChart() {
  const [weeklyData, setWeeklyData] =
    useState<number[]>(
      [0, 0, 0, 0, 0, 0, 0]
    );

  const [totalHours, setTotalHours] =
    useState(0);

  useEffect(() => {
    let unsubscribeSessions:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      auth.onAuthStateChanged((user) => {
        if (!user) {
          setWeeklyData([
            0, 0, 0, 0, 0, 0, 0,
          ]);
          setTotalHours(0);
          return;
        }

        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid)
        );

        unsubscribeSessions = onSnapshot(
          q,
          (snapshot) => {
            const days = [
              0, 0, 0, 0, 0, 0, 0,
            ];

            const today = new Date();

            today.setHours(
              23,
              59,
              59,
              999
            );

            snapshot.docs.forEach((doc) => {
              const data = doc.data();

              if (!data.createdAt) return;

              let date: Date;

              try {
                if (
                  typeof data.createdAt
                    .toDate === "function"
                ) {
                  date =
                    data.createdAt.toDate();
                } else {
                  date = new Date(
                    data.createdAt
                  );
                }
              } catch {
                return;
              }

              if (
                isNaN(date.getTime())
              ) {
                return;
              }

              const dateOnly =
                new Date(date);

              dateOnly.setHours(
                0,
                0,
                0,
                0
              );

              const todayOnly =
                new Date(today);

              todayOnly.setHours(
                0,
                0,
                0,
                0
              );

              const diffDays = Math.floor(
                (todayOnly.getTime() -
                  dateOnly.getTime()) /
                  (1000 *
                    60 *
                    60 *
                    24)
              );

              if (
                diffDays < 0 ||
                diffDays > 6
              ) {
                return;
              }

              const dayIndex =
                6 - diffDays;

              days[dayIndex] +=
                (Number(
                  data.duration
                ) || 0) / 60;
            });

            setWeeklyData(days);

            setTotalHours(
              days.reduce(
                (sum, hours) =>
                  sum + hours,
                0
              )
            );
          },
          (error) => {
            console.error(
              "Weekly chart error:",
              error
            );
          }
        );
      });

    return () => {
      unsubscribeAuth();

      if (unsubscribeSessions) {
        unsubscribeSessions();
      }
    };
  }, []);

  const labels = useMemo(() => {
    const result: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();

      d.setDate(
        d.getDate() - i
      );

      result.push(
        d.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        )
      );
    }

    return result;
  }, []);

  const data = {
    labels,

    datasets: [
      {
        label: "Study Hours",
        data: weeklyData,
        backgroundColor: "#3B82F6",
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${Number(
              context.raw
            ).toFixed(1)} hrs`,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "#E5E7EB",
        },

        ticks: {
          callback: (value: any) =>
            `${value}h`,
        },
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Weekly Overview
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Study hours from the last 7 days
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            Total
          </p>

          <h3 className="text-2xl font-bold text-blue-600">
            {totalHours.toFixed(1)}h
          </h3>
        </div>
      </div>

      <div className="flex-1 min-h-[320px]">
        <Bar
          data={data}
          options={options}
        />
      </div>
    </div>
  );
}