"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself, where
 * app/error.tsx cannot render because the layout it lives inside is the
 * thing that failed. It must ship its own <html>/<body>, and cannot rely on
 * app CSS variables or components loading, so the styling here is inline
 * and self-contained on purpose.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#0b0d14",
          color: "#eceef5",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center"
        }}
      >
        <div style={{ maxWidth: "30rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 600, margin: "0 0 12px" }}>
            United Exams didn&apos;t load.
          </h1>
          <p style={{ margin: "0 0 24px", lineHeight: 1.6, color: "#a7adc0" }}>
            Something failed before the page could start. Nothing you had saved
            is affected.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: "pointer",
              border: "1px solid #f5a623",
              background: "#f5a623",
              color: "#1a1205",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: "0.95rem",
              fontWeight: 600
            }}
          >
            Reload the page
          </button>
          {error.digest ? (
            <p style={{ marginTop: "20px", fontSize: "0.75rem", color: "#6f7690" }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
