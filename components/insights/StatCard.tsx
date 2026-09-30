"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300 h-full">

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>

        {icon}

      </div>

      <h4 className="text-sm text-gray-500 mt-5">
        {title}
      </h4>

      <h2 className="text-4xl font-bold mt-2">
        {value}
      </h2>

      <p className="text-sm text-gray-500 mt-3">
        {subtitle}
      </p>

    </div>
  );
}