import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="font-display font-bold text-[120px] leading-none gradient-text opacity-20 select-none">404</div>
        <div className="text-6xl mb-6 -mt-8">🔍</div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-white/40 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">← Go Home</Link>
          <Link to="/track" className="btn-ghost">Track an Order</Link>
        </div>
      </motion.div>
    </div>
  );
}
