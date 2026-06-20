import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { features, faqs, testimonials, shopInfo } from '../../data';
import { ChevronDown, Phone, Mail, MapPin, MessageCircle, Star, Clock, CheckCircle } from 'lucide-react';

// Garment Safety Section
export function GarmentSafetySection() {
  const cards = [
    { icon: '📸', title: 'Before Photos', desc: 'Every garment photographed on arrival', color: '#38BDF8' },
    { icon: '📋', title: 'Condition Report', desc: 'Stains, tears & damage documented', color: '#8B5CF6' },
    { icon: '🧾', title: 'Digital Bill', desc: 'Instant itemized invoice via email', color: '#10B981' },
    { icon: '🔔', title: 'Ready Notification', desc: 'Email + WhatsApp when ready', color: '#F59E0B' },
  ];

  return (
    <section className="py-24 bg-navy-950 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="section-label mb-3">Full Transparency</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Your Garments Are<br /><span className="gradient-text">Safe With Us</span>
            </h2>
            <p className="text-white/50 text-lg mb-8 leading-relaxed">
              We document every garment's condition before we touch it. Photos, condition reports, and digital records are shared with you — because transparency builds trust.
            </p>

            <div className="space-y-4">
              {['Photos taken of every garment on arrival', 'Pre-existing conditions recorded in detail', 'Secure digital records stored for 1 year', 'Evidence shared directly with customer'].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle size={18} className="text-sky-400 flex-shrink-0" />
                  <span className="text-white/70">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: 'spring' }}
                className={`glass-card p-6 hover:scale-[1.03] transition-all duration-300 ${i === 1 || i === 2 ? 'mt-6' : ''}`}
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-display font-bold text-white text-base mb-1">{card.title}</h3>
                <p className="text-white/40 text-sm">{card.desc}</p>
                <div className="mt-4 h-0.5 rounded-full" style={{ background: `linear-gradient(to right, ${card.color}, transparent)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
export function FeaturesSection() {
  return (
    <section className="py-24 bg-navy-900/30 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="section-label mb-3">Everything You Need</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Packed With <span className="gradient-text">Features</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5 text-center hover:border-sky-500/30 hover:bg-sky-500/5 transition-all duration-300 group cursor-default"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">{feat.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1">{feat.title}</h3>
              <p className="text-white/35 text-xs leading-snug">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials
export function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-24 bg-navy-950 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="section-label mb-3">What Customers Say</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Trusted by <span className="gradient-text">Thousands</span>
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 md:p-12 text-center mb-8"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(testimonials[active].rating)].map((_, i) => (
                <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 italic max-w-2xl mx-auto">
              "{testimonials[active].text}"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center font-bold text-white">
                {testimonials[active].avatar}
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">{testimonials[active].name}</div>
                <div className="text-white/40 text-sm">{testimonials[active].role}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${i === active ? 'w-8 h-2 bg-sky-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ
export function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-24 bg-navy-900/30 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="section-label mb-3">Have Questions?</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently <span className="gradient-text">Asked</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors"
              >
                <span className="font-medium text-white">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={18} className="text-sky-400 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Shop Info + Contact
export function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-navy-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="section-label mb-3">Find Us</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Visit Our <span className="gradient-text">Shop</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Phone size={18} className="text-sky-400" />
              </div>
              <h3 className="font-semibold text-white">Phone</h3>
            </div>
            <p className="text-white/60 text-sm mb-3">{shopInfo.phone}</p>
            <a href={`https://wa.me/${shopInfo.whatsapp}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              <MessageCircle size={16} />
              WhatsApp Us
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Clock size={18} className="text-violet-400" />
              </div>
              <h3 className="font-semibold text-white">Working Hours</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-white/40">Mon–Sat</span><span className="text-white/70">{shopInfo.hours.weekdays}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Sunday</span><span className="text-white/70">{shopInfo.hours.sunday}</span></div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex justify-between"><span className="text-white/40">Normal</span><span className="text-sky-400 text-xs">{shopInfo.completion.normal}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Express</span><span className="text-amber-400 text-xs">{shopInfo.completion.express}</span></div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <MapPin size={18} className="text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white">Address</h3>
            </div>
            <p className="text-white/60 text-sm mb-3">{shopInfo.address}</p>
            <p className="text-white/40 text-xs">{shopInfo.email}</p>
          </motion.div>
        </div>

        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden h-48 flex items-center justify-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-cyan-500/5" />
          <div className="text-center relative z-10">
            <MapPin size={32} className="text-sky-400 mx-auto mb-2" />
            <p className="text-white/50 text-sm">Interactive map coming soon</p>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(shopInfo.address)}`} target="_blank" rel="noreferrer"
              className="text-sky-400 text-sm hover:text-sky-300 transition-colors mt-1 block underline underline-offset-4">
              Open in Google Maps →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-sm">✨</div>
              <span className="font-display font-bold text-white text-lg">Sparkle Dry Cleaners</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Premium professional dry cleaning and laundry services with complete digital transparency.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              {['Services', 'How It Works', 'Track Order', 'Contact'].map(l => (
                <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 tracking-wide">Account</h4>
            <ul className="space-y-2 text-white/40 text-sm">
              {['Sign In', 'Register', 'Dashboard', 'My Orders'].map(l => (
                <li key={l}><a href="#" className="hover:text-white/70 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-sm">© {new Date().getFullYear()} Sparkle Dry Cleaners. All rights reserved.</p>
          <p className="text-white/20 text-xs">Professional Laundry & Dry Cleaning Services</p>
        </div>
      </div>
    </footer>
  );
}
