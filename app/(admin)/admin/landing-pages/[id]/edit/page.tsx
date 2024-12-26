import { getLandingPages } from "@/services/landing-pages";
import { EditLandingPageForm } from "@/app/(admin)/admin/landing-pages/[id]/edit/edit-landing-page-form";
import type { LandingPage } from "@/types/landing-page";

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Add runtime config to ensure server-side rendering
export const runtime = 'nodejs';

export default async function EditLandingPage({
  params,
}: {
  params: { id: string };
}) {
  const pages = await getLandingPages() as LandingPage[];
  const page = pages.find((p: LandingPage) => p.id === params.id);

  if (!page) {
    return <div className="container mx-auto py-10">Landing page not found</div>;
  }

  return <EditLandingPageForm initialData={page} />;
}
