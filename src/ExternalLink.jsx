import Icon from './Icon';

export default function ExternalLink({ children, className = '', ...props }) {
  return <a {...props} className={`external-link ${className}`} target="_blank" rel="noopener noreferrer">
    {children}<Icon className="external-link-icon" /><span className="sr-only"> (opens in a new tab)</span>
  </a>;
}
