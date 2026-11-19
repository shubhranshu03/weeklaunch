"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Edition = "day" | "night";

// The <html data-theme> attribute is the source of truth; the root layout sets it early
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const read = (): Edition =>
  document.documentElement.dataset.theme === "night" ? "night" : "day";

// Switches between the day edition (cream paper) and the night edition (dark paper)
export function EditionToggle() {
  const edition = useSyncExternalStore(subscribe, read, () => null);
  const next: Edition = edition === "night" ? "day" : "night";

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("wl-edition", next);
    } catch {
      // Private mode: the choice lasts until the page is closed
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to the ${next} edition`}
      title={`Switch to the ${next} edition`}
      className={`flex h-8 items-center gap-1.5 rounded-sm px-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink hover:bg-paper-dark ${
        edition === null ? "opacity-0" : ""
      }`}
    >
      {edition === "night" ? (
        <Sun className="size-3.5" />
      ) : (
        <Moon className="size-3.5" />
      )}
      <span className="hidden lg:inline">
        {edition === "night" ? "Day edition" : "Night edition"}
      </span>
    </button>
  );
}
