"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface EventsTagFilterProps {
  readonly selectedTag: string;
  readonly allTags: string[];
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

    if (value === "all") {
      params.delete("tag");
    } else {
      params.set("tag", value);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const tags = ["all", ...allTags];

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {tags.map((tag) => {
        const isActive = selectedTag === tag;
        const label = tag === "all" ? "All Events" : tag;

        return (
          <button
            key={tag}
            onClick={() => handleTagChange(tag)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-primary shadow-md shadow-primary/20"
                : "bg-card border border-border text-text-secondary hover:text-text-main hover:border-primary/50"
            }`}
            style={isActive ? { color: "#ffffff" } : undefined}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
