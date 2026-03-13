interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const SIZE_CLASS: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-4",
};

export function Spinner({ size = "md", label = "Loading…" }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span
        className={`${SIZE_CLASS[size]} inline-block animate-spin rounded-full border-brand-500 border-t-transparent`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
