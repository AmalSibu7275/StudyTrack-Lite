"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { Lightbulb } from "lucide-react";

interface Session {
  duration: number;
  productivityScore: number;
  sessionType: string;
  createdAt: any;
}

export default function InsightsPanel() {
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const generateInsights = async () => {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, "sessions"),
        where("userId", "==", auth.currentUser.uid)
      );

      const querySnapshot = await getDocs(q);

      const sessions: Session[] = querySnapshot.docs.map(
        (doc) => doc.data() as Session
      );

      if (sessions.length === 0) {
        setInsights([
          "Complete a few study sessions to unlock personalized insights.",
        ]);
        return;
      }

      const newInsights: string[] = [];

      const avgProductivity =
        sessions.reduce(
          (sum, s) => sum + s.productivityScore,
          0
        ) / sessions.length;

      if (avgProductivity < 5) {
        newInsights.push(
          "Your recent sessions appear less productive than usual."
        );
      }

      const longSessions = sessions.filter(
        (s) => s.duration > 120
      );

      if (longSessions.length > 0) {
        newInsights.push(
          "Productivity tends to decrease during very long study sessions."
        );
      }

      const productivityByDay: {
        [key: number]: number[];
      } = {};

     sessions.forEach((s) => {
  if (!s.createdAt || typeof s.createdAt.toDate !== "function") {
    return;
  }

  const day = s.createdAt.toDate().getDay();

  if (!productivityByDay[day]) {
    productivityByDay[day] = [];
  }

  productivityByDay[day].push(s.productivityScore);
});

      let bestDay = "";
      let highestAvg = 0;

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      Object.keys(productivityByDay).forEach((day) => {
        const scores =
          productivityByDay[Number(day)];

        const avg =
          scores.reduce((a, b) => a + b, 0) /
          scores.length;

        if (avg > highestAvg) {
          highestAvg = avg;
          bestDay = dayNames[Number(day)];
        }
      });

      if (bestDay) {
        newInsights.push(
          `${bestDay} is currently your strongest study day.`
        );
      }

      const deepWorkSessions = sessions.filter(
        (s) => s.sessionType === "Deep Work"
      );

      if (deepWorkSessions.length > 0) {
        const deepAvg =
          deepWorkSessions.reduce(
            (sum, s) => sum + s.productivityScore,
            0
          ) / deepWorkSessions.length;

        if (deepAvg > avgProductivity) {
          newInsights.push(
            "Deep Work sessions generate your highest productivity scores."
          );
        }
      }

      setInsights(newInsights);
    };

    generateInsights();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb
          className="text-yellow-500"
          size={22}
        />

        <h2 className="text-xl font-bold text-gray-900">
          Insights
        </h2>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-700"
          >
            {insight}
          </div>
        ))}
      </div>
    </div>
  );
}