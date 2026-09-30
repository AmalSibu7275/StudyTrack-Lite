"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

export interface AnalyticsSession {
  id: string;
  userId: string;

  subject?: string;
  taskName?: string;

  duration?: number;
  productivityScore?: number;

  sessionType?: string;
  energyAfter?: string;

  plannedGoal?: string;
  goalCompleted?: boolean;

  reflection?: string;

  createdAt?: any;
  updatedAt?: any;
}

export default function useAnalytics() {
  const [sessions, setSessions] = useState<
    AnalyticsSession[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    let unsubscribeSessions:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(auth, (user) => {
        /*
         * No logged-in user
         */
        if (!user) {
          setSessions([]);
          setLoading(false);
          setError(null);

          unsubscribeSessions?.();
          unsubscribeSessions = undefined;

          return;
        }

        setLoading(true);
        setError(null);

        /*
         * Real-time Firestore listener
         */
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid)
        );

        unsubscribeSessions = onSnapshot(
          sessionsQuery,
          (snapshot) => {
            const data: AnalyticsSession[] =
              snapshot.docs.map((document) => ({
                id: document.id,
                ...(document.data() as Omit<
                  AnalyticsSession,
                  "id"
                >),
              }));

            /*
             * Sort newest first.
             *
             * We sort client-side so Analytics does not
             * depend on a composite Firestore index.
             */
            data.sort((a, b) => {
              const dateA = getSessionDate(a);
              const dateB = getSessionDate(b);

              if (!dateA && !dateB) return 0;
              if (!dateA) return 1;
              if (!dateB) return -1;

              return (
                dateB.getTime() -
                dateA.getTime()
              );
            });

            setSessions(data);
            setLoading(false);
            setError(null);
          },
          (snapshotError) => {
            console.error(
              "Analytics realtime listener error:",
              snapshotError
            );

            setError(
              "Unable to load analytics data."
            );

            setSessions([]);
            setLoading(false);
          }
        );
      });

    return () => {
      unsubscribeAuth();
      unsubscribeSessions?.();
    };
  }, []);

  return {
    sessions,
    loading,
    error,
  };
}

/*
 * Convert Firestore Timestamp / Date / string
 * into a normal JavaScript Date.
 */
export function getSessionDate(
  session: AnalyticsSession
): Date | null {
  if (!session.createdAt) {
    return null;
  }

  try {
    if (
      typeof session.createdAt.toDate ===
      "function"
    ) {
      const date = session.createdAt.toDate();

      return isNaN(date.getTime())
        ? null
        : date;
    }

    const date = new Date(
      session.createdAt
    );

    return isNaN(date.getTime())
      ? null
      : date;
  } catch {
    return null;
  }
}

/*
 * Safely get a productivity score.
 */
export function getProductivity(
  session: AnalyticsSession
) {
  return Number(
    session.productivityScore
  ) || 0;
}

/*
 * Safely get duration.
 */
export function getDuration(
  session: AnalyticsSession
) {
  return Number(session.duration) || 0;
}