import Link from "next/link"

const PRODUCT_LINKS = [
  { label: "Formation", href: "/app" },
  { label: "Compliance Center", href: "/app" },
  { label: "Transactions", href: "/app" },
  { label: "Document Vault", href: "/app" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="flex items-start gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/beaker.png" alt="" className="h-8 w-8 shrink-0 object-contain" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">Vispo Labs</p>
              <p className="text-xs text-muted-foreground">Startup Legal Studio</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-right">
              Vispo Labs is an AI-assisted guide, not a law firm. Always consult a licensed attorney
              for legal advice.
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} Vispo Labs. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
