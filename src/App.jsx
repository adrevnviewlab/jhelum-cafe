import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { InfoDialog, MobileNav, Visit } from './CafeUtility';
import { ConfirmDialog, ItemDialog } from './CommercePanels';
import MenuPage, { MenuInvite } from './MenuPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import AdminBoard from './AdminBoard';
import TrackPage from './TrackPage';
import DriverApp from './DriverApp';
import { HomeDirect } from './DirectHome';
import SeoJsonLd from './SeoJsonLd';
import CafeHeader from './CafeHeader';
import Copyright from './Copyright';
import { cafe } from './menuData';
import { track } from './lib/analytics';
import { useMenu } from './MenuProvider';
import WaterRiver from './water/WaterRiver';
import Icon from './Icon';
import useCart from './useCart';
import useCafeRoute, { directHref } from './useCafeRoute';
import { SpringButton, SpringCard } from './Spring';

function MountainScene() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, .16], [0, 260]);
  const scale = useTransform(scrollYProgress, [0, .16], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, .14, .2], [.92, .66, 0]);
  return (
    <motion.figure className="mountain-scene" style={{ y, scale, opacity }}>
      <img src="/mountain-sunset.webp" alt="Golden sunset over snow-capped mountains, a forested valley and a rocky river." width="1783" height="882" fetchPriority="high" />
      <div className="mountain-haze" />
    </motion.figure>
  );
}

function JourneyRail() {
  const { scrollYProgress } = useScroll();
  return (
    <aside className="journey-rail" aria-label="Journey progress">
      <span className="journey-rail__name">Jehlum Cafe</span>
      <i><motion.b style={{ scaleY: scrollYProgress }} /></i>
      <span className="journey-rail__end">Brooklyn</span>
    </aside>
  );
}

function ScenicDecor({ position }) {
  const notes = {
    story: ['At our table', 'Food worth making time for.', 'Breakfast sandwiches, desi chaat and cardamom chai. Familiar dishes, served with the generosity of a Punjabi table.'],
    kitchen: ['The kitchen', 'A little spice. A little comfort.', 'Samosa chaat, masala fries and an anda shami burger. Our desi favourites bring a taste of home to your day.'],
    punjab: ['Our inspiration', 'A culture of hospitality.', 'In Punjab, a meal is an invitation. That spirit shapes our cafe: make room, share the bread, pour another cup.'],
    gathering: ['The daily ritual', 'Stay for chai.', 'A quiet pause after a meal, or a reason to meet in the afternoon. There is always time for one more conversation.'],
  };
  const [label, title, copy] = notes[position] || notes.story;
  return (
    <Reveal className={`editorial-note editorial-note--${position}`}>
      <span>{label}</span><h3>{title}</h3><p>{copy}</p><i aria-hidden="true" />
    </Reveal>
  );
}

function Reveal({ className = "", children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, .16, .72, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, .18, .78, 1], [85, 0, 0, -80]);
  const scale = useTransform(scrollYProgress, [0, .2, .75, 1], [.95, 1, 1, .97]);
  const rotateX = useTransform(scrollYProgress, [0, .4, 1], [8, 0, -5]);
  return <motion.div ref={ref} className={className} style={{ opacity, y, scale, rotateX, transformPerspective: 1200 }}>{children}</motion.div>;
}

function PaperCard({ className = "", dark = false, children }) {
  return <SpringCard className={`paper-card ${dark ? "paper-card--dark" : ""} ${className}`}>{children}<i className="corner-mark" /></SpringCard>;
}

function Label({ children, rust = false }) {
  return <p className={`label ${rust ? "label--rust" : ""}`}>{children}</p>;
}

function ActionArrow() {
  return <span className="action-arrow" aria-hidden="true"><Icon /></span>;
}

function Hero({ cartCount }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, .62, 1], [1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  return (
    <section ref={ref} className="hero scene">
      <MountainScene />
      <motion.div className="hero-copy" style={{ opacity, y }}>
        <Label>Jhelum Direct / Brooklyn</Label>
        <h1 className="brand-title"><span>Jehlum</span><em>Cafe</em></h1>
        <p className="hero-intro">A taste of Jhelum in Brooklyn. Order direct from the cafe.</p>
        <div className="utility-actions hero-actions">
          <SpringButton as="a" className="menu-anchor" href={directHref(cartCount)}>Order Direct <Icon /></SpringButton>
          <SpringButton as="a" className="visit-action" href="#menu">View menu <Icon /></SpringButton>
        </div>
      </motion.div>
      <div className="hero-reeds hero-reeds--left" aria-hidden="true" />
      <div className="hero-reeds hero-reeds--right" aria-hidden="true" />
    </section>
  );
}

function Beginning() {
  return (
    <section id="beginning" tabIndex={-1} className="scene scene--story">
      <ScenicDecor position="story" />
      <Reveal className="placement placement--beginning">
        <PaperCard>
          <Label>01 / The beginning</Label>
          <h2>A taste of<br />Jehlum in<br />Brooklyn</h2>
          <div className="rule" />
          <p>A small room for generous food, long conversations, and the feeling of a river just beyond the window. Here, recipes arrive with their memories still attached.</p>
          <span className="urdu" lang="ur">جہلم</span>
        </PaperCard>
      </Reveal>
      <Reveal className="placement placement--waterline">
        <PaperCard>
          <Label>Jhelum direct / 32°55′N</Label>
          <div className="route-lines" aria-hidden="true"><i /><i /><i /><b /><b /></div>
          <h3>The water keeps a line</h3>
          <p>A river through Punjab, a table on Coney Island Avenue. The distance is real. So is the thread between them: water, spice, language, and the instinct to make room.</p>
          <div className="split-meta"><span>Punjab</span><span>Brooklyn</span></div>
        </PaperCard>
      </Reveal>
    </section>
  );
}

function Kitchen() {
  return (
    <section className="scene scene--kitchen">
      <ScenicDecor position="kitchen" />
      <Reveal className="placement placement--karahi">
        <SpringCard className="menu-card" hover={{ y: -10, rotate: -.4, scale: 1.014 }}>
          <div className="featured-menu-panel"><span>Desi chaska</span><strong>A taste<br /><em>of home.</em></strong><a href="#menu">Explore the menu <Icon /></a></div>
          <div className="menu-copy">
            <Label rust>From the kitchen / 07</Label>
            <h3>Samosa chaat</h3>
            <p>A desi favourite,<br />for a little afternoon comfort.</p>
            <div className="price"><strong>$5.99</strong><span>Desi chaska</span></div>
          </div>
        </SpringCard>
      </Reveal>
      <Reveal className="placement placement--crossing">
        <PaperCard dark>
          <Label>The crossing</Label>
          <h2>From the<br />river to<br />Brooklyn</h2>
          <p>Recipes carried in memory. Spices measured by instinct. A cafe that holds both places at once—Kashmir&apos;s cold water, Punjab&apos;s generous table, Brooklyn&apos;s restless streets.</p>
          <div className="stamp">Brooklyn<br />NY</div>
        </PaperCard>
      </Reveal>
    </section>
  );
}

function PunjabInterlude() {
  return (
    <section className="scene scene--punjab">
      <ScenicDecor position="punjab" />
      <Reveal className="placement placement--fivewaters">
        <div className="chapter-title">
          <Label>Punjab / land of five waters</Label>
          <h2>Where water teaches the land to gather.</h2>
          <p>Jhelum is one current in a much older constellation. Across wheat fields, market roads, courtyards and railway bridges, water has always been a way of finding one another.</p>
        </div>
      </Reveal>
      <Reveal className="placement placement--welcome">
        <PaperCard dark>
          <Label>آؤ جی، بیٹھو</Label>
          <h3>Come, sit.</h3>
          <p>The first language of a Punjabi table is welcome. A chair appears. The roti keeps coming. Tea is already on its way.</p>
          <div className="hospitality-line"><span>Open hands</span><span>Full plates</span></div>
        </PaperCard>
      </Reveal>
      <Reveal className="placement placement--fieldnote">
        <PaperCard>
          <Label>Field note / 06</Label>
          <h3>Mustard at dusk</h3>
          <p>Yellow fields under a copper sky. Smoke from the evening fire. The road home measured in cups of chai.</p>
          <div className="swatch-row" aria-hidden="true"><i /><i /><i /><i /></div>
        </PaperCard>
      </Reveal>
    </section>
  );
}

function Gathering() {
  return (
    <section className="scene scene--gathering">
      <ScenicDecor position="gathering" />
      <Reveal className="placement placement--gather">
        <PaperCard>
          <Label>04 / At the water&apos;s edge</Label>
          <div className="color-bars" aria-hidden="true">{[1,2,3,4,5,6,7].map(n => <i key={n} />)}</div>
          <h3>Made for gathering</h3>
          <p>Pull up a chair. Start with breakfast, stay for conversation, and find your favourite cup among our cardamom, masala and karak chai.</p>
        </PaperCard>
      </Reveal>
      <Reveal className="placement placement--chai">
        <SpringCard className="image-card" hover={{ y: -9, rotate: .4, scale: 1.014 }}>
          <img src="/chai.jpg" alt="Chai and paratha on a cafe table" loading="lazy" decoding="async" width="640" height="420" />
          <div>
            <Label rust>The everyday / 11</Label>
            <h3>Chai, slowly</h3>
            <p>Cardamom, steam, and<br />nowhere else to be.</p>
          </div>
        </SpringCard>
      </Reveal>
    </section>
  );
}

const orderOptions = [
  ["Jhelum Direct", "Pay on the site. Pickup or free qualifying delivery.", "direct"],
  ["Visit us", "Hours, directions, and how to arrive.", "visit"],
  ["Share a table", "Copy a link and invite someone along.", "share"],
];

function TakeHome({ open }) {
  return (
    <section className="scene scene--home home-editorial" aria-labelledby="home-title">
      <Reveal className="home-salon">
        <div className="home-intro">
          <Label>05 / Beyond our table</Label>
          <h2 id="home-title">The pleasure<br />of a meal.<br /><em>The comfort<br />of home.</em></h2>
          <p>A Brooklyn breakfast. A little desi chaat. Chai to linger over. Bring a little of Jehlum into your day.</p>
          <span className="home-signature">Jehlum Cafe <i /> Brooklyn, New York</span>
        </div>
        <div className="home-services">
          <p className="home-services-label">Make an evening of it</p>
          <div className="home-action-list">
            {orderOptions.map(([title, sub, mode], index) => (
              <SpringButton className="action-card" type="button" key={title} onClick={() => open(mode)} hover={{ scale: 1.018, x: 6 }} tap={{ scale: 0.985 }}>
                <span className="home-action-number">0{index + 1}</span><span className="home-action-copy"><strong>{title}</strong><span>{sub}</span></span><ActionArrow />
              </SpringButton>
            ))}
          </div>
          <p className="home-service-note">Order through Jhelum Direct, come sit with us, or send someone a link.</p>
        </div>
      </Reveal>
      <div className="home-colophon"><span>The last bend</span><p>Every good table has a story.<br />There is room for yours.</p><span>With warmth, Jehlum</span></div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="scene footer">
      <motion.div className="pond-scene" initial={{ scale: 1.04 }} whileInView={{ scale: 1 }} transition={{ duration: 2.4, ease: [.16, 1, .3, 1] }} viewport={{ once: false, amount: .15 }}>
        <img src="/pond-sunset.webp" alt="A mountain river widens into a calm pond, reflecting the golden sunset between grassy banks and rocks." loading="lazy" decoding="async" width="1782" height="883" />
        <div className="pond-glow" />
      </motion.div>
      <div className="grass" aria-hidden="true" />
      <Reveal className="footer-inner">
        <Label rust>The river continues</Label>
        <h2>Jehlum Cafe</h2>
        <SpringButton as="a" className="action-card" href="#visit"><span>Come sit by the water</span><ActionArrow /></SpringButton>
        <p className="footer-hours"><strong>{cafe.hoursLabel}</strong><span>Brooklyn local time</span></p>
        <p className="footer-address">{cafe.address}</p>
        <Copyright />
      </Reveal>
    </footer>
  );
}

export default function App() {
  const route = useCafeRoute();
  const menu = useMenu();
  const [panel, setPanel] = useState(null);
  const [category, setCategory] = useState('all');
  const [notice, setNotice] = useState('');
  const cart = useCart(menu.items);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    document.title = {
      menu: 'Menu — Jehlum Cafe',
      cart: 'Your order — Jehlum Cafe',
      checkout: 'Checkout — Jhelum Direct',
      admin: 'Kitchen — Jhelum Direct',
      track: 'Track order — Jhelum Direct',
      driver: 'Driver — Jhelum Direct',
      home: 'Jehlum Cafe — Jhelum Direct',
    }[route.page];
  }, [route.page]);

  useEffect(() => {
    if (route.page === 'menu' && route.category) setCategory(route.category);
  }, [route.page, route.category]);

  const previousPage = useRef(null);
  useEffect(() => {
    const movedPages = previousPage.current && previousPage.current !== route.page;
    previousPage.current = route.page;
    if (route.page !== 'home') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (movedPages) {
        const heading = document.querySelector('main h1');
        heading?.setAttribute('tabIndex', '-1');
        heading?.focus({ preventScroll: true });
      }
      return;
    }
    if (route.section && route.section !== 'top') {
      requestAnimationFrame(() => document.getElementById(route.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return;
    }
    if (movedPages) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [route.page, route.section]);

  const closePanel = () => setPanel(null);
  const addItem = (item, needsOptions) => {
    if (needsOptions) {
      setPanel({ type: 'item', itemId: item.id });
      return;
    }
    cart.add(item.id);
    setNotice(`${item.name} added to your order.`);
    track('add_to_cart', { item_id: item.id, value: (item.cents || 0) / 100, currency: 'USD' });
  };
  const addConfiguredItem = (...details) => {
    cart.add(...details);
    const item = menu.items.find(entry => entry.id === details[0]);
    setNotice(`${item?.name || 'Item'} added to your order.`);
    track('add_to_cart', { item_id: details[0], currency: 'USD' });
  };
  const openService = mode => {
    if (mode === 'direct' || mode === 'pickup') window.location.hash = cart.itemCount ? 'checkout' : 'menu';
    else if (mode === 'visit') window.location.hash = 'visit';
    else setPanel({ type: mode });
  };

  const inner = {
    menu: <MenuPage category={category} setCategory={setCategory} onAddItem={addItem} cartCount={cart.itemCount} />,
    cart: <CartPage cart={cart} onClear={() => setPanel({ type: 'confirm-clear' })} />,
    checkout: <CheckoutPage cart={cart} settings={menu.settings} />,
    admin: <AdminBoard tab={route.category} />,
    track: <TrackPage token={route.token} />,
    driver: <DriverApp orderId={route.category} />,
  }[route.page];

  return <>
    <SeoJsonLd settings={menu.settings} sections={menu.sections} />
    <WaterRiver />
    <CafeHeader page={route.page} cartCount={cart.itemCount} />
    {route.page === 'home' ? <main id="top"><JourneyRail /><Hero cartCount={cart.itemCount} /><Visit /><HomeDirect sections={menu.sections} items={menu.items} onAdd={addItem} /><MenuInvite onAdd={addItem} /><Beginning /><Kitchen /><PunjabInterlude /><Gathering /><TakeHome open={openService} /><Footer /></main>
      : <main id="top" className={`cafe-page cafe-page--${route.page}`}>
          <figure className="page-hero-mountain">
            <img src="/mountain-sunset.webp" alt="Golden sunset over snow-capped mountains, a forested valley and a rocky river." width="1783" height="882" />
          </figure>
          {inner}
        </main>}
    <MobileNav page={route.page} cartCount={cart.itemCount} />
    <div className={`cart-toast ${notice ? 'cart-toast--visible' : ''}`} role="status" aria-live="polite">{notice}</div>
    {panel?.type === 'item' && <ItemDialog itemId={panel.itemId} close={closePanel} add={addConfiguredItem} />}
    {panel?.type === 'confirm-clear' && <ConfirmDialog title="Clear this order?" message="This removes every item saved on this device. You can still browse the menu and start again." confirmLabel="Clear order" close={closePanel} onConfirm={cart.clear} />}
    {panel?.type === 'share' && <InfoDialog close={closePanel} />}
  </>;
}
