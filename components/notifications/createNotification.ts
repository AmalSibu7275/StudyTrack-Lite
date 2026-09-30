import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type NotificationType =
  | "study"
  | "break"
  | "goal"
  | "achievement"
  | "summary"
  | "report"
  | "streak";

type CreateNotificationData = {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
};

export async function createNotification(
  userId: string,
  data: CreateNotificationData
) {
  if (!userId) {
    console.error(
      "Cannot create notification: missing user ID."
    );

    return false;
  }

  try {
    const notificationRef = await addDoc(
      collection(
        db,
        "users",
        userId,
        "notifications"
      ),
      {
        title: data.title,
        message: data.message,
        type: data.type,
        read: false,
        createdAt: serverTimestamp(),
        ...(data.link
          ? {
              link: data.link,
            }
          : {}),
      }
    );

    console.log(
      "Notification created:",
      notificationRef.id
    );

    return true;
  } catch (error) {
    console.error(
      "Failed to create notification:",
      error
    );

    return false;
  }
}