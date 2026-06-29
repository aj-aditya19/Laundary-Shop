import { workflowSteps } from '../../data';
import { CheckCircle } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section how-section">
      <div className="container">
        <div className="text-center">
          <span className="section-label">Simple Process</span>
          <h2 className="section-title">How It <span>Works</span></h2>
          <p className="section-desc" style={{ margin: '0 auto 48px' }}>
            From drop-off to pickup — a seamless, transparent 7-step process.
          </p>
        </div>

        {/* Desktop timeline (hidden on mobile via CSS) */}
        <div className="timeline" style={{ position: 'relative' }}>
          <div className="timeline-line" />

          {workflowSteps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={step.step} className="timeline-item">
                {/* Left card */}
                {isLeft ? (
                  <div className="timeline-card" style={{ marginRight: 24, marginLeft: 'auto' }}>
                    <div className="timeline-card-header">
                      <span className="timeline-card-emoji">{step.icon}</span>
                      <div>
                        <div className="timeline-card-step">Step {step.step}</div>
                        <div className="timeline-card-title">{step.title}</div>
                      </div>
                    </div>
                    <p className="timeline-card-desc">{step.desc}</p>
                    {step.highlight && (
                      <span className="timeline-card-highlight">{step.highlight}</span>
                    )}
                  </div>
                ) : (
                  <div className="timeline-spacer" />
                )}

                {/* Center dot */}
                <div
                  className="timeline-dot"
                  style={{ borderColor: step.color, color: step.color, backgroundColor: `${step.color}18` }}
                >
                  {step.step}
                </div>

                {/* Right card */}
                {!isLeft ? (
                  <div className="timeline-card" style={{ marginLeft: 24 }}>
                    <div className="timeline-card-header">
                      <span className="timeline-card-emoji">{step.icon}</span>
                      <div>
                        <div className="timeline-card-step">Step {step.step}</div>
                        <div className="timeline-card-title">{step.title}</div>
                      </div>
                    </div>
                    <p className="timeline-card-desc">{step.desc}</p>
                    {step.highlight && (
                      <span className="timeline-card-highlight">{step.highlight}</span>
                    )}
                  </div>
                ) : (
                  <div className="timeline-spacer" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile timeline (shown on mobile via CSS) */}
        <div className="timeline-mobile">
          {workflowSteps.map(step => (
            <div key={step.step} className="timeline-mobile-item">
              <div
                className="timeline-mobile-dot"
                style={{ borderColor: step.color, color: step.color }}
              >
                {step.step}
              </div>
              <div className="timeline-mobile-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.3rem' }}>{step.icon}</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text)' }}>{step.title}</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.desc}</p>
                {step.highlight && (
                  <span className="timeline-card-highlight" style={{ marginTop: 8 }}>{step.highlight}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
