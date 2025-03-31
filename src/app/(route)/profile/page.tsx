"use server";
import Profile from "@/components/shared/Profile";
import { getUserId } from "../../../../lib/auth";

const ProfilePage = async () => {
  const userId = await getUserId();
  console.log(userId);
  return <Profile userId={userId} />;
};

export default ProfilePage;
