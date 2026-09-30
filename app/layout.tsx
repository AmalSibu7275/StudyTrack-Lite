import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyTrack",
  description: "Track your study habits and improve your productivity.",
};

const appearanceScript = `
(function () {
  try {
    var theme = localStorage.getItem("studytrack-theme");
    var accent = localStorage.getItem("studytrack-accent");
    var compact = localStorage.getItem("studytrack-compact");
    var animations = localStorage.getItem("studytrack-animations");

    var html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "light") {
      html.classList.remove("dark");
    } else if (theme === "system") {
      html.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }

    if (
      accent === "blue" ||
      accent === "green" ||
      accent === "purple" ||
      accent === "orange"
    ) {
      html.setAttribute("data-accent", accent);
    }

    if (compact === "true") {
      html.classList.add("compact-mode");
    }

    if (animations === "false") {
      html.classList.add("no-animations");
    }
  } catch (error) {
    console.error("Failed to restore appearance:", error);
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: appearanceScript,
          }}
        />
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}