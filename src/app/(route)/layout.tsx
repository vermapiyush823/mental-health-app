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
    <main className="">
      <Header 
        userId={userId}
      />
      <section className="">
        <div>{children}</div>
      </section>
      <Footer />
    </main>
  );
}