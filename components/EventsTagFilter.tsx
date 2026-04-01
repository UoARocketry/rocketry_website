"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ALL_EVENTS_TAG } from "@/lib/utils";

interface EventTagOption {
  readonly value: string;
  readonly label: string;
}

interface EventsTagFilterProps {
  readonly selectedTag: string;
  readonly allTags: EventTagOption[];
}

export default function EventsTagFilter({
  selectedTag,
  allTags,
}: Readonly<EventsTagFilterProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTagChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === ALL_EVENTS_TAG) {
      params.delete("tag");
    } else {
      params.set("tag", value);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const tags = [{ value: ALL_EVENTS_TAG, label: "All Events" }, ...allTags];

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {tags.map((tag) => {
        const isActive = selectedTag === tag.value;

        return (
          <button
            key={tag.value}
            onClick={() => handleTagChange(tag.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-primary shadow-md shadow-primary/20"
                : "bg-card border border-border text-text-secondary hover:text-text-main hover:border-primary/50"
            }`}
            style={isActive ? { color: "#ffffff" } : undefined}
          >
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}
