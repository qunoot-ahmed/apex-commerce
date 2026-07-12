"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useId, useState } from "react";
import { SEARCH_SUGGESTIONS } from "@/lib/constants";
import { searchUrl } from "@/lib/routes/urls";

export function SearchBar({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();
  const suggestionsId = useId();
  const [q, setQ] = useState(defaultQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(searchUrl(trimmed));
  }

  return (
    <div className="apex-search w-100">
      <form onSubmit={onSubmit} className="d-flex" role="search">
        <input
          type="search"
          className="form-control form-control-lg apex-search-input"
          placeholder="Search products, brands, categories..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
          list={suggestionsId}
        />
        <button type="submit" className="btn btn-dark btn-lg px-4">
          Search
        </button>
      </form>
      <datalist id={suggestionsId}>
        {SEARCH_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
