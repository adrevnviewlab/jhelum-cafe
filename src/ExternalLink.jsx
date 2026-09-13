export default function ExternalLink({ children, className = '', ...props }) {
  return <a {...props} className={`external-link ${className}`} target="_blank" rel="noopener noreferrer">
    {children}<span className="external-link-icon" aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
  </a>;
}
