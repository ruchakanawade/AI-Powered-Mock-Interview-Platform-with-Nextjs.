import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in"); // 👈 Redirect unauthenticated users to sign-in page
  }

  return (
    <div>
      <h2>Hello everyone!!</h2>
    </div>
  );
}
