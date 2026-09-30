"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-gray-200 shadow-xl bg-white",
          title:
            "font-semibold text-gray-900",
          description:
            "text-sm text-gray-500",
        },
      }}
    />
  );
}