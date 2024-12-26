import { getMemberships } from "@/app/actions/memberships";
import MembershipCarousel from "@/components/sections/membership-carousel";
import ServiceCarousel from "@/components/sections/service-carousel";
import HeroBlue from "@/components/sections/frontpage/heroblue";
import { Testimonial } from "@/components/sections/frontpage/testimonial";
import GetStarted from "@/components/sections/frontpage/get-started";

export default async function HomePage() {
  const memberships = await getMemberships();
  
  return (
    <div>
      <HeroBlue />
      <div className="w-full mx-auto px-0 py-24 dark:bg-cyan-950">
        <ServiceCarousel />
      </div>
      <Testimonial />
      <GetStarted />
      <div className="w-full mx-auto px-4 py-8">
        <MembershipCarousel memberships={memberships} />
      </div>
    </div>
  );
}
