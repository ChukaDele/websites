import { redirect } from "next/navigation";

// Retired: prioritising a messy data estate is what the Data Diagnostic does, so
// this URL now sends readers there. It stays alive for old links and bookmarks.
export default function Page() {
  redirect("/data-diagnostic");
}
