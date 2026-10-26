import { redirect } from "next/navigation";
import { redirectedResources } from "../../../lib/resources";

// Retired in the US and UK refocus: its checks live in the parent insight and
// in the data audit checklist. This URL stays alive for old links and bookmarks.
export default function Page() {
  redirect(redirectedResources["data-quality-checklist"]);
}
