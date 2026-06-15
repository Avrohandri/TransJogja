import { redirect } from "next/navigation";

export default function RootPage() {
    // Arahkan ke halaman login sebagai landing page
    redirect("/login");
}
