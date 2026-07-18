"use client";

import { useEffect, useRef, type Ref } from "react";

function SplitMark({ className = "", markRef }: { className?: string; markRef?: Ref<HTMLSpanElement> }) {
  return <span ref={markRef} className={`split-mark ${className}`} aria-hidden="true" />;
}

function Arrow() {
  return <span className="arrow" aria-hidden="true">↗</span>;
}

const checks = [
  ["01", "Contracted rates", "Billed linehaul vs. the rate you actually negotiated."],
  ["02", "Fuel surcharge", "Ship-week fuel percentage vs. the carrier’s published schedule."],
  ["03", "Accessorials", "Waived, capped, undocumented, or otherwise unapproved fees."],
  ["04", "Weight & class", "Reclass, reweigh, piece count, density, and minimum-charge errors."],
  ["05", "Duplicate billing", "Exact rebills, shadow PROs, and master / child BOL duplicates."],
];

export default function Home() {
  const sceneRef = useRef<HTMLElement>(null);
  const heroMarkRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateScene = () => {
      const rect = scene.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const progress = reduced.matches
        ? 1
        : Math.min(1, Math.max(0, -rect.top / distance));
      const splitProgress = Math.min(1, Math.max(0, (progress - 0.1) / 0.62));
      scene.style.setProperty("--progress", progress.toFixed(4));
      scene.style.setProperty("--split-progress", splitProgress.toFixed(4));

      const heroMark = heroMarkRef.current;
      if (heroMark) {
        const markRect = heroMark.getBoundingClientRect();
        const introScale = 1 + progress * 0.28;
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const markCenterX = viewportCenterX
          + (markRect.left + markRect.width / 2 - viewportCenterX) / introScale;
        const markCenterY = viewportCenterY
          + (markRect.top + markRect.height / 2 - viewportCenterY) / introScale;
        const travel = Math.min(1, splitProgress * 2.4);
        const baseSize = markRect.width / introScale;

        scene.style.setProperty("--split-x", `${markCenterX + (viewportCenterX - markCenterX) * travel}px`);
        scene.style.setProperty("--split-y", `${markCenterY + (viewportCenterY - markCenterY) * travel}px`);
        scene.style.setProperty("--split-size", `${baseSize * (1 + splitProgress * 11)}px`);
        scene.classList.add("motion-ready");
      }
    };

    let frame = 0;
    const queueUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateScene);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14 },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
      revealObserver.observe(node);
    });

    updateScene();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    reduced.addEventListener("change", queueUpdate);

    return () => {
      cancelAnimationFrame(frame);
      revealObserver.disconnect();
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      reduced.removeEventListener("change", queueUpdate);
    };
  }, []);

  return (
    <>
      <header className="site-header">
        <a className="header-brand" href="#top" aria-label="Sable — home">
          <SplitMark className="split-mark--nav" />
          <span>Sable</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#thesis">Why Sable</a>
          <a href="#method">Method</a>
          <a href="#proof">Proof</a>
        </nav>
        <a className="header-cta" href="#contact">
          Request an audit <Arrow />
        </a>
      </header>

      <main id="top">
        <section className="split-scene" ref={sceneRef} aria-label="Sable introduction">
          <div className="scene-sticky">
            <div className="scene-grid" aria-hidden="true" />
            <div className="scene-dark-field" aria-hidden="true" />

            <div className="scene-intro">
              <div className="hero-wordmark">
                <SplitMark className="split-mark--hero" markRef={heroMarkRef} />
                <span>Sable</span>
              </div>
              <p>Transportation spend, <em>understood.</em></p>
            </div>

            <div className="scene-split" aria-hidden="true">
              <img className="hero-piece hero-piece--upper" src="/sable-mark-upper.svg" alt="" draggable="false" />
              <img className="hero-piece hero-piece--lower" src="/sable-mark-lower.svg" alt="" draggable="false" />
            </div>

            <div className="scene-reveal">
              <p className="eyebrow">Freight audit, without the fog</p>
              <h1>Every freight charge<br />should earn its place.</h1>
              <div className="reveal-support">
                <p>
                  We audit transportation invoices against your agreements, shipment records,
                  and published carrier schedules—then show you exactly where the
                  numbers diverge.
                </p>
                <a className="text-link text-link--light" href="#method">
                  See how the audit works <Arrow />
                </a>
              </div>
            </div>

            <div className="scroll-cue" aria-hidden="true">
              <span>Scroll to separate signal from spend</span>
              <span className="scroll-cue__line" />
            </div>
          </div>
        </section>

        <section className="thesis section-shell" id="thesis">
          <div className="section-index" data-reveal>
            <span>01</span>
            <span>The thesis</span>
          </div>
          <div className="thesis-grid">
            <h2 data-reveal>
              The invoice says <em>one number.</em><br />
              Your agreement may say another.
            </h2>
            <div className="thesis-copy" data-reveal>
              <p>
                Freight invoices are dense by design. Rates, fuel, accessorials,
                classes, weights, and minimums all interact—making small errors
                expensive and difficult to defend.
              </p>
              <p>
                Sable turns each exception into a clear claim: what was billed,
                what should have been billed, the recoverable difference, and the
                evidence behind it.
              </p>
            </div>
          </div>
          <div className="thesis-rail" data-reveal>
            <span>Verified accuracy</span>
            <span>Complete visibility</span>
            <span>Financial confidence</span>
            <span>Actionable evidence</span>
          </div>
        </section>

        <section className="checks-section" aria-labelledby="checks-title">
          <div className="checks-intro section-shell">
            <p className="eyebrow" data-reveal>Where we look</p>
            <h2 id="checks-title" data-reveal>
              A sharper second look<br />at every transportation invoice.
            </h2>
            <p data-reveal>
              The invoice is never judged in isolation. We reconcile it against
              the commercial and shipment context that determines what you owe.
            </p>
          </div>
          <div className="checks-list">
            {checks.map(([number, title, description]) => (
              <article className="check-row" key={number} data-reveal>
                <span className="check-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="check-mark" aria-hidden="true">+</span>
              </article>
            ))}
          </div>
        </section>

        <section className="method section-shell" id="method">
          <div className="section-index section-index--light" data-reveal>
            <span>02</span>
            <span>The method</span>
          </div>
          <div className="method-heading">
            <h2 data-reveal>From invoice pile<br />to defensible answer.</h2>
            <p data-reveal>
              Start with 90 days of invoices, shipment records, and carrier
              agreements. We do the reconciliation; you retain the final say.
            </p>
          </div>
          <div className="method-steps">
            <article data-reveal>
              <span className="method-step">01 / Send</span>
              <h3>Give us the operating picture.</h3>
              <p>Invoices, shipment records, and the rate agreements that governed them.</p>
              <div className="format-chips">
                <span>CSV</span><span>XLSX</span><span>EDI 210</span><span>PDF</span>
              </div>
            </article>
            <article data-reveal>
              <span className="method-step">02 / Verify</span>
              <h3>We test every charge.</h3>
              <p>Eight focused checks compare billed charges with contract and carrier evidence.</p>
              <div className="method-diagram" aria-hidden="true">
                <span>Invoice</span><i>→</i><span>Expected</span><i>→</i><span>Exception</span>
              </div>
            </article>
            <article data-reveal>
              <span className="method-step">03 / Decide</span>
              <h3>You approve every move.</h3>
              <p>Review the discrepancy, evidence, and potential recovery before any dispute.</p>
              <div className="decision-row" aria-hidden="true">
                <span>Approve</span><span>Valid charge</span><span>Dispute</span>
              </div>
            </article>
          </div>
        </section>

        <section className="proof section-shell" id="proof">
          <div className="section-index" data-reveal>
            <span>03</span>
            <span>The proof</span>
          </div>
          <div className="proof-grid">
            <div className="proof-copy" data-reveal>
              <p className="eyebrow">Built to show its work</p>
              <h2>Not a black box.<br /><em>An evidence file.</em></h2>
              <p>
                Every finding carries the source invoice, the expected charge,
                the violated term or schedule, and the dollar difference. Your
                team can understand it before it acts on it.
              </p>
              <div className="proof-note">
                <span>Controlled demo result</span>
                <span>Synthetic data—not a customer claim</span>
              </div>
            </div>

            <div className="audit-card" data-reveal aria-label="Example audit summary">
              <div className="audit-card__top">
                <div className="audit-brand"><SplitMark className="split-mark--tiny" /> Sable</div>
                <span>Audit summary / DEMO-001</span>
              </div>
              <div className="audit-metrics">
                <div><span>Invoices audited</span><strong>15</strong><small>4 formats normalized</small></div>
                <div><span>Findings</span><strong>15</strong><small>8 checks applied</small></div>
                <div><span>Potential recovery</span><strong>$5,220.90</strong><small>Controlled test set</small></div>
              </div>
              <div className="audit-detail">
                <div>
                  <span className="audit-detail__label">Exception categories</span>
                  <ul>
                    <li><span>Duplicate billing</span><i style={{ "--bar": "91%" } as React.CSSProperties} /></li>
                    <li><span>Invoice consistency</span><i style={{ "--bar": "67%" } as React.CSSProperties} /></li>
                    <li><span>Fuel surcharge</span><i style={{ "--bar": "52%" } as React.CSSProperties} /></li>
                    <li><span>Contract & accessorial</span><i style={{ "--bar": "38%" } as React.CSSProperties} /></li>
                  </ul>
                </div>
                <div className="evidence-stamp">
                  <span className="evidence-stamp__ring">✓</span>
                  <strong>Evidence<br />attached</strong>
                  <small>Source + rule + delta</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="promise">
          <div className="section-shell">
            <p className="eyebrow" data-reveal>Our promise</p>
            <h2 data-reveal>Clarity in every charge.<br />Confidence in every decision.</h2>
            <div className="promise-grid">
              <article data-reveal><span>◎</span><h3>Verified accuracy</h3><p>Every discrepancy ties back to a source.</p></article>
              <article data-reveal><span>≡</span><h3>Complete visibility</h3><p>See what passed, what failed, and why.</p></article>
              <article data-reveal><span>↗</span><h3>Financial confidence</h3><p>Prioritize recoveries by defensible value.</p></article>
              <article data-reveal><span>◴</span><h3>Actionable insight</h3><p>Turn repeat errors into better controls.</p></article>
            </div>
          </div>
        </section>

        <section className="contact section-shell" id="contact">
          <div className="contact-kicker" data-reveal>
            <SplitMark className="split-mark--contact" />
            <span>Start with 90 days.</span>
          </div>
          <div className="contact-grid">
            <h2 data-reveal>Let’s find what<br />your freight spend<br /><em>is hiding.</em></h2>
            <div className="contact-copy" data-reveal>
              <p>
                Send us 90 days of transportation invoices, shipment records, and carrier
                agreements. We’ll identify recoverable overcharges at no upfront
                cost and deliver a clear savings report.
              </p>
              <a className="contact-button" href="mailto:hello@sableaudit.com?subject=Freight%20audit%20inquiry">
                Request a complimentary audit <Arrow />
              </a>
              <span className="contact-assurance">You approve every dispute. We never short-pay a carrier.</span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand"><SplitMark className="split-mark--footer" /> Sable</div>
        <p>Transportation spend, understood.</p>
        <div><span>Freight audit for mid-market shippers</span><span>© 2026 Sable</span></div>
      </footer>
    </>
  );
}
