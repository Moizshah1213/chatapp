"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast, Toaster } from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // 🟢 Ye URL woh hai jahan user link click karne ke baad jayega
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Secure reset link sent to your email!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
      <Toaster />
      <div className="w-full max-w-md p-8 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-2xl">
        <h1 className="text-2xl font-medium mb-2">Reset Password</h1>
        <p className="text-sm text-gray-400 mb-6 text-balance">
          We will send a secure, encrypted recovery link to your email.
        </p>
        
        <form onSubmit={handleResetRequest} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? "Sending..." : "Send Recovery Link"}
          </button>
        </form>
      </div>
    </div>
  );
}