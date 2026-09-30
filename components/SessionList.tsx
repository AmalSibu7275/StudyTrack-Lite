"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";

interface Session {
  id: string;
  subject?: string;
  taskName?: string;
  duration?: number;
  productivityScore?: number;
  sessionType?: string;
  createdAt?: any;
}

export default function SessionList() {
  const [sessions, setSessions] =
    useState<Session[]>([]);

  const [loading, setLoading] =
    useState(true);

  const router = useRouter();

  useEffect(() => {
    let unsubscribeSessions:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      auth.onAuthStateChanged((user) => {
        if (!user) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "sessions"),
          where(
            "userId",
            "==",
            user.uid
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        );

        unsubscribeSessions =
          onSnapshot(
            q,
            (snapshot) => {
              const data =
                snapshot.docs
                  .map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<
                      Session,
                      "id"
                    >),
                  }))
                  .slice(0, 5);

              setSessions(data);
              setLoading(false);
            },
            (error) => {
              console.error(
                "Session list error:",
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Recent Sessions
        </h2>

        <button
          type="button"
          onClick={() =>
            router.push("/sessions")
          }
          className="text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-10">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          No sessions yet.
          <p className="text-xs mt-1">
            Complete your first study session
            to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {session.subject ||
                    "Study Session"}
                </h3>

                <p className="text-sm text-gray-500 truncate">
                  {session.taskName ||
                    "Study session"}
                </p>
              </div>

              <div className="text-right shrink-0 ml-4">
                <p className="font-semibold text-gray-900">
                  {session.duration ||
                    0}{" "}
                  min
                </p>

                <p className="text-sm text-blue-600">
                  {session.productivityScore ||
                    0}
                  /10 Focus
                </p>

                <p className="text-xs text-gray-500">
                  {session.sessionType ||
                    "Study"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}