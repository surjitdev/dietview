import React, { useEffect, useRef } from "react";

export default function AdSenseUnit() {
  const initialized = useRef(false);

  useEffect(() => {
    // Only push once per component lifecycle to prevent duplicate push errors
    if (initialized.current) return;
    initialized.current = true;

    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (err) {
      console.warn("AdSense push warning (expected in sandboxed preview):", err);
    }
  }, []);

  return (
    <div 
      className="flex flex-col items-center justify-center my-6 mx-auto p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl w-full max-w-sm text-center shadow-xs" 
      id="adsense-interactive-unit-container"
    >
      <span className="text-[9px] text-zinc-400 dark:text-zinc-650 font-bold uppercase tracking-widest mb-1.5 block">
        Advertisement
      </span>

      <div className="flex justify-center items-center overflow-hidden w-[150px] h-[90px] mx-auto bg-zinc-100/50 dark:bg-zinc-950/20 rounded-lg">
        <ins
          className="adsbygoogle"
          style={{ display: "inline-block", width: "150px", height: "90px" }}
          data-ad-client="ca-pub-7457127056634346"
          data-ad-slot="9582410347"
        />
      </div>
    </div>
  );
}
