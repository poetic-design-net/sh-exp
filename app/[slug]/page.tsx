import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/app/actions/landing-pages";
import type { LandingPage } from "@/types/landing-page";
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

  // Ensure each component gets the navigation config if it's a hero component
  const components = page.components.map(component => {
    if (component.type === 'hero') {
      return {
        ...component,
        props: {
          ...component.props,
          navigation: page.navigation
        }
      };
    }
    return component;
  });

  return (
    <div>
      {components.sort((a, b) => a.order - b.order).map((component) => (
        <ComponentMapper key={component.id} component={component} />
      ))}
    </div>
  );
}
