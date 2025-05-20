import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { getUserId } from "../../../lib/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserId();
  // Check if the "token" cookie exists
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    // Redirect to the sign-in page if the token is missing
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        userId={userId}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}