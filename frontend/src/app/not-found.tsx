import Link from "next/link";
import { Button } from "@/components/shared/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-text-muted">The page you requested does not exist.</p>
      <Link href="/" className="mt-6">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
