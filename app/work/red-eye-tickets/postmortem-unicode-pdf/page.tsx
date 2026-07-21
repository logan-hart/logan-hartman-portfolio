import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceCallout, EvidencePage, EvidenceSection } from "@/components/red-eye/EvidencePage";

export const metadata: Metadata = {
  title: "Unicode Ticket PDF Postmortem | Red Eye Tickets",
  description: "How a valid emoji in an event title exposed an implicit encoding contract in Red Eye's PDF ticket pipeline.",
  alternates: { canonical: "/work/red-eye-tickets/postmortem-unicode-pdf/" },
};

export default function UnicodePdfPostmortemPage() {
  return (
    <EvidencePage
      eyebrow="Production postmortem"
      title="An unexpected event title exposed a hidden assumption in our PDF pipeline"
      intro="A producer used an emoji in an event title. The product accepted the title, but the ticket renderer had a narrower character contract. The input triggered the incident; the system mismatch caused it."
      meta={["Incident class: document generation", "Committed remediation", "Blameless review"]}
    >
      <EvidenceCallout title="The short version">
        <p>
          Emoji are valid Unicode input. Calling the title “bad data” would hide the engineering failure: one product surface
          accepted a value that a downstream surface could not reliably render. We owned the contract mismatch and added
          defenses at validation, font selection, sanitization, fallback, and regression-test layers.
        </p>
      </EvidenceCallout>

      <EvidenceSection number="01" title="What happened">
        <p>
          A producer created an event whose title included an emoji. The web workflow and stored event record allowed the
          title, but generating a customer ticket PDF crossed into a renderer and font path built around Windows-1252-era
          assumptions. Ticket generation could fail when that title reached the document boundary.
        </p>
        <p>
          The behavior was legitimate and creative, not malicious. A title is naturally expressive content; there was no
          reason a producer should have known that a downstream PDF library had different encoding limits.
        </p>
      </EvidenceSection>

      <EvidenceSection number="02" title="Impact and evidence limits">
        <p>
          The failure threatened the most important artifact after purchase: a usable ticket. It also created support risk
          because the event could look healthy in the product while failing only when a document was rendered.
        </p>
        <p>
          Historical incident counts, exact duration, and the number of affected buyers are not preserved in the portfolio
          evidence, so this review does not invent them. The durable evidence is the renderer hardening and the regression
          case that saves an event titled <code>Cafe 🍩</code> and verifies a readable PDF is still produced.
        </p>
      </EvidenceSection>

      <EvidenceSection number="03" title="How I narrowed the failure">
        <p>
          The original alert transcript and timestamps are not preserved, so this is the bounded diagnostic path supported
          by the failure and the committed regression—not a reconstructed minute-by-minute timeline.
        </p>
        <ol className="evidence-cause-chain">
          <li><strong>Reproduce the boundary:</strong> generate a ticket from a saved event title containing an emoji.</li>
          <li><strong>Separate accepted input from failed output:</strong> confirm the web and storage path can hold the title, then isolate the failure to PDF generation.</li>
          <li><strong>Test the encoding hypothesis:</strong> compare general UTF-8 text with what the selected Prawn font and legacy character path can represent.</li>
          <li><strong>Turn the repro into proof:</strong> keep <code>Cafe 🍩</code> as a renderer regression and require a readable PDF result.</li>
        </ol>
        <p>
          That sequence changed the question from “which title broke?” to “where do our character contracts diverge?”—the
          distinction that led to layered remediation instead of a one-off data edit.
        </p>
      </EvidenceSection>

      <EvidenceSection number="04" title="Root cause">
        <ol className="evidence-cause-chain">
          <li><strong>Product contract:</strong> event titles behaved like general text.</li>
          <li><strong>Storage contract:</strong> the title could be persisted and reused across product surfaces.</li>
          <li><strong>Document contract:</strong> the renderer depended on narrower font and encoding support.</li>
          <li><strong>Test gap:</strong> the boundary lacked a representative non-Windows-1252 title case.</li>
        </ol>
        <p>
          The root cause was not “a user entered an emoji.” It was that character support was implicit and inconsistent
          across the end-to-end workflow.
        </p>
      </EvidenceSection>

      <EvidenceSection number="05" title="Resolution">
        <div className="evidence-detail-grid">
          <article><h3>Prefer Unicode fonts</h3><p>The PDF layer searches for Noto Sans or DejaVu Sans and keeps its text in UTF-8 when compatible fonts exist.</p></article>
          <article><h3>Sanitize at the boundary</h3><p>A single PDF text sanitizer replaces invalid byte sequences instead of letting raw display text reach Prawn unchecked.</p></article>
          <article><h3>Fail soft</h3><p>If the library raises an incompatible-string error, rendering retries through a printable ASCII fallback so ticket delivery can continue.</p></article>
          <article><h3>Make the contract visible</h3><p>Event-title validation and the producer readiness report surface legacy-character-set risk before the document path is exercised.</p></article>
          <article><h3>Keep the regression</h3><p>The ticket-renderer spec covers a saved title with an emoji and asserts that a readable PDF is produced. It does not claim the emoji glyph itself is preserved.</p></article>
          <article><h3>Preserve ownership</h3><p>User behavior is treated as a product input to design for, while remediation stays with the system and its maintainers.</p></article>
        </div>
      </EvidenceSection>

      <EvidenceSection number="06" title="What changed in how I build">
        <ul>
          <li>Define text and file-format contracts across the whole workflow, not field by field.</li>
          <li>Test boundaries with emoji, accents, smart punctuation, malformed bytes, and long content.</li>
          <li>Make customer-critical artifact generation degrade to a readable result when fidelity is impossible.</li>
          <li>Write incident language that separates the trigger from the root cause and keeps responsibility with the product.</li>
        </ul>
        <p className="evidence-next-link">
          Next: <Link href="/work/red-eye-tickets/adr-local-first-repair/">the architecture decision that bounds automated production repair →</Link>
        </p>
      </EvidenceSection>
    </EvidencePage>
  );
}
