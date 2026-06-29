import { useState } from 'react';
import { features, faqs, testimonials, shopInfo } from '../../data';
import { Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle } from 'lucide-react';

/* ---- Garment Safety Section ---- */
export function GarmentSafetySection() {
  const cards = [
    { emoji: '📸', title: 'Before Photos',      desc: 'Every garment photographed on arrival' },
    { emoji: '📋', title: 'Condition Report',   desc: 'Stains, tears & damage documented' },
    { emoji: '🧾', title: 'Digital Bill',       desc: 'Instant itemized invoice via email' },
    { emoji: '🔔', title: 'Ready Notification', desc: 'Email + WhatsApp when ready' },
  ];

  const checkItems = [
    'Photos taken of every garment on arrival',
    'Pre-existing conditions recorded in detail',
    'Secure digital records stored for 1 year',
    'Evidence shared directly with customer',
  ];

  return (
    <section className="section safety-section">
      <div className="container">
        <div className="safety-inner">
          {/* Left */}
          <div>
            <span className="section-label">Full Transparency</span>
            <h2 className="section-title">
              Your Garments Are<br /><span>Safe With Us</span>
            </h2>
            <p style={{ marginBottom: 8, maxWidth: 460 }}>
              We document every garment's condition before we touch it. Photos, condition reports,
              and digital records are shared with you — because transparency builds trust.
            </p>
            <div className="safety-checklist">
              {checkItems.map((item, i) => (
                <div key={i} className="safety-check-item">
                  <span className="safety-check-icon"><CheckCircle size={18} /></span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — cards grid */}
          <div className="safety-cards">
            {cards.map((card, i) => (
              <div key={i} className="safety-card">
                <div className="safety-card-emoji">{card.emoji}</div>
                <div className="safety-card-title">{card.title}</div>
                <p className="safety-card-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Features Section ---- */
export function FeaturesSection() {
  return (
    <section className="section features-section">
      <div className="container">
        <div className="text-center">
          <span className="section-label">Everything You Need</span>
          <h2 className="section-title">Packed With <span>Features</span></h2>
          <p className="section-desc" style={{ margin: '0 auto 40px' }}>
            A complete digital laundry experience from drop-off to delivery.
          </p>
        </div>
        <div className="features-grid">
          {features.map(feat => (
            <div key={feat.id} className="feature-card">
              <div className="feature-card-emoji">{feat.icon}</div>
              <div className="feature-card-title">{feat.title}</div>
              <p className="feature-card-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Testimonials Section ---- */
export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <section className="section testimonials-section">
      <div className="container">
        <div className="text-center">
          <span className="section-label">What Customers Say</span>
          <h2 className="section-title">Trusted by <span>Thousands</span></h2>
        </div>

        <div className="testimonial-card" style={{ marginTop: 40 }}>
          <div className="testimonial-stars">
            {'★'.repeat(t.rating)}
          </div>
          <p className="testimonial-text">"{t.text}"</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">{t.avatar}</div>
            <div>
              <div className="testimonial-name">{t.name}</div>
              <div className="testimonial-role">{t.role}</div>
            </div>
          </div>
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonial-dot ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- FAQ Section ---- */
export function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="section faq-section">
      <div className="container">
        <div className="text-center">
          <span className="section-label">Have Questions?</span>
          <h2 className="section-title">Frequently <span>Asked</span></h2>
        </div>

        <div className="faq-list" style={{ marginTop: 40 }}>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <span className="faq-icon">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="faq-answer">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Contact Section ---- */
export function ContactSection() {
  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="text-center">
          <span className="section-label">Find Us</span>
          <h2 className="section-title">Visit Our <span>Shop</span></h2>
        </div>

        <div className="contact-cards" style={{ marginTop: 40 }}>
          {/* Phone */}
          <div className="contact-card">
            <div className="contact-card-header">
              <div className="contact-card-icon-wrap"><Phone size={18} /></div>
              <div className="contact-card-label">Phone</div>
            </div>
            <p>{shopInfo.phone}</p>
            <a
              href={`https://wa.me/${shopInfo.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={15} />
              WhatsApp Us
            </a>
          </div>

          {/* Hours */}
          <div className="contact-card">
            <div className="contact-card-header">
              <div className="contact-card-icon-wrap"><Clock size={18} /></div>
              <div className="contact-card-label">Working Hours</div>
            </div>
            <div className="contact-hours-row">
              <span className="label">Mon–Sat</span>
              <span className="value">{shopInfo.hours.weekdays}</span>
            </div>
            <div className="contact-hours-row">
              <span className="label">Sunday</span>
              <span className="value">{shopInfo.hours.sunday}</span>
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div className="contact-hours-row">
                <span className="label">Normal</span>
                <span className="value highlight">{shopInfo.completion.normal}</span>
              </div>
              <div className="contact-hours-row">
                <span className="label">Express</span>
                <span className="value highlight">{shopInfo.completion.express}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="contact-card">
            <div className="contact-card-header">
              <div className="contact-card-icon-wrap"><MapPin size={18} /></div>
              <div className="contact-card-label">Address</div>
            </div>
            <p style={{ marginBottom: 8 }}>{shopInfo.address}</p>
            <p style={{ fontSize: '0.82rem' }}>{shopInfo.email}</p>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="contact-map-placeholder">
          <MapPin size={28} />
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Interactive map coming soon</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(shopInfo.address)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---- Footer ---- */
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">✨</div>
              <span className="footer-logo-text">Sparkle Dry Cleaners</span>
            </div>
            <p className="footer-tagline">
              Premium professional dry cleaning and laundry services with complete digital transparency.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div className="footer-col-title">Quick Links</div>
            <ul className="footer-links">
              {['Services', 'How It Works', 'Track Order', 'Contact'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <div className="footer-col-title">Account</div>
            <ul className="footer-links">
              {['Sign In', 'Register', 'Dashboard', 'My Orders'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="footer-col-title">Contact</div>
            <ul className="footer-links">
              <li><a href={`tel:${shopInfo.phone}`}>{shopInfo.phone}</a></li>
              <li><a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a></li>
              <li style={{ color: '#9aabb8', fontSize: '0.86rem', lineHeight: 1.5 }}>{shopInfo.address}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Sparkle Dry Cleaners. All rights reserved.</p>
          <p>Professional Laundry &amp; Dry Cleaning Services</p>
        </div>
      </div>
    </footer>
  );
}
