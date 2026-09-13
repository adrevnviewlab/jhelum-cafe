export default function Icon({ name = 'arrow', className = '' }) {
  return <svg className={`ui-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'close' ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M6 18 18 6M6 6h12v12" />}
  </svg>;
}
