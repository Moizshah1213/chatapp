"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Github, Chrome, Mail, Lock, ArrowRight } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile'; // 👈 Library import
import { createBrowserClient } from "@supabase/ssr"; // 👈 Supabase SSR use karenge

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // 🟢 Supabase Client Initialize
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 🔐 1. Email/Password Login Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
      options: {
        captchaToken: turnstileToken, // 👈 Supabase ko token bhej rahe hain
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh(); // Session sync karne ke liye
    }
  };

  // 🌐 2. Social Login Logic
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-4 sm:p-6 lg:p-8 selection:bg-blue-500/30">
      {/* Background Glow Effect */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm mt-2">Enter your details to access your account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs mb-6 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Social Logins */}
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
              <span className="bg-[#0a0a0a] px-3 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="flex justify-center py-2 z-[1000] overflow-hidden">
              <Turnstile 
                siteKey="0x4AAAAAACWezO7Ql2IkLe98"
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setError("Captcha failed to load.")}
                onExpire={() => setTurnstileToken(null)}
                options={{
    theme: 'dark', // 👈 Theme ko options ke andar le jayein
  }}
              />
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[12px] text-gray-500 hover:text-blue-400 transition-colors font-medium">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-white hover:text-blue-400 font-semibold transition-colors">
              Join for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}