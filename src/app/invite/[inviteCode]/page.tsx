import { redirect } from "next/navigation";
import { db } from "@/lib/db"; 
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth";

interface InvitePageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

const InvitePage = async ({ params }: InvitePageProps) => {
  // Params ko unwrap karein (Next.js 15 syntax)
  const { inviteCode } = await params;
  
  const session = await getServerSession(authOptions);

  // Agar user login nahi hai
  if (!session?.user) {
    return redirect("/login");
  }

  if (!inviteCode) {
    return redirect("/");
  }

  // 1. Check karein ke user pehle se member hai?
  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: inviteCode,
      members: {
        some: {
          profileId: session.user.id
        }
      }
    }
  });

  if (existingServer) {
    // Agar member hai toh home page par bhejien (ya server dashboard par)
    return redirect("/"); 
  }

  // 2. Naya member add karein
  const server = await db.server.update({
    where: {
      inviteCode: inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: session.user.id,
          }
        ]
      }
    }
  });

  // Join karne ke baad home page par bhej dein
  if (server) {
  // 1. Agar aap chahte hain ke user home page par jaye aur wahan server select ho jaye:
  return redirect(`/?serverId=${server.id}`); 
  
  // 2. Ya agar aapka dashboard sirf "/" par hai bina query ke:
  // return redirect("/"); 
}

return redirect("/");
};

export default InvitePage;