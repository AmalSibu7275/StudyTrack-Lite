"use client";

import SessionTypePerformance from "../SessionTypePerformance";
import FocusDistribution from "../FocusDistribution";
import BurnoutCard from "../BurnoutCard";
import CorrelationCard from "../CorrelationCard";

import useAnalytics, {
  getProductivity,
} from "../useAnalytics";

export default function Performance() {
  const { sessions } =
    useAnalytics();

  const overallScore =
    sessions.length > 0
      ? sessions.reduce(
          (sum, session) =>
            sum +
            getProductivity(session),
          0
        ) / sessions.length
      : 0;

  const subjectScores: Record<
    string,
    number[]
  > = {};

  sessions.forEach((session) => {
    const subject =
      session.subject ||
      "Other";

    if (!subjectScores[subject]) {
      subjectScores[subject] = [];
    }

    subjectScores[subject].push(
      getProductivity(session)
    );
  });

  const subjects = Object.entries(
    subjectScores
  )
    .map(
      ([subject, scores]) => ({
        subject,
        score:
          scores.reduce(
            (a, b) => a + b,
            0
          ) / scores.length,
      })
    )
    .sort(
      (a, b) =>
        b.score - a.score
    );

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white p-8">

        <p className="text-blue-100">
          Overall Performance Score
        </p>

        <h1 className="text-6xl font-bold mt-3">
          {overallScore.toFixed(1)}
        </h1>

        <p className="mt-3 text-blue-100">
          {sessions.length === 0
            ? "Add study sessions to calculate your performance."
            : overallScore >= 8
            ? "Excellent overall performance based on your recorded sessions."
            : overallScore >= 6
            ? "You're building a solid study routine."
            : "Your current data suggests there is room to improve your focus."}
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-4">
          <SessionTypePerformance />
        </div>

        <div className="lg:col-span-4">
          <FocusDistribution />
        </div>

        <div className="lg:col-span-4">
          <BurnoutCard />
        </div>

      </div>

      <CorrelationCard />

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

        <h2 className="text-xl font-semibold mb-6">
          Subject Performance
        </h2>

        {subjects.length === 0 ? (
          <p className="text-gray-500">
            No subject data yet.
          </p>
        ) : (
          <div className="space-y-6">

            {subjects.map(
              (item) => (
                <div
                  key={item.subject}
                >

                  <div className="flex justify-between mb-2">

                    <span className="font-medium">
                      {item.subject}
                    </span>

                    <span className="font-semibold">
                      {item.score.toFixed(
                        1
                      )}
                      /10
                    </span>

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">

                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${item.score * 10}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}