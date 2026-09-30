"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Language = "English" | "French";

type TranslationKey =
  | "dashboard"
  | "sessions"
  | "analytics"
  | "insights"
  | "calendar"
  | "settings"
  | "profile"
  | "preferences"
  | "appearance"
  | "goals"
  | "notifications"
  | "goodMorning"
  | "goodAfternoon"
  | "goodEvening"
  | "welcome"
  | "saveChanges"
  | "cancel"
  | "loading"
  | "search"
  | "logout"
  | "language"
  | "timezone"
  | "name"
  | "email";

const translations: Record<
  Language,
  Record<TranslationKey, string>
> = {
  English: {
    dashboard: "Dashboard",
    sessions: "Sessions",
    analytics: "Analytics",
    insights: "Insights",
    calendar: "Calendar",
    settings: "Settings",

    profile: "Profile",
    preferences: "Preferences",
    appearance: "Appearance",
    goals: "Goals",
    notifications: "Notifications",

    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",

    welcome: "Welcome back",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    loading: "Loading...",
    search: "Search",
    logout: "Log Out",

    language: "Language",
    timezone: "Timezone",
    name: "Name",
    email: "Email",
  },

  French: {
    dashboard: "Tableau de bord",
    sessions: "Sessions",
    analytics: "Analyses",
    insights: "Aperçus",
    calendar: "Calendrier",
    settings: "Paramètres",

    profile: "Profil",
    preferences: "Préférences",
    appearance: "Apparence",
    goals: "Objectifs",
    notifications: "Notifications",

    goodMorning: "Bonjour",
    goodAfternoon: "Bon après-midi",
    goodEvening: "Bonsoir",

    welcome: "Bon retour",
    saveChanges: "Enregistrer les modifications",
    cancel: "Annuler",
    loading: "Chargement...",
    search: "Rechercher",
    logout: "Se déconnecter",

    language: "Langue",
    timezone: "Fuseau horaire",
    name: "Nom",
    email: "E-mail",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("English");

  /*
   * Load saved language
   */
  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "studytrack-language"
      );

    if (
      savedLanguage === "English" ||
      savedLanguage === "French"
    ) {
      setLanguageState(savedLanguage);
    }
  }, []);

  /*
   * Change language
   */
  function setLanguage(
    newLanguage: Language
  ) {
    setLanguageState(newLanguage);

    localStorage.setItem(
      "studytrack-language",
      newLanguage
    );

    document.documentElement.lang =
      newLanguage === "French"
        ? "fr"
        : "en";
  }

  /*
   * Translation function
   */
  function t(
    key: TranslationKey
  ): string {
    return translations[language][key];
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}