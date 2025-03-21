import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the "token" cookie exists
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    // Redirect to the sign-in page if the token is missing
    redirect("/sign-in");
  }

  return (
    <main className="">
      <Header />
      <section className="">
        <div>{children}</div>
      </section>
    </main>
  );
}