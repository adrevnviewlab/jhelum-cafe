import Icon from './Icon';
import { directHref } from './useCafeRoute';
import { SpringButton } from './Spring';

export default function CafeHeader({ page, cartCount }) {
  const skip = page === 'checkout'
    ? { href: '#checkout', label: 'Skip to checkout' }
    : page === 'cart'
      ? { href: '#cart', label: 'Skip to your order' }
      : { href: '#menu', label: 'Skip to menu' };
  return <>
    <a className="skip-link" href={skip.href}>{skip.label}</a>
    <header className="cafe-header">
      <nav className="header-nav header-nav--left" aria-label="Explore the cafe">
        <a className="header-menu-button" href="#menu" aria-current={page === 'menu' ? 'page' : undefined}>Menu</a>
        <a className="header-story" href="#beginning">Our story</a>
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
        <SpringButton as="a" className="header-order" href={directHref(cartCount)}>{cartCount ? 'Checkout' : 'Jhelum Direct'} <Icon /></SpringButton>
        <SpringButton as="a" className="header-cart" href="#cart" aria-current={page === 'cart' ? 'page' : undefined} aria-label={`Your order, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}><Icon name="bag" /><span aria-live="polite">{cartCount}</span></SpringButton>
      </nav>
    </header>
  </>;
}
