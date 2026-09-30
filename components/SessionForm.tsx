"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";

export default function SessionForm() {
  const [subject, setSubject] = useState("");
  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState("");
  const [plannedGoal, setPlannedGoal] = useState("");
  const [sessionType, setSessionType] = useState("Deep Work");
  const [energyAfter, setEnergyAfter] = useState("Medium");
  const [productivityScore, setProductivityScore] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "sessions"), {
        userId: auth.currentUser?.uid,
        subject,
        taskName,
        duration: Number(duration),
        plannedGoal,
        sessionType,
        energyAfter,
        productivityScore,
        createdAt: serverTimestamp(),
      });

      toast.success("Session added", {
  description: "Your Session has been added successfully.",
});

      setSubject("");
      setTaskName("");
      setDuration("");
      setPlannedGoal("");
      setSessionType("Deep Work");
      setEnergyAfter("Medium");
      setProductivityScore(5);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <PlayCircle className="text-blue-600" size={22} />

        <h2 className="text-xl font-bold text-gray-900">
          Start Session
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Mathematics"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task
          </label>

          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Practice Integrals"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>

          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goal
          </label>

          <input
            type="text"
            value={plannedGoal}
            onChange={(e) => setPlannedGoal(e.target.value)}
            placeholder="Finish chapter exercises"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Type
          </label>

          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3"
          >
            <option>Deep Work</option>
            <option>Light Review</option>
            <option>Practice</option>
            <option>Preview</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Energy Level
          </label>

          <select
            value={energyAfter}
            onChange={(e) => setEnergyAfter(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

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
              setProductivityScore(Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
        >
          Save Session
        </button>

      </form>
    </div>
  );
}