"use client";

import Link from "next/link";
import { useState } from "react";
import {
  blogUrl,
  brandsUrl,
  categoryUrl,
  collectionsUrl,
  dealsUrl,
  productsUrl,
} from "@/lib/routes/urls";
import type { Category } from "@/types/catalog";

export function MegaMenu({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState<string | null>(categories[0]?.id ?? null);
  const activeCat = categories.find((c) => c.id === active) ?? categories[0];

  return (
    <div
      className="mega-menu dropdown-menu show p-0 border-0 shadow-lg w-100 mt-0"
      onMouseLeave={() => setActive(categories[0]?.id ?? null)}
    >
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-md-3 border-end">
            <ul className="nav flex-column">
              {categories.map((cat) => (
                <li key={cat.id} className="nav-item">
                  <button
                    type="button"
                    className={`nav-link text-start w-100${active === cat.id ? " active fw-semibold" : ""}`}
                    onMouseEnter={() => setActive(cat.id)}
                  >
                    <Link
                      href={categoryUrl(cat.path)}
                      className="text-decoration-none text-body stretched-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {cat.name}
                    </Link>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-9">
            {activeCat && (
              <>
                <h3 className="h6 text-uppercase text-muted mb-3">{activeCat.name}</h3>
                <div className="row g-3">
                  {activeCat.children.map((sub) => (
                    <div key={sub.id} className="col-md-4">
                      <Link
                        href={categoryUrl(sub.path)}
                        className="fw-semibold text-decoration-none d-block mb-2"
                      >
                        {sub.name}
                      </Link>
                      <ul className="list-unstyled small">
                        {sub.children.map((leaf) => (
                          <li key={leaf.id}>
                            <Link href={categoryUrl(leaf.path)} className="text-muted">
                              {leaf.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="border-top mt-3 pt-3 d-flex flex-wrap gap-3 small">
          <Link href={productsUrl()}>All Products</Link>
          <Link href={dealsUrl()}>Deals</Link>
          <Link href={collectionsUrl()}>Collections</Link>
          <Link href={brandsUrl()}>Brands</Link>
          <Link href={blogUrl()}>Blog</Link>
        </div>
      </div>
    </div>
  );
}
