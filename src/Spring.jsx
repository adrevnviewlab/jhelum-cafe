import { motion } from "framer-motion";

export const pressSpring = { type: "spring", stiffness: 560, damping: 18, mass: 0.52 };
export const cardSpring = { type: "spring", stiffness: 240, damping: 16, mass: 0.72 };

export const buttonHover = { scale: 1.045, y: -3 };
export const buttonTap = { scale: 0.96 };
export const cardHover = { y: -8, scale: 1.016 };
export const cardTap = { scale: 0.985 };

const tags = {
  button: motion.button,
  a: motion.a,
  article: motion.article,
  div: motion.div,
};

export function SpringButton({ as = "button", className = "", hover = buttonHover, tap = buttonTap, children, ...props }) {
  const Component = tags[as] || motion.button;
  return (
    <Component className={["spring-press", className].filter(Boolean).join(" ")} whileHover={hover} whileTap={tap} transition={pressSpring} {...props}>
      {children}
    </Component>
  );
}

export function SpringCard({ as = "article", className = "", hover = cardHover, tap = cardTap, children, ...props }) {
  const Component = tags[as] || motion.article;
  return (
    <Component className={["spring-card", className].filter(Boolean).join(" ")} whileHover={hover} whileTap={tap} transition={cardSpring} {...props}>
      {children}
    </Component>
  );
}
