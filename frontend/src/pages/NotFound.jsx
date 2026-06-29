import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-inner">
        <div className="notfound-code">404</div>
        <div className="notfound-emoji">🔍</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">← Go Home</Link>
          <Link to="/track" className="btn btn-ghost">Track an Order</Link>
        </div>
      </div>
    </div>
  );
}
