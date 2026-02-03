"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    // 🟢 Supabase built-in encryption ke saath password update karega
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
      <Toaster />
      <div className="w-full max-w-md p-8 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl">
        <h1 className="text-2xl font-medium mb-6">Create New Password</h1>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 ml-1">NEW PASSWORD</label>
            <input 
              type="password" 
              required
              minLength={6}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 ml-1">CONFIRM PASSWORD</label>
            <input 
              type="password" 
              required
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-medium transition-all shadow-lg shadow-green-500/20 mt-2"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}