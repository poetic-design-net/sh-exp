"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Tags,
  ShoppingBag,
  Image,
  Layout,
  GitBranch,
  GraduationCap,
} from "lucide-react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: ShoppingCart,
    subItems: [
      {
        href: "/admin/categories",
        label: "Categories",
        icon: Tags,
      },
    ],
  },
  {
    href: "/admin/memberships",
    label: "Memberships",
    icon: CreditCard,
    subItems: [
      {
        href: "/admin/membership-pages",
        label: "Membership Pages",
        icon: FileText,
      },
    ],
  },
  {
    href: "/admin/courses",
    label: "Kurse",
    icon: GraduationCap,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    href: "/admin/pages",
    label: "Pages",
    icon: FileText,
    subItems: [
      {
        href: "/admin/landing-pages",
        label: "Landing Pages",
        icon: Layout,
      },
      {
        href: "/admin/funnels",
        label: "Funnels",
        icon: GitBranch,
      },
    ],
  },
  {
    href: "/admin/media",
    label: "Media Library",
    icon: Image,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-xl font-bold text-primary">
              Admin
            </Link>
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.subItems?.some(sub => pathname === sub.href) ?? false);

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                    {item.subItems && (
                      <div className="absolute left-0 mt-0 pt-1 w-48 hidden group-hover:block z-50">
                        <div className="bg-white rounded-md shadow-lg border">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={cn(
                                  "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
                                  pathname === subItem.href && "bg-primary/10 text-primary"
                                )}
                              >
                                <SubIcon className="mr-2 h-4 w-4" />
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/settings"
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Exit Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
