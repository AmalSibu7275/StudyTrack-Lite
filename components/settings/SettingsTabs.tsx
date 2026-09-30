"use client";

import { useState } from "react";
import {
  User,
  Settings,
  Target,
  Bell,
  Workflow,
  Shield,
  UserCog,
} from "lucide-react";

const tabs = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: Settings,
  },
  {
    id: "tracking",
    label: "Tracking",
    icon: Target,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Workflow,
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    icon: Shield,
  },
  {
    id: "account",
    label: "Account",
    icon: UserCog,
  },
];

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-4">

      <div className="flex items-center gap-8 overflow-x-auto">

        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-5 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}

      </div>

    </div>
  );
}