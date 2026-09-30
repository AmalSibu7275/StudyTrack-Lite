"use client";

import { useState } from "react";
import { Palette, Save } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAppearance } from "./AppearanceProvider";

type Theme = "light" | "dark" | "system";
type Accent = "blue" | "green" | "purple" | "orange";

export default function AppearanceSettings() {
  const {
    theme,
    accent,
    compactMode,
    animations,
    setTheme,
    setAccent,
    setCompactMode,
    setAnimations,
  } = useAppearance();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    const user = auth.currentUser;

    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          appearance: {
            theme,
            accent,
            compactMode,
            animations,
          },
        },
        { merge: true }
      );

      /*
       * Also keep a local cache.
       * The AppearanceProvider already applies
       * the appearance globally.
       */
      localStorage.setItem(
        "studytrack-theme",
        theme
      );

      localStorage.setItem(
        "studytrack-accent",
        accent
      );

      localStorage.setItem(
        "studytrack-compact",
        String(compactMode)
      );

      localStorage.setItem(
        "studytrack-animations",
        String(animations)
      );

      setMessage(
        "Appearance settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Error saving appearance:",
        error
      );

      setMessage(
        "Unable to save appearance settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Appearance
        </h1>

        <p className="mt-2 text-gray-500">
          Personalize how StudyTrack looks.
        </p>
      </div>

      {/* Settings Card */}
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">

        {/* Title */}
        <div className="flex items-center gap-3">
          <Palette
            size={22}
            className="accent-text"
          />

          <h2 className="text-xl font-semibold">
            Appearance Settings
          </h2>
        </div>

        {/* Theme */}
        <div>
          <label
            htmlFor="theme"
            className="mb-2 block font-medium"
          >
            Theme
          </label>

          <select
            id="theme"
            value={theme}
            onChange={(e) =>
              setTheme(
                e.target.value as Theme
              )
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="light">
              Light
            </option>

            <option value="dark">
              Dark
            </option>

            <option value="system">
              System
            </option>
          </select>
        </div>

        {/* Accent */}
        <div>
          <label
            htmlFor="accent"
            className="mb-2 block font-medium"
          >
            Accent Color
          </label>

          <select
            id="accent"
            value={accent}
            onChange={(e) =>
              setAccent(
                e.target.value as Accent
              )
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="blue">
              Blue
            </option>

            <option value="green">
              Green
            </option>

            <option value="purple">
              Purple
            </option>

            <option value="orange">
              Orange
            </option>
          </select>
        </div>

        {/* Compact Mode */}
        <Toggle
          label="Compact Mode"
          checked={compactMode}
          onChange={setCompactMode}
        />

        {/* Animations */}
        <Toggle
          label="Enable Animations"
          checked={animations}
          onChange={setAnimations}
        />

        {/* Message */}
        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              message.includes("successfully")
                ? "accent-light-bg accent-text"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 rounded-xl accent-bg px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save Appearance"}
        </button>

      </div>
    </div>
  );
}


/* =========================================================
   TOGGLE
   ========================================================= */

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">

      <span className="font-medium">
        {label}
      </span>

      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        aria-label={`Toggle ${label}`}
        aria-pressed={checked}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked
            ? "accent-bg"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
            checked
              ? "translate-x-6"
              : "translate-x-0"
          }`}
        />
      </button>

    </div>
  );
}