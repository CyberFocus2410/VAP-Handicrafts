import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[var(--sand)] flex items-center justify-center mx-auto text-[var(--cocoa)]">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-[var(--cocoa-light)] font-medium">
            Catalogue
          </span>
          <h1 className="font-serif text-3xl font-medium text-[var(--cocoa)]">
            Product Not Found
          </h1>
          <p className="text-sm text-[var(--cocoa)]/80 leading-relaxed">
            The piece you are searching for might have been retired, moved, or the link may be incorrect.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--rose-deep)] text-white text-sm font-medium hover:brightness-110 transition-colors shadow-sm"
          >
            Browse All Jewellery
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[var(--border)] text-sm font-medium text-[var(--cocoa)] hover:bg-[var(--sand)]/50 transition-colors"
          >
            Search Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
