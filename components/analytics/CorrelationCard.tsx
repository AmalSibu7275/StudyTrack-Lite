"use client";

import useAnalytics, {
  getDuration,
  getProductivity,
} from "./useAnalytics";

export default function CorrelationCard() {
  const { sessions, loading } =
    useAnalytics();

  const insights: string[] = [];

  if (sessions.length > 0) {
    const average =
      sessions.reduce(
        (sum, session) =>
          sum +
          getProductivity(session),
        0
      ) / sessions.length;

    const longSessions =
      sessions.filter(
        (session) =>
          getDuration(session) >= 90
      );

    if (longSessions.length > 0) {
      const longAverage =
        longSessions.reduce(
          (sum, session) =>
            sum +
            getProductivity(session),
          0
        ) /
        longSessions.length;

      if (longAverage < average) {
        insights.push(
          `Your sessions of 90+ minutes average ${longAverage.toFixed(
            1
          )}/10 compared with ${average.toFixed(
            1
          )}/10 overall, suggesting longer blocks may reduce focus.`
        );
      } else {
        insights.push(
          "You maintain strong productivity even during longer study sessions."
        );
      }
    }

    const byType: Record<
      string,
      number[]
    > = {};

    sessions.forEach((session) => {
      const type =
        session.sessionType ||
        "Other";

      if (!byType[type]) {
        byType[type] = [];
      }

      byType[type].push(
        getProductivity(session)
      );
    });

    let bestType = "";
    let bestScore = -1;

    Object.entries(byType).forEach(
      ([type, values]) => {
        const average =
          values.reduce(
            (a, b) => a + b,
            0
          ) / values.length;

        if (average > bestScore) {
          bestScore = average;
          bestType = type;
        }
      }
    );

    if (bestType) {
      insights.push(
        `${bestType} is currently your strongest session type at ${bestScore.toFixed(
          1
        )}/10 on average.`
      );
    }

    const highEnergy =
      sessions.filter(
        (session) =>
          session.energyAfter ===
          "High"
      ).length;

    if (
      highEnergy >
      sessions.length / 2
    ) {
      insights.push(
        "More than half of your sessions end with high energy, suggesting your current workload is relatively sustainable."
      );
    }

    if (average < 6) {
      insights.push(
        "Your overall focus score is below 6/10. Reducing distractions and reviewing your study environment may help."
      );
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <h2 className="text-xl font-semibold">
        Performance Correlations
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Relationships discovered from your study data
      </p>

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">
            Analyzing relationships...
          </p>
        ) : insights.length === 0 ? (
          <p className="text-gray-500">
            Not enough data yet.
          </p>
        ) : (
          insights.map(
            (item, index) => (
              <div
                key={index}
                className="bg-blue-50 border border-blue-100 rounded-xl p-4"
              >
                <p className="text-sm text-gray-700">
                  {item}
                </p>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}