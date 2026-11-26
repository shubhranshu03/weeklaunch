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

// Switches between light and dark mode (saved as the "day" / "night" edition)
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
      aria-label={
        next === "night" ? "Switch to dark mode" : "Switch to light mode"
      }
      title={next === "night" ? "Dark mode" : "Light mode"}
      className={`flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${
        edition === null ? "opacity-0" : ""
      }`}
    >
      {edition === "night" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
