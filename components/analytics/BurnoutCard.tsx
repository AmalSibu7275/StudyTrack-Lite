"use client";

import useAnalytics, {
  getDuration,
  getProductivity,
} from "./useAnalytics";

export default function BurnoutCard() {
  const { sessions, loading } =
    useAnalytics();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
        <h2 className="text-xl font-semibold">
          Burnout Risk
        </h2>

        <p className="text-gray-500 text-sm mb-8">
          Analyzing recent study behaviour...
        </p>
      </div>
    );
  }

  let risk = 0;

  if (sessions.length > 0) {
    const longSessions =
      sessions.filter(
        (session) =>
          getDuration(session) >= 120
      );

    risk +=
      (longSessions.length /
        sessions.length) *
      40;

    const averageProductivity =
      sessions.reduce(
        (sum, session) =>
          sum +
          getProductivity(session),
        0
      ) / sessions.length;

    if (averageProductivity < 6) {
      risk += 35;
    }

    const lowEnergy =
      sessions.filter(
        (session) =>
          session.energyAfter ===
          "Low"
      );

    risk +=
      (lowEnergy.length /
        sessions.length) *
      25;
  }

  risk = Math.min(
    100,
    Math.round(risk)
  );

  let label = "Low";
  let message =
    "You're maintaining a healthy study routine.";

  if (risk >= 35 && risk < 70) {
    label = "Moderate";
    message =
      "Take regular breaks and monitor your study intensity.";
  }

  if (risk >= 70) {
    label = "High";
    message =
      "Your recent study pattern shows several fatigue indicators. Consider reducing session length and prioritizing recovery.";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <h2 className="text-xl font-semibold">
        Burnout Risk
      </h2>

      <p className="text-gray-500 text-sm mb-8">
        Based on your study behaviour
      </p>

      {sessions.length === 0 ? (
        <p className="text-gray-500">
          Add more study sessions to estimate burnout risk.
        </p>
      ) : (
        <>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                risk < 35
                  ? "bg-green-500"
                  : risk < 70
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{
                width: `${risk}%`,
              }}
            />
          </div>

          <div className="flex justify-between mt-3">
            <span className="text-gray-500">
              Risk Score
            </span>

            <span className="font-bold">
              {risk}%
            </span>
          </div>

          <div className="mt-8">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                risk < 35
                  ? "bg-green-100 text-green-700"
                  : risk < 70
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {label} Risk
            </span>

            <p className="text-gray-600 mt-4">
              {message}
            </p>
          </div>
        </>
      )}
    </div>
  );
}