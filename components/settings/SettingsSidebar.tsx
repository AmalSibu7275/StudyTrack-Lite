"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  User,
  BookOpen,
  Target,
  Bell,
  Palette,
  Shield,
  Database,
  Settings,
} from "lucide-react";

const items = [
  {
    label: "Profile",
    href: "/settings/profile",
    icon: User,
  },
  {
    label: "Preferences",
    href: "/settings/preferences",
    icon: BookOpen,
  },
  {
    label: "Goals",
    href: "/settings/goals",
    icon: Target,
  },
  {
    label: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    label: "Appearance",
    href: "/settings/appearance",
    icon: Palette,
  },
  {
    label: "Privacy",
    href: "/settings/privacy",
    icon: Shield,
  },
  {
    label: "Data",
    href: "/settings/data",
    icon: Database,
  },
  {
    label: "Account",
    href: "/settings/account",
    icon: Settings,
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 rounded-3xl border border-gray-200 bg-white shadow-sm p-6 h-fit">

      <h2 className="text-2xl font-bold mb-6">
        Settings
      </h2>

      <nav className="space-y-2">

        {items.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition

              ${
                active
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Icon size={20} />

              {item.label}
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}