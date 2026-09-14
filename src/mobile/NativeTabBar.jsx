import Icon from '../Icon';
import ExternalLink from '../ExternalLink';
import { cafe } from '../menuData';
import { SpringButton } from '../Spring';
import { directHref } from '../useCafeRoute';

const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cafe.address)}`;

export default function NativeTabBar({ page, cartCount }) {
  return <nav className="mobile-nav native-tabbar" aria-label="Cafe">
    <SpringButton as="a" href="#menu" aria-current={page === 'menu' ? 'page' : undefined} hover={{ scale: 1.06 }} tap={{ scale: 0.94 }}>
      <Icon name="menu" />
      <span>Menu</span>
    </SpringButton>
    <SpringButton as="a" className="mobile-order" href={directHref(cartCount)} hover={{ scale: 1.06 }} tap={{ scale: 0.94 }}>
      <Icon name="order" />
      <span>Direct</span>
    </SpringButton>
    <ExternalLink className="native-tabbar-directions" href={mapUrl}>
      <Icon name="map" />
      <span>Directions</span>
    </ExternalLink>
    <SpringButton as="a" className="mobile-cart" href="#cart" aria-current={page === 'cart' ? 'page' : undefined} aria-label={`Your order, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`} hover={{ scale: 1.06 }} tap={{ scale: 0.94 }}>
      <Icon name="bag" />
      <span>Cart</span>
      <b className="native-tabbar-count" aria-live="polite">{cartCount}</b>
    </SpringButton>
  </nav>;
}
