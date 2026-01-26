"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Yahan hum link generate kar rahe hain jo user ko Reset page par le jayega
    const link = `http://localhost:3000/reset-password?email=${encodeURIComponent(email)}`;
    setResetLink(link);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email to generate a reset link.</p>
        
        <form onSubmit={handleRequest} className="space-y-4">
          <input 
            type="email" 
            placeholder="Enter your registered email" 
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">
            Get Reset Link
          </button>
        </form>

        {resetLink && (
          <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
            <p className="text-[10px] uppercase tracking-widest text-blue-400 mb-2 font-bold">Step 2: Click this link</p>
            <Link href={resetLink} className="text-gray-300 underline break-all text-xs block">
              {resetLink}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}