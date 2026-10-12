"use client";

import { useState } from "react";

export default function NotSupported() {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-left">
      <div className="panel p-6 sm:p-8 bg-white border border-[#E3E0D8]">
        <span className="text-[11px] font-mono-code uppercase tracking-wider text-[#FF4B35] font-semibold block mb-2">
          Desktop Required
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#191919] tracking-tight mb-3">
          Physical keyboard calibrated
        </h1>
        <p className="text-sm text-[#77756F] leading-relaxed mb-6 font-normal">
          Typing Race is designed for mechanical and physical desktop keyboards to measure accurate, millisecond keystroke telemetry.
        </p>

        <button
          onClick={copyUrl}
          className="btn-primary w-full py-2.5 text-xs font-mono-code"
        >
          {copied ? "Link Copied to Clipboard" : "Copy URL to Open on Desktop"}
        </button>
      </div>
    </div>
  );
}
