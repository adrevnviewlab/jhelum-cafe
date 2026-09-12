import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { CafeDialog, MobileNav, Visit } from './CafeUtility';
import MenuCatalog from './MenuCatalog';
import CafeHeader from './CafeHeader';

const riverPath = "M 950 720 C 790 910, 800 1120, 970 1280 C 1130 1450, 1135 1690, 955 1880 C 775 2070, 770 2290, 950 2480 C 1125 2670, 1120 2900, 940 3090 C 760 3280, 765 3510, 950 3700 C 1135 3890, 1125 4120, 940 4310 C 755 4500, 760 4730, 950 4920 C 1135 5110, 1125 5340, 945 5530 C 770 5715, 780 5945, 955 6130 C 1125 6310, 1110 6530, 945 6700 C 800 6850, 800 7000, 930 7140";

function River() {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, .28, .56, .82, 1], [0, -28, 34, -20, 0]);
  const scaleX = useTransform(scrollYProgress, [0, .45, 1], [1, 1.045, .98]);
  const reveal = useTransform(scrollYProgress, [0, .085, .91], [0, 0, 1]);
  return (
    <motion.div className="river-wrap" style={{ x, scaleX }} aria-hidden="true">
      <svg viewBox="0 0 1900 7800" preserveAspectRatio="none">
        <defs>
          <mask id="river-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1900" height="7800">
            <motion.path d={riverPath} pathLength="1" style={{ pathLength: reveal }} fill="none" stroke="white" strokeWidth="620" strokeLinecap="round" />
          </mask>
        </defs>
        <g mask="url(#river-reveal)">
          <path className="river-bank" d={riverPath} />
          <motion.path className="river" d={riverPath} animate={{ opacity: [1, .975, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
          <path className="river-current river-current--one" d={riverPath} pathLength="1" />
          <path className="river-current river-current--two" d={riverPath} pathLength="1" />
          <path className="river-current river-current--three" d={riverPath} pathLength="1" />
        </g>
      </svg>
    </motion.div>
  );
}

function MountainScene() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, .16], [0, 260]);
  const scale = useTransform(scrollYProgress, [0, .16], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, .14, .2], [.92, .66, 0]);
  return (
    <motion.figure className="mountain-scene" style={{ y, scale, opacity }} aria-hidden="true">
      <img src="/jhelum-headwaters.webp" alt="" width="1536" height="1024" fetchPriority="high" />
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

function MountainEcho({ variant = "one" }) {
  return <div className={`mountain-echo mountain-echo--${variant}`} aria-hidden="true"><img src="/jhelum-headwaters.webp" alt="" loading="lazy" decoding="async" width="1536" height="1024" /></div>;
}

function ScenicDecor({ type, position, caption }) {
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
  return <article className={`paper-card ${dark ? "paper-card--dark" : ""} ${className}`}>{children}<i className="corner-mark" /></article>;
}

function Label({ children, rust = false }) {
  return <p className={`label ${rust ? "label--rust" : ""}`}>{children}</p>;
}

function Hero({ open }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, .62, 1], [1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  return (
    <section ref={ref} className="hero scene">
      <motion.div className="hero-copy" style={{ opacity, y }}>
        <Label>A mountain kitchen / since 2024</Label>
        <h1 className="brand-title"><span>Jehlum</span><em>Cafe</em></h1>
        <p className="hero-intro">Where the mountain river meets a generous table.</p>
        <p className="hero-sub">Inspired by Punjab.<br />At home in Brooklyn.<br />Breakfast, desi favourites<br />and a cup of chai.</p>
        <a href="#beginning" className="follow">Follow the water <span /></a>
        <div className="utility-actions hero-actions"><button onClick={() => open('menu')}>Explore the menu</button><button onClick={() => open('pickup')}>Plan your visit ↗</button></div>
      </motion.div>
      <div className="hero-reeds hero-reeds--left" aria-hidden="true" />
      <div className="hero-reeds hero-reeds--right" aria-hidden="true" />
    </section>
  );
}

function Beginning() {
  return (
    <section id="beginning" className="scene scene--story">
      <MountainEcho variant="one" />
      <ScenicDecor type="greenery" position="story" />
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
      <MountainEcho variant="two" />
      <ScenicDecor type="chai" position="kitchen" caption="Morning chai / mountain air" />
      <Reveal className="placement placement--karahi">
        <motion.article className="menu-card" whileHover={{ y: -10, rotate: -.4 }} transition={{ type: "spring", stiffness: 180, damping: 18 }}>
          <div className="featured-menu-panel"><span>Desi chaska</span><strong>A taste<br /><em>of home.</em></strong><a href="#menu">Explore the menu ↗</a></div>
          <div className="menu-copy">
            <Label rust>From the kitchen / 07</Label>
            <h3>Samosa chaat</h3>
            <p>A desi favourite,<br />for a little afternoon comfort.</p>
            <div className="price"><strong>$5.99</strong><span>Desi chaska</span></div>
          </div>
        </motion.article>
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
      <MountainEcho variant="three" />
      <ScenicDecor type="greenery" position="punjab" />
      <div className="field-ribbons" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <Reveal className="placement placement--fivewaters">
        <div className="chapter-title">
          <Label>Punjab / land of five waters</Label>
          <h2>Where water<br />teaches the<br />land to gather.</h2>
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
      <MountainEcho variant="four" />
      <ScenicDecor type="chai" position="gathering" caption="Two cups / no hurry" />
      <Reveal className="placement placement--gather">
        <PaperCard>
          <Label>04 / At the water&apos;s edge</Label>
          <div className="color-bars" aria-hidden="true">{[1,2,3,4,5,6,7].map(n => <i key={n} />)}</div>
          <h3>Made for gathering</h3>
          <p>Pull up a chair. Start with breakfast, stay for conversation, and find your favourite cup among our cardamom, masala and karak chai.</p>
        </PaperCard>
      </Reveal>
      <Reveal className="placement placement--chai">
        <motion.article className="image-card" whileHover={{ y: -9, rotate: .4 }}>
          <img src="/chai.jpg" alt="Chai and paratha on a cafe table" loading="lazy" decoding="async" width="640" height="420" />
          <div>
            <Label rust>The everyday / 11</Label>
            <h3>Chai, slowly</h3>
            <p>Cardamom, steam, and<br />nowhere else to be.</p>
          </div>
        </motion.article>
      </Reveal>
    </section>
  );
}

const orderOptions = [
  ["Pickup", "A considered meal, wherever the evening takes you.", "pickup"],
  ["Delivery", "Explore dining at home.", "delivery"],
  ["Jehlum Club", "For those who make a ritual of returning.", "club"],
  ["Share a table", "An invitation is always a good beginning.", "share"],
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
              <button key={title} onClick={() => open(mode)}>
                <span className="home-action-number">0{index + 1}</span><span className="home-action-copy"><strong>{title}</strong><span>{sub}</span></span><span className="home-action-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <p className="home-service-note">Explore our menu, plan your visit, or invite someone along.</p>
        </div>
      </Reveal>
      <div className="home-colophon"><span>The last bend</span><p>Every good table has a story.<br />There is room for yours.</p><span>With warmth, Jehlum</span></div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="scene footer">
      <motion.div className="pond-scene" initial={{ scale: 1.04 }} whileInView={{ scale: 1 }} transition={{ duration: 2.4, ease: [.16, 1, .3, 1] }} viewport={{ once: false, amount: .15 }} aria-hidden="true">
        <img src="/punjab-pond.webp" alt="" loading="lazy" decoding="async" width="1536" height="1024" />
        <div className="pond-glow" />
      </motion.div>
      <div className="grass" aria-hidden="true" />
      <Reveal className="footer-inner">
        <Label rust>The river continues</Label>
        <h2>Jehlum Cafe</h2>
        <motion.a href="#beginning" whileHover={{ scale: 1.03 }} whileTap={{ scale: .98 }}>Come sit by the water <span>↗</span></motion.a>
        <p>Open daily · 937 Coney Island Ave · Brooklyn, NY 11230</p>
      </Reveal>
    </footer>
  );
}

export default function App() {
  const [mode, setMode] = useState(null);
  return <><CafeHeader open={setMode} /><main id="top"><MountainScene /><River /><JourneyRail /><Hero open={setMode} /><Visit open={setMode} /><MenuCatalog /><Beginning /><Kitchen /><PunjabInterlude /><Gathering /><TakeHome open={setMode} /><Footer /></main><MobileNav open={setMode} />{mode && <CafeDialog key={mode} mode={mode} close={() => setMode(null)} changeMode={setMode} />}</>;
}
