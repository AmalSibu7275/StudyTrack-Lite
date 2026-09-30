"use client";

import { useEffect, useState } from "react";
import { Shield, Save, Lock, Database } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

type Visibility = "private" | "public";

type PrivacySettingsData = {
  profileVisibility: Visibility;
  activityVisibility: Visibility;
  showProductivity: boolean;
  showStreak: boolean;
  dataSharing: boolean;
};

const DEFAULT_PRIVACY: PrivacySettingsData = {
  profileVisibility: "private",
  activityVisibility: "private",
  showProductivity: true,
  showStreak: true,
  dataSharing: false,
};

export default function PrivacySettings() {
  const [user, setUser] = useState<User | null>(null);

  const [profileVisibility, setProfileVisibility] =
    useState<Visibility>("private");

  const [activityVisibility, setActivityVisibility] =
    useState<Visibility>("private");

  const [showProductivity, setShowProductivity] =
    useState(true);

  const [showStreak, setShowStreak] =
    useState(true);

  const [dataSharing, setDataSharing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  /*
   * LOAD PRIVACY SETTINGS
   */
  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const userRef = doc(
          db,
          "users",
          currentUser.uid
        );

        /*
         * Realtime listener.
         *
         * If the privacy document changes from another
         * tab/device, this page updates automatically.
         */
        unsubscribeUser = onSnapshot(
          userRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              setProfileVisibility(
                DEFAULT_PRIVACY.profileVisibility
              );

              setActivityVisibility(
                DEFAULT_PRIVACY.activityVisibility
              );

              setShowProductivity(
                DEFAULT_PRIVACY.showProductivity
              );

              setShowStreak(
                DEFAULT_PRIVACY.showStreak
              );

              setDataSharing(
                DEFAULT_PRIVACY.dataSharing
              );

              setLoading(false);
              return;
            }

            const privacy =
              snapshot.data()?.privacy;

            if (!privacy) {
              setProfileVisibility(
                DEFAULT_PRIVACY.profileVisibility
              );

              setActivityVisibility(
                DEFAULT_PRIVACY.activityVisibility
              );

              setShowProductivity(
                DEFAULT_PRIVACY.showProductivity
              );

              setShowStreak(
                DEFAULT_PRIVACY.showStreak
              );

              setDataSharing(
                DEFAULT_PRIVACY.dataSharing
              );

              setLoading(false);
              return;
            }

            setProfileVisibility(
              privacy.profileVisibility === "public"
                ? "public"
                : "private"
            );

            setActivityVisibility(
              privacy.activityVisibility === "public"
                ? "public"
                : "private"
            );

            setShowProductivity(
              typeof privacy.showProductivity ===
                "boolean"
                ? privacy.showProductivity
                : DEFAULT_PRIVACY.showProductivity
            );

            setShowStreak(
              typeof privacy.showStreak ===
                "boolean"
                ? privacy.showStreak
                : DEFAULT_PRIVACY.showStreak
            );

            setDataSharing(
              typeof privacy.dataSharing ===
                "boolean"
                ? privacy.dataSharing
                : DEFAULT_PRIVACY.dataSharing
            );

            setLoading(false);
          },
          (error) => {
            console.error(
              "Error loading privacy settings:",
              error
            );

            setMessage(
              "Unable to load privacy settings."
            );

            setMessageType("error");
            setLoading(false);
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
   * SAVE PRIVACY SETTINGS
   */
  async function handleSave() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setMessage(
        "You must be logged in."
      );
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const privacy: PrivacySettingsData = {
        profileVisibility,
        activityVisibility,
        showProductivity,
        showStreak,
        dataSharing,
      };

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          privacy,
        },
        {
          merge: true,
        }
      );

      setMessage(
        "Privacy settings saved successfully."
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Error saving privacy settings:",
        error
      );

      setMessage(
        "Unable to save privacy settings."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading privacy settings...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-500">
        You must be logged in to manage privacy settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl accent-light-bg">
            <Shield
              size={23}
              className="accent-text"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              Privacy
            </h1>

            <p className="mt-1 text-gray-500">
              Control how your StudyTrack information is used.
            </p>
          </div>
        </div>
      </div>

      {/* PRIVACY SETTINGS */}
      <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        <div className="flex items-center gap-3">
          <Shield
            size={21}
            className="accent-text"
          />

          <h2 className="text-xl font-semibold">
            Privacy Settings
          </h2>
        </div>

        {/* PROFILE VISIBILITY */}
        <div>
          <label
            htmlFor="profileVisibility"
            className="mb-2 block font-medium"
          >
            Profile Visibility
          </label>

          <select
            id="profileVisibility"
            value={profileVisibility}
            onChange={(event) =>
              setProfileVisibility(
                event.target.value as Visibility
              )
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="private">
              Private
            </option>

            <option value="public">
              Public
            </option>
          </select>

          <p className="mt-2 text-sm text-gray-500">
            Private keeps your profile visible only
            to you. Public allows your profile to be
            shown in future shared StudyTrack features.
          </p>
        </div>

        {/* ACTIVITY VISIBILITY */}
        <div>
          <label
            htmlFor="activityVisibility"
            className="mb-2 block font-medium"
          >
            Activity Visibility
          </label>

          <select
            id="activityVisibility"
            value={activityVisibility}
            onChange={(event) =>
              setActivityVisibility(
                event.target.value as Visibility
              )
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="private">
              Private
            </option>

            <option value="public">
              Public
            </option>
          </select>

          <p className="mt-2 text-sm text-gray-500">
            Controls whether your study activity can
            appear in future shared views.
          </p>
        </div>

        {/* PRODUCTIVITY */}
        <Toggle
          label="Show Productivity Score"
          description="Allow your productivity score to appear in shared views."
          checked={showProductivity}
          onChange={setShowProductivity}
        />

        {/* STREAK */}
        <Toggle
          label="Show Study Streak"
          description="Allow your study streak to appear in shared views."
          checked={showStreak}
          onChange={setShowStreak}
        />

        {/* DATA SHARING */}
        <Toggle
          label="Allow Anonymous Data Sharing"
          description="Opt in to sharing anonymized study data for optional StudyTrack analysis."
          checked={dataSharing}
          onChange={setDataSharing}
        />

        {/* SECURITY INFORMATION */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-start gap-3">

            <Lock
              size={20}
              className="mt-0.5 shrink-0 text-gray-500"
            />

            <div>
              <h3 className="font-semibold">
                Your private data
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Your StudyTrack account data is protected
                by Firebase authentication and Firestore
                security rules. Privacy settings do not
                override those security protections.
              </p>
            </div>
          </div>
        </div>

        {/* DATA SHARING INFORMATION */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-start gap-3">

            <Database
              size={20}
              className="mt-0.5 shrink-0 text-gray-500"
            />

            <div>
              <h3 className="font-semibold">
                Anonymous data sharing
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                This setting is opt-in. Turning it off
                means StudyTrack should not use your data
                for optional anonymous data-sharing features.
              </p>
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              messageType === "success"
                ? "accent-light-bg accent-text"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {/* SAVE */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 rounded-xl accent-bg px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save Privacy"}
        </button>

      </div>
    </div>
  );
}

/*
 * TOGGLE
 */
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-gray-100 pb-5">

      <div className="min-w-0">
        <p className="font-medium">
          {label}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
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