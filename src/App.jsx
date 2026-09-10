import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
          <mask id="river-reveal">
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
      <img src="/jhelum-headwaters.png" alt="" />
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
  return <div className={`mountain-echo mountain-echo--${variant}`} aria-hidden="true"><img src="/jhelum-headwaters.png" alt="" /></div>;
}

function ScenicDecor({ type, position, caption }) {
  const source = type === "chai" ? "/chai-still-life.png" : "/valley-greenery.png";
  return (
    <Reveal className={`scenic-decor scenic-decor--${type} scenic-decor--${position}`}>
      <figure>
        <img src={source} alt={type === "chai" ? "Handmade chai cups, brass kettle, and paratha" : ""} />
        {caption && <figcaption><span>{caption}</span><i /></figcaption>}
      </figure>
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

function Hero() {
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
        <p className="hero-sub">Born among stone and snow.<br />Carried through Punjab.<br />Remembered over karahi and chai<br />in Brooklyn.</p>
        <a href="#beginning" className="follow">Follow the water <span /></a>
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
          <img src="/karahi.jpg" alt="Chicken karahi with green chiles and ginger" />
          <div className="menu-copy">
            <Label rust>From the kitchen / 07</Label>
            <h3>Chicken karahi</h3>
            <p>Slow-cooked tomato,<br />ginger, green chili.</p>
            <div className="price"><strong>$18</strong><span>Best shared</span></div>
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
          <p>Pull up a chair. There is always room for one more, always another piece of paratha to tear, and always another pot of chai on its way.</p>
        </PaperCard>
      </Reveal>
      <Reveal className="placement placement--chai">
        <motion.article className="image-card" whileHover={{ y: -9, rotate: .4 }}>
          <img src="/chai.jpg" alt="Chai and paratha on a cafe table" />
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
  ["Pickup", "Ready when you are"],
  ["Delivery", "Brooklyn, nearby"],
  ["Jhelum Club", "Every 6th chai, ours"],
  ["+1", "Bring someone along"],
];

function TakeHome() {
  return (
    <section className="scene scene--home">
      <MountainEcho variant="five" />
      <ScenicDecor type="greenery" position="home" />
      <Reveal className="placement placement--home">
        <PaperCard>
          <Label>05 / Take a little home</Label>
          <h3>Jehlum, wherever you are</h3>
          <p>Your table does not have to end at the door. Take the familiar things home: warm bread, slow karahi, something sweet, and enough chai for whoever arrives.</p>
          <div className="order-grid">
            {orderOptions.map(([title, sub]) => (
              <motion.button key={title} whileHover={{ backgroundColor: "#214e56", color: "#f7f3e7", y: -3 }} whileTap={{ scale: .97 }}>
                <strong>{title}</strong><span>{sub}</span>
              </motion.button>
            ))}
          </div>
        </PaperCard>
      </Reveal>
      <Reveal className="placement placement--last">
        <PaperCard>
          <Label>The last bend</Label>
          <h2>A table<br />with a<br />story</h2>
          <p>It starts somewhere far away. It arrives warm, set down between people, and becomes yours for a while. Every table adds another bend to the river.</p>
          <div className="split-meta"><span>Open daily</span><span>Brooklyn, NY</span></div>
        </PaperCard>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="scene footer">
      <motion.div className="pond-scene" initial={{ scale: 1.04 }} whileInView={{ scale: 1 }} transition={{ duration: 2.4, ease: [.16, 1, .3, 1] }} viewport={{ once: false, amount: .15 }} aria-hidden="true">
        <img src="/punjab-pond.png" alt="" />
        <div className="pond-glow" />
      </motion.div>
      <div className="grass" aria-hidden="true" />
      <Reveal className="footer-inner">
        <Label rust>The river continues</Label>
        <h2>Jehlum Cafe</h2>
        <motion.a href="#beginning" whileHover={{ scale: 1.03 }} whileTap={{ scale: .98 }}>Come sit by the water <span>↗</span></motion.a>
        <p>Open daily · Coney Island Avenue · Brooklyn, New York</p>
      </Reveal>
    </footer>
  );
}

export default function App() {
  return <main><MountainScene /><River /><JourneyRail /><Hero /><Beginning /><Kitchen /><PunjabInterlude /><Gathering /><TakeHome /><Footer /></main>;
}
