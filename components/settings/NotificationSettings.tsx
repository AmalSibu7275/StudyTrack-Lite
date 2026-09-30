"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

import { auth, db } from "@/lib/firebase";

type NotificationPreferences = {
  studyReminder: boolean;
  breakReminder: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  achievementAlerts: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  studyReminder: true,
  breakReminder: true,
  dailySummary: true,
  weeklyReport: true,
  achievementAlerts: true,
};

const options = [
  {
    key: "studyReminder" as const,
    title: "Study Reminders",
    description: "Remind me to start studying",
  },
  {
    key: "breakReminder" as const,
    title: "Break Reminders",
    description: "Notify me when it's time for a break",
  },
  {
    key: "dailySummary" as const,
    title: "Daily Summary",
    description: "Receive today's study summary",
  },
  {
    key: "weeklyReport" as const,
    title: "Weekly Report",
    description: "Receive weekly productivity insights",
  },
  {
    key: "achievementAlerts" as const,
    title: "Achievement Alerts",
    description: "Celebrate streaks and milestones",
  },
];

export default function NotificationSettings() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] =
    useState<keyof NotificationPreferences | null>(null);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setPreferences(DEFAULT_PREFERENCES);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);

      unsubscribeUser = onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setPreferences(DEFAULT_PREFERENCES);
            setLoading(false);
            return;
          }

          const data = snapshot.data();
          const notifications = data.notifications || {};

          setPreferences({
            studyReminder:
              notifications.studyReminder ?? true,
            breakReminder:
              notifications.breakReminder ?? true,
            dailySummary:
              notifications.dailySummary ?? true,
            weeklyReport:
              notifications.weeklyReport ?? true,
            achievementAlerts:
              notifications.achievementAlerts ?? true,
          });

          setLoading(false);
        },
        (error) => {
          console.error(
            "Error loading notification settings:",
            error
          );

          toast.error("Couldn't load notification settings", {
            description:
              "Please refresh the page and try again.",
          });

          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, []);

  async function toggleNotification(
    key: keyof NotificationPreferences
  ) {
    const user = auth.currentUser;

    if (!user) {
      toast.error("You're not logged in", {
        description:
          "Please sign in before changing notification settings.",
      });

      return;
    }

    const previousValue = preferences[key];
    const newValue = !previousValue;

    // Immediately update the UI
    setPreferences((current) => ({
      ...current,
      [key]: newValue,
    }));

    setSavingKey(key);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          notifications: {
            [key]: newValue,
          },
        },
        {
          merge: true,
        }
      );

      const option = options.find(
        (item) => item.key === key
      );

      toast.success(
        `${option?.title || "Notification"} ${
          newValue ? "enabled" : "disabled"
        }`,
        {
          description: newValue
            ? "You'll receive these notifications."
            : "You won't receive these notifications.",
        }
      );
    } catch (error) {
      console.error(
        "Error updating notification preference:",
        error
      );

      // Revert UI if Firestore fails
      setPreferences((current) => ({
        ...current,
        [key]: previousValue,
      }));

      toast.error("Couldn't update setting", {
        description:
          "Your change wasn't saved. Please try again.",
      });
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-52 rounded bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />

          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-16 rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Notification Settings
          </h2>

          <p className="text-sm text-gray-500">
            Choose which notifications you want to receive.
          </p>
        </div>
      </div>

      {/* Notification options */}
      <div className="space-y-3">
        {options.map((option) => {
          const enabled = preferences[option.key];
          const saving = savingKey === option.key;

          return (
            <div
              key={option.key}
              className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">
                  {option.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {option.description}
                </p>
              </div>

              <button
  type="button"
  onClick={() => toggleNotification(option.key)}
  disabled={savingKey !== null}
  aria-label={`Toggle ${option.title}`}
  aria-pressed={enabled}
  className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors duration-200 ${
    enabled
      ? "accent-bg"
      : "bg-gray-300 dark:bg-gray-600"
  } ${
    saving
      ? "cursor-wait opacity-60"
      : "cursor-pointer"
  }`}
>
  <span
    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
      enabled
        ? "translate-x-5"
        : "translate-x-0"
    }`}
  />
</button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-700">
          Changes are saved automatically.
        </p>
      </div>
    </div>
  );
}