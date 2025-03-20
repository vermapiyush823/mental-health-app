import Header from "@/components/shared/Header";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="">
      <Header/>
      <section className="">
        <div>{children}</div>
      </section>
    </main>
  );
}