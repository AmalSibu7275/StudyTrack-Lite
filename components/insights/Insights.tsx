"use client";

import { useMemo, useState } from "react";

import {
  CalendarDays,
  Download,
  FileText,
  ChevronDown,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import AISummaryRow from "./AISummaryRow";
import TopStrengths from "./TopStrengths";
import ProductivityByTime from "./ProductivityByTime";
import DurationVsFocus from "./DurationVsFocus";
import SessionTypeScores from "./SessionTypeScores";
import WeeklyConsistency from "./WeeklyConsistency";
import FocusFactors from "./FocusFactors";
import KeyTakeaway from "./KeyTakeaways";

import useInsights, {
  type Session,
} from "./useInsights";

export type InsightRange =
  | "7d"
  | "30d"
  | "3m"
  | "6m"
  | "year"
  | "all"
  | "custom";

/* =========================================================
   DATE HELPERS
========================================================= */

function getDate(createdAt: any): Date | null {
  if (!createdAt) {
    return null;
  }

  try {
    if (typeof createdAt.toDate === "function") {
      const date = createdAt.toDate();

      return isNaN(date.getTime())
        ? null
        : date;
    }

    const date =
      createdAt instanceof Date
        ? createdAt
        : new Date(createdAt);

    return isNaN(date.getTime())
      ? null
      : date;
  } catch {
    return null;
  }
}

function startOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(23, 59, 59, 999);

  return result;
}

function addDays(
  date: Date,
  amount: number
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
}

function addMonths(
  date: Date,
  amount: number
): Date {
  const result = new Date(date);

  result.setMonth(
    result.getMonth() + amount
  );

  return result;
}

/* =========================================================
   CSV EXPORT
========================================================= */

function exportInsightsCSV(
  sessions: Session[],
  rangeLabel: string
) {
  const headers = [
    "Date",
    "Subject",
    "Task",
    "Session Type",
    "Duration (min)",
    "Focus Score",
    "Energy After",
    "Planned Goal",
  ];

  const rows = sessions.map((session) => {
    const date = getDate(
      session.createdAt
    );

    return [
      date
        ? date.toLocaleString()
        : "",
      session.subject ?? "",
      session.taskName ?? "",
      session.sessionType ?? "",
      session.duration ?? "",
      session.productivityScore ?? "",
      session.energyAfter ?? "",
      session.plannedGoal ?? "",
    ];
  });

  const csv = [
    [
      "StudyTrack Lite - Insights Export",
    ],
    [
      `Range: ${rangeLabel}`,
    ],
    [
      `Sessions: ${sessions.length}`,
    ],
    [],
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) => {
          const text = String(
            value ?? ""
          );

          return `"${text.replace(
            /"/g,
            '""'
          )}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `studytrack-insights-${rangeLabel
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .toLowerCase()}.csv`;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(url);
}

/* =========================================================
   PDF EXPORT
========================================================= */

function exportInsightsPDF(
  sessions: Session[],
  rangeLabel: string,
  averageFocus: string,
  averageDuration: number
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  /* -------------------------------------------------------
     HEADER
  ------------------------------------------------------- */

  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "StudyTrack Lite",
    20,
    22
  );

  pdf.setFontSize(16);
  pdf.text(
    "Insights Report",
    20,
    31
  );

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    `Date Range: ${rangeLabel}`,
    20,
    40
  );

  pdf.text(
    `Generated: ${new Date().toLocaleString()}`,
    20,
    46
  );

  /* -------------------------------------------------------
     SUMMARY
  ------------------------------------------------------- */

  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");

  pdf.text(
    "Study Summary",
    20,
    60
  );

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(
    `Sessions: ${sessions.length}`,
    20,
    68
  );

  pdf.text(
    `Average Focus: ${averageFocus}/10`,
    20,
    75
  );

  pdf.text(
    `Average Duration: ${averageDuration} min`,
    20,
    82
  );

  /* -------------------------------------------------------
     SESSION TABLE
  ------------------------------------------------------- */

  const tableData = sessions.map(
    (session) => {
      const date = getDate(
        session.createdAt
      );

      return [
        date
          ? date.toLocaleDateString()
          : "-",

        session.subject || "-",

        session.taskName || "-",

        session.sessionType || "-",

        `${session.duration ?? 0}`,

        `${session.productivityScore ?? 0}/10`,

        session.energyAfter || "-",
      ];
    }
  );

  autoTable(pdf, {
    startY: 94,

    head: [
      [
        "Date",
        "Subject",
        "Task",
        "Type",
        "Min",
        "Focus",
        "Energy",
      ],
    ],

    body: tableData,

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 3,
    },

    headStyles: {
      fontStyle: "bold",
    },

    margin: {
      left: 20,
      right: 20,
    },
  });

  /* -------------------------------------------------------
     INSIGHT SUMMARY
  ------------------------------------------------------- */

  const finalY =
    (pdf as any).lastAutoTable?.finalY ??
    100;

  let y = finalY + 15;

  if (y > 260) {
    pdf.addPage();
    y = 20;
  }

  pdf.setFontSize(13);
  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.text(
    "Key Insights",
    20,
    y
  );

  y += 9;

  pdf.setFontSize(10);
  pdf.setFont(
    "helvetica",
    "normal"
  );

  const strongestType =
    getStrongestSessionType(
      sessions
    );

  const strongestTime =
    getStrongestTimePeriod(
      sessions
    );

  const insights = [
    `Strongest session type: ${strongestType}`,
    `Most productive study period: ${strongestTime}`,
    `Average focus score: ${averageFocus}/10`,
    `Average session duration: ${averageDuration} minutes`,
  ];

  insights.forEach(
    (insight) => {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(
        `• ${insight}`,
        20,
        y
      );

      y += 7;
    }
  );

  /* -------------------------------------------------------
     FOOTER
  ------------------------------------------------------- */

  const pageCount =
    pdf.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    pdf.setPage(page);

    pdf.setFontSize(8);
    pdf.setTextColor(
      120,
      120,
      120
    );

    pdf.text(
      `StudyTrack Lite • Insights Report • Page ${page} of ${pageCount}`,
      20,
      290
    );
  }

  pdf.save(
    `studytrack-insights-${rangeLabel
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .toLowerCase()}.pdf`
  );
}

/* =========================================================
   PDF HELPERS
========================================================= */

function getStrongestSessionType(
  sessions: Session[]
): string {
  const totals: Record<
    string,
    {
      total: number;
      count: number;
    }
  > = {};

  sessions.forEach(
    (session) => {
      const type =
        session.sessionType ||
        "Unknown";

      if (!totals[type]) {
        totals[type] = {
          total: 0,
          count: 0,
        };
      }

      totals[type].total +=
        Number(
          session.productivityScore
        ) || 0;

      totals[type].count++;
    }
  );

  let best =
    "Not enough data";

  let bestScore = 0;

  Object.entries(
    totals
  ).forEach(
    ([type, data]) => {
      const average =
        data.count > 0
          ? data.total /
            data.count
          : 0;

      if (
        average >
        bestScore
      ) {
        bestScore =
          average;

        best = type;
      }
    }
  );

  return best;
}

function getStrongestTimePeriod(
  sessions: Session[]
): string {
  const periods = [
    {
      label: "Morning",
      start: 5,
      end: 11,
    },
    {
      label: "Afternoon",
      start: 12,
      end: 16,
    },
    {
      label: "Evening",
      start: 17,
      end: 21,
    },
    {
      label: "Night",
      start: 22,
      end: 4,
    },
  ];

  let best =
    "Not enough data";

  let bestScore = 0;

  periods.forEach(
    (period) => {
      const filtered =
        sessions.filter(
          (session) => {
            const date =
              getDate(
                session.createdAt
              );

            if (!date) {
              return false;
            }

            const hour =
              date.getHours();

            if (
              period.label ===
              "Night"
            ) {
              return (
                hour >= 22 ||
                hour <= 4
              );
            }

            return (
              hour >=
                period.start &&
              hour <=
                period.end
            );
          }
        );

      if (
        filtered.length ===
        0
      ) {
        return;
      }

      const average =
        filtered.reduce(
          (sum, session) =>
            sum +
            (Number(
              session.productivityScore
            ) || 0),
          0
        ) /
        filtered.length;

      if (
        average >
        bestScore
      ) {
        bestScore =
          average;

        best =
          `${period.label} (${average.toFixed(
            1
          )}/10)`;
      }
    }
  );

  return best;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Insights() {
  const {
    sessions,
    loading,
  } = useInsights();

  const [range, setRange] =
    useState<InsightRange>("7d");

  const [customStart, setCustomStart] =
    useState("");

  const [customEnd, setCustomEnd] =
    useState("");

  const [appliedStart, setAppliedStart] =
    useState("");

  const [appliedEnd, setAppliedEnd] =
    useState("");

  const [
    exportOpen,
    setExportOpen,
  ] = useState(false);

  /* =======================================================
     DATE RANGE
  ======================================================= */

  const {
    filteredSessions,
    rangeLabel,
    activeStart,
    activeEnd,
  } = useMemo(() => {
    const now = new Date();

    let start: Date;
    let end = endOfDay(now);

    let label =
      "Last 7 Days";

    switch (range) {
      case "7d":
        start = startOfDay(
          addDays(now, -6)
        );
        label =
          "Last 7 Days";
        break;

      case "30d":
        start = startOfDay(
          addDays(now, -29)
        );
        label =
          "Last 30 Days";
        break;

      case "3m":
        start = startOfDay(
          addMonths(now, -3)
        );
        label =
          "Last 3 Months";
        break;

      case "6m":
        start = startOfDay(
          addMonths(now, -6)
        );
        label =
          "Last 6 Months";
        break;

      case "year":
        start = startOfDay(
          new Date(
            now.getFullYear(),
            0,
            1
          )
        );
        label =
          "This Year";
        break;

      case "all": {
        const dates = sessions
          .map((session) =>
            getDate(
              session.createdAt
            )
          )
          .filter(
            (
              date
            ): date is Date =>
              date !== null
          );

        if (dates.length > 0) {
          const earliest =
            Math.min(
              ...dates.map(
                (date) =>
                  date.getTime()
              )
            );

          start = startOfDay(
            new Date(
              earliest
            )
          );
        } else {
          start = startOfDay(
            addDays(now, -6)
          );
        }

        label =
          "All Time";

        break;
      }

      case "custom":
        if (
          appliedStart &&
          appliedEnd
        ) {
          start = startOfDay(
            new Date(
              `${appliedStart}T00:00:00`
            )
          );

          end = endOfDay(
            new Date(
              `${appliedEnd}T23:59:59`
            )
          );

          label =
            `${appliedStart} → ${appliedEnd}`;
        } else {
          start = startOfDay(
            addDays(now, -6)
          );

          label =
            "Custom Range";
        }

        break;

      default:
        start = startOfDay(
          addDays(now, -6)
        );
    }

    const filtered =
      sessions.filter(
        (session) => {
          const date =
            getDate(
              session.createdAt
            );

          if (!date) {
            return false;
          }

          return (
            date >= start &&
            date <= end
          );
        }
      );

    return {
      filteredSessions:
        filtered,
      rangeLabel: label,
      activeStart: start,
      activeEnd: end,
    };
  }, [
    sessions,
    range,
    appliedStart,
    appliedEnd,
  ]);

  /* =======================================================
     SUMMARY VALUES
  ======================================================= */

  const averageFocus =
    filteredSessions.length > 0
      ? (
          filteredSessions.reduce(
            (sum, session) =>
              sum +
              (Number(
                session.productivityScore
              ) || 0),
            0
          ) /
          filteredSessions.length
        ).toFixed(1)
      : "0.0";

  const averageDuration =
    filteredSessions.length > 0
      ? Math.round(
          filteredSessions.reduce(
            (sum, session) =>
              sum +
              (Number(
                session.duration
              ) || 0),
            0
          ) /
          filteredSessions.length
        )
      : 0;

  /* =======================================================
     CUSTOM RANGE
  ======================================================= */

  function applyCustomRange() {
    if (
      !customStart ||
      !customEnd
    ) {
      return;
    }

    const start = new Date(
      `${customStart}T00:00:00`
    );

    const end = new Date(
      `${customEnd}T23:59:59`
    );

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return;
    }

    if (
      start.getTime() >
      end.getTime()
    ) {
      return;
    }

    setAppliedStart(
      customStart
    );

    setAppliedEnd(
      customEnd
    );
  }

  /* =======================================================
     EXPORT HANDLERS
  ======================================================= */

  function handleCSVExport() {
    if (
      loading ||
      filteredSessions.length === 0
    ) {
      return;
    }

    exportInsightsCSV(
      filteredSessions,
      rangeLabel
    );

    setExportOpen(false);
  }

  function handlePDFExport() {
    if (
      loading ||
      filteredSessions.length === 0
    ) {
      return;
    }

    exportInsightsPDF(
      filteredSessions,
      rangeLabel,
      averageFocus,
      averageDuration
    );

    setExportOpen(false);
  }

  /* =======================================================
     DISPLAY DATES
  ======================================================= */

  const formattedStart =
    activeStart.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  const formattedEnd =
    activeEnd.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Insights
          </h1>

          <p className="mt-2 text-lg text-gray-500">
            AI-powered insights to help you
            understand your study habits and
            improve productivity.
          </p>
        </div>

        {/* TOP CONTROLS */}

        <div className="flex flex-wrap items-center gap-3">

          {/* DATE */}

          <div className="relative">

            <CalendarDays
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none"
            />

            <select
              value={range}
              onChange={(e) =>
                setRange(
                  e.target.value as InsightRange
                )
              }
              className="h-14 min-w-[190px] appearance-none rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-medium text-gray-800 shadow-sm outline-none transition hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="7d">
                Last 7 Days
              </option>

              <option value="30d">
                Last 30 Days
              </option>

              <option value="3m">
                Last 3 Months
              </option>

              <option value="6m">
                Last 6 Months
              </option>

              <option value="year">
                This Year
              </option>

              <option value="all">
                All Time
              </option>

              <option value="custom">
                Custom Range
              </option>
            </select>

          </div>

          {/* EXPORT */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setExportOpen(
                  (value) =>
                    !value
                )
              }
              disabled={loading}
              className="inline-flex h-14 items-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download
                size={19}
              />

              Export Insights

              <ChevronDown
                size={17}
                className={`transition-transform ${
                  exportOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">

                <button
                  type="button"
                  onClick={
                    handlePDFExport
                  }
                  disabled={
                    filteredSessions.length ===
                    0
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                    <FileText
                      size={18}
                      className="text-red-600"
                    />
                  </div>

                  <div>
                    <p className="font-semibold">
                      Export as PDF
                    </p>

                    <p className="text-xs text-gray-400">
                      Full insights report
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={
                    handleCSVExport
                  }
                  disabled={
                    filteredSessions.length ===
                    0
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                    <Download
                      size={18}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <p className="font-semibold">
                      Export as CSV
                    </p>

                    <p className="text-xs text-gray-400">
                      Session data
                    </p>
                  </div>
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ===================================================
          CUSTOM RANGE
      =================================================== */}

      {range === "custom" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Start Date
              </label>

              <input
                type="date"
                value={customStart}
                onChange={(e) =>
                  setCustomStart(
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                End Date
              </label>

              <input
                type="date"
                value={customEnd}
                min={
                  customStart ||
                  undefined
                }
                onChange={(e) =>
                  setCustomEnd(
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={
                applyCustomRange
              }
              disabled={
                !customStart ||
                !customEnd
              }
              className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply Range
            </button>

          </div>

        </div>
      )}

      {/* ===================================================
          RANGE STATUS
      =================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div className="text-sm text-gray-500">
          {loading
            ? "Loading your insights..."
            : (
              <>
                <span className="font-medium text-gray-700">
                  {rangeLabel}
                </span>

                {" • "}

                {filteredSessions.length}{" "}
                session
                {filteredSessions.length ===
                1
                  ? ""
                  : "s"}
              </>
            )}
        </div>

        {!loading && (
          <div className="text-sm text-gray-400">
            {formattedStart}{" "}
            –{" "}
            {formattedEnd}
          </div>
        )}

      </div>

      {/* ===================================================
          AI SUMMARY
      =================================================== */}

      <AISummaryRow />

      {/* ===================================================
          INSIGHTS ROW 1
      =================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

        <div className="xl:col-span-3">
          <TopStrengths
            sessions={
              filteredSessions
            }
            loading={
              loading
            }
          />
        </div>

        <div className="xl:col-span-4">
          <ProductivityByTime
            sessions={
              filteredSessions
            }
            loading={
              loading
            }
          />
        </div>

        <div className="xl:col-span-5">
          <DurationVsFocus
            sessions={
              filteredSessions
            }
            loading={
              loading
            }
          />
        </div>

      </div>

      {/* ===================================================
          INSIGHTS ROW 2
      =================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

        <div className="xl:col-span-3">
          <SessionTypeScores
            sessions={
              filteredSessions
            }
            loading={
              loading
            }
          />
        </div>

        <div className="xl:col-span-4">
          <WeeklyConsistency
            sessions={
              filteredSessions
            }
            loading={
              loading
            }
            startDate={
              activeStart
            }
            endDate={
              activeEnd
            }
          />
        </div>

        <div className="xl:col-span-5">
          <FocusFactors
            sessions={
              filteredSessions
            }
            loading={
              loading
            }
          />
        </div>

      </div>

      {/* ===================================================
          KEY TAKEAWAY
      =================================================== */}

      <KeyTakeaway
        sessions={
          filteredSessions
        }
        loading={
          loading
        }
      />

    </div>
  );
}