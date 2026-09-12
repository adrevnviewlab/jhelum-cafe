export default function CafeHeader({ open }) {
  return <>
    <a className="skip-link" href="#menu">Skip to menu</a>
    <header className="cafe-header">
      <nav className="header-nav header-nav--left" aria-label="Explore the cafe">
        <a href="#menu">Menu</a><a className="header-story" href="#beginning">Our story</a>
      </nav>
      <a className="cafe-wordmark" href="#top" aria-label="Jehlum Cafe — home">
        <svg className="brand-seal" viewBox="0 0 48 54" fill="none" aria-hidden="true">
          <path d="M5 47V23a19 19 0 0 1 38 0v24" stroke="currentColor" strokeWidth="1" />
          <path d="m10 27 9-12 6 8 5-6 8 10M10 30h9m12 0h7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M25 27c-11 6 11 7 0 13s-8 8-4 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10 50h5m13 0h10" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span><strong>Jehlum</strong><small>C A F E <i /> B R O O K L Y N</small></span>
      </a>
      <nav className="header-nav header-nav--right" aria-label="Plan your visit">
        <a href="#visit">Visit us</a><button onClick={() => open('pickup')}>Order online <span aria-hidden="true">↗</span></button>
      </nav>
    </header>
  </>;
}
