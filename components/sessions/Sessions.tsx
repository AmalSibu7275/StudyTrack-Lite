"use client";

import { useEffect, useMemo, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";

import SessionsHeader from "./SessionsHeader";
import SessionsStats from "./SessionsStats";
import SessionFilters from "./SessionFilters";
import SessionHistory from "./SessionHistory";
import SessionDetails from "./SessionDetails";
import SessionActivity from "./SessionActivity";
import QuickReflection from "./QuickReflection";
import SessionCalendar from "./SessionCalendar";

export type Session = {
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
};

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] =
    useState<Session | null>(null);

  const [search, setSearch] = useState("");

  const [sessionType, setSessionType] =
    useState("All Session Types");

  const [subject, setSubject] =
    useState("All Subjects");

  const [score, setScore] =
    useState("All Scores");

  const [duration, setDuration] =
    useState("All Durations");

  const [view, setView] =
    useState<"list" | "calendar">("list");

  const [dateRange, setDateRange] =
    useState<"all" | "week" | "month">("all");

  /*
   * LOAD FIRESTORE SESSIONS
   */
  useEffect(() => {
    async function loadSessions() {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data: Session[] = snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...(document.data() as Omit<Session, "id">),
          })
        );

        setSessions(data);
      } catch (error) {
        console.error(
          "Error loading sessions:",
          error
        );

        toast.error("Unable to load sessions", {
          description:
            "Please refresh the page and try again.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  /*
   * EDIT SESSION
   *
   * SessionDetails prepares the updated
   * session object and sends it here.
   */
  async function handleEditSession(
    updatedSession: Session
  ) {
    const user = auth.currentUser;

    if (!user) {
      toast.error("You're not logged in", {
        description:
          "Please sign in before editing a session.",
      });

      throw new Error("User is not logged in");
    }

    /*
     * Extra client-side ownership check.
     */
    if (updatedSession.userId !== user.uid) {
      toast.error("Permission denied", {
        description:
          "You cannot edit this session.",
      });

      throw new Error("Session ownership mismatch");
    }

    try {
      const sessionRef = doc(
        db,
        "sessions",
        updatedSession.id
      );

      await updateDoc(sessionRef, {
        subject: updatedSession.subject?.trim() || "",
        taskName: updatedSession.taskName?.trim() || "",
        duration:
          Number(updatedSession.duration) || 0,
        productivityScore:
          Number(updatedSession.productivityScore) || 0,
        sessionType:
          updatedSession.sessionType || "Deep Work",
        energyAfter:
          updatedSession.energyAfter || "Medium",
        plannedGoal:
          updatedSession.plannedGoal?.trim() || "",
        goalCompleted:
          updatedSession.goalCompleted === true,
        reflection:
          updatedSession.reflection?.trim() || "",
        updatedAt: serverTimestamp(),
      });

      /*
       * Update local list immediately.
       */
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === updatedSession.id
            ? {
                ...session,
                ...updatedSession,
              }
            : session
        )
      );

      /*
       * Keep the details panel updated.
       */
      setSelectedSession((currentSession) =>
        currentSession?.id === updatedSession.id
          ? {
              ...currentSession,
              ...updatedSession,
            }
          : currentSession
      );

      toast.success("Session updated", {
        description:
          "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error(
        "Error updating session:",
        error
      );

      toast.error("Unable to update session", {
        description:
          "Something went wrong while saving your changes.",
      });

      throw error;
    }
  }

  /*
   * DELETE SESSION
   */
  async function handleDeleteSession(
    sessionId: string
  ) {
    const user = auth.currentUser;

    if (!user) {
      toast.error("You're not logged in", {
        description:
          "Please sign in before deleting a session.",
      });

      throw new Error("User is not logged in");
    }

    /*
     * Find the session locally first so we can
     * verify that it belongs to this user.
     */
    const sessionToDelete = sessions.find(
      (session) => session.id === sessionId
    );

    if (!sessionToDelete) {
      toast.error("Session not found", {
        description:
          "This session may have already been removed.",
      });

      throw new Error("Session not found");
    }

    if (sessionToDelete.userId !== user.uid) {
      toast.error("Permission denied", {
        description:
          "You cannot delete this session.",
      });

      throw new Error("Session ownership mismatch");
    }

    try {
      await deleteDoc(
        doc(db, "sessions", sessionId)
      );

      /*
       * Remove it from the UI immediately.
       */
      setSessions((currentSessions) =>
        currentSessions.filter(
          (session) =>
            session.id !== sessionId
        )
      );

      /*
       * Close the details panel.
       */
      setSelectedSession(null);

      toast.success("Session deleted", {
        description:
          "The study session has been removed from your history.",
      });
    } catch (error) {
      console.error(
        "Error deleting session:",
        error
      );

      toast.error("Unable to delete session", {
        description:
          "Something went wrong while deleting the session.",
      });

      throw error;
    }
  }

  /*
   * FILTER SESSIONS
   */
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    /*
     * SEARCH
     */
    if (search.trim()) {
  const value = search
    .toLowerCase()
    .trim();

  result = result.filter((session) => {
    const searchableText = [
      session.subject,
      session.taskName,
      session.sessionType,
      session.energyAfter,
      session.plannedGoal,
      session.reflection,
      session.productivityScore?.toString(),
      session.duration?.toString(),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(value);
  });
}

    /*
     * SESSION TYPE
     */
    if (
      sessionType !==
      "All Session Types"
    ) {
      result = result.filter(
        (session) =>
          session.sessionType === sessionType
      );
    }

    /*
     * SUBJECT
     */
    if (
      subject !==
      "All Subjects"
    ) {
      result = result.filter(
        (session) =>
          session.subject === subject
      );
    }

    /*
     * PRODUCTIVITY SCORE
     */
    if (score !== "All Scores") {
      result = result.filter(
        (session) => {
          const value =
            Number(
              session.productivityScore
            ) || 0;

          switch (score) {
            case "9-10":
              return value >= 9;

            case "7-8":
              return (
                value >= 7 &&
                value < 9
              );

            case "5-6":
              return (
                value >= 5 &&
                value < 7
              );

            case "1-4":
              return (
                value > 0 &&
                value < 5
              );

            default:
              return true;
          }
        }
      );
    }

    /*
     * DURATION
     */
    if (
      duration !==
      "All Durations"
    ) {
      result = result.filter(
        (session) => {
          const value =
            Number(session.duration) || 0;

          switch (duration) {
            case "Under 30 min":
              return value < 30;

            case "30-60 min":
              return (
                value >= 30 &&
                value <= 60
              );

            case "1-2 hours":
              return (
                value > 60 &&
                value <= 120
              );

            case "Over 2 hours":
              return value > 120;

            default:
              return true;
          }
        }
      );
    }

    /*
     * DATE RANGE
     */
    if (dateRange !== "all") {
      const now = new Date();
      const start = new Date(now);

      if (dateRange === "week") {
        start.setDate(
          now.getDate() - 7
        );
      }

      if (dateRange === "month") {
        start.setDate(
          now.getDate() - 30
        );
      }

      result = result.filter(
        (session) => {
          const date =
            getSessionDate(session);

          return (
            date !== null &&
            date >= start
          );
        }
      );
    }

    return result;
  }, [
    sessions,
    search,
    sessionType,
    subject,
    score,
    duration,
    dateRange,
  ]);

  /*
   * STATISTICS
   */
  const totalMinutes =
    filteredSessions.reduce(
      (sum, session) =>
        sum +
        (Number(session.duration) || 0),
      0
    );

  const averageScore =
    filteredSessions.length > 0
      ? filteredSessions.reduce(
          (sum, session) =>
            sum +
            (Number(
              session.productivityScore
            ) || 0),
          0
        ) / filteredSessions.length
      : 0;

  const completedGoals =
    filteredSessions.filter(
      (session) =>
        session.goalCompleted === true
    ).length;

  const goalCompletion =
    filteredSessions.length > 0
      ? Math.round(
          (completedGoals /
            filteredSessions.length) *
            100
        )
      : 0;

  /*
   * SESSION TYPE COUNTS
   */
  const sessionTypeCounts =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      filteredSessions.forEach(
        (session) => {
          const type =
            session.sessionType ||
            "Other";

          counts[type] =
            (counts[type] || 0) + 1;
        }
      );

      return counts;
    }, [filteredSessions]);

  /*
   * CLEAR FILTERS
   */
  function clearFilters() {
    setSearch("");
    setSessionType(
      "All Session Types"
    );
    setSubject(
      "All Subjects"
    );
    setScore("All Scores");
    setDuration(
      "All Durations"
    );
    setDateRange("all");
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}

      <SessionsHeader
        search={search}
        setSearch={setSearch}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* STATS */}

      <SessionsStats
        totalSessions={
          filteredSessions.length
        }
        totalMinutes={totalMinutes}
        averageScore={averageScore}
        goalCompletion={goalCompletion}
        sessionTypeCounts={
          sessionTypeCounts
        }
      />

      {/* FILTERS */}

      <SessionFilters
        sessionType={sessionType}
        setSessionType={setSessionType}

        subject={subject}
        setSubject={setSubject}

        score={score}
        setScore={setScore}

        duration={duration}
        setDuration={setDuration}

        view={view}
        setView={setView}

        clearFilters={clearFilters}
      />

      {/* MAIN CONTENT */}

      {view === "list" ? (
        <div
          className={`grid gap-5 ${
            selectedSession
              ? "xl:grid-cols-[minmax(0,1.65fr)_minmax(380px,1fr)]"
              : "grid-cols-1"
          }`}
        >

          <SessionHistory
            sessions={filteredSessions}
            loading={loading}
            selectedSession={
              selectedSession
            }
            onSelect={
              setSelectedSession
            }
          />

          {selectedSession && (
            <SessionDetails
              session={selectedSession}
              onClose={() =>
                setSelectedSession(null)
              }
              onEdit={
                handleEditSession
              }
              onDelete={
                handleDeleteSession
              }
            />
          )}

        </div>
      ) : (
        <div
          className={`grid gap-5 ${
            selectedSession
              ? "xl:grid-cols-[minmax(0,1.65fr)_minmax(380px,1fr)]"
              : "grid-cols-1"
          }`}
        >

          <SessionCalendar
            sessions={filteredSessions}
            onSelect={
              setSelectedSession
            }
          />

          {selectedSession && (
            <SessionDetails
              session={selectedSession}
              onClose={() =>
                setSelectedSession(null)
              }
              onEdit={
                handleEditSession
              }
              onDelete={
                handleDeleteSession
              }
            />
          )}

        </div>
      )}

      {/* BOTTOM ANALYTICS */}

      <div className="grid xl:grid-cols-2 gap-5">

        <SessionActivity
          sessions={filteredSessions}
        />

        <QuickReflection
          sessions={filteredSessions}
        />

      </div>

    </div>
  );
}

/*
 * GET SESSION DATE
 */
export function getSessionDate(
  session: Session
): Date | null {
  if (!session.createdAt) {
    return null;
  }

  try {
    if (
      typeof session.createdAt.toDate ===
      "function"
    ) {
      return session.createdAt.toDate();
    }

    const date = new Date(
      session.createdAt
    );

    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}