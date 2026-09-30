"use client";

import { useEffect, useState } from "react";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

interface Session {
  duration: number;
  productivityScore: number;
  createdAt: any;
}

export default function WeeklyComparison() {
  const [comparison, setComparison] = useState({
    hoursDiff: 0,
    productivityDiff: 0,
    sessionDiff: 0,
  });

  useEffect(() => {
    const fetchComparison = async () => {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, "sessions"),
        where("userId", "==", auth.currentUser.uid)
      );

      const querySnapshot = await getDocs(q);

      const sessions: Session[] = querySnapshot.docs.map(
        (doc) => doc.data() as Session
      );

      const now = new Date();

      const currentWeek: Session[] = [];
      const lastWeek: Session[] = [];

      sessions.forEach((session) => {
        const sessionDate =
          session.createdAt.toDate();

        const diffTime =
          now.getTime() - sessionDate.getTime();

        const diffDays =
          diffTime / (1000 * 60 * 60 * 24);

        if (diffDays <= 7) {
          currentWeek.push(session);
        } else if (diffDays <= 14) {
          lastWeek.push(session);
        }
      });

      const currentHours =
        currentWeek.reduce(
          (sum, s) => sum + s.duration,
          0
        ) / 60;

      const lastHours =
        lastWeek.reduce(
          (sum, s) => sum + s.duration,
          0
        ) / 60;

      const currentAvg =
        currentWeek.length > 0
          ? currentWeek.reduce(
              (sum, s) =>
                sum + s.productivityScore,
              0
            ) / currentWeek.length
          : 0;

      const lastAvg =
        lastWeek.length > 0
          ? lastWeek.reduce(
              (sum, s) =>
                sum + s.productivityScore,
              0
            ) / lastWeek.length
          : 0;

      setComparison({
        hoursDiff: Number(
          (currentHours - lastHours).toFixed(1)
        ),

        productivityDiff: Number(
          (currentAvg - lastAvg).toFixed(1)
        ),

        sessionDiff:
          currentWeek.length - lastWeek.length,
      });
    };

    fetchComparison();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Weekly Comparison
      </h2>

      <div className="space-y-4">

        <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
          {comparison.hoursDiff >= 0 ? "+" : ""}
          {comparison.hoursDiff} study hours compared to last week
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          {comparison.productivityDiff >= 0 ? "+" : ""}
          {comparison.productivityDiff} productivity score change
        </div>

        <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
          {comparison.sessionDiff >= 0 ? "+" : ""}
          {comparison.sessionDiff} sessions completed
        </div>

      </div>
    </div>
  );
}