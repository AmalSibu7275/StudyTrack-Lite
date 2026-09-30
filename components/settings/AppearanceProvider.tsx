"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

type Theme = "light" | "dark" | "system";
type Accent = "blue" | "green" | "purple" | "orange";

type AppearanceContextType = {
  theme: Theme;
  accent: Accent;
  compactMode: boolean;
  animations: boolean;

  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setCompactMode: (value: boolean) => void;
  setAnimations: (value: boolean) => void;
};

const AppearanceContext =
  createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme | null>(null);

  const [accent, setAccentState] =
    useState<Accent | null>(null);

  const [compactMode, setCompactModeState] =
    useState<boolean | null>(null);

  const [animations, setAnimationsState] =
    useState<boolean | null>(null);

  const [loaded, setLoaded] =
    useState(false);

  /*
   * LOAD SAVED APPEARANCE
   */
  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (cancelled) return;

        try {
          /*
           * Start with LocalStorage.
           *
           * This allows us to restore the appearance
           * immediately without showing the defaults.
           */
          const savedTheme =
            localStorage.getItem("studytrack-theme");

          const savedAccent =
            localStorage.getItem("studytrack-accent");

          const savedCompact =
            localStorage.getItem("studytrack-compact");

          const savedAnimations =
            localStorage.getItem(
              "studytrack-animations"
            );

          let finalTheme: Theme =
            savedTheme === "light" ||
            savedTheme === "dark" ||
            savedTheme === "system"
              ? savedTheme
              : "light";

          let finalAccent: Accent =
            savedAccent === "blue" ||
            savedAccent === "green" ||
            savedAccent === "purple" ||
            savedAccent === "orange"
              ? savedAccent
              : "blue";

          let finalCompact =
            savedCompact === "true";

          let finalAnimations =
            savedAnimations !== "false";

          /*
           * Then load Firestore.
           *
           * Firestore is the permanent source of truth.
           */
          if (user) {
            const userRef = doc(
              db,
              "users",
              user.uid
            );

            const snapshot =
              await getDoc(userRef);

            if (snapshot.exists()) {
              const appearance =
                snapshot.data()?.appearance;

              if (
                appearance?.theme === "light" ||
                appearance?.theme === "dark" ||
                appearance?.theme === "system"
              ) {
                finalTheme =
                  appearance.theme;
              }

              if (
                appearance?.accent === "blue" ||
                appearance?.accent === "green" ||
                appearance?.accent === "purple" ||
                appearance?.accent === "orange"
              ) {
                finalAccent =
                  appearance.accent;
              }

              if (
                typeof appearance?.compactMode ===
                "boolean"
              ) {
                finalCompact =
                  appearance.compactMode;
              }

              if (
                typeof appearance?.animations ===
                "boolean"
              ) {
                finalAnimations =
                  appearance.animations;
              }
            }
          }

          if (cancelled) return;

          /*
           * Set the final values.
           */
          setThemeState(finalTheme);
          setAccentState(finalAccent);
          setCompactModeState(finalCompact);
          setAnimationsState(finalAnimations);

          /*
           * Cache them locally.
           */
          localStorage.setItem(
            "studytrack-theme",
            finalTheme
          );

          localStorage.setItem(
            "studytrack-accent",
            finalAccent
          );

          localStorage.setItem(
            "studytrack-compact",
            String(finalCompact)
          );

          localStorage.setItem(
            "studytrack-animations",
            String(finalAnimations)
          );

          setLoaded(true);
        } catch (error) {
          console.error(
            "Failed to load appearance settings:",
            error
          );

          /*
           * If Firebase fails, use LocalStorage.
           */
          const savedTheme =
            localStorage.getItem("studytrack-theme");

          const savedAccent =
            localStorage.getItem("studytrack-accent");

          const savedCompact =
            localStorage.getItem("studytrack-compact");

          const savedAnimations =
            localStorage.getItem(
              "studytrack-animations"
            );

          setThemeState(
            savedTheme === "light" ||
              savedTheme === "dark" ||
              savedTheme === "system"
              ? savedTheme
              : "light"
          );

          setAccentState(
            savedAccent === "blue" ||
              savedAccent === "green" ||
              savedAccent === "purple" ||
              savedAccent === "orange"
              ? savedAccent
              : "blue"
          );

          setCompactModeState(
            savedCompact === "true"
          );

          setAnimationsState(
            savedAnimations !== "false"
          );

          setLoaded(true);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  /*
   * APPLY APPEARANCE GLOBALLY
   */
  useEffect(() => {
    if (
      !loaded ||
      theme === null ||
      accent === null ||
      compactMode === null ||
      animations === null
    ) {
      return;
    }

    const html =
      document.documentElement;

    /*
     * THEME
     */
    let dark = false;

    if (theme === "dark") {
      dark = true;
    } else if (theme === "system") {
      dark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
    }

    html.classList.toggle(
      "dark",
      dark
    );

    /*
     * ACCENT
     */
    html.setAttribute(
      "data-accent",
      accent
    );

    /*
     * COMPACT MODE
     */
    html.classList.toggle(
      "compact-mode",
      compactMode
    );

    /*
     * ANIMATIONS
     */
    html.classList.toggle(
      "no-animations",
      !animations
    );
  }, [
    theme,
    accent,
    compactMode,
    animations,
    loaded,
  ]);

  /*
   * Don't render the protected application
   * until appearance has been loaded.
   */
  if (
    !loaded ||
    theme === null ||
    accent === null ||
    compactMode === null ||
    animations === null
  ) {
    return (
      <div className="min-h-screen bg-gray-50" />
    );
  }

  /*
   * SETTERS
   */
  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
  }

  function setAccent(newAccent: Accent) {
    setAccentState(newAccent);
  }

  function setCompactMode(value: boolean) {
    setCompactModeState(value);
  }

  function setAnimations(value: boolean) {
    setAnimationsState(value);
  }

  return (
    <AppearanceContext.Provider
      value={{
        theme,
        accent,
        compactMode,
        animations,
        setTheme,
        setAccent,
        setCompactMode,
        setAnimations,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context =
    useContext(AppearanceContext);

  if (!context) {
    throw new Error(
      "useAppearance must be used inside AppearanceProvider"
    );
  }

  return context;
}