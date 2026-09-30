"use client";

import useInsights from "./useInsights";

export default function StudyBehaviour() {
  const { sessions } = useInsights();

  const total =
    sessions.reduce(
      (sum, s) => sum + s.duration,
      0
    ) / 60;

  const avg =
    sessions.length > 0
      ? total / sessions.length
      : 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <h2 className="text-xl font-bold mb-6">
        Study Behaviour
      </h2>

      <div className="space-y-5">

        <div>
          <p className="text-gray-500">
            Total Hours
          </p>

          <h3 className="text-3xl font-bold">
            {total.toFixed(1)}
          </h3>
        </div>

        <div>
          <p className="text-gray-500">
            Avg Session
          </p>

          <h3 className="text-3xl font-bold">
            {avg.toFixed(1)} hrs
          </h3>
        </div>

        <div>
          <p className="text-gray-500">
            Sessions
          </p>

          <h3 className="text-3xl font-bold">
            {sessions.length}
          </h3>
        </div>

      </div>

    </div>
  );
}