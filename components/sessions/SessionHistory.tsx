"use client";

import { Session } from "./Sessions";
import SessionRow from "./SessionRow";

type Props = {
  sessions: Session[];
  loading: boolean;
  selectedSession: Session | null;
  onSelect: (session: Session) => void;
};

export default function SessionHistory({
  sessions,
  loading,
  selectedSession,
  onSelect,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">

      <h2 className="text-sm font-semibold text-gray-900 mb-3 px-1">
        Session History
      </h2>

      {loading ? (
        <div className="py-16 text-center text-gray-500">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No sessions found.
        </div>
      ) : (
        <div className="space-y-2">

          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              selected={
                selectedSession?.id ===
                session.id
              }
              onClick={() =>
                onSelect(session)
              }
            />
          ))}

        </div>
      )}

      {sessions.length > 0 && (
        <button className="w-full mt-3 py-2.5 border border-gray-200 rounded-xl text-sm text-blue-600 font-medium hover:bg-blue-50">
          ↓ Load more
        </button>
      )}

    </div>
  );
}