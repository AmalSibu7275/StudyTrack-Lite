"use client";

import { useState } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { toast } from "sonner";
import { getFirebaseErrorMessage } from "../../lib/firebaseAuthError";
import { UserPlus } from "lucide-react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
  try {
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
    }

    await signInWithEmailAndPassword(auth, email, password);

    toast.success("Welcome back!");
    router.push("/dashboard");
  } catch (error: any) {
    toast.error(getFirebaseErrorMessage(error));
  }
};

  const handleForgotPassword = async () => {
  if (!email) {
    toast.error("Please enter your email first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    toast.success("Password reset email sent!");
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
        Track your study.
      </h1>

      <h2 className="text-3xl font-semibold text-gray-900">
        Understand your{" "}
        <span className="text-blue-500">performance</span>
        .
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        A simple way to log your study sessions, measure productivity, and improve every day.
      </p>
    </div>

    {/* Inputs */}
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

    <div className="flex items-center justify-between text-gray-600">
  <label className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      onChange={(e) => setRememberMe(e.target.checked)}
    />
    Remember me
  </label>


  <button
    onClick={handleForgotPassword}
    className="text-sm text-blue-500 hover:underline"
  >
    Forgot password?
  </button>
</div>


    {/* Button */}
    <button
      onClick={handleLogin}
      className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition font-medium"
    >
      Log in
    </button>

   {/* Divider */}
<div className="flex items-center gap-3">
  <div className="h-px bg-gray-300 flex-1" />
  <span className="text-sm text-gray-400">or</span>
  <div className="h-px bg-gray-300 flex-1" />
</div>

{/* Sign up button */}
<Link href="/signup">
  <button className="w-full bg-white border border-gray-300 text-gray-800 py-3 rounded-lg transition font-medium hover:bg-blue-500 hover:text-white hover:border-blue-500 flex items-center justify-center gap-2">
    
    <UserPlus size={18} />
    
    Create an account
  </button>
</Link>

  </div>
</div>
  );
}