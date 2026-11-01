"use client";

import React, { useEffect, useState } from "react";
import { Mail, Phone, CheckCircle2, Send } from "lucide-react";
import ContactHero from "@/components/contact/ContactHero";
import ContactFaq from "@/components/contact/ContactFaq";

export default function ContactPage() {
  const [siteContent, setSiteContent] = useState({
    contactEyebrow: "WE ARE HERE TO HELP",
    contactTitle: "Contact Aura & Aether",
    contactDescription: "Questions about a fragrance or an order? We would love to hear from you.",
    contactEmail: "concierge@aura-aether.com",
    contactPhone: "+233 (0) 24 892 4110",
    contactAddress: "Suite 4B, The Meridian Galleria, Airport Residential Area, Accra, Ghana",
  });

  useEffect(() => {
    fetch("/api/site-settings").then((res) => res.ok ? res.json() : null).then((data) => {
      if (data?.settings) setSiteContent((current) => ({ ...current, ...data.settings }));
    }).catch(() => undefined);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Fragrance Consultation",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "We couldn't send your message. Please try again.");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "Fragrance Consultation", message: "" });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't send your message. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <ContactHero />
      <section className="relative isolate flex min-h-[70svh] flex-col justify-center overflow-hidden bg-[var(--primary)] px-4 py-12 text-white sm:px-6 sm:py-14 lg:px-[4vw] lg:py-16">
        <p aria-hidden="true" className="pointer-events-none absolute -left-[5vw] top-[12%] select-none whitespace-nowrap text-[28vw] font-black leading-none tracking-[-0.09em] text-white/[0.055]">
          AETHER
        </p>
        <div className="relative z-10 mx-auto">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="order-1 lg:col-span-4 lg:mt-2">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                {siteContent.contactEyebrow}
              </span>
              <h2 className="font-serif-luxury text-4xl font-normal text-white sm:text-5xl">
                Get in touch
              </h2>
              <p className="mt-4 text-sm font-light leading-relaxed text-white/75 sm:text-base">
                {siteContent.contactDescription}
              </p>
              <h3 className="mb-7 mt-10 border-t border-white/25 pt-6 font-serif-luxury text-2xl font-medium text-white">We’re happy to help.</h3>
              <div className="space-y-6 text-sm text-white/80">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 text-white"><Phone className="h-4 w-4" /></div>
                  <div><h5 className="font-semibold text-white">Phone</h5><p className="mt-1">{siteContent.contactPhone}</p></div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 text-white"><Mail className="h-4 w-4" /></div>
                  <div><h5 className="font-semibold text-white">Email</h5><p className="mt-1 break-words">{siteContent.contactEmail}</p></div>
                </div>
              </div>
              <p className="mt-8 border-t border-white/25 pt-5 text-xs leading-6 text-white/70">Questions about a fragrance, an order, or a gift? Send us a message and we’ll get back to you.</p>
            </div>

            <div className="order-2 lg:col-span-8">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/40 text-white">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif-luxury text-2xl font-medium text-white">
                    Thank you for reaching out
                  </h4>
                  <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/75">
                    Your inquiry has been received. Our team will review it and follow up using
                    the email address you provided.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 border border-white/60 px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-[var(--primary)]"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                    <div>
                      <input
                        type="text"
                        id="contact-name"
                        required
                        aria-label="Your name"
                        placeholder="[ YOUR NAME ]"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border-0 border-b-2 border-white/60 bg-transparent px-0 py-3 text-base font-semibold text-white placeholder:font-black placeholder:uppercase placeholder:tracking-wide placeholder:text-white outline-none transition-colors focus:border-white focus:ring-0 sm:text-lg"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        id="contact-email"
                        required
                        aria-label="Your email"
                        placeholder="[ YOUR EMAIL ]"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-0 border-b-2 border-white/60 bg-transparent px-0 py-3 text-base font-semibold text-white placeholder:font-black placeholder:uppercase placeholder:tracking-wide placeholder:text-white outline-none transition-colors focus:border-white focus:ring-0 sm:text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <select
                      id="contact-subject"
                      aria-label="Inquiry subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border-0 border-b-2 border-white/60 bg-transparent px-0 py-3 text-sm text-white outline-none transition-colors focus:border-white focus:ring-0 [&>option]:text-[#17110F]"
                    >
                      <option value="Fragrance Consultation">Personal Fragrance Consultation</option>
                      <option value="Order Tracking & Support">Order Tracking &amp; Delivery Support</option>
                      <option value="Gift Coffret Customization">Bespoke Gift Coffrets &amp; Events</option>
                      <option value="Wholesale Inquiry">Stockist &amp; Corporate Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <textarea
                      id="contact-message"
                      aria-label="Your message"
                      required
                      rows={4}
                      placeholder="[ MESSAGE ]"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full resize-y border-0 border-b-2 border-white/60 bg-transparent px-0 py-3 text-base font-semibold text-white placeholder:font-black placeholder:uppercase placeholder:tracking-wide placeholder:text-white outline-none transition-colors focus:border-white focus:ring-0 sm:text-lg"
                    />
                  </div>

                  {submitError && (
                    <p role="alert" className="border border-red-200/60 bg-black/10 px-4 py-3 text-sm text-white">
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="mt-2 flex min-h-14 w-full items-center justify-center gap-2 bg-[#17110F] px-6 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-[#17110F] disabled:opacity-60 sm:w-56"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? "Transmitting..." : "Submit Inquiry"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <ContactFaq />
    </>
  );
}
