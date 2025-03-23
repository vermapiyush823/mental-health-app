"use server";
import Profile from "@/components/shared/Profile";
import { cookies } from "next/headers";

const ProfilePage = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value || ""; // Get value safely
  console.log(userId);
  return <Profile userId={userId} />;
};

export default ProfilePage;
