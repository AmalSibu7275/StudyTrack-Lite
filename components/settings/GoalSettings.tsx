"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  Target,
  Plus,
  CheckCircle2,
  Clock3,
  Trash2,
  Pencil,
  X,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { notifyGoalCompleted } from "@/components/notifications/notificationTriggers";
type Goal = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetHours: number;
  deadline: string;
  completed: boolean;
  createdAt?: any;
};

type Session = {
  duration?: number;
  createdAt?: any;
  userId?: string;
};

type Filter = "all" | "active" | "completed";

export default function GoalSettings() {
  const [userId, setUserId] = useState<string | null>(null);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [editingGoal, setEditingGoal] =
    useState<Goal | null>(null);

  const [filter, setFilter] =
    useState<Filter>("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [targetHours, setTargetHours] =
    useState("");
  const [deadline, setDeadline] =
    useState("");

  const [saving, setSaving] = useState(false);

  /*
   * ==========================================
   * AUTH
   * ==========================================
   */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUserId(user?.uid ?? null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
   * ==========================================
   * REAL-TIME GOALS
   * ==========================================
   */

  useEffect(() => {
    if (!userId) {
      setGoals([]);
      return;
    }

    const q = query(
      collection(db, "goals"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Goal[] =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...(item.data() as Omit<
              Goal,
              "id"
            >),
          }));

        setGoals(data);
      },
      (error) => {
        console.error(
          "Goals listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [userId]);

  /*
   * ==========================================
   * REAL-TIME SESSIONS
   * ==========================================
   */

  useEffect(() => {
    if (!userId) {
      setSessions([]);
      return;
    }

    const q = query(
      collection(db, "sessions"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Session[] =
          snapshot.docs.map(
            (item) =>
              item.data() as Session
          );

        setSessions(data);
      },
      (error) => {
        console.error(
          "Sessions listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [userId]);

  /*
   * ==========================================
   * GOAL PROGRESS
   * ==========================================
   */

  function getGoalProgress(
    goal: Goal
  ): number {
    const goalCreated =
      goal.createdAt?.toDate
        ? goal.createdAt.toDate()
        : goal.createdAt
        ? new Date(goal.createdAt)
        : null;

    const relevantSessions =
      sessions.filter((session) => {
        if (!session.createdAt) {
          return false;
        }

        const sessionDate =
          session.createdAt?.toDate
            ? session.createdAt.toDate()
            : new Date(session.createdAt);

        if (
          !goalCreated ||
          isNaN(sessionDate.getTime())
        ) {
          return false;
        }

        return sessionDate >= goalCreated;
      });

    const minutes =
      relevantSessions.reduce(
        (total, session) =>
          total +
          (Number(session.duration) || 0),
        0
      );

    const hours = minutes / 60;

    if (goal.targetHours <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (hours / goal.targetHours) * 100
      )
    );
  }

  function getGoalHours(goal: Goal) {
    const progress = getGoalProgress(goal);

    return (
      (progress / 100) *
      goal.targetHours
    );
  }

  /*
   * ==========================================
   * FILTER
   * ==========================================
   */

  const filteredGoals = useMemo(() => {
    if (filter === "active") {
      return goals.filter(
        (goal) => !goal.completed
      );
    }

    if (filter === "completed") {
      return goals.filter(
        (goal) => goal.completed
      );
    }

    return goals;
  }, [goals, filter]);

  /*
   * ==========================================
   * STATS
   * ==========================================
   */

  const completedCount =
    goals.filter(
      (goal) => goal.completed
    ).length;

  const activeCount =
    goals.filter(
      (goal) => !goal.completed
    ).length;

  const overallProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (sum, goal) =>
              sum +
              getGoalProgress(goal),
            0
          ) / goals.length
        )
      : 0;

  /*
   * ==========================================
   * FORM
   * ==========================================
   */

  function resetForm() {
    setTitle("");
    setDescription("");
    setTargetHours("");
    setDeadline("");
    setEditingGoal(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setEditingGoal(null);
    setTitle("");
    setDescription("");
    setTargetHours("");
    setDeadline("");
    setShowForm(true);
  }

  function openEditForm(goal: Goal) {
    setEditingGoal(goal);

    setTitle(goal.title);
    setDescription(
      goal.description || ""
    );
    setTargetHours(
      String(goal.targetHours)
    );
    setDeadline(goal.deadline);

    setShowForm(true);
  }

  /*
   * ==========================================
   * SAVE GOAL
   * ==========================================
   */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!userId) {
      return;
    }

    if (!title.trim()) {
      return;
    }

    if (
      !targetHours ||
      Number(targetHours) <= 0
    ) {
      return;
    }

    setSaving(true);

    try {
      if (editingGoal) {
        await updateDoc(
          doc(
            db,
            "goals",
            editingGoal.id
          ),
          {
            title: title.trim(),
            description:
              description.trim(),
            targetHours:
              Number(targetHours),
            deadline,
          }
        );
      } else {
        await addDoc(
          collection(db, "goals"),
          {
            userId,
            title: title.trim(),
            description:
              description.trim(),
            targetHours:
              Number(targetHours),
            deadline,
            completed: false,
            createdAt: new Date(),
          }
        );
      }

      resetForm();
    } catch (error) {
      console.error(
        "Error saving goal:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ==========================================
   * TOGGLE COMPLETE
   * ==========================================
   */

  async function toggleGoal(goal: Goal) {
  if (!userId) {
    return;
  }

  const becomingCompleted = !goal.completed;

  try {
    await updateDoc(
      doc(db, "goals", goal.id),
      {
        completed: becomingCompleted,
      }
    );

    // Create a notification only when the goal
    // changes from active → completed.
    if (becomingCompleted) {
      await notifyGoalCompleted(
        userId,
        goal.title
      );
    }
  } catch (error) {
    console.error(
      "Error updating goal:",
      error
    );
  }
}

  /*
   * ==========================================
   * DELETE
   * ==========================================
   */

  async function deleteGoal(
    goal: Goal
  ) {
    const confirmed =
      window.confirm(
        `Delete "${goal.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "goals", goal.id)
      );
    } catch (error) {
      console.error(
        "Error deleting goal:",
        error
      );
    }
  }

  /*
   * ==========================================
   * DEADLINE STATUS
   * ==========================================
   */

  function getDeadlineStatus(
    goal: Goal
  ) {
    if (!goal.deadline) {
      return {
        text: "No deadline",
        className:
          "text-gray-500",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate =
      new Date(goal.deadline);

    deadlineDate.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      Math.ceil(
        (deadlineDate.getTime() -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (goal.completed) {
      return {
        text: "Completed",
        className:
          "text-green-600",
      };
    }

    if (difference < 0) {
      return {
        text: "Overdue",
        className:
          "text-red-500",
      };
    }

    if (difference === 0) {
      return {
        text: "Due today",
        className:
          "text-orange-500",
      };
    }

    if (difference === 1) {
      return {
        text: "Due tomorrow",
        className:
          "text-orange-500",
      };
    }

    return {
      text: `${difference} days left`,
      className:
        "text-gray-500",
    };
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-8">
        <div className="
          bg-white
          rounded-3xl
          border
          border-gray-100
          p-10
          text-center
          text-gray-500
        ">
          Loading goals...
        </div>
      </div>
    );
  }

  return (
    <div className="
      px-4
      md:px-8
      xl:px-10
      py-7
      max-w-[1500px]
      mx-auto
    ">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
        mb-7
      ">

        <div>
          <div className="
            flex
            items-center
            gap-3
          ">
            <div className="
              w-11
              h-11
              rounded-xl
              bg-blue-50
              text-blue-600
              flex
              items-center
              justify-center
            ">
              <Target size={22} />
            </div>

            <div>
              <h1 className="
                text-2xl
                font-bold
                text-gray-900
              ">
                Goals
              </h1>

              <p className="
                text-sm
                text-gray-500
                mt-0.5
              ">
                Set targets and track your
                study progress.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            px-5
            py-3
            rounded-xl
            bg-blue-600
            text-white
            text-sm
            font-semibold
            hover:bg-blue-700
            transition
            shadow-sm
          "
        >
          <Plus size={18} />
          New Goal
        </button>

      </div>

      {/* ================================= */}
      {/* STATS */}
      {/* ================================= */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-3
        gap-4
        mb-7
      ">

        <StatCard
          icon={
            <Target size={19} />
          }
          title="Total Goals"
          value={goals.length}
        />

        <StatCard
          icon={
            <Clock3 size={19} />
          }
          title="Active Goals"
          value={activeCount}
        />

        <StatCard
          icon={
            <CheckCircle2 size={19} />
          }
          title="Completed"
          value={completedCount}
        />

      </div>

      {/* ================================= */}
      {/* OVERALL PROGRESS */}
      {/* ================================= */}

      <div className="
        bg-white
        border
        border-gray-100
        rounded-2xl
        shadow-sm
        p-5
        mb-7
      ">

        <div className="
          flex
          items-center
          justify-between
          mb-3
        ">
          <div>
            <h2 className="
              text-sm
              font-semibold
              text-gray-900
            ">
              Overall Progress
            </h2>

            <p className="
              text-xs
              text-gray-500
              mt-1
            ">
              Across all your goals
            </p>
          </div>

          <span className="
            text-lg
            font-bold
            text-blue-600
          ">
            {overallProgress}%
          </span>
        </div>

        <div className="
          h-2.5
          bg-gray-100
          rounded-full
          overflow-hidden
        ">
          <div
            className="
              h-full
              bg-blue-600
              rounded-full
              transition-all
              duration-500
            "
            style={{
              width: `${overallProgress}%`,
            }}
          />
        </div>

      </div>

      {/* ================================= */}
      {/* FILTERS */}
      {/* ================================= */}

      <div className="
        flex
        items-center
        gap-2
        mb-5
        overflow-x-auto
      ">

        {(
          [
            ["all", "All"],
            ["active", "Active"],
            ["completed", "Completed"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setFilter(value)
            }
            className={`
              px-4
              py-2
              rounded-lg
              text-sm
              font-medium
              whitespace-nowrap
              transition
              ${
                filter === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {label}
          </button>
        ))}

      </div>

      {/* ================================= */}
      {/* GOALS */}
      {/* ================================= */}

      {filteredGoals.length === 0 ? (
        <div className="
          bg-white
          border
          border-gray-100
          rounded-2xl
          shadow-sm
          p-12
          text-center
        ">

          <div className="
            w-14
            h-14
            mx-auto
            rounded-2xl
            bg-blue-50
            text-blue-600
            flex
            items-center
            justify-center
            mb-4
          ">
            <Target size={26} />
          </div>

          <h2 className="
            text-lg
            font-semibold
            text-gray-900
          ">
            {filter === "completed"
              ? "No completed goals"
              : filter === "active"
              ? "No active goals"
              : "No goals yet"}
          </h2>

          <p className="
            text-sm
            text-gray-500
            mt-1
            mb-5
          ">
            Create a study goal and start
            tracking your progress.
          </p>

          <button
            type="button"
            onClick={openCreateForm}
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-blue-600
              text-white
              text-sm
              font-medium
              hover:bg-blue-700
            "
          >
            <Plus size={17} />
            Create Goal
          </button>

        </div>
      ) : (
        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-5
        ">

          {filteredGoals.map(
            (goal) => {
              const progress =
                getGoalProgress(
                  goal
                );

              const hours =
                getGoalHours(goal);

              const deadlineStatus =
                getDeadlineStatus(
                  goal
                );

              return (
                <div
                  key={goal.id}
                  className="
                    bg-white
                    border
                    border-gray-100
                    rounded-2xl
                    shadow-sm
                    p-5
                    hover:shadow-md
                    transition
                  "
                >

                  {/* CARD HEADER */}

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  ">

                    <div className="
                      flex
                      items-start
                      gap-3
                    ">

                      <div className={`
                        w-10
                        h-10
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        shrink-0
                        ${
                          goal.completed
                            ? "bg-green-50 text-green-600"
                            : "bg-blue-50 text-blue-600"
                        }
                      `}>
                        {goal.completed ? (
                          <CheckCircle2
                            size={20}
                          />
                        ) : (
                          <Target
                            size={20}
                          />
                        )}
                      </div>

                      <div>
                        <h3 className="
                          font-semibold
                          text-gray-900
                        ">
                          {goal.title}
                        </h3>

                        {goal.description && (
                          <p className="
                            text-sm
                            text-gray-500
                            mt-1
                          ">
                            {goal.description}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="
                      flex
                      items-center
                      gap-1
                    ">

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(
                            goal
                          )
                        }
                        title="Edit goal"
                        className="
                          p-2
                          rounded-lg
                          text-gray-400
                          hover:text-blue-600
                          hover:bg-blue-50
                        "
                      >
                        <Pencil
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteGoal(
                            goal
                          )
                        }
                        title="Delete goal"
                        className="
                          p-2
                          rounded-lg
                          text-gray-400
                          hover:text-red-500
                          hover:bg-red-50
                        "
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="mt-6">

                    <div className="
                      flex
                      items-center
                      justify-between
                      mb-2
                    ">

                      <span className="
                        text-xs
                        font-medium
                        text-gray-500
                      ">
                        Progress
                      </span>

                      <span className="
                        text-sm
                        font-bold
                        text-gray-900
                      ">
                        {progress}%
                      </span>

                    </div>

                    <div className="
                      h-2.5
                      bg-gray-100
                      rounded-full
                      overflow-hidden
                    ">
                      <div
                        className={`
                          h-full
                          rounded-full
                          transition-all
                          duration-500
                          ${
                            goal.completed
                              ? "bg-green-500"
                              : "bg-blue-600"
                          }
                        `}
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <p className="
                      text-xs
                      text-gray-500
                      mt-2
                    ">
                      {hours.toFixed(1)}h of{" "}
                      {goal.targetHours}h
                      studied
                    </p>

                  </div>

                  {/* FOOTER */}

                  <div className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                    mt-5
                    pt-4
                    border-t
                    border-gray-100
                  ">

                    <div className="
                      flex
                      items-center
                      gap-2
                    ">
                      <CalendarDays
                        size={15}
                        className="text-gray-400"
                      />

                      <span
                        className={`
                          text-xs
                          font-medium
                          ${deadlineStatus.className}
                        `}
                      >
                        {goal.deadline
                          ? new Date(
                              goal.deadline
                            ).toLocaleDateString()
                          : "No deadline"}
                      </span>

                      <span className="
                        text-xs
                        text-gray-400
                      ">
                        •
                      </span>

                      <span
                        className={`
                          text-xs
                          font-medium
                          ${deadlineStatus.className}
                        `}
                      >
                        {deadlineStatus.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleGoal(
                          goal
                        )
                      }
                      className={`
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-3
                        py-2
                        rounded-lg
                        text-xs
                        font-medium
                        transition
                        ${
                          goal.completed
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }
                      `}
                    >
                      <CheckCircle2
                        size={15}
                      />

                      {goal.completed
                        ? "Mark Active"
                        : "Mark Complete"}
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

      {/* ================================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ================================= */}

      {showForm && (
        <div className="
          fixed
          inset-0
          z-50
          bg-black/30
          backdrop-blur-sm
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            w-full
            max-w-lg
            bg-white
            rounded-3xl
            shadow-xl
            border
            border-gray-100
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-6
            ">

              <div>
                <h2 className="
                  text-lg
                  font-bold
                  text-gray-900
                ">
                  {editingGoal
                    ? "Edit Goal"
                    : "Create New Goal"}
                </h2>

                <p className="
                  text-sm
                  text-gray-500
                  mt-1
                ">
                  Set a target and track
                  your progress automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="
                  p-2
                  rounded-lg
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-700
                "
              >
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* TITLE */}

              <div>
                <label className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-2
                ">
                  Goal name
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Study for Data Structures"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-2
                ">
                  Description
                  <span className="
                    text-gray-400
                    font-normal
                  ">
                    {" "}optional
                  </span>
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="What do you want to accomplish?"
                  rows={3}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    resize-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>

              {/* HOURS + DEADLINE */}

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <div>
                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Target hours
                  </label>

                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={targetHours}
                    onChange={(e) =>
                      setTargetHours(
                        e.target.value
                      )
                    }
                    placeholder="10"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                    required
                  />
                </div>

                <div>
                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) =>
                      setDeadline(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />
                </div>

              </div>

              {/* BUTTONS */}

              <div className="
                flex
                items-center
                justify-end
                gap-3
                pt-2
              ">

                <button
                  type="button"
                  onClick={resetForm}
                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    text-sm
                    font-medium
                    text-gray-600
                    bg-gray-100
                    hover:bg-gray-200
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    bg-blue-600
                    text-white
                    text-sm
                    font-semibold
                    hover:bg-blue-700
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {saving
                    ? "Saving..."
                    : editingGoal
                    ? "Save Changes"
                    : "Create Goal"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

/*
 * ==========================================
 * STAT CARD
 * ==========================================
 */

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="
      bg-white
      border
      border-gray-100
      rounded-2xl
      shadow-sm
      p-5
    ">

      <div className="
        flex
        items-center
        gap-3
      ">

        <div className="
          w-10
          h-10
          rounded-xl
          bg-blue-50
          text-blue-600
          flex
          items-center
          justify-center
        ">
          {icon}
        </div>

        <div>
          <p className="
            text-xs
            text-gray-500
          ">
            {title}
          </p>

          <p className="
            text-2xl
            font-bold
            text-gray-900
            mt-0.5
          ">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
}