"use client";

import { useEffect, useState } from "react";
import { Settings2, Save } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

export default function PreferenceSettings() {
  const [defaultSessionType, setDefaultSessionType] =
    useState("Deep Work");

  const [defaultDuration, setDefaultDuration] =
    useState(60);

  const [breakDuration, setBreakDuration] =
    useState(10);

  const [pomodoro, setPomodoro] =
    useState(25);

  const [weekStarts, setWeekStarts] =
    useState("Monday");

  const [timeFormat, setTimeFormat] =
    useState("12h");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          const ref = doc(
            db,
            "users",
            user.uid
          );

          const snap = await getDoc(ref);

          if (snap.exists()) {
            const data = snap.data().preferences;

            if (data) {
              setDefaultSessionType(
                data.defaultSessionType ?? "Deep Work"
              );

              setDefaultDuration(
                data.defaultDuration ?? 60
              );

              setBreakDuration(
                data.breakDuration ?? 10
              );

              setPomodoro(
                data.pomodoro ?? 25
              );

              setWeekStarts(
                data.weekStarts ?? "Monday"
              );

              setTimeFormat(
                data.timeFormat ?? "12h"
              );
            }
          }
        } catch (error) {
          console.error(
            "Error loading preferences:",
            error
          );
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleSave() {
    const user = auth.currentUser;

    if (!user) {
      toast.success("You must be logged in", {
  description: "You must be logged in to proceed.",
});
      return;
    }

    setSaving(true);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          preferences: {
            defaultSessionType,
            defaultDuration,
            breakDuration,
            pomodoro,
            weekStarts,
            timeFormat,
          },
        },
        { merge: true }
      );

      toast.success("Preferences saved", {
  description: "Your Preferences has been updated successfully.",
});
    } catch (error) {
      console.error(
        "Error saving preferences:",
        error
      );

      toast.success("Please try again.", {
  description: "Unable to save preferences. Please try again.",
});
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">
          Loading preferences...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Preferences
        </h1>

        <p className="text-gray-500 mt-2">
          Customize your study experience.
        </p>
      </div>

      {/* Card */}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-6">

        {/* Title */}

        <div className="flex items-center gap-3">

          <Settings2 className="text-blue-600" />

          <h2 className="text-xl font-semibold">
            Study Preferences
          </h2>

        </div>

        {/* Default Session Type */}

        <div>
          <label className="block mb-2 font-medium">
            Default Session Type
          </label>

          <select
            value={defaultSessionType}
            onChange={(e) =>
              setDefaultSessionType(e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Deep Work</option>
            <option>Practice</option>
            <option>Reading</option>
            <option>Light Review</option>
          </select>
        </div>

        {/* Default Duration */}

        <div>
          <label className="block mb-2 font-medium">
            Default Session Duration
          </label>

          <input
            type="number"
            min="1"
            value={defaultDuration}
            onChange={(e) =>
              setDefaultDuration(
                Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Break Duration */}

        <div>
          <label className="block mb-2 font-medium">
            Break Duration (minutes)
          </label>

          <input
            type="number"
            min="1"
            value={breakDuration}
            onChange={(e) =>
              setBreakDuration(
                Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Pomodoro */}

        <div>
          <label className="block mb-2 font-medium">
            Pomodoro Length
          </label>

          <select
            value={pomodoro}
            onChange={(e) =>
              setPomodoro(
                Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={25}>
              25 min
            </option>

            <option value={30}>
              30 min
            </option>

            <option value={45}>
              45 min
            </option>

            <option value={60}>
              60 min
            </option>
          </select>
        </div>

        {/* Week Starts */}

        <div>
          <label className="block mb-2 font-medium">
            Week Starts On
          </label>

          <select
            value={weekStarts}
            onChange={(e) =>
              setWeekStarts(e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Monday</option>
            <option>Sunday</option>
          </select>
        </div>

        {/* Time Format */}

        <div>
          <label className="block mb-2 font-medium">
            Time Format
          </label>

          <select
            value={timeFormat}
            onChange={(e) =>
              setTimeFormat(e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="12h">
              12-hour
            </option>

            <option value="24h">
              24-hour
            </option>
          </select>
        </div>

        {/* Save */}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 transition disabled:opacity-50"
        >
          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save Preferences"}
        </button>

      </div>
    </div>
  );
}