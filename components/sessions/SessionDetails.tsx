"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Flag,
  Target,
  Zap,
  X,
  Trash2,
  Pencil,
  CheckCircle2,
  Save,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

import {
  Session,
  getSessionDate,
} from "./Sessions";

type Props = {
  session: Session;
  onClose: () => void;
  onEdit: (session: Session) => Promise<void>;
  onDelete: (sessionId: string) => Promise<void>;
};

export default function SessionDetails({
  session,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const date = getSessionDate(session);

  const score =
    Number(session.productivityScore) || 0;

  const [editing, setEditing] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingNow, setDeletingNow] =
    useState(false);

  const [subject, setSubject] =
    useState(session.subject || "");

  const [taskName, setTaskName] =
    useState(session.taskName || "");

  const [duration, setDuration] =
    useState(String(session.duration || ""));

  const [plannedGoal, setPlannedGoal] =
    useState(session.plannedGoal || "");

  const [sessionType, setSessionType] =
    useState(
      session.sessionType || "Deep Work"
    );

  const [energyAfter, setEnergyAfter] =
    useState(
      session.energyAfter || "Medium"
    );

  const [productivityScore, setProductivityScore] =
    useState(
      Number(session.productivityScore) || 5
    );

  const [goalCompleted, setGoalCompleted] =
    useState(
      session.goalCompleted === true
    );

  /*
   * START EDITING
   */
  function startEditing() {
    setSubject(session.subject || "");
    setTaskName(session.taskName || "");
    setDuration(
      String(session.duration || "")
    );

    setPlannedGoal(
      session.plannedGoal || ""
    );

    setSessionType(
      session.sessionType || "Deep Work"
    );

    setEnergyAfter(
      session.energyAfter || "Medium"
    );

    setProductivityScore(
      Number(session.productivityScore) || 5
    );

    setGoalCompleted(
      session.goalCompleted === true
    );

    setEditing(true);
  }

  /*
   * SAVE EDITED SESSION
   */
  async function saveChanges() {
    const durationNumber =
      Number(duration);

    /*
     * VALIDATION
     */
    if (!subject.trim()) {
      toast.error("Subject required", {
        description:
          "Please enter a subject for this session.",
      });

      return;
    }

    if (!taskName.trim()) {
      toast.error("Task required", {
        description:
          "Please enter a task for this session.",
      });

      return;
    }

    if (
      !duration ||
      Number.isNaN(durationNumber) ||
      durationNumber <= 0
    ) {
      toast.error("Invalid duration", {
        description:
          "Please enter a duration greater than 0 minutes.",
      });

      return;
    }

    try {
      setSaving(true);

      /*
       * Create updated session object.
       */
      const updatedSession: Session = {
        ...session,

        subject: subject.trim(),

        taskName: taskName.trim(),

        duration: durationNumber,

        plannedGoal:
          plannedGoal.trim(),

        sessionType,

        energyAfter,

        productivityScore,

        goalCompleted,
      };

      /*
       * Sessions.tsx handles
       * the actual Firestore update.
       */
      await onEdit(updatedSession);

      setEditing(false);
    } catch (error) {
      console.error(
        "Error saving session:",
        error
      );

      /*
       * Sessions.tsx already displays
       * the main error toast.
       */
    } finally {
      setSaving(false);
    }
  }

  /*
   * DELETE SESSION
   */
  async function removeSession() {
    try {
      setDeletingNow(true);

      /*
       * Sessions.tsx handles
       * the Firestore delete.
       */
      await onDelete(session.id);

      setDeleting(false);
    } catch (error) {
      console.error(
        "Error deleting session:",
        error
      );
    } finally {
      setDeletingNow(false);
    }
  }

  /*
   * EDIT VIEW
   */
  if (editing) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 h-fit">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setEditing(false)
              }
              disabled={saving}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Edit Session
              </h2>

              <p className="text-xs text-gray-500">
                Update your study session
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>

        </div>

        <div className="space-y-4">

          {/* SUBJECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              disabled={saving}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          {/* TASK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task
            </label>

            <input
              type="text"
              value={taskName}
              onChange={(e) =>
                setTaskName(e.target.value)
              }
              disabled={saving}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          {/* DURATION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>

            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value)
              }
              disabled={saving}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          {/* GOAL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned Goal
            </label>

            <input
              type="text"
              value={plannedGoal}
              onChange={(e) =>
                setPlannedGoal(
                  e.target.value
                )
              }
              disabled={saving}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          {/* SESSION TYPE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Type
            </label>

            <select
              value={sessionType}
              onChange={(e) =>
                setSessionType(
                  e.target.value
                )
              }
              disabled={saving}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option>
                Deep Work
              </option>

              <option>
                Light Review
              </option>

              <option>
                Practice
              </option>

              <option>
                Preview
              </option>
            </select>
          </div>

          {/* ENERGY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Energy Level
            </label>

            <select
              value={energyAfter}
              onChange={(e) =>
                setEnergyAfter(
                  e.target.value
                )
              }
              disabled={saving}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* PRODUCTIVITY */}
          <div>

            <div className="flex justify-between mb-2">

              <span className="text-sm font-medium text-gray-700">
                Productivity Score
              </span>

              <span className="font-semibold text-blue-600">
                {productivityScore}/10
              </span>

            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={productivityScore}
              onChange={(e) =>
                setProductivityScore(
                  Number(e.target.value)
                )
              }
              disabled={saving}
              className="w-full"
            />

          </div>

          {/* GOAL COMPLETED */}
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition">

            <input
              type="checkbox"
              checked={goalCompleted}
              onChange={(e) =>
                setGoalCompleted(
                  e.target.checked
                )
              }
              disabled={saving}
              className="w-4 h-4 accent-blue-600"
            />

            <div>

              <p className="text-sm font-medium text-gray-800">
                Goal completed
              </p>

              <p className="text-xs text-gray-500">
                Mark this session's planned
                goal as completed.
              </p>

            </div>

          </label>

        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-6">

          <button
            type="button"
            onClick={() =>
              setEditing(false)
            }
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >

            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </div>
    );
  }

  /*
   * NORMAL DETAILS VIEW
   */
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 h-fit">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-3">

            <ArrowLeft
              size={17}
              className="text-gray-500"
            />

            <h2 className="text-sm font-semibold">
              Session Details
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>

        </div>

        {/* SESSION HEADER */}
        <div className="flex items-start justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target size={24} />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <h3 className="font-bold text-lg text-gray-900">
                  {session.subject ||
                    "Study Session"}
                </h3>

                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">
                  {session.sessionType ||
                    "Study"}
                </span>

              </div>

              <p className="text-sm text-gray-500">
                {session.taskName ||
                  "Study session"}
              </p>

            </div>

          </div>

          <div className="rounded-xl bg-green-50 px-4 py-2 text-right">

            <p className="text-xl font-bold text-green-600">
              {score}/10
            </p>

            <p className="text-xs text-green-700">
              {score >= 8
                ? "High Focus"
                : score >= 6
                ? "Good Focus"
                : "Low Focus"}
            </p>

          </div>

        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">

          <Detail
            icon={
              <CalendarDays size={17} />
            }
            label="Date"
            value={
              date
                ? date.toLocaleDateString()
                : "Unknown"
            }
          />

          <Detail
            icon={
              <Clock3 size={17} />
            }
            label="Started"
            value={
              date
                ? date.toLocaleTimeString(
                    [],
                    {
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  )
                : "Unknown"
            }
          />

          <Detail
            icon={
              <Clock3 size={17} />
            }
            label="Duration"
            value={`${session.duration || 0} minutes`}
          />

          <Detail
            icon={
              <Flag size={17} />
            }
            label="Session Type"
            value={
              session.sessionType ||
              "Study"
            }
          />

          <Detail
            icon={
              <Target size={17} />
            }
            label="Planned Goal"
            value={
              session.plannedGoal ||
              "No goal specified"
            }
          />

          <Detail
            icon={
              <CheckCircle2 size={17} />
            }
            label="Goal Completed"
            value={
              session.goalCompleted
                ? "Yes"
                : "No"
            }
          />

          <Detail
            icon={
              <Zap size={17} />
            }
            label="Energy Level"
            value={
              session.energyAfter ||
              "Not recorded"
            }
          />

        </div>

        {/* REFLECTION */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100">

          <div className="flex items-center gap-2 mb-2">

            <Pencil
              size={15}
              className="text-blue-600"
            />

            <p className="text-sm font-semibold text-gray-800">
              Session Reflection
            </p>

          </div>

          <p className="text-xs text-gray-600 leading-5">
            {session.reflection ||
              "Your session was recorded successfully. Use your productivity score and energy level to understand how this session went."}
          </p>

        </div>

        {/* AI FEEDBACK */}
        <div className="mt-4 p-4 rounded-xl bg-green-50/60 border border-green-100">

          <div className="flex items-center gap-2 mb-2">

            <Zap
              size={15}
              className="text-green-600"
            />

            <p className="text-sm font-semibold">
              AI Feedback
            </p>

          </div>

          <p className="text-xs text-gray-600 leading-5">
            {score >= 8
              ? "Great work! This session had a strong productivity score. Consider using similar study conditions again."
              : "Consider reviewing what affected your focus during this session and adjusting your next study block."}
          </p>

        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between mt-5">

          <button
            type="button"
            onClick={startEditing}
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium flex items-center gap-2 hover:bg-blue-100 transition"
          >
            <Pencil size={15} />
            Edit Session
          </button>

          <button
            type="button"
            onClick={() =>
              setDeleting(true)
            }
            className="w-10 h-10 rounded-xl border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition"
            aria-label="Delete session"
          >
            <Trash2 size={17} />
          </button>

        </div>

      </div>

      {/* DELETE CONFIRMATION */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">

            {/* ICON + MESSAGE */}
            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={22} />
              </div>

              <div>

                <h3 className="text-lg font-bold text-gray-900">
                  Delete this session?
                </h3>

                <p className="text-sm text-gray-500 mt-1 leading-5">
                  This will permanently remove{" "}
                  <span className="font-medium text-gray-700">
                    {session.subject ||
                      "this study session"}
                  </span>{" "}
                  from your study history.
                  This action cannot be undone.
                </p>

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  setDeleting(false)
                }
                disabled={deletingNow}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={removeSession}
                disabled={deletingNow}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >

                <Trash2 size={16} />

                {deletingNow
                  ? "Deleting..."
                  : "Delete Session"}

              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

/*
 * DETAIL COMPONENT
 */
function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>

      <div className="flex items-center gap-2 text-gray-500 mb-1">

        {icon}

        <span className="text-xs">
          {label}
        </span>

      </div>

      <p className="text-xs font-medium text-gray-800">
        {value}
      </p>

    </div>
  );
}