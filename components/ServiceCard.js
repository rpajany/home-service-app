import Link from "next/link";
import Image from "next/image";
import { MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServiceCard({ service }) {
  return (
    <article className="card-shadow-hover w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-[#e5e1e9] bg-white">

      <Link
        href={`/services/${service.slug || service._id}`}
        className="block min-w-0 max-w-full"
      >
        <div className="relative h-36 w-full max-w-full overflow-hidden bg-gray-100">
          <Image
            src={service.image}
            alt={service.name || "Service"}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 300px"
          />
        </div>
      </Link>

      <div className="min-w-0 max-w-full p-3">

        <span className="inline-flex max-w-full rounded-full bg-[#eee5ff] px-2.5 py-1 text-[11px] font-semibold text-[#6d42d7]">
          {service.category}
        </span>

        <Link
          href={`/services/${service.slug || service._id}`}
          className="block min-w-0 max-w-full"
        >
          <h3 className="mt-2 line-clamp-1 text-[15px] font-bold">
            {service.name}
          </h3>
        </Link>

        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs font-medium text-[#6d42d7]">
          <UserRound size={13} className="shrink-0" />
          <span className="truncate">
            {service.providerName}
          </span>
        </p>

        <p className="mt-1 flex min-w-0 items-start gap-1 text-xs text-[#777481]">
          <MapPin
            size={13}
            className="mt-0.5 shrink-0"
          />

          <span className="truncate">
            {service.address}
          </span>
        </p>

        <Link
          href={`/services/${service.slug || service._id}`}
          className="block w-full max-w-full"
        >
          <Button
            size="sm"
            className="mt-3 w-full max-w-full"
          >
            Book Now
          </Button>
        </Link>

      </div>
    </article>
  );
}