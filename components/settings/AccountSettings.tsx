"use client";

import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Save,
  LogOut,
  Trash2,
} from "lucide-react";

import {
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  signOut,
  deleteUser,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export default function AccountSettings() {
  const [user, setUser] = useState<User | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        setDisplayName(
          currentUser.displayName ?? ""
        );

        setEmail(
          currentUser.email ?? ""
        );

        try {
          const snap = await getDoc(
            doc(db, "users", currentUser.uid)
          );

          if (snap.exists()) {
            const data = snap.data();

            if (data.displayName) {
              setDisplayName(data.displayName);
            }

            if (data.email) {
              setEmail(data.email);
            }
          }
        } catch (error) {
          console.error(
            "Error loading account:",
            error
          );

          setMessage(
            "Unable to load account information."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleSaveProfile() {
    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await updateProfile(user, {
        displayName,
      });

      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName,
          email: user.email ?? email,
        },
        { merge: true }
      );

      setMessage(
        "Account information updated successfully."
      );
    } catch (error) {
      console.error(
        "Error updating account:",
        error
      );

      setMessage(
        "Unable to update account information."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateEmail() {
    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter an email address.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await updateEmail(user, email.trim());

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: email.trim(),
        },
        { merge: true }
      );

      setMessage(
        "Email address updated successfully."
      );
    } catch (error) {
      console.error(
        "Error updating email:",
        error
      );

      setMessage(
        "Unable to update email. You may need to sign in again before changing your email."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword() {
    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await updatePassword(
        user,
        newPassword
      );

      setNewPassword("");

      setMessage(
        "Password updated successfully."
      );
    } catch (error) {
      console.error(
        "Error updating password:",
        error
      );

      setMessage(
        "Unable to update password. You may need to sign in again before changing your password."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        "Error signing out:",
        error
      );

      setMessage("Unable to sign out.");
    }
  }

  async function handleDeleteAccount() {
    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await deleteUser(user);
    } catch (error) {
      console.error(
        "Error deleting account:",
        error
      );

      setMessage(
        "Unable to delete your account. You may need to sign in again before deleting your account."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading account...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-500">
        You must be logged in to manage your account.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Account
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your StudyTrack account.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-8">

        {/* Account Information */}

        <div>

          <div className="flex items-center gap-3 mb-6">

            <UserIcon className="accent-text" />

            <h2 className="text-xl font-semibold">
              Account Information
            </h2>

          </div>

          <div className="space-y-5">

            <div>
              <label className="block mb-2 font-medium">
                Display Name
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-3 accent-bg text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Profile"}
            </button>

          </div>
        </div>

        {/* Password */}

        <div className="border-t border-gray-100 pt-8">

          <h2 className="text-xl font-semibold mb-5">
            Change Password
          </h2>

          <div className="space-y-4">

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={saving}
              className="accent-bg text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              Update Password
            </button>

          </div>
        </div>

        {/* Email */}

        <div className="border-t border-gray-100 pt-8">

          <h2 className="text-xl font-semibold mb-5">
            Update Email
          </h2>

          <button
            type="button"
            onClick={handleUpdateEmail}
            disabled={saving}
            className="accent-bg text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            Update Email
          </button>

        </div>

        {/* Message */}

        {message && (
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {message}
          </div>
        )}

        {/* Sign Out */}

        <div className="border-t border-gray-100 pt-8">

          <h2 className="text-xl font-semibold mb-2">
            Sign Out
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Sign out of your StudyTrack account on this device.
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition"
          >
            <LogOut size={18} />

            Sign Out
          </button>

        </div>

        {/* Delete Account */}

        <div className="border-t border-gray-100 pt-8">

          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Delete Account
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your StudyTrack account.
          </p>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={saving}
            className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
          >
            <Trash2 size={18} />

            Delete Account
          </button>

        </div>

      </div>
    </div>
  );
}