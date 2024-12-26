import { PageHeader } from "./components/page-header";
import { LandingPagesList } from "./components/landing-pages-list";
import { getLandingPages } from "@/app/actions/landing-pages";

export default async function LandingPagesPage() {
  const pages = await getLandingPages();

  return (
    <div className="">
      <PageHeader />
      <LandingPagesList initialPages={pages} />
    </div>
  );
}
