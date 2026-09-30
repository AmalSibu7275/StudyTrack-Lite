"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Save, User } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import {
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { useUserProfile } from "@/context/UserProfileContext";

import {
  useLanguage,
  Language,
} from "@/components/language/LanguageProvider";

import { toast } from "sonner";

const CLOUDINARY_CLOUD_NAME = "adcjv865";
const CLOUDINARY_UPLOAD_PRESET = "studytrack_profile";

export default function ProfileSettings() {
  const {
    setPhotoURL: setGlobalPhotoURL,
  } = useUserProfile();

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [timezone, setTimezone] =
    useState("America/Toronto");

  /*
   * Keep a separate language value for the form.
   *
   * This prevents changing the dropdown from
   * immediately changing the entire website.
   *
   * The global language changes after Save Changes.
   */
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(language);

  const [photoURL, setPhotoURL] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /*
   * -----------------------------------------
   * KEEP FORM LANGUAGE IN SYNC
   * -----------------------------------------
   */

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  /*
   * -----------------------------------------
   * LOAD USER PROFILE
   * -----------------------------------------
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            setLoading(false);
            return;
          }

          setName(user.displayName || "");
          setEmail(user.email || "");
          setPhotoURL(user.photoURL || "");

          try {
            const ref = doc(
              db,
              "users",
              user.uid
            );

            const snap = await getDoc(ref);

            if (snap.exists()) {
              const data = snap.data();

              /*
               * TIMEZONE
               */
              if (
                typeof data.timezone === "string" &&
                data.timezone.length > 0
              ) {
                setTimezone(data.timezone);
              }

              /*
               * LANGUAGE
               */
              if (
                data.language === "English" ||
                data.language === "French"
              ) {
                setSelectedLanguage(
                  data.language as Language
                );

                /*
                 * Make Firebase's saved language
                 * the active application language.
                 */
                setLanguage(
                  data.language as Language
                );
              }

              /*
               * PROFILE PHOTO
               */
              if (data.photoURL) {
                setPhotoURL(data.photoURL);

                setGlobalPhotoURL(
                  data.photoURL
                );
              }
            }
          } catch (error) {
            console.error(
              "Failed to load profile:",
              error
            );

            toast.error(
              "Unable to load profile",
              {
                description:
                  "Please try again.",
              }
            );
          }

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [setGlobalPhotoURL, setLanguage]);

  /*
   * -----------------------------------------
   * CAMERA BUTTON
   * -----------------------------------------
   */

  function handleCameraClick() {
    fileInputRef.current?.click();
  }

  /*
   * -----------------------------------------
   * PROFILE PHOTO
   * -----------------------------------------
   */

  async function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const user = auth.currentUser;

    if (!user) {
      toast.error(
        "You must be logged in",
        {
          description:
            "Please log in before uploading a profile photo.",
        }
      );

      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Invalid image",
        {
          description:
            "Please select an image file.",
        }
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Image is too large",
        {
          description:
            "Please select an image smaller than 5 MB.",
        }
      );

      return;
    }

    try {
      setUploadingPhoto(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
      );

      formData.append(
        "public_id",
        `studytrack/${user.uid}/profile`
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(
          "Upload failed"
        );
      }

      const data =
        await res.json();

      const downloadURL: string =
        data.secure_url;

      /*
       * Update Firebase Auth
       */
      await updateProfile(
        user,
        {
          photoURL: downloadURL,
        }
      );

      /*
       * Update Firestore
       */
      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          photoURL: downloadURL,
        },
        {
          merge: true,
        }
      );

      /*
       * Update local image
       */
      setPhotoURL(
        downloadURL
      );

      /*
       * Update global image
       */
      setGlobalPhotoURL(
        downloadURL
      );

      toast.success(
        "Profile picture updated",
        {
          description:
            "Your new profile picture is now being used across StudyTrack.",
        }
      );
    } catch (error) {
      console.error(
        "Photo upload error:",
        error
      );

      toast.error(
        "Failed to upload profile picture",
        {
          description:
            "Please try again.",
        }
      );
    } finally {
      setUploadingPhoto(false);

      event.target.value = "";
    }
  }

  /*
   * -----------------------------------------
   * SAVE PROFILE
   * -----------------------------------------
   */

  async function handleSave() {
    const user =
      auth.currentUser;

    if (!user) {
      toast.error(
        "You must be logged in",
        {
          description:
            "Please log in before saving your profile.",
        }
      );

      return;
    }

    try {
      setSaving(true);

      /*
       * Update Firebase Authentication
       */
      await updateProfile(
        user,
        {
          displayName: name,
        }
      );

      /*
       * Save profile settings
       */
      await setDoc(
  doc(
    db,
    "users",
    user.uid
  ),
  {
    name: name.trim(),
    timezone,
    language: selectedLanguage,
    photoURL,
  },
  {
    merge: true,
  }
);

      /*
       * Now apply the selected language
       * globally.
       */
      setLanguage(
        selectedLanguage
      );

      toast.success(
        "Profile saved",
        {
          description:
            "Your profile settings have been updated successfully.",
        }
      );
    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );

      toast.error(
        "Failed to save profile",
        {
          description:
            "We couldn't save your profile settings. Please try again.",
        }
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  if (loading) {
    return (
      <div className="p-8 text-gray-500">
        {t("loading")}
      </div>
    );
  }

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold">
          {t("profile")}
        </h1>

        <p className="text-gray-500 mt-2">
          {selectedLanguage === "French"
            ? "Gérez vos informations personnelles."
            : "Manage your personal information."}
        </p>
      </div>

      {/* PROFILE CARD */}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">

        <div className="flex flex-col md:flex-row gap-8">

          {/* PROFILE PHOTO */}

          <div className="flex flex-col items-center">

            <div className="relative">

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={
                  handlePhotoChange
                }
                className="hidden"
              />

              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">

                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    size={54}
                    className="text-blue-600"
                  />
                )}

              </div>

              <button
                type="button"
                onClick={
                  handleCameraClick
                }
                disabled={
                  uploadingPhoto
                }
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Camera size={18} />
              </button>

            </div>

            <p className="text-sm text-gray-500 mt-4">
              {uploadingPhoto
                ? selectedLanguage === "French"
                  ? "Téléchargement..."
                  : "Uploading photo..."
                : selectedLanguage === "French"
                  ? "Télécharger une nouvelle photo"
                  : "Upload a new photo"}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or GIF • Max 5 MB
            </p>

          </div>

          {/* PROFILE INFORMATION */}

          <div className="flex-1 space-y-6">

            {/* NAME */}

            <div>

              <label className="block text-sm font-medium mb-2">
                {t("name")}
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-medium mb-2">
                {t("email")}
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
              />

            </div>

            {/* TIMEZONE + LANGUAGE */}

            <div className="grid md:grid-cols-2 gap-6">

              {/* TIMEZONE */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  {t("timezone")}
                </label>

                <select
                  value={timezone}
                  onChange={(e) =>
                    setTimezone(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >

                  <option value="America/Toronto">
                    Eastern Time — Toronto
                  </option>

                  <option value="America/New_York">
                    Eastern Time — New York
                  </option>

                  <option value="America/Chicago">
                    Central Time — Chicago
                  </option>

                  <option value="America/Denver">
                    Mountain Time — Denver
                  </option>

                  <option value="America/Los_Angeles">
                    Pacific Time — Los Angeles
                  </option>

                  <option value="America/Vancouver">
                    Pacific Time — Vancouver
                  </option>

                  <option value="America/Edmonton">
                    Mountain Time — Edmonton
                  </option>

                  <option value="America/Winnipeg">
                    Central Time — Winnipeg
                  </option>

                  <option value="America/Halifax">
                    Atlantic Time — Halifax
                  </option>

                  <option value="America/St_Johns">
                    Newfoundland Time — St. John's
                  </option>

                  <option value="Asia/Kolkata">
                    India Standard Time — Kolkata
                  </option>

                  <option value="Europe/London">
                    Greenwich Mean Time — London
                  </option>

                  <option value="Europe/Paris">
                    Central European Time — Paris
                  </option>

                  <option value="Asia/Tokyo">
                    Japan Standard Time — Tokyo
                  </option>

                  <option value="Australia/Sydney">
                    Australian Eastern Time — Sydney
                  </option>

                  <option value="UTC">
                    Coordinated Universal Time — UTC
                  </option>

                </select>

              </div>

              {/* LANGUAGE */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  {t("language")}
                </label>

                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    const newLanguage =
                      e.target.value as Language;

                    setSelectedLanguage(
                      newLanguage
                    );
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >

                  <option value="English">
                    English
                  </option>

                  <option value="French">
                    Français
                  </option>

                </select>

              </div>

            </div>

            {/* SAVE */}

            <div className="pt-4">

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                <Save size={18} />

                {saving
                  ? selectedLanguage === "French"
                    ? "Enregistrement..."
                    : "Saving..."
                  : t("saveChanges")}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}