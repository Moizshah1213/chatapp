"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    if (res.ok) {
      alert("Password updated! Redirecting to login...");
      router.push("/login");
    }
  };

  if (!email) return <p className="text-red-500 text-center">Invalid Link!</p>;

  return (
    <div className="w-full max-w-md p-8 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl">
      <h2 className="text-xl font-bold mb-2">Set New Password</h2>
      <p className="text-xs text-gray-500 mb-6">Resetting password for: {email}</p>
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <input 
          type="password" 
          placeholder="New Password" 
          required
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button className="w-full py-3 bg-blue-600 rounded-xl font-bold">Update Now</button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}