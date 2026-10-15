import {
  ArrowRight,
  BookOpenCheck,
  ChartNoAxesCombined,
  ClipboardCheck,
  HeartHandshake,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";

const features = [
  {
    icon: ClipboardCheck,
    title: "Complaints with a clear path",
    description: "One place to submit an issue, follow its progress, and keep every reply together.",
    tone: "teal",
  },
  {
    icon: Sparkles,
    title: "AI that knows its limits",
    description: "Get grounded guidance from approved articles, with a clear route to a human when needed.",
    tone: "sky",
  },
  {
    icon: MessageCircleMore,
    title: "Feedback that informs service",
    description: "Share what happened after resolution and help teams spot recurring concerns.",
    tone: "amber",
  },
  {
    icon: BookOpenCheck,
    title: "Consumer help you can verify",
    description: "Find reviewed articles, practical checklists, and source links in one searchable centre.",
    tone: "blue",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Impact backed by evidence",
    description: "Keep service outcomes and community outreach distinct, traceable, and honestly reported.",
    tone: "green",
  },
];

const steps = [
  ["01", "Tell us what happened", "Share the issue and the outcome you need."],
  ["02", "Follow every update", "See the owner, replies, and status in one timeline."],
  ["03", "Close the loop", "Review the resolution and tell us how we did."],
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#how-it-works">How it works</a>
            <a href="#services">What we do</a>
            <a href="#impact">Our approach</a>
          </nav>
          <div className="header-actions">
            <Link className="header-signin" to="/login">Sign in</Link>
            <Link className="button button-small button-primary" to="/register">Get started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=2200&q=85"
            alt="A customer support team working together around a table"
            fetchPriority="high"
          />
          <div className="hero-overlay" />
          <div className="hero-content page-width">
            <div className="hero-copy">
              <p className="eyebrow hero-eyebrow"><span /> Support that follows through</p>
              <h1 id="hero-title">CareConnect <span>360</span></h1>
              <p className="hero-tagline">Every Complaint Matters.<br />Every Customer Deserves Care.</p>
              <p className="hero-description">A clearer way to raise concerns, get human support, and see what happens next.</p>
              <div className="hero-actions">
                <Link className="button button-hero" to="/register">Get started <ArrowRight size={18} /></Link>
                <Link className="hero-text-link" to="/login">I already have an account</Link>
              </div>
            </div>
            <div className="hero-note" aria-label="Service commitment">
              <span className="hero-note-icon"><HeartHandshake size={21} /></span>
              <span><strong>People first, at every step</strong><small>Clear updates. Thoughtful follow-through.</small></span>
            </div>
          </div>
          <a className="hero-scroll" href="#services"><span /> Explore the platform</a>
        </section>

        <section className="trust-strip" aria-label="Platform principles">
          <div className="trust-strip-inner page-width">
            <span><ShieldCheck size={17} /> Private by design</span>
            <span><MessageCircleMore size={17} /> Human support when it matters</span>
            <span><BookOpenCheck size={17} /> Guidance with sources</span>
          </div>
        </section>

        <section className="section services-section" id="services">
            <div className="page-width" id="about">
            <div className="section-heading">
              <div>
                <p className="eyebrow">A better support experience</p>
                <h2>From first message<br className="desktop-break" /> to meaningful resolution.</h2>
              </div>
              <p className="section-intro">The right support should feel connected, understandable, and accountable. CareConnect 360 brings the parts of that experience together.</p>
            </div>
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, description, tone }) => (
                <article className="feature-item" key={title}>
                  <span className={`feature-icon tone-${tone}`}><Icon size={20} strokeWidth={1.8} /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="feature-rule" aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section process-section" id="how-it-works">
          <div className="page-width process-layout">
            <div className="process-intro">
              <p className="eyebrow">Simple by design</p>
              <h2>Know where you stand.<br />Know what comes next.</h2>
              <p>No chasing through disconnected channels. Your support journey stays visible from the first report through follow-up.</p>
              <Link className="inline-link" to="/register">Start a conversation <ArrowRight size={17} /></Link>
            </div>
            <div className="step-list">
              {steps.map(([number, title, description]) => (
                <article className="step-item" key={number}>
                  <span className="step-number">{number}</span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                  <ArrowRight className="step-arrow" size={18} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="impact-section" id="impact">
          <div className="page-width impact-layout">
            <div className="impact-copy">
              <p className="eyebrow eyebrow-light">Accountability, not inflated claims</p>
              <h2>Measure what matters.<br />Show how it was counted.</h2>
              <p>Service outcomes and community outreach belong in the same conversation, but not in the same unverified number.</p>
            </div>
            <div className="impact-data">
              <div className="demo-label"><span /> Illustration only · demonstration figures</div>
              <div className="demo-metric"><strong>—</strong><span>Service outcomes<br />Awaiting verified records</span></div>
              <div className="demo-metric"><strong>—</strong><span>Community reach<br />Awaiting evidence-backed activities</span></div>
              <p className="impact-footnote">Live reporting will use authorized application data. No impact statistics are asserted on this preview.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-main">
          <div className="footer-brand-block">
            <Brand />
            <p>Every complaint matters.<br />Every customer deserves care.</p>
          </div>
          <div className="footer-links">
            <div><h2>Explore</h2><a href="#about">About CareConnect</a><a href="#services">What we do</a><a href="#how-it-works">How it works</a></div>
            <div><h2>Account</h2><Link to="/login">Sign in</Link><Link to="/register">Get started</Link><Link to="/forgot-password">Reset password</Link></div>
            <div><h2>Information</h2><a href="#contact-info">Contact</a><a href="#policy-notice">Privacy</a><a href="#policy-notice">Terms</a></div>
          </div>
        </div>
        <div className="page-width footer-bottom"><span>© {new Date().getFullYear()} CareConnect 360</span><span id="contact-info">Contact details are not configured for this preview.</span><span id="policy-notice">Privacy and terms will be published before account services are enabled.</span></div>
      </footer>
    </div>
  );
}