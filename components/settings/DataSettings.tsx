"use client";

import { useEffect, useState } from "react";
import {
  Database,
  Download,
  Trash2,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function DataSettings() {
  const [user, setUser] = useState<User | null>(null);

  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        try {
          const sessionsQuery = query(
            collection(db, "sessions"),
            where("userId", "==", currentUser.uid)
          );

          const snapshot = await getDocs(sessionsQuery);

          setSessionCount(snapshot.size);
        } catch (error) {
          console.error(
            "Error loading data:",
            error
          );

          setMessage(
            "Unable to load your study data."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleExport() {
    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    setExporting(true);
    setMessage("");

    try {
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(sessionsQuery);

      const sessions = snapshot.docs.map((sessionDoc) => ({
        id: sessionDoc.id,
        ...sessionDoc.data(),
      }));

      const exportData = {
        exportedAt: new Date().toISOString(),
        userId: user.uid,
        sessions,
      };

      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        {
          type: "application/json",
        }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "studytrack-data.json";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setMessage("Your data has been exported.");
    } catch (error) {
      console.error(
        "Error exporting data:",
        error
      );

      setMessage("Unable to export your data.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteSessions() {
    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete all of your study sessions? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(sessionsQuery);

      await Promise.all(
        snapshot.docs.map((sessionDoc) =>
          deleteDoc(
            doc(db, "sessions", sessionDoc.id)
          )
        )
      );

      setSessionCount(0);

      setMessage(
        "All of your study sessions have been deleted."
      );
    } catch (error) {
      console.error(
        "Error deleting sessions:",
        error
      );

      setMessage(
        "Unable to delete your study sessions."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading data settings...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-500">
        You must be logged in to manage your data.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Data
        </h1>

        <p className="text-gray-500 mt-2">
          Manage and export your StudyTrack data.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-6">

        <div className="flex items-center gap-3">
          <Database className="accent-text" />

          <h2 className="text-xl font-semibold">
            Your Data
          </h2>
        </div>

        <div className="rounded-2xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Study Sessions
          </p>

          <p className="text-3xl font-bold mt-1">
            {sessionCount}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            sessions stored in StudyTrack
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6">

          <h3 className="font-semibold text-lg">
            Export Data
          </h3>

          <p className="text-sm text-gray-500 mt-1 mb-4">
            Download your study sessions as a JSON file.
          </p>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-3 accent-bg text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            <Download size={18} />

            {exporting
              ? "Exporting..."
              : "Export My Data"}
          </button>

        </div>

        <div className="border-t border-gray-100 pt-6">

          <h3 className="font-semibold text-lg text-red-600">
            Delete Study Sessions
          </h3>

          <p className="text-sm text-gray-500 mt-1 mb-4">
            Permanently delete all of your recorded study sessions.
          </p>

          <button
            type="button"
            onClick={handleDeleteSessions}
            disabled={deleting || sessionCount === 0}
            className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
          >
            <Trash2 size={18} />

            {deleting
              ? "Deleting..."
              : "Delete All Sessions"}
          </button>

        </div>

        {message && (
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}