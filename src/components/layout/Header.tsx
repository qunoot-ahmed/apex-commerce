"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { useState } from "react";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { SearchBar } from "@/components/search/SearchBar";
import { useColorMode } from "@/components/providers/AppProviders";
import { useCart } from "@/components/providers/CartProvider";
import { SITE_NAME } from "@/lib/constants";
import {
  blogUrl,
  brandsUrl,
  cartUrl,
  collectionsUrl,
  crawlerTestUrl,
  dealsUrl,
  homeUrl,
  htmlSitemapUrl,
  productsUrl,
} from "@/lib/routes/urls";
import type { Category } from "@/types/catalog";

export function Header({ categories }: { categories: Category[] }) {
  const { mode, toggle } = useColorMode();
  const { itemCount } = useCart();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="apex-header sticky-top bg-body border-bottom">
      <div className="bg-dark text-white py-2 small">
        <div className="container d-flex justify-content-between">
          <span>Free shipping on orders $75+</span>
          <span>
            <Link href="/help" className="text-white-50 text-decoration-none me-3">
              Help
            </Link>
            <Link href="/account" className="text-white-50 text-decoration-none">
              Account
            </Link>
          </span>
        </div>
      </div>

      <div className="container py-3">
        <div className="d-flex align-items-center gap-3">
          <IconButton
            className="d-lg-none"
            aria-label="Open menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <MenuIcon />
          </IconButton>

          <Link href={homeUrl()} className="apex-logo text-decoration-none text-body">
            <span className="fw-bold fs-3 tracking-tight">{SITE_NAME}</span>
          </Link>

          <div className="flex-grow-1 d-none d-md-block mx-3">
            <SearchBar />
          </div>

          <div className="d-flex align-items-center gap-1 ms-auto">
            <IconButton aria-label="Toggle theme" onClick={toggle}>
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <IconButton component={Link} href={cartUrl()} aria-label="Cart">
              <Badge badgeContent={itemCount} color="error" invisible={itemCount === 0}>
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>
          </div>
        </div>

        <div className="d-md-none mt-3">
          <SearchBar />
        </div>
      </div>

      <nav className="border-top d-none d-lg-block" aria-label="Main">
        <div className="container">
          <ul className="nav py-2 gap-2">
            <li
              className="nav-item dropdown position-static"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                type="button"
                className="nav-link fw-semibold btn btn-link"
                aria-expanded={megaOpen}
              >
                Shop
              </button>
              {megaOpen && <MegaMenu categories={categories} />}
            </li>
            <li className="nav-item">
              <Link className="nav-link" href={productsUrl()}>
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href={dealsUrl()}>
                Deals
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href={collectionsUrl()}>
                Collections
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href={brandsUrl()}>
                Brands
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href={blogUrl()}>
                Blog
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-muted" href={htmlSitemapUrl()}>
                Sitemap
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {mobileOpen && (
        <div className="d-lg-none border-top p-3 bg-body">
          <ul className="list-unstyled">
            {categories.map((c) => (
              <li key={c.id} className="mb-2">
                <Link href={`/category/${c.path.join("/")}`} onClick={() => setMobileOpen(false)}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={crawlerTestUrl()}>Crawler Test</Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
