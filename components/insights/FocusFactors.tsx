"use client";

import { BatteryCharging } from "lucide-react";
import type { Session } from "./useInsights";

interface FocusFactorsProps {
  sessions: Session[];
  loading?: boolean;
}

const energies = ["High", "Medium", "Low"];

export default function FocusFactors({
  sessions,
  loading = false,
}: FocusFactorsProps) {
  const stats = energies.map((energy) => {
    const filtered = sessions.filter(
      (session) => session.energyAfter === energy
    );

    const avg =
      filtered.length === 0
        ? 0
        : filtered.reduce(
            (sum, session) =>
              sum + (Number(session.productivityScore) || 0),
            0
          ) / filtered.length;

    return {
      energy,
      avg,
      count: filtered.length,
    };
  });

  const strongestEnergy =
    stats.filter((item) => item.count > 0).sort(
      (a, b) => b.avg - a.avg
    )[0] ?? null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
          <BatteryCharging className="text-yellow-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            Focus Factors
          </h2>

          <p className="text-sm text-gray-500">
            Energy vs productivity
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((item) => (
            <div key={item}>
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>

              <div className="h-3 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
          No sessions available for this date range.
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {stats.map((item) => (
              <div key={item.energy}>
                <div className="flex justify-between mb-2">
                  <span>{item.energy} Energy</span>

                  <span>
                    {item.avg.toFixed(1)}/10
                  </span>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(item.avg * 10, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-yellow-50 p-4">
            {strongestEnergy ? (
              <p className="text-sm text-yellow-700">
                Your highest average focus occurs after{" "}
                <strong>{strongestEnergy.energy.toLowerCase()}</strong>{" "}
                energy sessions at{" "}
                <strong>
                  {strongestEnergy.avg.toFixed(1)}/10
                </strong>.
              </p>
            ) : (
              <p className="text-sm text-yellow-700">
                Not enough data to identify an energy-related focus pattern.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}