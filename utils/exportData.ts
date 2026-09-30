import jsPDF from "jspdf";
import { toast } from "sonner";

export function exportCSV(data: any[]) {

  if (!data || data.length === 0) {
    toast.success("No study sessions found to export.", {
  description: "",
});
    return;
  }


  const headers = Object.keys(data[0]);


  const csv = [
    headers.join(","),

    ...data.map((row) =>
      headers
        .map((field) => `"${row[field] ?? ""}"`)
        .join(",")
    ),

  ].join("\n");



  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );


  const url = URL.createObjectURL(blob);


  const link = document.createElement("a");

  link.href = url;

  link.download = "studytrack_sessions.csv";


  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);


  URL.revokeObjectURL(url);

}





export function exportJSON(data: any[]) {

  const blob = new Blob(
    [
      JSON.stringify(data, null, 2)
    ],
    {
      type: "application/json",
    }
  );


  const url = URL.createObjectURL(blob);


  const link = document.createElement("a");


  link.href = url;

  link.download = "studytrack_sessions.json";


  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);


  URL.revokeObjectURL(url);

}





export function exportPDF(data: any[]) {

  const pdf = new jsPDF();


  pdf.text(
    "StudyTrack Lite Analytics Report",
    20,
    20
  );


  let y = 40;


  data.slice(0, 10).forEach((session, index) => {

    pdf.text(
      `${index + 1}. ${session.taskName ?? "Session"} - ${session.duration ?? 0} mins`,
      20,
      y
    );


    y += 10;

  });


  pdf.save(
    "studytrack_report.pdf"
  );

}