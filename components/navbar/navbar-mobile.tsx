"use client";

import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

export const NavbarMobile = () => {
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="-mr-4">
              <MenuIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex flex-col p-1">
              <Link
                href="#about"
                className={buttonVariants({ variant: "link" })}
              >
                Über mich
              </Link>
              <Link
                href="#program"
                className={buttonVariants({ variant: "link" })}
              >
                Programm Details
              </Link>
              <Link
                href="#pricing"
                className={buttonVariants({ variant: "link" })}
              >
                Preise
              </Link>
              <Link
                href="#testimonials"
                className={buttonVariants({ variant: "link" })}
              >
                Referenzen
              </Link>
              <Link
                href="#contact"
                className={buttonVariants({ variant: "link" })}
              >
                Kontakt
              </Link>
              <Link
                href="/reserve"
                className={buttonVariants({ variant: "default", className: "mt-2" })}
              >
                Platz reservieren
              </Link>
              <div className="flex flex-col mt-2">
                <NavbarUserLinks />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
};
