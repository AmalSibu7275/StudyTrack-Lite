"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import NotificationBell from "@/components/dashboard/NotificationBell";

export default function Header() {
  const [userName, setUserName] = useState("there");
  const [greeting, setGreeting] = useState("Good Morning");

  /*
   * GREETING
   */

  useEffect(() => {
    function updateGreeting() {
      const hour = new Date().getHours();

      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 18) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    }

    updateGreeting();

    const interval = setInterval(
      updateGreeting,
      60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  /*
   * USER PROFILE
   */

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        // Remove previous Firestore listener
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        // No user
        if (!user) {
          setUserName("there");
          return;
        }

        /*
         * INITIAL FALLBACK
         */

        if (user.displayName) {
          setUserName(
            user.displayName
              .trim()
              .split(/\s+/)[0]
          );
        } else if (user.email) {
          setUserName(
            user.email
              .split("@")[0]
              .replace(/[._-]/g, " ")
              .split(/\s+/)[0]
          );
        } else {
          setUserName("there");
        }

        /*
         * FIRESTORE PROFILE
         */

        const userRef = doc(
          db,
          "users",
          user.uid
        );

        unsubscribeProfile = onSnapshot(
          userRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              return;
            }

            const data = snapshot.data();

            /*
             * 'name' is the primary username
             * stored by Profile Settings.
             *
             * The other fields are fallbacks
             * for older user documents.
             */

            const name =
              data.name ||
              data.displayName ||
              data.firstName;

            if (!name) {
              return;
            }

            const firstName = String(name)
              .trim()
              .split(/\s+/)[0];

            if (firstName) {
              setUserName(firstName);
            }
          },
          (error) => {
            console.error(
              "Error loading user profile:",
              error
            );
          }
        );
      }
    );

    /*
     * CLEANUP
     */

    return () => {
      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  /*
   * UI
   */

  return (
    <header
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >
      {/* LEFT */}

      <div className="min-w-0">
        <h1
          className="
            text-2xl
            md:text-3xl
            font-bold
            text-gray-900
            truncate
          "
        >
          {greeting}, {userName} 👋
        </h1>

        <p
          className="
            text-sm
            text-gray-500
            mt-1
          "
        >
          Track behaviour → measure outcome → improve.
        </p>
      </div>

      {/* RIGHT */}

      <div
        className="
          flex
          items-center
          gap-2
          shrink-0
        "
      >
        <NotificationBell />
      </div>
    </header>
  );
}