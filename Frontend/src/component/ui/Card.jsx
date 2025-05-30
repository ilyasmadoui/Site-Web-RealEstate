import "../ui/Card.scss";

export function Card({ children, className }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardContent({ children }) {
  return <div className="card-content">{children}</div>;
}
