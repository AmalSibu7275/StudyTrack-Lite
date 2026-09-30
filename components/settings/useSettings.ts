"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export interface UserSettings {
  language: string;
  timezone: string;
}

const defaultSettings: UserSettings = {
  language: "English",
  timezone: "America/Toronto",
};

export default function useSettings() {
  const [settings, setSettings] =
    useState<UserSettings>(defaultSettings);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (!auth.currentUser) return;

      const ref = doc(
        db,
        "users",
        auth.currentUser.uid
      );

      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSettings({
          ...defaultSettings,
          ...snap.data(),
        });
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  async function saveSettings(
    values: Partial<UserSettings>
  ) {
    if (!auth.currentUser) return;

    const newValues = {
      ...settings,
      ...values,
    };

    setSettings(newValues);

    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      newValues,
      {
        merge: true,
      }
    );
  }

  return {
    settings,
    saveSettings,
    loading,
  };
}