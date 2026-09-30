"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getFirebaseErrorMessage } from "../../lib/firebaseAuthError";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

const handleSignup = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    toast.success("Welcome! Your account is ready.");
    router.push("/dashboard");
  } catch (error: any) {
    toast.error(getFirebaseErrorMessage(error));
  }
};
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
  <div className="bg-white p-10 rounded-2xl shadow-lg w-[400px] flex flex-col gap-6">
    
    {/* Header */}
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold text-gray-900">
        Create your account
      </h1>

      <p className="text-sm text-gray-600">
        Start tracking your study sessions
      </p>
    </div>

    {/* Inputs */}
    <div className="flex flex-col gap-3">
      <p className="font-bold text-gray-800">Email address</p>
     <div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

  <input
    className="w-full border border-gray-600 text-gray-800 pl-10 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>

      <p className="font-bold text-gray-800">Password</p>
      <div className="relative">
  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

  <input
    className="w-full border border-gray-600 text-gray-800 pl-10 pr-10 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>

</div>

    {/* Button */}
    <button
      onClick={handleSignup}
      className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition font-medium"
    >
      Create Account
    </button>

    {/* Footer */}
    <p className="text-sm text-center text-gray-600">
      Already have an account?{" "}
      <Link href="/login" className="text-blue-500 hover:underline">
        Log in
      </Link>
    </p>

  </div>
</div>
  );
}