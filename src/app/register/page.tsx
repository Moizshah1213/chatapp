"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Github, Chrome } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";


export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
const [success, setSuccess] = useState(""); // 👈 Success message ke liye
  // 🟢 Supabase Client Initialize
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 🔐 1. Email/Password Signup Logic
 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   if (!turnstileToken) {
      setError("Please complete the captcha verification.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // 1. Apni Register API ko call karein (Ye Supabase + Prisma dono handle karegi)
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          captchaToken: turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // 2. Agar API successful hai
     if (!response.ok) {
  throw new Error(result.error || "Registration failed");
}

// ✅ Alert ki jagah success state set karein
setSuccess("Registration successful! Please check your email if confirmation is enabled.");
// router.push("/login"); // Agar aap message dikhana chahte hain, toh foran redirect na karein

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌐 2. Social Login Logic (Google/Github)
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-4 sm:p-6 lg:p-8 selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[460px] animate-in fade-in zoom-in duration-500">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-500 text-sm mt-2">Join our modern chat community today</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs mb-6 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Social Sign Up */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 text-sm font-medium"
            >
              <Chrome size={18} className="text-gray-300" />
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 text-sm font-medium"
            >
              <Github size={18} className="text-gray-300" />
              GitHub
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0a] px-3 text-gray-500 font-medium">Or use email</span>
            </div>
          </div>

          {success && (
  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl text-xs mb-6 text-center">
    {success}
  </div>
)}

{/* Error Message 🔴 */}
{error && (
  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs mb-6 text-center animate-shake">
    {error}
  </div>
)}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="password"
                placeholder="Strong Password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="flex justify-center py-2">
              <Turnstile 
                siteKey="0x4AAAAAACWezO7Ql2IkLe98"
                 onError={() => setError("Captcha failed to load.")}
                onExpire={() => setTurnstileToken(null)}
                options={{
    theme: 'dark', // 👈 Theme ko options ke andar le jayein
  }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !turnstileToken} // Disable if no token
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20 mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-blue-400 font-semibold transition-colors">
              Log in instead
            </Link>
          </p>
        </div>

        {/* Legal Stuff */}
        <p className="text-[11px] text-center text-gray-600 mt-6 px-10">
          By clicking Create Account, you agree to our 
          <span className="text-gray-500 hover:underline cursor-pointer px-1">Terms of Service</span> 
          and 
          <span className="text-gray-500 hover:underline cursor-pointer px-1">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
