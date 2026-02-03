// ❌ No "use client" here
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/lib/db";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  
  // 🚀 SPEED FIX: getAll use karein taake Supabase baar-baar token refresh na kare
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component mein setAll error ignore karein
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. 🔄 Prisma Sync & Fetch with Profiles
  const dbUser = await db.user.upsert({
    where: { id: user.id },
    update: {
    email: user.email!,
    },
    create: {
    id: user.id,
    email: user.email!,
    // 🟢 Sirf naya user bante waqt metadata use karein
    name: user.user_metadata?.full_name || user.user_metadata?.user_name || "New Member",
    image: user.user_metadata?.avatar_url || "/default-avatar.png",
    password: "", 
    status: "OFFLINE",
    statusPreference: "ONLINE",
  },
    include: {
      profiles: true // 👈 Prisma model relation ka naam yahan check karein
    }
  });

  // 🧩 Data Merge Logic (The Clean Way)
  // Check karein ke Prisma ne 'profiles' bheja hai ya 'Profiles'
  const profileData = (dbUser as any).profiles || (dbUser as any).Profiles;

  const mergedUser = {
  ...dbUser,
  // 🔑 Priority: Agar profile mein avatar hai toh wo dikhao, warna Github image
  image: profileData?.avatar || dbUser.image,
  name: profileData?.display_name || dbUser.name,
  // Baaki profile fields bhi merge kar dein
  bio: profileData?.bio,
  banner: profileData?.banner,
};

  // 4. Dashboard ko data bhej dein
  return <Dashboard currentUser={mergedUser}
   />;
}