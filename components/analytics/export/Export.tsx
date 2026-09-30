"use client";

import {
  Download,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Calendar,
  Mail,
  Share2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useAnalytics, {
  getSessionDate,
  getDuration,
  getProductivity,
} from "../useAnalytics";

export default function Export() {
  const { sessions, loading, error } = useAnalytics();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  /*
   * Filter sessions using the selected date range.
   */
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const sessionDate = getSessionDate(session);

      if (!sessionDate) {
        return false;
      }

      if (appliedStartDate) {
        const start = new Date(`${appliedStartDate}T00:00:00`);

        if (sessionDate < start) {
          return false;
        }
      }

      if (appliedEndDate) {
        const end = new Date(`${appliedEndDate}T23:59:59.999`);

        if (sessionDate > end) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, appliedStartDate, appliedEndDate]);

  /*
   * Export CSV
   */
  function downloadCSV() {
    if (filteredSessions.length === 0) {
      toast.error("No data to export", {
        description: "There are no study sessions in the selected date range.",
      });
      return;
    }

    const headers = [
      "Date",
      "Subject",
      "Task",
      "Duration (minutes)",
      "Session Type",
      "Energy After",
      "Productivity Score",
      "Planned Goal",
      "Goal Completed",
      "Reflection",
    ];

    const rows = filteredSessions.map((session) => {
      const date = getSessionDate(session);

      return [
        date ? date.toLocaleString() : "",
        session.subject ?? "",
        session.taskName ?? "",
        getDuration(session),
        session.sessionType ?? "",
        session.energyAfter ?? "",
        getProductivity(session),
        session.plannedGoal ?? "",
        session.goalCompleted ? "Yes" : "No",
        session.reflection ?? "",
      ];
    });

    const escapeCSV = (value: unknown) => {
      const stringValue = String(value ?? "");

      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `studytrack-sessions-${getFileDate()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("CSV downloaded", {
      description: `${filteredSessions.length} session${
        filteredSessions.length === 1 ? "" : "s"
      } exported successfully.`,
    });
  }

  /*
   * Open browser print dialog.
   * User can choose "Save as PDF".
   */
  function downloadPDF() {
    if (filteredSessions.length === 0) {
      toast.error("No data to export", {
        description: "There are no study sessions in the selected date range.",
      });
      return;
    }

    toast.info("Preparing PDF", {
      description: "Choose 'Save as PDF' in the print window.",
    });

    setTimeout(() => {
      window.print();
    }, 300);
  }

  /*
   * Export every canvas currently rendered on the page.
   *
   * Chart.js renders charts to canvas elements, so this works
   * without requiring another chart-export package.
   */
  function exportCharts() {
    const canvases = Array.from(document.querySelectorAll("canvas"));

    if (canvases.length === 0) {
      toast.error("No charts found", {
        description: "Open the analytics charts before exporting them.",
      });
      return;
    }

    let exported = 0;

    canvases.forEach((canvas, index) => {
      try {
        const dataURL = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `studytrack-chart-${index + 1}-${getFileDate()}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        exported++;
      } catch (error) {
        console.error("Failed to export chart:", error);
      }
    });

    if (exported > 0) {
      toast.success("Charts exported", {
        description: `${exported} chart${
          exported === 1 ? "" : "s"
        } downloaded as PNG.`,
      });
    } else {
      toast.error("Unable to export charts");
    }
  }

  /*
   * Apply date range.
   */
  function applyDateRange() {
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59.999`);

      if (start > end) {
        toast.error("Invalid date range", {
          description: "The start date cannot be after the end date.",
        });
        return;
      }
    }

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);

    const count = sessions.filter((session) => {
      const date = getSessionDate(session);

      if (!date) return false;

      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (date < start) return false;
      }

      if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999`);
        if (date > end) return false;
      }

      return true;
    }).length;

    toast.success("Date range applied", {
      description: `${count} session${
        count === 1 ? "" : "s"
      } match the selected range.`,
    });
  }

  /*
   * Send report through the user's email client.
   */
  function sendEmail() {
    if (filteredSessions.length === 0) {
      toast.error("No data to send", {
        description: "There are no sessions in the selected date range.",
      });
      return;
    }

    const totalMinutes = filteredSessions.reduce(
      (total, session) => total + getDuration(session),
      0
    );

    const averageFocus =
      filteredSessions.length > 0
        ? (
            filteredSessions.reduce(
              (total, session) => total + getProductivity(session),
              0
            ) / filteredSessions.length
          ).toFixed(1)
        : "0.0";

    const subject = "My StudyTrack Analytics Report";

    const body = `
StudyTrack Analytics Report

Sessions: ${filteredSessions.length}
Total Study Time: ${(totalMinutes / 60).toFixed(2)} hours
Average Productivity: ${averageFocus}/10

Date Range:
${appliedStartDate || "All time"} → ${appliedEndDate || "Present"}

Generated by StudyTrack Lite.
`.trim();

    const mailto = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    toast.success("Email draft prepared", {
      description: "Your email application should open with the report.",
    });
  }

  /*
   * Share report.
   */
  async function generateShareLink() {
    const shareText = `
StudyTrack Analytics

Sessions: ${filteredSessions.length}
Total Study Time: ${(
      filteredSessions.reduce(
        (total, session) => total + getDuration(session),
        0
      ) / 60
    ).toFixed(2)} hours

Generated with StudyTrack Lite.
`.trim();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "StudyTrack Analytics",
          text: shareText,
        });

        toast.success("Report shared");
        return;
      }

      await navigator.clipboard.writeText(shareText);

      toast.success("Report copied", {
        description: "The analytics summary was copied to your clipboard.",
      });
    } catch (error) {
      console.error("Share failed:", error);

      toast.error("Unable to share report", {
        description: "Your browser may not support sharing.",
      });
    }
  }

  /*
   * Download everything.
   */
  async function downloadAll() {
    if (filteredSessions.length === 0) {
      toast.error("No data to export", {
        description: "There are no study sessions in the selected range.",
      });
      return;
    }

    downloadCSV();

    setTimeout(() => {
      exportCharts();
    }, 500);

    setTimeout(() => {
      downloadPDF();
    }, 1000);

    toast.success("Export started", {
      description: "Your analytics data and charts are being exported.",
    });
  }

  /*
   * File-safe date for downloads.
   */
  function getFileDate() {
    return new Date().toISOString().split("T")[0];
  }

  const totalMinutes = filteredSessions.reduce(
    (total, session) => total + getDuration(session),
    0
  );

  const averageProductivity =
    filteredSessions.length > 0
      ? (
          filteredSessions.reduce(
            (total, session) => total + getProductivity(session),
            0
          ) / filteredSessions.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white print:bg-none print:text-black print:p-0">
        <h1 className="text-3xl font-bold">Export Analytics</h1>

        <p className="text-blue-100 mt-2 print:text-gray-600">
          Download, share, or save your study analytics.
        </p>
      </div>

      {/* Status */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-700">
          Loading your analytics data...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Sessions</p>
          <p className="text-2xl font-bold mt-1">
            {filteredSessions.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Study Time</p>
          <p className="text-2xl font-bold mt-1">
            {(totalMinutes / 60).toFixed(1)}h
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Average Productivity</p>
          <p className="text-2xl font-bold mt-1">
            {averageProductivity}/10
          </p>
        </div>
      </div>

      {/* Export options */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:hidden">
        {/* PDF */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
            <FileText className="text-red-600" size={28} />
          </div>

          <h2 className="text-xl font-semibold mt-5">
            PDF Report
          </h2>

          <p className="text-gray-500 mt-2">
            Save a printable analytics report as a PDF.
          </p>

          <button
            onClick={downloadPDF}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3 transition"
          >
            Download PDF
          </button>
        </div>

        {/* CSV */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
            <FileSpreadsheet
              className="text-green-600"
              size={28}
            />
          </div>

          <h2 className="text-xl font-semibold mt-5">
            CSV Data
          </h2>

          <p className="text-gray-500 mt-2">
            Export all study sessions as a spreadsheet.
          </p>

          <button
            onClick={downloadCSV}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3 transition"
          >
            Download CSV
          </button>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
            <ImageIcon
              className="text-purple-600"
              size={28}
            />
          </div>

          <h2 className="text-xl font-semibold mt-5">
            Charts
          </h2>

          <p className="text-gray-500 mt-2">
            Export currently rendered analytics charts as PNG.
          </p>

          <button
            onClick={exportCharts}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 transition"
          >
            Export Charts
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 print:hidden">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-blue-600" />

          <div>
            <h2 className="text-xl font-semibold">
              Export Range
            </h2>

            <p className="text-sm text-gray-500">
              Select which sessions should be included.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={applyDateRange}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
        >
          Apply Date Range
        </button>
      </div>

      {/* Share */}
      <div className="grid md:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <Mail className="text-blue-600 mb-4" size={30} />

          <h2 className="text-xl font-semibold">
            Email Report
          </h2>

          <p className="text-gray-500 mt-2">
            Open your email client with an analytics summary.
          </p>

          <button
            onClick={sendEmail}
            className="mt-6 w-full border border-gray-300 rounded-xl py-3 hover:bg-gray-50 transition"
          >
            Send Email
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <Share2
            className="text-blue-600 mb-4"
            size={30}
          />

          <h2 className="text-xl font-semibold">
            Share Report
          </h2>

          <p className="text-gray-500 mt-2">
            Share your analytics summary with supported apps.
          </p>

          <button
            onClick={generateShareLink}
            className="mt-6 w-full border border-gray-300 rounded-xl py-3 hover:bg-gray-50 transition"
          >
            Generate Link
          </button>
        </div>
      </div>

      {/* Download All */}
      <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col lg:flex-row justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold">
            Export Everything
          </h2>

          <p className="text-blue-100 mt-2">
            Download your session data, charts, and PDF report.
          </p>
        </div>

        <button
          onClick={downloadAll}
          disabled={loading}
          className="mt-6 lg:mt-0 bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50 transition"
        >
          <Download size={22} />
          Download All
        </button>
      </div>

      {/* Printable report */}
      <div className="hidden print:block mt-8">
        <h1 className="text-3xl font-bold">
          StudyTrack Analytics Report
        </h1>

        <p className="text-gray-600 mt-2">
          Generated on {new Date().toLocaleString()}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="border rounded-xl p-4">
            <p className="text-sm text-gray-500">Sessions</p>
            <p className="text-2xl font-bold">
              {filteredSessions.length}
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Total Study Time
            </p>
            <p className="text-2xl font-bold">
              {(totalMinutes / 60).toFixed(2)} hours
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Average Productivity
            </p>
            <p className="text-2xl font-bold">
              {averageProductivity}/10
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Study Sessions
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Subject</th>
                <th className="border p-2 text-left">Task</th>
                <th className="border p-2 text-left">
                  Duration
                </th>
                <th className="border p-2 text-left">
                  Productivity
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSessions.map((session) => {
                const date = getSessionDate(session);

                return (
                  <tr key={session.id}>
                    <td className="border p-2">
                      {date ? date.toLocaleDateString() : "-"}
                    </td>

                    <td className="border p-2">
                      {session.subject || "-"}
                    </td>

                    <td className="border p-2">
                      {session.taskName || "-"}
                    </td>

                    <td className="border p-2">
                      {getDuration(session)} min
                    </td>

                    <td className="border p-2">
                      {getProductivity(session)}/10
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}