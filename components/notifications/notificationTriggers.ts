import { createNotification } from "./createNotification";
import { getNotificationPreferences } from "./notificationPreferences";


/*
 * =========================================
 * GOALS
 * =========================================
 */

export async function notifyGoalCompleted(
  userId: string,
  goalName: string
) {

  const preferences =
    await getNotificationPreferences(userId);


  if (!preferences.achievementAlerts) {
    return;
  }


  await createNotification(userId, {
    title: "Goal completed! 🎯",
    message:
      `You completed your goal: ${goalName}`,
    type: "goal",
    link: "/settings/goals",
  });
}


export async function notifyGoalBehind(
  userId: string,
  goalName: string
) {

  const preferences =
    await getNotificationPreferences(userId);


  if (!preferences.achievementAlerts) {
    return;
  }


  await createNotification(userId, {
    title: "You're falling behind 📊",
    message:
      `You're behind on your goal: ${goalName}`,
    type: "goal",
    link: "/settings/goals",
  });
}


/*
 * =========================================
 * STUDY
 * =========================================
 */

export async function notifyStudyReminder(
  userId: string
) {

  const preferences =
    await getNotificationPreferences(userId);


  if (!preferences.studyReminder) {
    return;
  }


  await createNotification(userId, {
    title: "Time to study 📚",
    message:
      "You have a study session planned. Let's get started!",
    type: "study",
    link: "/sessions",
  });
}


/*
 * =========================================
 * BREAK
 * =========================================
 */

export async function notifyBreakReminder(
  userId: string
) {

  const preferences =
    await getNotificationPreferences(userId);


  if (!preferences.breakReminder) {
    return;
  }


  await createNotification(userId, {
    title: "Time for a break ☕",
    message:
      "You've been studying for a while. Take a short break!",
    type: "break",
    link: "/sessions",
  });
}


/*
 * =========================================
 * STREAK
 * =========================================
 */

export async function notifyStreak(
  userId: string,
  streak: number
) {

  const preferences =
    await getNotificationPreferences(userId);


  if (!preferences.achievementAlerts) {
    return;
  }


  await createNotification(userId, {
    title: `${streak} day streak! 🔥`,
    message:
      "Great consistency! Keep your streak going.",
    type: "streak",
    link: "/",
  });
}


/*
 * =========================================
 * ACHIEVEMENT
 * =========================================
 */

export async function notifyAchievement(
  userId: string,
  achievement: string
) {

  const preferences =
    await getNotificationPreferences(userId);


  if (!preferences.achievementAlerts) {
    return;
  }


  await createNotification(userId, {
    title: "New achievement! 🏆",
    message: achievement,
    type: "achievement",
    link: "/analytics",
  });
}


/*
 * =========================================
 * DAILY SUMMARY
 * =========================================
 */

export async function notifyDailySummary(
  userId: string,
  hours: number,
  sessions: number
) {

  const preferences =
    await getNotificationPreferences(userId);


  if (!preferences.dailySummary) {
    return;
  }


  await createNotification(userId, {
    title: "Your daily summary 📊",
    message:
      `You studied ${hours} hour${
        hours === 1 ? "" : "s"
      } across ${sessions} session${
        sessions === 1 ? "" : "s"
      } today.`,
    type: "summary",
    link: "/analytics",
  });
}


/*
 * =========================================
 * WEEKLY REPORT
 * =========================================
 */

export async function notifyWeeklyReport(
  userId: string
) {

  const preferences =
    await getNotificationPreferences(userId);


  if (!preferences.weeklyReport) {
    return;
  }


  await createNotification(userId, {
    title: "Your weekly report 📈",
    message:
      "Your weekly productivity report is ready.",
    type: "report",
    link: "/analytics",
  });
}