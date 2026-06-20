// src/data/index.js - All static content

export const services = {
  men: [
    { id: 1, name: 'Shirts', icon: '👔', price: 40, time: '2-3 days', category: 'men' },
    { id: 2, name: 'T-Shirts', icon: '👕', price: 30, time: '2-3 days', category: 'men' },
    { id: 3, name: 'Trousers', icon: '👖', price: 50, time: '2-3 days', category: 'men' },
    { id: 4, name: 'Jackets', icon: '🧥', price: 120, time: '3-4 days', category: 'men' },
    { id: 5, name: 'Suits', icon: '🤵', price: 250, time: '4-5 days', category: 'men' },
  ],
  women: [
    { id: 6, name: 'Saree', icon: '🥻', price: 150, time: '3-4 days', category: 'women' },
    { id: 7, name: 'Lehenga', icon: '👗', price: 300, time: '4-5 days', category: 'women' },
    { id: 8, name: 'Gown', icon: '👘', price: 200, time: '3-4 days', category: 'women' },
    { id: 9, name: 'Kurti', icon: '🫱', price: 60, time: '2-3 days', category: 'women' },
    { id: 10, name: 'Dresses', icon: '💃', price: 80, time: '2-3 days', category: 'women' },
  ],
  household: [
    { id: 11, name: 'Bedsheets', icon: '🛏️', price: 80, time: '2-3 days', category: 'household' },
    { id: 12, name: 'Blankets', icon: '🧣', price: 150, time: '3-4 days', category: 'household' },
    { id: 13, name: 'Curtains', icon: '🏠', price: 100, time: '3-4 days', category: 'household' },
  ],
};

export const workflowSteps = [
  { step: 1, title: 'Bring Clothes to Shop', desc: 'Visit our shop with your garments. No pickup needed.', icon: '🏪', color: '#38BDF8' },
  { step: 2, title: 'Receive Unique Tag ID', desc: 'Get a unique Tag ID like DC-2026-1203 for tracking.', icon: '🏷️', color: '#06B6D4', highlight: 'DC-2026-1203' },
  { step: 3, title: 'Bill Generated', desc: 'Detailed digital bill sent to your email instantly.', icon: '📋', color: '#8B5CF6' },
  { step: 4, title: 'Garments Processed', desc: 'Professional washing, dry cleaning & ironing begins.', icon: '✨', color: '#10B981' },
  { step: 5, title: 'Quality Check', desc: 'Every garment inspected before packaging.', icon: '🔍', color: '#F59E0B' },
  { step: 6, title: 'Ready Notification Sent', desc: 'Email & WhatsApp notification when clothes are ready.', icon: '🔔', color: '#EF4444' },
  { step: 7, title: 'Customer Collects Clothes', desc: 'Visit shop, pay & collect your fresh garments.', icon: '✅', color: '#10B981' },
];

export const features = [
  { id: 1, title: 'Digital Tag System', desc: 'Unique QR-enabled tag for every order', icon: '🏷️' },
  { id: 2, title: 'E-Billing', desc: 'Instant PDF invoices via email', icon: '🧾' },
  { id: 3, title: 'Garment Photos', desc: 'Before photos for full transparency', icon: '📸' },
  { id: 4, title: 'Condition Reports', desc: 'Detailed pre-existing damage records', icon: '📋' },
  { id: 5, title: 'Email Notifications', desc: 'Real-time updates at every stage', icon: '📧' },
  { id: 6, title: 'WhatsApp Alerts', desc: 'Instant WhatsApp when ready for pickup', icon: '💬' },
  { id: 7, title: 'Status Tracking', desc: 'Live 7-stage order progress tracking', icon: '📍' },
  { id: 8, title: 'QR Payments', desc: 'Scan & pay with Google Pay / UPI', icon: '📱' },
  { id: 9, title: 'Order History', desc: 'Complete lifetime order records', icon: '📂' },
  { id: 10, title: 'Customer Dashboard', desc: 'Personal portal to manage everything', icon: '🖥️' },
];

export const faqs = [
  { q: 'How do I track my order?', a: 'Use the Tag ID (e.g., DC-2026-1203) on our Track Order page. Enter the tag and see real-time status instantly.' },
  { q: 'How long does dry cleaning take?', a: 'Normal service takes 3–5 working days. Express service is available in 1–2 days for select items at an additional charge.' },
  { q: 'Do you offer home pickup?', a: 'Currently we do not offer home pickup. Customers must visit our shop to drop off and collect garments.' },
  { q: 'What if my garment is damaged?', a: 'We photograph all garments and record conditions on arrival. This protects both you and us. Pre-existing damage is always documented.' },
  { q: 'How will I know when my clothes are ready?', a: 'You receive both an email and WhatsApp notification the moment your order is marked ready.' },
  { q: 'What payment methods do you accept?', a: 'We accept cash and digital payments via Google Pay / UPI QR code. Payment is collected on pickup.' },
  { q: 'Can I get an invoice for my order?', a: 'Yes! A detailed digital invoice with item breakdown is generated automatically and emailed to you.' },
  { q: 'What is your policy on unclaimed garments?', a: 'Garments uncollected after 30 days of the ready notification will attract a storage fee. After 90 days, garments may be donated.' },
];

export const testimonials = [
  { name: 'Priya Sharma', role: 'Regular Customer', text: 'The digital tracking system is a game-changer. I love getting WhatsApp notifications when my sarees are ready!', rating: 5, avatar: 'PS' },
  { name: 'Rahul Mehra', role: 'Business Professional', text: 'My suits always come back impeccably pressed. The garment photo system gave me complete confidence in their service.', rating: 5, avatar: 'RM' },
  { name: 'Anita Verma', role: 'Homemaker', text: 'The condition reports are brilliant. They documented a small stain on my lehenga before cleaning — total transparency!', rating: 5, avatar: 'AV' },
  { name: 'Suresh Kumar', role: 'Hotel Manager', text: 'We use Sparkle for all our hotel linen. The bulk service and e-billing makes our accounts department very happy.', rating: 5, avatar: 'SK' },
  { name: 'Deepika Nair', role: 'Fashion Designer', text: 'They handle my delicate designer pieces with exceptional care. The before-photos and condition reports are reassuring.', rating: 5, avatar: 'DN' },
];

export const shopInfo = {
  name: 'Sparkle Dry Cleaners',
  address: '123 Clean Street, Market Complex, Your City – 248001',
  phone: '+91-XXXXXXXXXX',
  email: 'info@sparkledrycleaner.com',
  whatsapp: '91XXXXXXXXXX',
  hours: {
    weekdays: '9:00 AM – 8:00 PM',
    saturday: '9:00 AM – 8:00 PM',
    sunday: '10:00 AM – 6:00 PM',
  },
  completion: {
    normal: '3–5 Working Days',
    express: '1–2 Working Days',
  },
};

export const garmentTypes = [
  { value: 'shirt', label: 'Shirt', category: 'men', basePrice: 40 },
  { value: 'tshirt', label: 'T-Shirt', category: 'men', basePrice: 30 },
  { value: 'trouser', label: 'Trouser', category: 'men', basePrice: 50 },
  { value: 'jacket', label: 'Jacket', category: 'men', basePrice: 120 },
  { value: 'suit', label: 'Suit (2pc)', category: 'men', basePrice: 250 },
  { value: 'saree', label: 'Saree', category: 'women', basePrice: 150 },
  { value: 'lehenga', label: 'Lehenga', category: 'women', basePrice: 300 },
  { value: 'gown', label: 'Gown', category: 'women', basePrice: 200 },
  { value: 'kurti', label: 'Kurti', category: 'women', basePrice: 60 },
  { value: 'dress', label: 'Dress', category: 'women', basePrice: 80 },
  { value: 'bedsheet', label: 'Bedsheet', category: 'household', basePrice: 80 },
  { value: 'blanket', label: 'Blanket', category: 'household', basePrice: 150 },
  { value: 'curtain', label: 'Curtain (per panel)', category: 'household', basePrice: 100 },
];

export const orderStatuses = [
  { key: 'received', label: 'Received', color: '#38BDF8', bg: 'bg-sky-500/20 text-sky-300' },
  { key: 'washing', label: 'Washing', color: '#8B5CF6', bg: 'bg-violet-500/20 text-violet-300' },
  { key: 'dry_cleaning', label: 'Dry Cleaning', color: '#06B6D4', bg: 'bg-cyan-500/20 text-cyan-300' },
  { key: 'ironing', label: 'Ironing', color: '#F59E0B', bg: 'bg-amber-500/20 text-amber-300' },
  { key: 'quality_check', label: 'Quality Check', color: '#EC4899', bg: 'bg-pink-500/20 text-pink-300' },
  { key: 'ready', label: 'Ready', color: '#10B981', bg: 'bg-emerald-500/20 text-emerald-300' },
  { key: 'delivered', label: 'Delivered', color: '#6EE7B7', bg: 'bg-emerald-900/40 text-emerald-400' },
];
