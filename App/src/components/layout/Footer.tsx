import { Link } from "react-router";
import {
  ShieldCheck,
  RefreshCcw,
  BadgeCheck,
  Headphones,
  Send,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter, FaFacebook, FaYoutube } from "react-icons/fa6";

// ─── Data ────────────────────────────────────────────────────────────────────

const LINKS = {
  Shop: [
    { label: "New arrivals", to: "/shop/new" },
    { label: "Best sellers", to: "/shop/best-sellers" },
    { label: "Sale items", to: "/shop/sale" },
    { label: "Gift cards", to: "/shop/gift-cards" },
    { label: "Collections", to: "/shop/collections" },
  ],
  Support: [
    { label: "Help center", to: "/support" },
    { label: "Track your order", to: "/orders/track" },
    { label: "Returns & exchanges", to: "/returns" },
    { label: "Shipping info", to: "/shipping" },
    { label: "Contact us", to: "/contact" },
  ],
  Company: [
    { label: "About us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Press", to: "/press" },
    { label: "Sustainability", to: "/sustainability" },
    { label: "Blog", to: "/blog" },
  ],
  Legal: [
    { label: "Privacy policy", to: "/privacy" },
    { label: "Terms of service", to: "/terms" },
    { label: "Cookie settings", to: "/cookies" },
    { label: "Accessibility", to: "/accessibility" },
    { label: "Sitemap", to: "/sitemap" },
  ],
};

const SOCIALS = [
  { icon: FaInstagram, label: "Instagram", href: "https://instagram.com" },
  { icon: FaTwitter, label: "Twitter / X", href: "https://twitter.com" },
  { icon: FaFacebook, label: "Facebook", href: "https://facebook.com" },
  { icon: FaYoutube, label: "YouTube", href: "https://youtube.com" },
];

const TRUST = [
  { icon: ShieldCheck, text: "Secure checkout" },
  { icon: RefreshCcw, text: "Free 30-day returns" },
  { icon: BadgeCheck, text: "100% authentic" },
  { icon: Headphones, text: "24/7 support" },
];

const PAYMENTS = ["VISA", "MC", "AMEX", "PayPal", "UPI", "GPay"];

// ─── Sub-components ──────────────────────────────────────────────────────────

function TrustBar() {
  return (
    <div className="border-b border-zinc-800 bg-zinc-900/60">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:justify-between">
          {TRUST.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2 text-sm text-zinc-400"
            >
              <Icon size={16} className="shrink-0 text-amber-400" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex flex-col gap-5">
      {/* Logo */}
      <Link to="/" className="group flex w-fit items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 transition-transform group-hover:scale-105">
          <svg
            viewBox="0 0 18 18"
            className="h-5 w-5 fill-zinc-900"
            aria-hidden="true"
          >
            <path d="M9 2L3 6v6l6 4 6-4V6L9 2z" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          Shop<span className="text-amber-400">Co</span>
        </span>
      </Link>

      <p className="max-w-[220px] text-sm leading-relaxed text-zinc-400">
        Curated products delivered to your door. Quality you can feel, prices
        you'll love.
      </p>

      {/* Contact snippets */}
      <ul className="flex flex-col gap-2.5 text-sm text-zinc-400">
        {[
          { icon: MapPin, text: "123 Market St, San Francisco" },
          { icon: Phone, text: "+1 (800) 123-4567" },
          { icon: Mail, text: "hello@shopify.com" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2">
            <Icon size={14} className="shrink-0 text-amber-400/70" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {/* Socials */}
      <div className="flex gap-2">
        {SOCIALS.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition-all hover:border-amber-400 hover:text-amber-400"
          >
            <Icon size={15} />
          </a>
        ))}
      </div>
    </div>
  );
}

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-300">
        {title}
      </h4>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ label, to }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-amber-400"
            >
              <ChevronRight
                size={12}
                className="-translate-x-1 shrink-0 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
              />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
  }

  return (
    <div className="border-t border-zinc-800 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">
              Stay in the loop
            </h4>
            <p className="mt-0.5 text-sm text-zinc-500">
              Deals, new arrivals &amp; style tips — straight to your inbox.
            </p>
          </div>

          {sent ? (
            <p className="text-sm font-medium text-amber-400">
              Thanks! You're subscribed ✓
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-sm gap-2"
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-amber-400"
              />
              <button
                type="submit"
                className="flex h-10 items-center gap-1.5 rounded-lg bg-amber-400 px-4 text-sm font-semibold text-zinc-900 transition-all hover:bg-amber-300 active:scale-95"
              >
                <Send size={13} />
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function BottomBar() {
  return (
    <div className="border-t border-zinc-800 py-5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Shopify Inc. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Payment badges */}
            <div className="flex flex-wrap gap-1.5">
              {PAYMENTS.map((name) => (
                <span
                  key={name}
                  className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-500"
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Legal links */}
            <div className="flex gap-0">
              {["Privacy", "Terms", "Cookies"].map((label, i) => (
                <span key={label} className="flex items-center">
                  {i > 0 && <span className="mx-2 text-zinc-700">·</span>}
                  <Link
                    to={`/${label.toLowerCase()}`}
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                  >
                    {label}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer
      className=" bg-zinc-950 text-white w-screen!"
      aria-label="Site footer"
    >
      <TrustBar />

      {/* Main grid */}
      <div className="mx-auto min-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          {/* Brand column — spans full width on mobile */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Brand />
          </div>

          {Object.entries(LINKS).map(([title, links]) => (
            <LinkColumn key={title} title={title} links={links} />
          ))}
        </div>
      </div>

      <Newsletter />
      <BottomBar />
    </footer>
  );
}
