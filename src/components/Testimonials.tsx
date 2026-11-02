import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { testimonials, type Testimonial } from "@/lib/data";

function Stars({ className = "size-4" }: { className?: string }) {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} fill-amber-400 text-amber-400`}
        />
      ))}
    </div>
  );
}

// Real photo when provided, otherwise an illustrated placeholder
function avatarSrc(t: Testimonial) {
  return (
    t.avatar ??
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=${t.color.slice(1)}`
  );
}

function ReviewCard({ review }: { review: Testimonial }) {
  return (
    <figure className="badge-pop mb-5 break-inside-avoid rounded-2xl bg-white p-5">
      <div className="flex items-center justify-between">
        <Stars className="size-3.5" />
        <Quote className="size-5 fill-brand-100 text-brand-200" />
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
        <Image
          src={avatarSrc(review)}
          alt={review.name}
          width={40}
          height={40}
          unoptimized
          className="size-10 shrink-0 rounded-full border-[1.5px] border-slate-900 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {review.name}
          </p>
          <p className="truncate text-xs text-slate-500">{review.role}</p>
        </div>
        <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
          {review.result}
        </span>
      </figcaption>
    </figure>
  );
}

export function ReviewGrid({ wide = true }: { wide?: boolean }) {
  return (
    <div
      className={`columns-1 gap-5 sm:columns-2 ${wide ? "lg:columns-3" : ""}`}
    >
      {testimonials.map((t) => (
        <ReviewCard key={t.name} review={t} />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      aria-label="Reviews from makers"
      className="mx-auto w-full max-w-[1320px] px-4 pb-24 pt-4 sm:px-6"
    >
      <ReviewGrid />
    </section>
  );
}
