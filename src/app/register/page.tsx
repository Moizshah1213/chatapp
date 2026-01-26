"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const router = useRouter(); // Initialize


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (res.ok) {
    // Signup ke baad foran login par bhej dega
    router.push("/login");
  } else {
    alert("Email already used!");
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F0F] text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#1A1A1A] rounded-2xl border border-gray-800 shadow-2xl">
        <h1 className="text-3xl font-bold text-center">Create Account</h1>
        <p className="text-sm text-gray-400 text-center">Join our modern chat community</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 bg-[#252525] border border-gray-700 rounded-lg focus:outline-none focus:border-[#E2FB6D] transition-colors"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-[#252525] border border-gray-700 rounded-lg focus:outline-none focus:border-[#E2FB6D] transition-colors"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-[#252525] border border-gray-700 rounded-lg focus:outline-none focus:border-[#E2FB6D] transition-colors"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#E2FB6D] text-black font-bold rounded-lg hover:bg-[#d4ed5a] transition-all shadow-[0_0_15px_rgba(226,251,109,0.3)]"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}