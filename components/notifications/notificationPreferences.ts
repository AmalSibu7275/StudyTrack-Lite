import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type NotificationPreferences = {
  studyReminder: boolean;
  breakReminder: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  achievementAlerts: boolean;
};


/*
 * Default settings
 */

const DEFAULT_PREFERENCES: NotificationPreferences = {
  studyReminder: true,
  breakReminder: true,
  dailySummary: true,
  weeklyReport: true,
  achievementAlerts: true,
};


/*
 * Get the user's notification preferences
 */

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {

  if (!userId) {
    return DEFAULT_PREFERENCES;
  }


  try {

    const snapshot = await getDoc(
      doc(db, "users", userId)
    );


    if (!snapshot.exists()) {
      return DEFAULT_PREFERENCES;
    }


    const data = snapshot.data();

    const notifications =
      data.notifications;


    if (!notifications) {
      return DEFAULT_PREFERENCES;
    }


    return {
      studyReminder:
        notifications.studyReminder ??
        true,

      breakReminder:
        notifications.breakReminder ??
        true,

      dailySummary:
        notifications.dailySummary ??
        true,

      weeklyReport:
        notifications.weeklyReport ??
        true,

      achievementAlerts:
        notifications.achievementAlerts ??
        true,
    };

  } catch (error) {

    console.error(
      "Failed to load notification preferences:",
      error
    );

    return DEFAULT_PREFERENCES;
  }
}