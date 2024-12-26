import Link from 'next/link';

interface FooterProps {
  id?: string;
  name: {
    bold: string;
    normal: string;
  };
  quote: string;
  quickLinks: {
    privacyPolicy: string;
    termsConditions: string;
    faqs: string;
    contact: string;
  };
  socials: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  contact: {
    phone: string;
    address: string;
  };
}

export function Footer({
  id,
  name,
  quote,
  quickLinks,
  socials,
  contact
}: FooterProps) {
  const linkClasses = "text-white text-xl leading-normal hover:text-cyan-300 transition-colors";
  const titleClasses = "text-white text-xl font-bold leading-normal";
  const textClasses = "text-white text-xl leading-normal";

  return (
    <section id={id} className="bg-cyan-950">
      <div className="max-w-[1440px] mx-auto px-5 py-24 md:px-16 lg:px-24">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-10 mb-24">
          <div className="text-center">
            <span className="text-cyan-300 text-5xl lg:text-8xl font-bold ">
              {name.bold}
            </span>
            <span className="text-cyan-300 text-5xl lg:text-8xl">
              {name.normal}
            </span>
          </div>
          <div className="max-w-2xl text-center text-white text-2xl leading-loose">
            {quote}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-20 mb-24">
          {/* Quick Links */}
          <div className="flex flex-col gap-5">
            <div className={titleClasses}>Quick Links</div>
            <Link href="/privacy-policy" className={linkClasses}>
              {quickLinks.privacyPolicy}
            </Link>
            <Link href="/terms" className={linkClasses}>
              {quickLinks.termsConditions}
            </Link>
            <Link href="/faqs" className={linkClasses}>
              {quickLinks.faqs}
            </Link>
            <Link href="/contact" className={linkClasses}>
              {quickLinks.contact}
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-5">
            <div className={titleClasses}>Socials</div>
            <Link href="#" className={linkClasses}>
              {socials.facebook}
            </Link>
            <Link href="#" className={linkClasses}>
              {socials.instagram}
            </Link>
            <Link href="#" className={linkClasses}>
              {socials.linkedin}
            </Link>
            <Link href="#" className={linkClasses}>
              {socials.youtube}
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-5">
            <div className={titleClasses}>Contact</div>
            <div className={textClasses}>
              {contact.phone}
            </div>
            <div className={`${textClasses} whitespace-pre-line`}>
              {contact.address}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-white">
          © Intensiventbildung 2024. All Rights Reserved.
        </div>
      </div>
    </section>
  );
}

export default Footer;
