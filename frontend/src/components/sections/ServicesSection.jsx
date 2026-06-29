import { useState } from 'react';
import { services } from '../../data';

const TABS = [
  { key: 'men',       label: "Men's",    emoji: '👔' },
  { key: 'women',     label: "Women's",  emoji: '👗' },
  { key: 'household', label: 'Household', emoji: '🏠' },
];

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState('men');

  return (
    <section id="services" className="section services-section">
      <div className="container">
        <div className="text-center">
          <span className="section-label">What We Clean</span>
          <h2 className="section-title">Our <span>Services</span></h2>
          <p className="section-desc" style={{ margin: '0 auto 40px' }}>
            Professional cleaning for every garment type, handled with precision and care.
          </p>
        </div>

        {/* Tabs */}
        <div className="services-tabs">
          <div className="services-tab-bar">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="services-grid">
          {services[activeTab].map(service => (
            <div key={service.id} className="service-card">
              <div className="service-card-emoji">{service.icon}</div>
              <div className="service-card-name">{service.name}</div>
              <div className="service-card-footer">
                <div>
                  <span className="service-card-price">₹{service.price}</span>
                  <span className="service-card-price-unit">/ piece</span>
                </div>
                <div className="service-card-time">
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Ready in</div>
                  {service.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="services-cta">
          <p>Don't see your item? We clean almost anything.</p>
          <a href="#contact">Contact us for custom pricing →</a>
        </div>
      </div>
    </section>
  );
}
