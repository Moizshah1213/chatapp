"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link correctly

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Yeh page refresh hone se rokta hai
    setError("");

    const res = await signIn("credentials", {
      ...formData,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        
        {error && <p className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</p>}

        {/* 1. Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          
          {/* Yeh button sirf login karega */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            Sign In
          </button>
        </form>

        {/* 2. Separate Links (Form se bahar) */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link 
            href="/forgot-password" 
            className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
          >
            Forgot Password?
          </Link>
          
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}