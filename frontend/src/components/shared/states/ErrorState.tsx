import { Button } from "@/components/shared/ui/Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="rounded-md border border-danger/30 bg-danger/5 px-4 py-6 text-center"
      role="alert"
    >
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
