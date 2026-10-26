import { redirect } from "next/navigation";

// About now lives on the How we work page.
export default function AboutPage() {
  redirect("/how-we-work#about");
}
