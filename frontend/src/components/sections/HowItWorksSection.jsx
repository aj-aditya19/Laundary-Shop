import { motion } from 'framer-motion';
import { workflowSteps } from '../../data';

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-navy-900/50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(56,189,248,1) 1px, transparent 0)',
        backgroundSize: '48px 48px'
      }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-label mb-3">Simple Process</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            From drop-off to pickup — a seamless, transparent 7-step process.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-sky-500/50 via-cyan-500/30 to-transparent -translate-x-1/2 hidden md:block" />

          <div className="space-y-8">
            {workflowSteps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex items-center gap-6 md:gap-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Card */}
                  <div className={`flex-1 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                    <div className={`glass-card p-6 inline-block max-w-sm group hover:border-sky-500/30 transition-all duration-300 ${isLeft ? 'md:ml-auto' : ''}`}>
                      <div className="flex items-center gap-3 mb-3" style={{ flexDirection: isLeft ? 'row-reverse' : 'row' }}>
                        <span className="text-3xl">{step.icon}</span>
                        <div>
                          <div className="text-white/30 text-xs font-mono">Step {step.step}</div>
                          <h3 className="font-display font-bold text-white text-lg leading-tight">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-white/50 text-sm">{step.desc}</p>
                      {step.highlight && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-1.5">
                          <span className="text-sky-400 font-mono font-bold text-sm">{step.highlight}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="relative flex-shrink-0 w-12 h-12 hidden md:flex items-center justify-center">
                    <motion.div
                      whileInView={{ scale: [0, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold font-display z-10"
                      style={{ borderColor: step.color, background: `${step.color}18`, color: step.color }}
                    >
                      {step.step}
                    </motion.div>
                    <div className="absolute inset-0 rounded-full blur-sm" style={{ background: `${step.color}20` }} />
                  </div>

                  {/* Mobile: step number */}
                  <div className="md:hidden flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold font-display"
                    style={{ borderColor: step.color, color: step.color }}>
                    {step.step}
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
