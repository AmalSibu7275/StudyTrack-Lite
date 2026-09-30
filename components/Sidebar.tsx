"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Home,
  Clock3,
  BarChart3,
  Target,
  Lightbulb,
  Calendar,
  Settings,
  Flame,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Sessions",
    href: "/sessions",
    icon: Clock3,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Goals",
    href: "/goals",
    icon: Target,
  },
  {
    name: "Insights",
    href: "/insights",
    icon: Lightbulb,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

type SidebarSession = {
  createdAt?: any;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  // Profile picture
  const [photoURL, setPhotoURL] = useState("");

  const [collapsed, setCollapsed] = useState(false);

  const [sessionCount, setSessionCount] = useState(0);

  const [streak, setStreak] = useState(0);


  /*
   * -----------------------------------------
   * AUTH
   * -----------------------------------------
   */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);

        // Immediately use Auth photo if available
        setPhotoURL(currentUser?.photoURL || "");
      }
    );

    return () => unsubscribe();
  }, []);


  /*
   * PROFILE DATA
   */

  useEffect(() => {
    if (!user) {
      setPhotoURL("");
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          // Firestore is the main source for the profile picture.
          setPhotoURL(
            data.photoURL || user.photoURL || ""
          );
        } else {
          // Fall back to Firebase Auth
          setPhotoURL(user.photoURL || "");
        }
      },
      (error) => {
        console.error(
          "Sidebar profile listener error:",
          error
        );

        // If Firestore fails, still try Auth
        setPhotoURL(user.photoURL || "");
      }
    );

    return () => unsubscribe();
  }, [user]);


  /*
  * REAL-TIME SESSION DATA
   */

  useEffect(() => {
    if (!user) {
      setSessionCount(0);
      setStreak(0);
      return;
    }

    const sessionsQuery = query(
      collection(db, "sessions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const sessions: SidebarSession[] =
          snapshot.docs.map((doc) => ({
            ...(doc.data() as SidebarSession),
          }));

        setSessionCount(sessions.length);

        setStreak(
          calculateStreak(sessions)
        );
      },
      (error) => {
        console.error(
          "Sidebar session listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [user]);


  /*
   * USER DISPLAY
   */

  const displayName = useMemo(() => {
    if (!user) {
      return "Student";
    }

    if (user.displayName) {
      return user.displayName;
    }

    if (user.email) {
      return user.email
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );
    }

    return "Student";
  }, [user]);


  const email = user?.email || "";


  /*
   * INITIALS
   */

  const initials = useMemo(() => {
    if (!displayName) {
      return "S";
    }

    const words = displayName
      .trim()
      .split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  }, [displayName]);


  /*
   * NAVIGATION
   */

  function isActive(href: string) {
    if (href === "/settings") {
      return pathname.startsWith("/settings");
    }

    return pathname === href;
  }


  /*
   * LOGOUT
   */

  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }


  /*
   * UI
   */

  return (
    <aside
      className={`
        sticky
        top-0
        h-screen
        shrink-0
        bg-white
        border-r
        border-gray-200
        transition-all
        duration-300
        flex
        flex-col
        ${collapsed ? "w-[76px]" : "w-[205px]"}
      `}
    >

      {/* TOP */}

      <div className="flex-1 flex flex-col">

        {/* LOGO */}

        <div
          className={`
            h-[76px]
            flex
            items-center
            border-b
            border-gray-100
            ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-4"
            }
          `}
        >
          <Link
            href="/dashboard"
            className="flex items-center"
          >
            {collapsed ? (
              <span className="text-xl font-bold text-blue-600">
                ST
              </span>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                StudyTrack{" "}
                <span className="text-blue-500">
                  Lite
                </span>
              </span>
            )}
          </Link>
        </div>


        {/* NAVIGATION */}

        <nav
          className={`
            px-3
            py-5
            space-y-1.5
            ${collapsed ? "px-2" : ""}
          `}
        >
          {navItems.map((item) => {
            const Icon = item.icon;

            const active = isActive(
              item.href
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                title={
                  collapsed
                    ? item.name
                    : undefined
                }
                className={`
                  group
                  flex
                  items-center
                  rounded-xl
                  transition-all
                  duration-200
                  ${
                    collapsed
                      ? "justify-center px-2 py-3"
                      : "gap-3 px-3 py-2.5"
                  }
                  ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  size={19}
                  strokeWidth={
                    active ? 2.4 : 2
                  }
                  className="shrink-0"
                />

                {!collapsed && (
                  <span
                    className={`
                      text-sm
                      ${
                        active
                          ? "font-semibold"
                          : "font-medium"
                      }
                    `}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>


      {/* BOTTOM */}
      
      <div
        className="
          border-t
          border-gray-100
          p-3
          space-y-3
        "
      >

        {/* STREAK */}

        {collapsed ? (
          <div
            title={`${streak} day streak`}
            className="
              flex
              justify-center
              items-center
              w-full
              h-11
              rounded-xl
              bg-orange-50
              text-orange-500
            "
          >
            <Flame size={19} />
          </div>
        ) : (
          <div
            className="
              rounded-xl
              bg-gray-50
              border
              border-gray-100
              p-3
            "
          >
            <div className="flex items-center gap-3">

              <div
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-orange-50
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <Flame
                  size={18}
                  className="text-orange-500"
                />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  {streak}{" "}
                  {streak === 1
                    ? "day"
                    : "days"}
                </p>

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  current streak
                </p>
              </div>

            </div>


            <div
              className="
                flex
                items-center
                justify-between
                mt-3
              "
            >
              <span
                className="
                  text-[11px]
                  text-gray-400
                "
              >
                {sessionCount}{" "}
                {sessionCount === 1
                  ? "session"
                  : "sessions"}
              </span>

              <span
                className="
                  text-[11px]
                  text-orange-500
                  font-medium
                "
              >
                Keep going!
              </span>
            </div>

          </div>
        )}


        {/* USER */}

        {collapsed ? (

          <button
            type="button"
            onClick={() =>
              router.push(
                "/settings/profile"
              )
            }
            title={displayName}
            className="
              w-full
              flex
              justify-center
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-full
                bg-blue-500
                text-white
                flex
                items-center
                justify-center
                text-sm
                font-semibold
                overflow-hidden
              "
            >

              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />
              ) : (
                initials
              )}

            </div>

          </button>

        ) : (

          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-gray-100
              p-2.5
            "
          >

            {/* PROFILE IMAGE */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/settings/profile"
                )
              }
              className="
                w-9
                h-9
                rounded-full
                bg-blue-500
                text-white
                flex
                items-center
                justify-center
                text-sm
                font-semibold
                shrink-0
                overflow-hidden
                hover:bg-blue-600
                transition
              "
            >

              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />
              ) : (
                initials
              )}

            </button>


            {/* USER NAME */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/settings/profile"
                )
              }
              className="
                min-w-0
                flex-1
                text-left
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-900
                  truncate
                "
              >
                {displayName}
              </p>

              <p
                className="
                  text-[11px]
                  text-gray-500
                  truncate
                "
              >
                {email || "Student account"}
              </p>

            </button>

          </div>

        )}


        {/* COLLAPSE */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (value) => !value
            )
          }
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            py-2
            rounded-lg
            text-gray-400
            hover:text-gray-700
            hover:bg-gray-50
            transition
          "
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >

          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <>
              <ChevronLeft size={17} />

              <span className="text-xs">
                Collapse
              </span>
            </>
          )}

        </button>

      </div>

    </aside>
  );
}


/*
 * CALCULATE CURRENT STUDY STREAK
 */

function calculateStreak(
  sessions: SidebarSession[]
): number {

  const studyDays = new Set<string>();


  sessions.forEach((session) => {

    if (!session.createdAt) {
      return;
    }

    try {

      let date: Date;


      if (
        typeof session.createdAt.toDate ===
        "function"
      ) {
        date =
          session.createdAt.toDate();
      } else {
        date = new Date(
          session.createdAt
        );
      }


      if (isNaN(date.getTime())) {
        return;
      }


      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");


      studyDays.add(
        `${year}-${month}-${day}`
      );

    } catch {
      // Ignore invalid dates
    }

  });


  if (studyDays.size === 0) {
    return 0;
  }


  let streak = 0;


  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const todayKey =
    formatDateKey(today);


  const yesterday =
    new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1
  );


  const yesterdayKey =
    formatDateKey(yesterday);

  let currentDate: Date;


  if (studyDays.has(todayKey)) {

    currentDate = today;

  } else if (
    studyDays.has(yesterdayKey)
  ) {

    currentDate = yesterday;

  } else {

    return 0;

  }


  while (true) {

    const key =
      formatDateKey(
        currentDate
      );


    if (!studyDays.has(key)) {
      break;
    }


    streak++;


    currentDate =
      new Date(currentDate);


    currentDate.setDate(
      currentDate.getDate() - 1
    );

  }


  return streak;
}


function formatDateKey(
  date: Date
): string {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;
}
