export default function Icon({ name = 'arrow', className = '' }) {
  return <svg className={`ui-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'close' && <path d="m6 6 12 12M6 18 18 6" />}
    {name === 'plus' && <path d="M12 5v14M5 12h14" />}
    {name === 'minus' && <path d="M5 12h14" />}
    {name === 'bag' && <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>}
    {name === 'check' && <path d="m5 12 4 4L19 6" />}
    {name === 'arrow' && <path d="M6 18 18 6M6 6h12v12" />}
    {name === 'menu' && <path d="M5 7h14M5 12h14M5 17h10" />}
    {name === 'order' && <><path d="M7 4h10v16l-2.2-1.4L12 20l-2.8-1.4L7 20V4Z" /><path d="M10 9h4M10 13h4" /></>}
    {name === 'map' && <><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" /><circle cx="12" cy="10" r="2.2" /></>}
  </svg>;
}
