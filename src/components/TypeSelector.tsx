"use client";

interface TypeSelectorProps {
  label: string;
  types: { value: string; label?: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
}

export default function TypeSelector({
  label,
  types,
  selected,
  onSelect,
}: TypeSelectorProps) {
  return (
    <div>
      <div className="text-[16px] font-medium text-text mb-3">{label}</div>
      <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
        {types.map((t) => {
          const active = selected === t.value;
          return (
            <button
              key={t.value}
              onClick={() => onSelect(t.value)}
              className="px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer"
              style={{
                background: active ? "var(--color-selected-bg)" : "#fff",
                borderColor: active
                  ? "var(--color-selected-border)"
                  : "var(--color-border)",
                color: active ? "var(--color-selected-border)" : "var(--color-text)",
                fontWeight: active ? 600 : 400,
              }}
            >
              <div className="font-semibold">{t.value}</div>
              {t.label && (
                <div className="text-xs text-muted mt-0.5">{t.label}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
