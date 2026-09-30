"use client";

import useAnalytics, {
  getDuration,
  getProductivity,
} from "./useAnalytics";

export default function AISummary() {
  const { sessions, loading } =
    useAnalytics();

  const report: string[] = [];

  if (sessions.length > 0) {
    const totalMinutes =
      sessions.reduce(
        (sum, session) =>
          sum + getDuration(session),
        0
      );

    const totalHours =
      (totalMinutes / 60).toFixed(1);

    const averageProductivity =
      sessions.reduce(
        (sum, session) =>
          sum +
          getProductivity(session),
        0
      ) / sessions.length;

    report.push(
      `You completed ${sessions.length} study sessions totaling ${totalHours} hours.`
    );

    report.push(
      `Your average productivity score is ${averageProductivity.toFixed(
        1
      )}/10.`
    );

    /*
     * Best session type
     */
    const typeMap: Record<
      string,
      number[]
    > = {};

    sessions.forEach((session) => {
      const type =
        session.sessionType ||
        "Other";

      if (!typeMap[type]) {
        typeMap[type] = [];
      }

      typeMap[type].push(
        getProductivity(session)
      );
    });

    let bestType = "";
    let bestAverage = -1;

    Object.entries(typeMap).forEach(
      ([type, scores]) => {
        const average =
          scores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) / scores.length;

        if (average > bestAverage) {
          bestAverage = average;
          bestType = type;
        }
      }
    );

    if (bestType) {
      report.push(
        `${bestType} is currently your highest-performing study method with an average score of ${bestAverage.toFixed(
          1
        )}/10.`
      );
    }

    /*
     * Average duration
     */
    const averageDuration =
      totalMinutes /
      sessions.length;

    if (averageDuration > 120) {
      report.push(
        "Your sessions are quite long. Consider splitting longer study blocks to maintain focus."
      );
    } else if (
      averageDuration >= 60
    ) {
      report.push(
        "Your average study session is in a balanced range."
      );
    } else {
      report.push(
        "Your sessions are relatively short. Longer focused blocks may help when appropriate."
      );
    }

    /*
     * Energy
     */
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
      report.push(
        "Most of your sessions end with high energy, which suggests your current workload is relatively sustainable."
      );
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <h2 className="text-xl font-semibold">
        AI Study Summary
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Personalized insights generated from your study history
      </p>

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">
            Analyzing your study data...
          </p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500">
            Add study sessions to generate personalized insights.
          </p>
        ) : (
          report.map(
            (line, index) => (
              <div
                key={index}
                className="bg-indigo-50 border border-indigo-100 rounded-xl p-4"
              >
                <p className="text-gray-700 text-sm">
                  {line}
                </p>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}