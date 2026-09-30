"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { toast } from "sonner";

import { auth, db } from "@/lib/firebase";

type Preferences = {
  studyReminder: boolean;
  breakReminder: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  achievementAlerts: boolean;
};

const defaultPreferences: Preferences = {
  studyReminder: true,
  breakReminder: true,
  dailySummary: true,
  weeklyReport: true,
  achievementAlerts: true,
};

export default function NotificationPreferences() {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [loading, setLoading] = useState(true);

  const [savingKey, setSavingKey] =
    useState<keyof Preferences | null>(null);

  /*
   * =========================================
   * LOAD NOTIFICATION PREFERENCES
   * =========================================
   */

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        // No user
        if (!user) {
          setLoading(false);
          return;
        }

        const userRef = doc(
          db,
          "users",
          user.uid
        );

        unsubscribeUser = onSnapshot(
          userRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              setPreferences(defaultPreferences);
              setLoading(false);
              return;
            }

            const data = snapshot.data();

            const notifications =
              data.notifications ?? {};

            setPreferences({
              studyReminder:
                notifications.studyReminder ??
                defaultPreferences.studyReminder,

              breakReminder:
                notifications.breakReminder ??
                defaultPreferences.breakReminder,

              dailySummary:
                notifications.dailySummary ??
                defaultPreferences.dailySummary,

              weeklyReport:
                notifications.weeklyReport ??
                defaultPreferences.weeklyReport,

              achievementAlerts:
                notifications.achievementAlerts ??
                defaultPreferences.achievementAlerts,
            });

            setLoading(false);
          },
          (error) => {
            console.error(
              "Error loading notification preferences:",
              error
            );

            setLoading(false);

            toast.error(
              "Unable to load notification settings"
            );
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, []);

  /*
   * =========================================
   * TOGGLE PREFERENCE
   * =========================================
   */

  async function togglePreference(
    key: keyof Preferences
  ) {
    const user = auth.currentUser;

    if (!user) {
      toast.error(
        "You must be logged in to change notification settings."
      );
      return;
    }

    // Prevent changing multiple settings at once
    if (savingKey !== null) {
      return;
    }

    const previousValue = preferences[key];

    const newValue = !previousValue;

    /*
     * Update UI immediately
     */
    setPreferences((current) => ({
      ...current,
      [key]: newValue,
    }));

    setSavingKey(key);

    try {
      const userRef = doc(
        db,
        "users",
        user.uid
      );

      await setDoc(
        userRef,
        {
          notifications: {
            [key]: newValue,
          },
        },
        {
          merge: true,
        }
      );

      toast.success(
        newValue
          ? "Notification enabled"
          : "Notification disabled"
      );
    } catch (error) {
      console.error(
        "Error updating notification preference:",
        error
      );

      /*
       * Revert UI if Firebase write fails
       */
      setPreferences((current) => ({
        ...current,
        [key]: previousValue,
      }));

      toast.error(
        "Could not update notification setting"
      );
    } finally {
      setSavingKey(null);
    }
  }

  /*
   * =========================================
   * NOTIFICATION OPTIONS
   * =========================================
   */

  const notifications = [
    {
      key: "studyReminder" as const,
      title: "Study Reminders",
      description:
        "Remind me to start studying",
    },
    {
      key: "breakReminder" as const,
      title: "Break Reminders",
      description:
        "Notify when it's time for a break",
    },
    {
      key: "dailySummary" as const,
      title: "Daily Summary",
      description:
        "Receive today's study summary",
    },
    {
      key: "weeklyReport" as const,
      title: "Weekly Report",
      description:
        "Weekly productivity insights",
    },
    {
      key: "achievementAlerts" as const,
      title: "Achievement Alerts",
      description:
        "Celebrate streaks and milestones",
    },
  ];

  /*
   * =========================================
   * LOADING STATE
   * =========================================
   */

  if (loading) {
    return (
      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          shadow-sm
          p-6
          h-full
        "
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-yellow-100
              flex
              items-center
              justify-center
            "
          >
            <Bell className="text-yellow-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Notifications
            </h2>

            <p className="text-sm text-gray-500">
              Loading notification preferences...
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-48 bg-gray-100 rounded" />
              </div>

              <div className="w-12 h-7 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /*
   * =========================================
   * UI
   * =========================================
   */

  return (
    <div
      className="
        bg-white
        rounded-3xl
        border
        border-gray-200
        shadow-sm
        p-6
        h-full
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          gap-3
          mb-6
        "
      >
        <div
          className="
            w-12
            h-12
            rounded-2xl
            bg-yellow-100
            flex
            items-center
            justify-center
          "
        >
          <Bell className="text-yellow-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Notifications
          </h2>

          <p className="text-sm text-gray-500">
            Manage notification preferences
          </p>
        </div>
      </div>

      {/* OPTIONS */}

      <div className="space-y-5">
        {notifications.map((item) => {
          const enabled =
            preferences[item.key];

          const saving =
            savingKey === item.key;

          return (
            <div
              key={item.key}
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div>
                <h3 className="font-semibold">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.description}
                </p>
              </div>

              {/* TOGGLE */}

              <button
                type="button"
                disabled={savingKey !== null}
                onClick={() =>
                  togglePreference(item.key)
                }
                aria-label={`Toggle ${item.title}`}
                aria-pressed={enabled}
                className={`
                  relative
                  shrink-0
                  w-12
                  h-7
                  rounded-full
                  transition-all
                  duration-200
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  ${
                    enabled
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }
                `}
              >
                <div
                  className={`
                    absolute
                    top-1
                    left-1
                    w-5
                    h-5
                    bg-white
                    rounded-full
                    shadow
                    transition-transform
                    duration-200
                    ${
                      enabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }
                  `}
                />

                {saving && (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        w-3
                        h-3
                        border-2
                        border-gray-400
                        border-t-transparent
                        rounded-full
                        animate-spin
                      "
                    />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}