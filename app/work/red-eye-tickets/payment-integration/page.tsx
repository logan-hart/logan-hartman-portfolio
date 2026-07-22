import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceCallout, EvidencePage, EvidenceSection } from "@/components/red-eye/EvidencePage";

export const metadata: Metadata = {
  title: "Payment Integration Deep Dive | Red Eye Tickets",
  description:
    "How Red Eye integrated Authorize.Net, Apple Pay, and Google Pay across provider-specific token protocols, idempotency, asynchronous recovery, and reconciliation.",
  alternates: { canonical: "/work/red-eye-tickets/payment-integration/" },
};

export default function PaymentIntegrationPage() {
  return (
    <EvidencePage
      eyebrow="Production"
      title="One checkout, three payment protocols, no duplicate charges"
      intro="Red Eye had to make cards, Apple Pay, and Google Pay feel like one checkout while respecting different provider contracts, single-use tokens, asynchronous processor outcomes, and a strict boundary around financial data."
      meta={["February–July 2026", "Authorize.Net + wallets", "Substantial implementation contribution"]}
    >
      <EvidenceCallout title="The operating rule">
        <p>
          The gateway moves money, but Red Eye&apos;s payment ledger owns product state. A buyer action may create at most one
          charge, tickets follow reconciled payment state, and an uncertain processor response must remain recoverable
          without asking the customer to guess whether they paid.
        </p>
      </EvidenceCallout>

      <EvidenceSection number="01" title="The assumption that changed">
        <p>
          The first implementation tried to normalize both wallet providers through Authorize.Net Accept.js. Repository
          history quickly exposed the flaw: the Apple Pay and Google Pay payloads were already provider tokens, but their
          accepted descriptors, request shapes, merchant validation, and failure behavior were not interchangeable.
        </p>
        <ol className="evidence-cause-chain">
          <li><strong>Manual cards:</strong> Accept.js tokenizes PAN and CVV in the browser before Red Eye receives opaque data.</li>
          <li><strong>Apple Pay:</strong> a separately validated Apple payment token goes to Rails as <code>COMMON.APPLE.INAPP.PAYMENT</code>, with server-side merchant validation and certificate readiness.</li>
          <li><strong>Google Pay:</strong> Google requests an Authorize.Net gateway token that Rails maps as <code>COMMON.GOOGLE.INAPP.PAYMENT</code>.</li>
          <li><strong>Shared capture boundary:</strong> protocol-specific adapters converge only after validation, at the order and payment-ledger layer.</li>
        </ol>
        <p>
          The lesson was not to force a clean abstraction before understanding each provider. The shared interface belongs
          around business invariants—order identity, amount, capture state, and ticket issuance—not around dissimilar token protocols.
        </p>
      </EvidenceSection>

      <EvidenceSection number="02" title="The constraints behind the interface">
        <div className="evidence-detail-grid">
          <article><h3>Different authentication</h3><p>Browser-safe card identifiers, server gateway credentials, an Apple merchant certificate and domain association, and Google gateway configuration each have separate readiness rules.</p></article>
          <article><h3>Single-use tokens</h3><p>A legitimate retry receives a fresh token, so the token cannot be the durable identity used to prevent a second charge.</p></article>
          <article><h3>Asynchronous truth</h3><p>A capture can be processing or lack a transaction ID while a later webhook, settlement sync, or gateway lookup supplies the final state.</p></article>
          <article><h3>Uneven customer data</h3><p>Wallets can return relay email, missing phone data, or address shapes that cause false AVS declines if handled like manual cards.</p></article>
        </div>
      </EvidenceSection>

      <EvidenceSection number="03" title="Correctness decisions">
        <div className="evidence-two-column">
          <div>
            <h3>Prevent duplicate money movement</h3>
            <ul>
              <li>Confirm and capture use persisted <code>X-Idempotency-Key</code> values scoped to the action.</li>
              <li>The capture digest binds to the order and deliberately excludes the replaceable single-use token.</li>
              <li>Successful replays return the existing payment instead of calling the gateway again.</li>
              <li>Concurrent requests re-read the persisted record rather than surfacing a uniqueness race to the buyer.</li>
            </ul>
          </div>
          <div>
            <h3>Keep ledger state honest</h3>
            <ul>
              <li>Gateway success without a transaction ID becomes <code>pending_capture</code>; tickets are not issued yet.</li>
              <li>Late pending or decline events cannot downgrade an already paid order.</li>
              <li>Signed webhook replay, gateway refresh, and settlement reconciliation repair delayed final state.</li>
              <li>Refunds, reversals, and chargebacks follow separate state transitions instead of a generic status overwrite.</li>
            </ul>
          </div>
        </div>
      </EvidenceSection>

      <EvidenceSection number="04" title="Provider friction became regression coverage">
        <ul>
          <li>Wallet billing fields were removed from the gateway AVS payload after incomplete wallet addresses produced false declines; name and country remain while the cryptogram carries wallet authorization.</li>
          <li>Google Pay can report a concrete error and then cancel, or hold focus without an immediate callback. The UI preserves the specific error and waits for focus to return before declaring “no callback.”</li>
          <li>An unsupported top-level Google Pay request field was removed and the accepted schema was locked with a test.</li>
          <li>A wallet authorization can outlive its checkout session. The product refreshes preview and idempotency state, then asks for a controlled retry.</li>
          <li>Browser capability alone is not Apple Pay readiness. Server certificate, domain, environment, and merchant-validation checks can hide the wallet and preserve card fallback.</li>
        </ul>
      </EvidenceSection>

      <EvidenceSection number="05" title="Operating the integration">
        <div className="evidence-detail-grid">
          <article><h3>Fail-closed configuration</h3><p>Production checks validate the card tokenization host and integrity policy, Apple certificate and domain material, and Google Pay&apos;s deployed environment before buyers depend on them.</p></article>
          <article><h3>Behavior monitoring</h3><p>Method-health windows distinguish tokenization from capture failures so a broken wallet can be identified without calling every checkout problem a decline.</p></article>
          <article><h3>Reconciliation</h3><p>Pending sync, signed webhooks, settlement comparison, transaction refresh, refund sync, and ledger audits cover different ways gateway and local state can drift.</p></article>
          <article><h3>Privacy boundary</h3><p>Logs filter tokens, opaque data, idempotency keys, PAN, and CVV. Reporting keeps constrained aggregates rather than raw processor rows.</p></article>
        </div>
      </EvidenceSection>

      <EvidenceSection number="06" title="Inspecting the evidence">
        <p>
          The implementation is committed across the browser, Rails capture boundary, reconciliation services, monitoring,
          tests, and runbooks. These are representative entry points rather than a claim that one file owns the system.
        </p>
        <ul>
          <li><code>ApplePayButton.jsx</code> and <code>GooglePayButton.jsx</code>: provider-specific requests, contact normalization, fallback, and callback recovery.</li>
          <li><code>apple_pay_controller.rb</code> and <code>Wallets::ApplePayReadiness</code>: URL allowlisting, mutual TLS merchant validation, and certificate checks.</li>
          <li><code>orders/payments_controller.rb</code>: descriptor and token validation, provider adapters, order-bound idempotency, pending state, and safe errors.</li>
          <li><code>authorize_net/webhook_controller.rb</code> and <code>Orders::ReconcileFromWebhook</code>: HMAC validation, replay defense, and out-of-order state handling.</li>
          <li>Request, component, service, and job specs cover provider mapping, wallet AVS, callback anomalies, idempotent replay, settlement, refunds, and stale events.</li>
        </ul>
        <p className="evidence-maturity">
          <strong>Evidence limit:</strong> the guarded live purchase/refund lane exercises manual card entry. Wallet paths have
          component and request coverage; full automated live-wallet E2E is not claimed.
        </p>
      </EvidenceSection>

      <EvidenceSection number="07" title="Outcome, ownership, and what I would revisit">
        <p>
          I authored the core provider-specific adapters and much of the readiness and recovery work; two later public-checkout
          and release-safety changes were co-authored. The shipped result supports provider-specific Apple Pay and Google Pay
          handling on the Authorize.Net capture pipeline, with duplicate-charge prevention, pending-state recovery, webhook
          reconciliation, settlement repair, configuration monitoring, and release gates.
        </p>
        <ul>
          <li>Add 3-D Secure only with an explicit liability, conversion, and recovery design; fields exist, but no 3DS flow is enabled.</li>
          <li>Continue reducing dependence on runtime third-party script availability without weakening production host and integrity checks.</li>
          <li>Attach a dated, cohort-defined analytics note before attributing any conversion or failure-rate change to wallet rollout.</li>
          <li>Expand guarded live-wallet coverage before treating component and request tests as complete end-to-end proof.</li>
        </ul>
        <p className="evidence-next-link">
          Related: <Link href="/work/red-eye-tickets/postmortem-unicode-pdf/">how another downstream contract failed at the PDF boundary →</Link>
        </p>
      </EvidenceSection>
    </EvidencePage>
  );
}
