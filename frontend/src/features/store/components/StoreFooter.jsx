import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ShoppingBag } from "lucide-react";

import { Container } from "./Primitives";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All products" },
      { to: "/shop?sort=createdAt:desc", label: "New arrivals" },
      { to: "/shop?minRating=4", label: "Top rated" },
      { to: "/wishlist", label: "Wishlist" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/profile", label: "Your profile" },
      { to: "/orders", label: "Your orders" },
      { to: "/cart", label: "Your bag" },
      { to: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About us" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

const StoreFooter = () => (
  <footer className="mt-section border-t border-line-subtle bg-surface-sunken">
    <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
      <div>
        <Link to="/" className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-on">
            <ShoppingBag size={17} />
          </span>
          <span className="type-section-title text-[1.0625rem] text-content">Planet</span>
        </Link>
        <p className="type-description max-w-[38ch]">
          Everyday essentials, sourced carefully and delivered across India.
        </p>

        <ul className="mt-5 flex flex-col gap-2">
          <li className="flex items-center gap-2 type-caption text-content-secondary">
            <Mail size={14} className="text-content-muted" />
            <a href="mailto:support@planet.store" className="hover:text-accent-text">
              support@planet.store
            </a>
          </li>
          <li className="flex items-center gap-2 type-caption text-content-secondary">
            <Phone size={14} className="text-content-muted" />
            <a href="tel:+911800000000" className="hover:text-accent-text">
              1800 000 000
            </a>
          </li>
          <li className="flex items-center gap-2 type-caption text-content-secondary">
            <MapPin size={14} className="text-content-muted" />
            Bengaluru, India
          </li>
        </ul>
      </div>

      {COLUMNS.map((column) => (
        <nav key={column.title} aria-label={column.title}>
          <h3 className="type-overline mb-3 text-content">{column.title}</h3>
          <ul className="flex flex-col gap-2">
            {column.links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="type-caption text-content-secondary transition-colors hover:text-accent-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </Container>

    <div className="border-t border-line-subtle">
      <Container className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-caption text-content-muted">
          © {new Date().getFullYear()} Planet. All rights reserved.
        </p>
        <p className="type-caption text-content-muted">
          Prices include GST where applicable.
        </p>
      </Container>
    </div>
  </footer>
);

export default StoreFooter;
