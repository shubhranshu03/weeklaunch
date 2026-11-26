"use client";

import { Laptop } from "lucide-react";
import {
  getFromOptions,
  platforms,
  priceModels,
  type PlatformInfo,
} from "@/lib/platforms";

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        on
          ? "badge-pop bg-brand-500 text-white"
          : "border border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

// Platform picker, plus price, where to get it and Apple Silicon for Mac apps.
// Used when submitting and when editing a launch.
export function PlatformFields({
  value,
  onChange,
  showErrors,
}: {
  value: PlatformInfo;
  onChange: (v: PlatformInfo) => void;
  showErrors?: boolean;
}) {
  const set = (patch: Partial<PlatformInfo>) => onChange({ ...value, ...patch });
  const mac = value.platform === "mac";

  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm font-semibold text-slate-900">
          What is it?
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {platforms.map((p) => (
            <Chip
              key={p.id}
              on={value.platform === p.id}
              onClick={() => set({ platform: p.id })}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      {mac && (
        <fieldset className="space-y-4 rounded-2xl bg-slate-50 p-4">
          <legend className="sr-only">Mac app details</legend>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Laptop className="size-4 text-brand-600" />
            Mac app details
          </p>
          <div>
            <span className="text-sm font-medium text-slate-700">Price</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {priceModels.map((p) => (
                <Chip
                  key={p.id}
                  on={value.priceModel === p.id}
                  onClick={() => set({ priceModel: p.id })}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
            {showErrors && !value.priceModel && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                Pick a price.
              </p>
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700">
              Where to get it{" "}
              <span className="font-normal text-slate-400">
                (pick all that apply)
              </span>
            </span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {getFromOptions.map((o) => {
                const on = value.getFrom.includes(o.id);
                return (
                  <Chip
                    key={o.id}
                    on={on}
                    onClick={() =>
                      set({
                        getFrom: on
                          ? value.getFrom.filter((x) => x !== o.id)
                          : [...value.getFrom, o.id],
                      })
                    }
                  >
                    {o.label}
                  </Chip>
                );
              })}
            </div>
            {showErrors && value.getFrom.length === 0 && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                Pick at least one.
              </p>
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700">
              Runs natively on Apple Silicon (M1 and later)?
            </span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {(
                [
                  [true, "Yes"],
                  [false, "No"],
                  [null, "Not sure"],
                ] as const
              ).map(([v, label]) => (
                <Chip
                  key={label}
                  on={value.appleSilicon === v}
                  onClick={() => set({ appleSilicon: v })}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
}

// True when a Mac app is missing a required detail
export const platformIncomplete = (v: PlatformInfo) =>
  v.platform === "mac" && (!v.priceModel || v.getFrom.length === 0);
