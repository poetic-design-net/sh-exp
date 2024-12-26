import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/app/actions/landing-pages";
import { ComponentMapper } from "@/app/l/components/component-mapper";

export default async function LandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getLandingPageBySlug(params.slug);
  if (!page) {
    notFound();
  }

  return (
    <div>
      {page.components.sort((a, b) => a.order - b.order).map((component) => (
        <ComponentMapper key={component.id} component={component} />
      ))}
    </div>
  );
}
