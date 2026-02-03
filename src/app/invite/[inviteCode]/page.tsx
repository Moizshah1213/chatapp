import { redirect } from "next/navigation";
import { db } from "@/lib/db"; 
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface InvitePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { inviteCode } = await params;
  const cookieStore = await cookies();

  // 1. Supabase Client Setup (User check karne ke liye)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Agar user login nahi hai, toh login page par bhejien
  if (!user) {
    return redirect(`/login?returnTo=/invite/${inviteCode}`);
  }

  if (!inviteCode) {
    return redirect("/");
  }

  // 2. Check karein ke user pehle se member hai?
  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: inviteCode,
      members: {
        some: {
          profileId: user.id // Supabase Auth ID
        }
      }
    }
  });

  if (existingServer) {
    return redirect(`/?serverId=${existingServer.id}`); 
  }

  // 3. Naya member add karein
  try {
    const server = await db.server.update({
      where: {
        inviteCode: inviteCode,
      },
      data: {
        members: {
          create: [
            {
              profileId: user.id,
            }
          ]
        }
      }
    });

    if (server) {
      return redirect(`/?serverId=${server.id}`); 
    }
  } catch (error) {
    console.error("INVITE_PAGE_ERROR", error);
    return redirect("/");
  }

  return redirect("/");
};

export default InvitePage;