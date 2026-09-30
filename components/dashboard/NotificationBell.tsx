"use client";

import { useEffect, useRef, useState } from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Target,
  Coffee,
  Flame,
  BarChart3,
  BookOpen,
  Palette,
  Trophy,
} from "lucide-react";

import { auth, db } from "@/lib/firebase";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";


export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type:
    | "study"
    | "break"
    | "goal"
    | "achievement"
    | "summary"
    | "report"
    | "appearance"
    | "notification"
    | "privacy"
    | "preference"
    | "profile"
    | "streak";

  read: boolean;
  createdAt: any;
};


export default function NotificationBell() {

  const [notifications, setNotifications] =
    useState<AppNotification[]>([]);

  const [open, setOpen] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement | null>(null);


  /*
   * -----------------------------------------
   * REAL-TIME NOTIFICATIONS
   * -----------------------------------------
   */

  useEffect(() => {

    let unsubscribeNotifications:
      | (() => void)
      | null = null;


    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {

          if (!user) {

            setNotifications([]);

            return;

          }


          const notificationsRef =
            collection(
              db,
              "users",
              user.uid,
              "notifications"
            );


          const notificationsQuery =
            query(
              notificationsRef,
              orderBy(
                "createdAt",
                "desc"
              )
            );


          unsubscribeNotifications =
            onSnapshot(
              notificationsQuery,
              (snapshot) => {

                const data =
                  snapshot.docs.map(
                    (notification) => {

                      const value =
                        notification.data();

                      return {
                        id:
                          notification.id,

                        title:
                          value.title ||
                          "Notification",

                        message:
                          value.message ||
                          "",

                        type:
                          value.type ||
                          "study",

                        read:
                          value.read ??
                          false,

                        createdAt:
                          value.createdAt,
                      };
                    }
                  );


                setNotifications(data);
              },
              (error) => {

                console.error(
                  "Notification listener error:",
                  error
                );

              }
            );
        }
      );


    return () => {

      unsubscribeAuth();

      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }

    };

  }, []);


  /*
   * -----------------------------------------
   * CLOSE WHEN CLICKING OUTSIDE
   * -----------------------------------------
   */

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }

    }


    if (open) {

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

    }


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, [open]);


  /*
   * -----------------------------------------
   * UNREAD COUNT
   * -----------------------------------------
   */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;


  /*
   * -----------------------------------------
   * MARK AS READ
   * -----------------------------------------
   */

  async function markAsRead(
    notificationId: string
  ) {

    const user =
      auth.currentUser;

    if (!user) return;


    try {

      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
          "notifications",
          notificationId
        ),
        {
          read: true,
        }
      );

    } catch (error) {

      console.error(
        "Failed to mark notification as read:",
        error
      );

    }

  }


  /*
   * -----------------------------------------
   * MARK ALL AS READ
   * -----------------------------------------
   */

  async function markAllAsRead() {

    const user =
      auth.currentUser;

    if (!user) return;


    try {

      const unread =
        notifications.filter(
          (notification) =>
            !notification.read
        );


      await Promise.all(
        unread.map(
          (notification) =>
            updateDoc(
              doc(
                db,
                "users",
                user.uid,
                "notifications",
                notification.id
              ),
              {
                read: true,
              }
            )
        )
      );

    } catch (error) {

      console.error(
        "Failed to mark all notifications as read:",
        error
      );

    }

  }


  /*
   * -----------------------------------------
   * DELETE
   * -----------------------------------------
   */

  async function deleteNotification(
    notificationId: string
  ) {

    const user =
      auth.currentUser;

    if (!user) return;


    try {

      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "notifications",
          notificationId
        )
      );

    } catch (error) {

      console.error(
        "Failed to delete notification:",
        error
      );

    }

  }


  /*
   * -----------------------------------------
   * TIME FORMAT
   * -----------------------------------------
   */

  function formatTime(
    timestamp: any
  ) {

    if (!timestamp) {
      return "";
    }


    let date: Date;


    try {

      if (
        typeof timestamp.toDate ===
        "function"
      ) {

        date =
          timestamp.toDate();

      } else {

        date =
          new Date(timestamp);

      }


      const seconds =
        Math.floor(
          (Date.now() -
            date.getTime()) /
            1000
        );


      if (seconds < 60) {
        return "Just now";
      }


      const minutes =
        Math.floor(
          seconds / 60
        );


      if (minutes < 60) {
        return `${minutes}m ago`;
      }


      const hours =
        Math.floor(
          minutes / 60
        );


      if (hours < 24) {
        return `${hours}h ago`;
      }


      const days =
        Math.floor(
          hours / 24
        );


      if (days < 7) {
        return `${days}d ago`;
      }


      return date.toLocaleDateString();

    } catch {

      return "";

    }

  }


  /*
   * -----------------------------------------
   * ICON
   * -----------------------------------------
   */

  function getIcon(
    type: AppNotification["type"]
  ) {

    switch (type) {

      case "goal":
        return (
          <Target
            size={17}
            className="text-blue-600"
          />
        );

      case "break":
        return (
          <Coffee
            size={17}
            className="text-orange-500"
          />
        );

      case "streak":
        return (
          <Flame
            size={17}
            className="text-orange-500"
          />
        );

      case "achievement":
        return (
          <Trophy
            size={17}
            className="text-yellow-500"
          />
        );

      case "summary":
        return (
          <BarChart3
            size={17}
            className="text-blue-500"
          />
        );

      case "report":
        return (
          <BarChart3
            size={17}
            className="text-purple-500"
          />
        );

      case "appearance":
        return (
          <Palette
            size={17}
            className="text-purple-500"
           />
        );

      default:
        return (
          <BookOpen
            size={17}
            className="text-blue-500"
          />
        );

    }

  }


  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (

    <div
      ref={dropdownRef}
      className="relative"
    >

      {/* BELL */}

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        aria-label="Notifications"
        className="
          relative
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          text-gray-500
          hover:bg-gray-100
          hover:text-gray-900
          transition
        "
      >

        <Bell size={21} />

        {unreadCount > 0 && (

          <span
            className="
              absolute
              -top-0.5
              -right-0.5
              min-w-[18px]
              h-[18px]
              px-1
              rounded-full
              bg-red-500
              text-white
              text-[10px]
              font-bold
              flex
              items-center
              justify-center
              border-2
              border-white
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>

        )}

      </button>


      {/* DROPDOWN */}

      {open && (

        <div
          className="
            absolute
            right-0
            top-12
            w-[360px]
            max-w-[calc(100vw-2rem)]
            bg-white
            rounded-2xl
            border
            border-gray-200
            shadow-xl
            z-50
            overflow-hidden
          "
        >

          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-4
              border-b
              border-gray-100
            "
          >

            <div>

              <h3
                className="
                  font-semibold
                  text-gray-900
                "
              >
                Notifications
              </h3>

              <p
                className="
                  text-xs
                  text-gray-500
                  mt-0.5
                "
              >
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread`}
              </p>

            </div>


            {unreadCount > 0 && (

              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  text-blue-600
                  hover:text-blue-700
                  font-medium
                "
              >

                <CheckCheck
                  size={15}
                />

                Mark all read

              </button>

            )}

          </div>


          {/* NOTIFICATIONS */}

          <div className="max-h-[420px] overflow-y-auto">

            {notifications.length === 0 ? (

              <div
                className="
                  py-12
                  px-6
                  text-center
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-gray-100
                    mx-auto
                    flex
                    items-center
                    justify-center
                    mb-3
                  "
                >

                  <Bell
                    size={21}
                    className="text-gray-400"
                  />

                </div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  No notifications
                </p>

                <p
                  className="
                    text-xs
                    text-gray-400
                    mt-1
                  "
                >
                  We'll let you know when
                  something happens.
                </p>

              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    key={
                      notification.id
                    }
                    className={`
                      group
                      flex
                      gap-3
                      px-5
                      py-4
                      border-b
                      border-gray-100
                      transition
                      ${
                        notification.read
                          ? "bg-white"
                          : "bg-blue-50/50"
                      }
                    `}
                  >

                    {/* ICON */}

                    <div
                      className="
                        w-9
                        h-9
                        rounded-xl
                        bg-white
                        border
                        border-gray-100
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      {getIcon(
                        notification.type
                      )}
                    </div>


                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-2
                        "
                      >

                        <p
                          className={`
                            text-sm
                            ${
                              notification.read
                                ? "font-medium"
                                : "font-semibold"
                            }
                            text-gray-900
                          `}
                        >
                          {notification.title}
                        </p>


                        {!notification.read && (

                          <span
                            className="
                              w-2
                              h-2
                              rounded-full
                              bg-blue-600
                              shrink-0
                              mt-1.5
                            "
                          />

                        )}

                      </div>


                      <p
                        className="
                          text-xs
                          text-gray-500
                          mt-1
                          leading-relaxed
                        "
                      >
                        {notification.message}
                      </p>


                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          mt-2
                        "
                      >

                        <span
                          className="
                            text-[11px]
                            text-gray-400
                          "
                        >
                          {formatTime(
                            notification.createdAt
                          )}
                        </span>


                        <div
                          className="
                            flex
                            items-center
                            gap-1
                          "
                        >

                          {!notification.read && (

                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                              title="Mark as read"
                              className="
                                p-1.5
                                rounded-lg
                                text-gray-400
                                hover:text-blue-600
                                hover:bg-blue-50
                              "
                            >
                              <Check
                                size={14}
                              />
                            </button>

                          )}


                          <button
                            type="button"
                            onClick={() =>
                              deleteNotification(
                                notification.id
                              )
                            }
                            title="Delete"
                            className="
                              p-1.5
                              rounded-lg
                              text-gray-400
                              hover:text-red-600
                              hover:bg-red-50
                            "
                          >
                            <Trash2
                              size={14}
                            />
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      )}

    </div>
  );
}