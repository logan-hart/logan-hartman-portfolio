import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceCallout, EvidencePage, EvidenceSection } from "@/components/red-eye/EvidencePage";

export const metadata: Metadata = {
  title: {
    absolute: "The final ticket was held, but capture counted it twice | Red Eye Tickets",
  },
  description:
    "How Red Eye fixed a final-inventory failure by binding hold consumption to verified checkout provenance.",
  alternates: { canonical: "/work/red-eye-tickets/guest-checkout-inventory-hold/" },
};

export default function GuestCheckoutInventoryHoldPage() {
  return (
    <EvidencePage
      eyebrow="Resolved production incident"
      title="The final ticket was held, but capture counted it twice"
      intro="A buyer entered checkout as a guest and reserved the final available ticket. During confirmation, the submitted email matched an existing Red Eye account, so the order was associated with that account for delivery and purchase history. Payment capture then looked for an account-owned hold instead of the guest-session hold that had actually reserved the inventory. The deployed fix now derives hold ownership from the validated checkout origin rather than inferring it from the order’s eventual account association."
      meta={["Production fix deployed"]}
    >
      <EvidenceCallout title="The short version">
        <p>
          Red Eye allows customers to complete a purchase without creating or signing into an account. The purchase email
          is retained so that, if the customer later registers with the same address, previous purchases can appear in
          their account history. When the email already belongs to an account, the new order can also be associated with
          that account.
        </p>
        <p>
          That association supports delivery and purchase history. It does not authenticate the guest or grant access to
          account-owned resources.
        </p>
        <p>
          In this incident, preview correctly created an inventory hold owned by the guest session. Confirmation then
          associated the order with the account matching the submitted email. At capture, the system treated that account
          association as the source of hold ownership and failed to consume the guest-session hold.
        </p>
        <p>
          The original hold continued to reduce availability while the order requested the same inventory again. The final
          preflight therefore rejected a valid purchase as insufficient inventory.
        </p>
        <p>The failure happened before the payment gateway was contacted. No charge, payment record, or ticket was created.</p>
      </EvidenceCallout>

      <EvidenceSection number="01" title="Guest checkout created an important identity boundary">
        <p>
          Guest checkout was an intentional product decision. Requiring an account before purchase would add friction at
          the most important point in the customer journey, particularly for buyers arriving from an event link and trying
          to secure limited inventory.
        </p>
        <p>The system therefore supports two related but distinct concepts:</p>
        <div className="evidence-detail-grid">
          <article>
            <h3>Purchase identity</h3>
            <p>The email used for ticket delivery, support, and later account-history reconciliation.</p>
          </article>
          <article>
            <h3>Checkout authority</h3>
            <p>The authenticated user or guest session that created the inventory hold and is permitted to consume it.</p>
          </article>
        </div>
        <p>
          Most of the time, those identities remain aligned. This incident exposed the case where they legitimately
          diverged.
        </p>
        <p>
          A guest could enter an email already associated with an account, allowing the resulting purchase to appear in
          that account&apos;s history, while the inventory reservation still belonged to the guest checkout session.
        </p>
      </EvidenceSection>

      <EvidenceSection number="02" title="The production evidence narrowed the failure">
        <p>
          The affected sales window was open and the tier configuration had not changed. The remaining inventory had
          already been reserved by the buyer&apos;s guest session.
        </p>
        <p>The request sequence was consistent:</p>
        <div className="evidence-detail-grid">
          <article>
            <h3>Preview succeeded</h3>
            <p>The guest checkout session created the expected hold.</p>
          </article>
          <article>
            <h3>Confirmation succeeded</h3>
            <p>The order was created and associated with the account matching the submitted email.</p>
          </article>
          <article>
            <h3>Capture was rejected</h3>
            <p>The final inventory preflight returned insufficient availability before making a gateway request.</p>
          </article>
        </div>
        <p>
          Multiple confirmed incidents shared this sequence. Broader availability errors were not treated as proof because
          retries, expired holds, and genuine buyer contention can produce the same generic response.
        </p>
        <p>The defect required a specific combination:</p>
        <ul>
          <li>The checkout originated as a guest.</li>
          <li>The submitted email belonged to an existing account.</li>
          <li>Inventory was at the sellout boundary.</li>
          <li>Capture performed the final locked revalidation.</li>
        </ul>
        <p>
          Spare availability could hide the duplicated demand, which is why preview and confirmation could both appear
          healthy.
        </p>
      </EvidenceSection>

      <EvidenceSection number="03" title="Root cause: account association was mistaken for authority">
        <p>Preview stored the hold against the guest-session identifier.</p>
        <p>
          Confirmation associated the order with the existing account so the purchase could be delivered and included in
          account history.
        </p>
        <p>
          Capture then saw that the order had a user and searched for a user-owned hold. It did not consume the validated
          guest-session hold that had originated the checkout.
        </p>
        <p>
          The untouched guest hold still reduced availability. When capture requested the same inventory for the order,
          the system effectively counted the intended purchase twice.
        </p>
        <p>
          The inventory protection behaved safely, but incorrectly. It prevented overselling and stopped before payment,
          while rejecting a buyer who already held the inventory they were trying to purchase.
        </p>
      </EvidenceSection>

      <EvidenceSection number="04" title="The obvious fix would have widened authority">
        <p>
          A broad lookup using either the account ID or the session ID would have removed the visible symptom, but it would
          have introduced a more serious authorization problem.
        </p>
        <p>
          A signed-out buyer must not gain access to an account&apos;s unrelated inventory holds simply by entering that
          account&apos;s email address.
        </p>
        <p>
          An email match can support order association and purchase history. It cannot prove that the guest controls the
          account or its existing checkout state.
        </p>
        <p>
          The safe source of truth was therefore not the order&apos;s final identity. It was the validated checkout session
          that originated the hold.
        </p>
      </EvidenceSection>

      <EvidenceSection number="05" title="The implemented fix">
        <p>
          Payment capture now derives hold ownership from the validated <code>CheckoutSession</code>.
        </p>
        <ul>
          <li>A guest-origin checkout consumes only the active hold belonging to its validated guest session.</li>
          <li>An authenticated-origin checkout consumes only the hold belonging to that authenticated user.</li>
          <li>An authenticated legacy flow without a checkout session may fall back to the current signed-in user.</li>
          <li>
            Invalid, expired, or mismatched checkout sessions fail closed instead of falling back to weaker identity
            inference.
          </li>
          <li>An account inferred from an email address never grants ownership of account-held inventory.</li>
        </ul>
        <p>Hold consumption remains:</p>
        <ul>
          <li>active-only;</li>
          <li>row-locked;</li>
          <li>quantity-bounded;</li>
          <li>transactional; and</li>
          <li>scoped to the proven checkout owner.</li>
        </ul>
        <p>
          Foreign holds and excess matching quantity remain untouched. The previous broad post-payment deletion path was
          removed because exact hold consumption already performs the required conversion without widening ownership.
        </p>
        <p>
          Checkout sessions, route orders, and idempotent capture replays are also bound to the same proven owner. A replay
          must belong to the route order before an existing payment result can be returned.
        </p>
      </EvidenceSection>

      <EvidenceSection number="06" title="Verification focused on boundaries, not only the repaired path">
        <p>The regression coverage verifies that:</p>
        <ul>
          <li>
            A guest checkout using an existing-account email consumes its own hold, captures once, and issues the expected
            ticket.
          </li>
          <li>Multi-ticket and shared-tier forms of the same boundary complete correctly.</li>
          <li>A guest cannot consume an account-owned hold.</li>
          <li>Holds belonging to another session or account remain untouched.</li>
          <li>Genuine inventory loss still returns an availability error before gateway contact.</li>
          <li>Partial and multi-option hold consumption remains quantity-bounded.</li>
          <li>Capture replay remains idempotent.</li>
          <li>Authenticated checkout and guest checkout without account reconciliation remain green control paths.</li>
        </ul>
        <p>
          The focused checkout and payment coverage, full backend suite, payment and inventory invariants, static analysis,
          operational validation, and merge gate all passed.
        </p>
        <p>
          The exact verified commit was then deployed through the multi-service release workflow and confirmed in
          production.
        </p>
      </EvidenceSection>

      <EvidenceSection number="07" title="The failure now leaves durable, privacy-safe evidence">
        <p>
          The inventory-preflight event is emitted outside the failed database transaction so rejection evidence survives
          rollback.
        </p>
        <p>Its allowlist records only the information needed to understand the system&apos;s behavior:</p>
        <ul>
          <li>the shape of the checkout identity;</li>
          <li>the proven hold-owner source;</li>
          <li>matched and consumed quantities;</li>
          <li>capacity scope;</li>
          <li>the result of the preflight; and</li>
          <li>whether the gateway was contacted.</li>
        </ul>
        <p>
          It excludes customer and payment data, including order IDs, user IDs, session values, cookies, email addresses,
          IP addresses, and payment tokens.
        </p>
        <p>
          Production monitoring can now distinguish a successfully reconciled guest/account handoff from genuine inventory
          contention without retaining customer-identifying data.
        </p>
      </EvidenceSection>

      <EvidenceCallout title="What this incident clarified">
        <p>
          An order may be associated with an account for delivery and purchase history without making that account the
          authority for the checkout that created it.
        </p>
        <p>The underlying distinction is simple:</p>
        <p><strong>Identity association is not authorization.</strong></p>
        <p>
          Reliability depended on preserving that distinction from preview through capture, while still allowing guest
          checkout to remain low-friction and account history to remain complete.
        </p>
        <p>
          This case demonstrates more than an inventory correction. It shows how a product decision, identity model,
          authorization boundary, concurrency control, payment preflight, regression strategy, and production telemetry all
          meet in one customer-facing workflow.
        </p>
        <p className="evidence-next-link">
          Next:{" "}
          <Link href="/work/red-eye-tickets/postmortem-unicode-pdf/">
            how an event title exposed another hidden production boundary →
          </Link>
        </p>
      </EvidenceCallout>
    </EvidencePage>
  );
}
