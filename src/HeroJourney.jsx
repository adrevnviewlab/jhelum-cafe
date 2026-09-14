import { motion, useReducedMotion } from "framer-motion";

const ROUTE = "M 92 168 C 168 204, 248 86, 338 132 S 468 214, 546 150";
const RIVER = "M 132 108 C 124 132, 108 150, 92 168";

const beats = [
  { id: "punjab", label: "Punjab", title: "Inspired by Punjab" },
  { id: "brooklyn", label: "Brooklyn", title: "At home in Brooklyn" },
  { id: "breakfast", label: "Breakfast", title: "Breakfast and desi favourites" },
  { id: "chai", label: "Chai", title: "A cup of chai" },
  { id: "water", label: "The water", title: "Follow the water", href: "#beginning" },
];

function BeatIcon({ id }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  if (id === "punjab") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="9" r="3.2" {...common} />
        <path d="M5 24 12 13.5 16 19 21 11.5 27 24Z" {...common} />
      </svg>
    );
  }
  if (id === "brooklyn") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 26V13l8-6 8 6v13" {...common} />
        <path d="M14 26v-7h4v7M12 15h3M17 15h3M12 19h3M17 19h3" {...common} />
      </svg>
    );
  }
  if (id === "breakfast") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <ellipse cx="16" cy="21" rx="10" ry="4.2" {...common} />
        <path d="M8 19c2.2-6.4 13.8-6.4 16 0M13 8c0 2.6 2 2.6 2 5.2M17 7c0 2.6 2 2.6 2 5.2" {...common} />
      </svg>
    );
  }
  if (id === "chai") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 14h13v6.5a6 6 0 0 1-13 0Z" {...common} />
        <path d="M21 16h2.6a2.8 2.8 0 0 1 0 5.6H21M13 7c0 2.2 1.8 2.2 1.8 4.2M17 6.2c0 2.2 1.8 2.2 1.8 4.2" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 11c3 3.2 5-3 8 0s5-3 8 0M6 17c3 3.2 5-3 8 0s5-3 8 0M6 23c3 3.2 5-3 8 0s5-3 8 0" {...common} />
    </svg>
  );
}

export default function HeroJourney() {
  const reduce = useReducedMotion();
  const draw = reduce
    ? { pathLength: 1, opacity: 1 }
    : { pathLength: 1, opacity: 1 };
  const undrawn = reduce
    ? { pathLength: 1, opacity: 1 }
    : { pathLength: 0, opacity: 0 };

  return (
    <figure className="hero-journey">
      <p className="sr-only">Inspired by Punjab. At home in Brooklyn. Breakfast, desi favourites and a cup of chai. Follow the water.</p>
      <svg className="hero-journey__map" viewBox="0 0 640 248" role="img" aria-hidden="true">
        <title>The Jhelum river from Punjab to a table in Brooklyn</title>
        <g className="hero-journey__graticule" stroke="#e3bd7b" strokeOpacity=".18" fill="none">
          <path d="M36 72h568M36 112h568M36 152h568M36 192h568" strokeDasharray="3 11" />
          <path d="M120 48v168M240 48v168M360 48v168M480 48v168" strokeDasharray="2 14" />
        </g>

        <motion.path
          d="M46 168c10-62 58-92 112-78 28 8 48 34 58 62 6 18-2 40-22 50-36 18-86 8-116-16-20-16-36-18-32-18Z"
          fill="#e3bd7b18"
          stroke="#e3bd7b"
          strokeWidth="1.2"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        />
        <motion.path
          d="M64 168 96 108l22 28 28-52 22 36 20-28 26 80Z"
          fill="none"
          stroke="#f4e6c4"
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={draw}
          transition={{ duration: 1.1, delay: .15, ease: [.16, 1, .3, 1] }}
        />

        <motion.path
          d="M498 86c38-22 92-8 108 32 12 30 2 68-28 84-34 18-86 10-108-18-16-20-16-52 0-70 8-10 16-20 28-28Z"
          fill="#e3bd7b16"
          stroke="#e3bd7b"
          strokeWidth="1.2"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .12, ease: [.16, 1, .3, 1] }}
        />
        <motion.g
          fill="none"
          stroke="#f4e6c4"
          strokeWidth="1.45"
          strokeLinejoin="round"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6, delay: .35 }}
        >
          <path d="M528 176V132h16v44" />
          <path d="M546 176V118h15v58" />
          <path d="M563 176v-30h18v30" />
          <path d="M508 158q28-22 62 0" />
        </motion.g>

        <motion.path
          d={RIVER}
          fill="none"
          stroke="#c9e4e0"
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={undrawn}
          animate={draw}
          transition={{ duration: .8, delay: .3, ease: [.16, 1, .3, 1] }}
        />
        <path d={ROUTE} fill="none" stroke="#e3bd7b" strokeOpacity=".28" strokeWidth="2.2" strokeLinecap="round" />
        <motion.path
          d={ROUTE}
          fill="none"
          stroke="#e3bd7b"
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={undrawn}
          animate={draw}
          transition={{ duration: 2.1, delay: .45, ease: [.16, 1, .3, 1] }}
        />
        <motion.path
          className="hero-journey__flow"
          d={ROUTE}
          fill="none"
          stroke="#fff9ec"
          strokeWidth="1.15"
          strokeLinecap="round"
          initial={reduce ? { opacity: .7 } : { opacity: 0 }}
          animate={{ opacity: .7 }}
          transition={{ delay: reduce ? 0 : 2.2, duration: .4 }}
        />

        <motion.circle cx="92" cy="168" r="5" fill="#fff9ec" stroke="#e3bd7b" strokeWidth="1.6" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .55, type: "spring", stiffness: 260, damping: 18 }} />
        <motion.circle cx="546" cy="150" r="5" fill="#e3bd7b" stroke="#fff9ec" strokeWidth="1.6" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.1, type: "spring", stiffness: 260, damping: 18 }} />

        {!reduce && (
          <circle r="4.2" fill="#fff9ec" stroke="#c1986e" strokeWidth="1.4">
            <animateMotion dur="2.4s" begin="0.55s" fill="freeze" rotate="auto" path={ROUTE} />
          </circle>
        )}

        <motion.text x="78" y="214" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6 }} className="hero-journey__place">Punjab</motion.text>
        <motion.text x="118" y="96" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .75 }} className="hero-journey__place hero-journey__place--small">Jhelum</motion.text>
        <motion.text x="508" y="214" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.05 }} className="hero-journey__place">Brooklyn</motion.text>
      </svg>

      <motion.ul
        className="hero-journey__beats"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduce ? 0 : .1, delayChildren: reduce ? 0 : .55 } },
        }}
      >
        {beats.map(beat => {
          const inner = (
            <>
              <span className="hero-journey__mark"><BeatIcon id={beat.id} /></span>
              <span>{beat.label}</span>
            </>
          );
          return (
            <motion.li key={beat.id} variants={{ hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 12 }, show: { opacity: 1, y: 0, transition: { duration: .42, ease: [.16, 1, .3, 1] } } }}>
              {beat.href
                ? <a className="hero-journey__beat" href={beat.href} title={beat.title}>{inner}</a>
                : <div className="hero-journey__beat" title={beat.title}>{inner}</div>}
            </motion.li>
          );
        })}
      </motion.ul>
    </figure>
  );
}
