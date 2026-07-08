"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/invoices", label: "Invoices" },
  { href: "/inventory", label: "Inventory" },
  { href: "/calculator", label: "Calculator" },
  { href: "/assistant", label: "Assistant" },
  { href: "/settings/shopify", label: "Shopify" },
];

export default function NavBar() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <header className="sticky top-0 z-10 border-b border-[#e1e0d9] bg-[#fcfcfb]/90 backdrop-blur dark:border-[#2c2c2a] dark:bg-[#1a1a19]/90">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-3 text-sm">
        <span className="mr-3 shrink-0 font-semibold text-[#0b0b0b] dark:text-white">
          SnapPrint
        </span>
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1.5 font-medium transition-colors ${
                active
                  ? "bg-[#2a78d6] text-white"
                  : "text-[#52514e] hover:bg-[#e1e0d9]/60 dark:text-[#c3c2b7] dark:hover:bg-[#2c2c2a]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <form action={logout} className="ml-auto shrink-0">
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 font-medium text-[#52514e] hover:bg-[#e1e0d9]/60 dark:text-[#c3c2b7] dark:hover:bg-[#2c2c2a]"
          >
            Log out
          </button>
        </form>
      </nav>
    </header>
  );
}
