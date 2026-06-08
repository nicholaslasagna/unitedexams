/**
 * Institution moment — the editorial "Folio" section. Mono-uppercase
 * head row, massive open-font display headline with a Fraunces italic
 * accent on "partnered", an italic-serif promise paragraph on the
 * left, and a roman-numeralled list of i/ii/iii/iv pacts on the right.
 *
 * No icons, no badge gradients, no glow card stacks — the typographic
 * voice carries the seriousness on its own.
 */
const pacts = [
  {
    n: "i.",
    title: "Sign in with your school account.",
    text: "Single sign-on (SSO) with Shibboleth, Okta, or Azure — use the login you already have."
  },
  {
    n: "ii.",
    title: "No upgrade prompts, ever.",
    text: "Verified school accounts skip the pricing page entirely. The app never asks them to pay."
  },
  {
    n: "iii.",
    title: "Classes, rosters, and grades.",
    text: "Sends grades back to your school's system (LMS) where it needs to. Quiet where it doesn't."
  },
  {
    n: "iv.",
    title: "Private and FERPA-compliant.",
    text: "We follow FERPA, the U.S. student-privacy law. Contract templates available."
  }
];

export function InstitutionSection() {
  return (
    <section className="ed-section" id="institution">
      <div className="institution-ed">
        <div className="inst-head-ed">
          <span>Institution Access · Folio</span>
          <span>Section 04</span>
        </div>
        <h2 className="inst-title-ed">
          If your school&apos;s <em>partnered</em>, the platform is just yours.
        </h2>
        <div className="inst-grid-ed">
          <p className="inst-promise">
            Verified students at partnered universities never see a pricing page,
            an upgrade prompt, or a paywall. The institution covers it. You log in
            with your school credentials and the entire library is open — every
            course, every mode, every set.
          </p>
          <div className="inst-pacts">
            {pacts.map((pact) => (
              <div className="inst-pact" key={pact.n}>
                <span className="pact-num">{pact.n}</span>
                <p className="pact-text">
                  <b>{pact.title}</b> {pact.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
