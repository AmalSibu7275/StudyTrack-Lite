"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import {
  Sparkles,
  Clock,
  Brain,
  Zap,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

type Session = {
  duration?: number;
  productivityScore?: number;
  sessionType?: string;
  energyAfter?: string;
  createdAt?: any;
};

type Recommendation = {
  title: string;
  message: string;
  icon: any;
};

export default function Recommendations() {
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let unsubscribeSessions:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      auth.onAuthStateChanged((user) => {
        if (!user) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid)
        );

        unsubscribeSessions = onSnapshot(
          q,
          (snapshot) => {
            const sessions: Session[] =
              snapshot.docs.map(
                (doc) =>
                  doc.data() as Session
              );

            generateRecommendations(
              sessions
            );

            setLoading(false);
          },
          (error) => {
            console.error(
              "Recommendations error:",
              error
            );

            setLoading(false);
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

  function generateRecommendations(
    sessions: Session[]
  ) {
    if (sessions.length === 0) {
      setRecommendations([
        {
          title: "Start tracking",
          message:
            "Complete your first study session and we'll start generating personalized recommendations.",
          icon: Sparkles,
        },
      ]);

      return;
    }

    const recommendations: Recommendation[] =
      [];

    /*
     * Average productivity
     */
    const validScores = sessions
      .map((s) =>
        Number(s.productivityScore)
      )
      .filter(
        (score) => score > 0
      );

    const averageProductivity =
      validScores.length > 0
        ? validScores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) / validScores.length
        : 0;

    /*
     * Average session duration
     */
    const totalMinutes =
      sessions.reduce(
        (sum, session) =>
          sum +
          (Number(session.duration) ||
            0),
        0
      );

    const averageDuration =
      sessions.length > 0
        ? totalMinutes /
          sessions.length
        : 0;

    /*
     * Long sessions with low productivity
     */
    const longLowSessions =
      sessions.filter(
        (session) =>
          Number(session.duration) >
            120 &&
          Number(
            session.productivityScore
          ) < 6
      );

    if (longLowSessions.length > 0) {
      recommendations.push({
        title: "Try shorter study blocks",
        message:
          "Your longer sessions sometimes have lower focus scores. Try 60–90 minute blocks with short breaks.",
        icon: Clock,
      });
    }

    /*
     * Low average productivity
     */
    if (
      averageProductivity > 0 &&
      averageProductivity < 5
    ) {
      recommendations.push({
        title: "Protect your focus",
        message:
          "Your average focus score is below 5. Try reducing distractions and studying in shorter focused blocks.",
        icon: AlertCircle,
      });
    }

    /*
     * Strong productivity
     */
    if (averageProductivity >= 8) {
      recommendations.push({
        title: "You're doing great",
        message:
          "Your average productivity is excellent. Try to keep the same study conditions for future sessions.",
        icon: TrendingUp,
      });
    }

    /*
     * Deep Work analysis
     */
    const deepWorkSessions =
      sessions.filter(
        (session) =>
          session.sessionType ===
          "Deep Work"
      );

    if (deepWorkSessions.length > 0) {
      const deepScores =
        deepWorkSessions
          .map((s) =>
            Number(
              s.productivityScore
            )
          )
          .filter(
            (score) => score > 0
          );

      if (deepScores.length > 0) {
        const deepAverage =
          deepScores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) / deepScores.length;

        if (
          deepAverage >=
          averageProductivity
        ) {
          recommendations.push({
            title:
              "Deep Work is working",
            message:
              "Your Deep Work sessions perform at or above your average. Consider scheduling more focused blocks.",
            icon: Brain,
          });
        }
      }
    }

    /*
     * High energy analysis
     */
    const highEnergySessions =
      sessions.filter(
        (session) =>
          session.energyAfter ===
          "High"
      );

    if (
      highEnergySessions.length >=
      2
    ) {
      const highEnergyScores =
        highEnergySessions
          .map((s) =>
            Number(
              s.productivityScore
            )
          )
          .filter(
            (score) => score > 0
          );

      if (highEnergyScores.length > 0) {
        const highEnergyAverage =
          highEnergyScores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) /
          highEnergyScores.length;

        if (
          highEnergyAverage >=
          averageProductivity
        ) {
          recommendations.push({
            title:
              "Use your high-energy periods",
            message:
              "You appear to perform well when your energy is high. Consider doing difficult subjects during those periods.",
            icon: Zap,
          });
        }
      }
    }

    /*
     * Very short sessions
     */
    if (
      sessions.length >= 3 &&
      averageDuration < 25
    ) {
      recommendations.push({
        title:
          "Build longer focus blocks",
        message:
          "Your average session is quite short. If possible, gradually work toward 30–60 minute focused sessions.",
        icon: Clock,
      });
    }

    /*
     * If no special recommendation
     */
    if (
      recommendations.length === 0
    ) {
      recommendations.push({
        title: "Keep building your data",
        message:
          "Keep logging sessions. The more you study, the better we can identify patterns in your productivity.",
        icon: Sparkles,
      });
    }

    /*
     * Show maximum 4
     */
    setRecommendations(
      recommendations.slice(0, 4)
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <Sparkles
              className="text-purple-500"
              size={20}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Recommendations
            </h2>

            <p className="text-xs text-gray-500">
              Based on your study patterns
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Analyzing your study habits...
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map(
            (
              recommendation,
              index
            ) => {
              const Icon =
                recommendation.icon;

              return (
                <div
                  key={index}
                  className="bg-purple-50/70 border border-purple-100 rounded-xl p-4"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <Icon
                        size={17}
                        className="text-purple-500"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {
                          recommendation.title
                        }
                      </h3>

                      <p className="text-xs text-gray-600 leading-5 mt-1">
                        {
                          recommendation.message
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}