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

export interface Session {
  id: string;
  userId?: string;

  subject: string;
  taskName: string;

  duration: number;
  plannedGoal?: string;

  sessionType: string;
  energyAfter: string;
  productivityScore: number;

  goalCompleted?: boolean;
  reflection?: string;

  createdAt: any;
  updatedAt?: any;
}

export default function useInsights() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSessions: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        /*
         * No logged-in user
         */
        if (!user) {
          unsubscribeSessions?.();
          unsubscribeSessions = null;

          setSessions([]);
          setLoading(false);

          return;
        }

        setLoading(true);

        /*
         * Realtime Firestore listener
         */
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid)
        );

        unsubscribeSessions = onSnapshot(
          sessionsQuery,
          (snapshot) => {
            const data: Session[] =
              snapshot.docs.map((document) => ({
                id: document.id,
                ...(document.data() as Omit<
                  Session,
                  "id"
                >),
              }));

            /*
             * Newest sessions first.
             *
             * This is sorted client-side so we do not
             * require a composite Firestore index.
             */
            data.sort((a, b) => {
              const dateA = getSessionDate(
                a.createdAt
              );

              const dateB = getSessionDate(
                b.createdAt
              );

              if (!dateA && !dateB) {
                return 0;
              }

              if (!dateA) {
                return 1;
              }

              if (!dateB) {
                return -1;
              }

              return (
                dateB.getTime() -
                dateA.getTime()
              );
            });

            setSessions(data);
            setLoading(false);
          },
          (error) => {
            console.error(
              "Insights realtime listener error:",
              error
            );

            setSessions([]);
            setLoading(false);
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeSessions?.();
    };
  }, []);

  /*
   * Calculate average productivity for each
   * session type.
   */
  const sessionTypeScores = [
    "Deep Work",
    "Practice",
    "Light Study",
    "Passive",
  ].map((type) => {
    const filteredSessions = sessions.filter(
      (session) =>
        session.sessionType === type
    );

    const average =
      filteredSessions.length === 0
        ? 0
        : filteredSessions.reduce(
            (sum, session) =>
              sum +
              (Number(
                session.productivityScore
              ) || 0),
            0
          ) / filteredSessions.length;

    return {
      type,
      score: Number(
        average.toFixed(1)
      ),
    };
  });

  return {
    sessions,
    loading,
    sessionTypeScores,
  };
}

/*
 * Safely convert Firestore Timestamp,
 * Date, or string into a Date.
 */
function getSessionDate(
  createdAt: any
): Date | null {
  if (!createdAt) {
    return null;
  }

  try {
    /*
     * Firestore Timestamp
     */
    if (
      typeof createdAt.toDate === "function"
    ) {
      const date = createdAt.toDate();

      return isNaN(date.getTime())
        ? null
        : date;
    }

    /*
     * JavaScript Date
     */
    if (createdAt instanceof Date) {
      return isNaN(createdAt.getTime())
        ? null
        : createdAt;
    }

    /*
     * String / number timestamp
     */
    const date = new Date(createdAt);

    return isNaN(date.getTime())
      ? null
      : date;
  } catch {
    return null;
  }
}