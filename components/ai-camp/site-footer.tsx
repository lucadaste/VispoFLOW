export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/15 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-foreground bg-foreground text-[11px] font-bold text-background">
                SVE
              </span>
              <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Silicon Valley Experience
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Bridging Silicon Valley and the world through immersive, hands-on programs in applied AI and
              innovation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol title="Program" links={["Overview", "Tracks", "Partners", "Pricing"]} />
            <FooterCol title="Company" links={["About SVE", "Alumni", "Contact", "Careers"]} />
            <FooterCol title="Legal" links={["Privacy", "Terms", "Cookies"]} />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-foreground/15 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Silicon Valley Experience. All rights reserved.</p>
          <p>siliconvalleyexperience.us</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
