"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type UserProfileContextType = {
  user: User | null;
  loading: boolean;
  photoURL: string;
  setPhotoURL: (url: string) => void;
};

const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  loading: true,
  photoURL: "",
  setPhotoURL: () => {},
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoURL, setPhotoURLState] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setPhotoURLState(currentUser?.photoURL || "");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  function setPhotoURL(url: string) {
    setPhotoURLState(url);
  }

  return (
    <UserProfileContext.Provider value={{ user, loading, photoURL, setPhotoURL }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}