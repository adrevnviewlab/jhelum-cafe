import Icon from './Icon';

export default function CafeHeader({ openMenu, openOrder, openCart, cartCount, menuOpen }) {
  return <>
    <a className="skip-link" href="#menu">Skip to menu</a>
    <header className="cafe-header">
      <nav className="header-nav header-nav--left" aria-label="Explore the cafe">
        <button type="button" className="header-menu-button" onClick={openMenu} aria-expanded={menuOpen} aria-controls="menu-drawer">Menu</button><a className="header-story" href="#beginning">Our story</a>
      </nav>
      <a className="cafe-wordmark" href="#top" aria-label="Jehlum Cafe — home">
        <svg className="brand-seal" viewBox="0 0 48 54" fill="none" aria-hidden="true">
          <path d="M5 47V23a19 19 0 0 1 38 0v24" stroke="currentColor" strokeWidth="1" />
          <path d="m10 27 9-12 6 8 5-6 8 10M10 30h9m12 0h7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M25 27c-11 6 11 7 0 13s-8 8-4 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10 50h5m13 0h10" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span><strong>Jehlum</strong><small>Cafe <i aria-hidden="true" /> Brooklyn</small></span>
      </a>
      <nav className="header-nav header-nav--right" aria-label="Plan your visit">
        <a href="#visit">Visit us</a>
        <button type="button" className="header-order" onClick={openOrder}>Order online <Icon /></button>
        <button type="button" className="header-cart" onClick={openCart} aria-label={`Open cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}><Icon name="bag" /><span aria-live="polite">{cartCount}</span></button>
      </nav>
    </header>
  </>;
}
