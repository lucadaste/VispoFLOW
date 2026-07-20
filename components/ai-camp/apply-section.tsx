"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function ApplySection() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <section id="apply" className="border-t border-foreground/15 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden border border-foreground bg-foreground text-background">
          <div className="grid lg:grid-cols-2">
            <div className="relative hidden lg:block">
              <img
                src="/images/workshop.png"
                alt="Managers and entrepreneurs collaborating in a workshop"
                className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 to-foreground" />
              <div className="relative flex h-full flex-col justify-end p-8">
                <p className="font-serif text-2xl font-semibold leading-snug">
                  The next cohort is filling up.
                </p>
                <p className="mt-2 text-background/70">
                  Applications are reviewed on a rolling basis. Limited to 20 participants.
                </p>
              </div>
            </div>

            <div className="border-foreground/0 p-8 sm:p-10 lg:border-l lg:border-background/20">
              <h2 className="text-balance font-serif text-3xl font-normal tracking-tight">
                Apply to <span className="italic">join</span>
              </h2>
              <p className="mt-2 text-background/70">
                Tell us a little about you and we&apos;ll be in touch within two business days.
              </p>

              {submitted ? (
                <div className="mt-8 flex items-start gap-3 border border-background/30 p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-background" />
                  <div>
                    <p className="font-semibold">Application received</p>
                    <p className="mt-1 text-sm text-background/70">
                      Thank you. Our team will reach out shortly to discuss your goals and the right track.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  className="mt-7 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSubmitted(true)
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" id="name" placeholder="Jane Doe" />
                    <Field label="Work email" id="email" type="email" placeholder="jane@company.com" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company" id="company" placeholder="Acme Inc." />
                    <Field label="Role" id="role" placeholder="Head of Innovation" />
                  </div>
                  <div>
                    <label htmlFor="track" className="mb-1.5 block text-sm font-medium">
                      Preferred track
                    </label>
                    <select
                      id="track"
                      className="w-full border border-background/30 bg-transparent px-3.5 py-2.5 text-sm text-background outline-none focus:border-background"
                    >
                      <option className="text-foreground">Essentials — 3 days</option>
                      <option className="text-foreground">Accelerator — 4 days</option>
                      <option className="text-foreground">Executive Intensive — 5 days</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
                  >
                    Submit application
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
}: {
  label: string
  id: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        placeholder={placeholder}
        className="w-full border border-background/30 bg-transparent px-3.5 py-2.5 text-sm text-background placeholder:text-background/40 outline-none focus:border-background"
      />
    </div>
  )
}
