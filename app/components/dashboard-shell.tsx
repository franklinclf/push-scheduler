"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ShellProps = {
  children: React.ReactNode;
};

const links = [
  { href: "/", label: "Employees" },
  { href: "/scheduler", label: "Scheduler" },
  { href: "/timetracking", label: "Timetracking" },
];

const HEADER_HEIGHT = 64;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function DashboardShell({ children }: ShellProps) {
  const pathname = usePathname();
  const isLarge = useMediaQuery("(min-width: 1366px)");
  const [sidebarOpen, setSidebarOpen] = useState(() => isLarge);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSidebarOpen(isLarge);
  }, [isLarge]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const showSidebar = useMemo(() => {
    if (!hydrated) return true;
    return sidebarOpen || isLarge;
  }, [hydrated, isLarge, sidebarOpen]);

  const title = links.find((link) => link.href === pathname)?.label || "Employees";

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#0D325F]">
      <header
        className={`fixed top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 ${
          isLarge ? "left-60 right-0" : "left-0 right-0"
        }`}
      >
        <div className="flex items-center gap-3">
          {!isLarge && (
            <button
              type="button"
              aria-label="Toggle navigation"
              className="flex h-10 w-10 items-center justify-center rounded-md bg-white shadow-sm"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#103b73]"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}
          <h1 className="text-xl font-semibold text-[#103b73] capitalize">{title}</h1>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4db3d3] text-sm font-semibold text-white">
            JS
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[#103b73]">John Smith</div>
            <div className="text-xs text-slate-500">johnsmith@gmail.com</div>
          </div>
        </div>
      </header>

      <div className="pt-16">
        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-60 border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-out ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } ${isLarge ? "translate-x-0" : ""}`}
        >
          <div className="flex items-center gap-3 px-3 py-5">
            <Image src="/logo.svg" width={26} height={26} alt="Push logo" />
            <span className="text-lg font-semibold text-[#0D325F]">Push</span>
          </div>
          <nav className="flex flex-col text-sm font-medium text-slate-600">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block w-full px-4 py-3 transition ${
                    active ? "bg-[#F4F6F9] text-[#0D325F] font-bold" : "hover:bg-[#F4F6F9]"
                  }`}
                  onClick={() => {
                    if (!isLarge) setSidebarOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {!isLarge && showSidebar && (
          <div
            className="fixed inset-0 z-10 bg-black/20"
            role="presentation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main
          className={`min-h-[calc(100vh-${HEADER_HEIGHT}px)] p-6 sm:p-6 lg:p-5 ${
            isLarge ? "lg:ml-60" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

