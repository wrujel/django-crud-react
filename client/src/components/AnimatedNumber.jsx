import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

/** Counts up to `value` smoothly whenever it changes. */
export function AnimatedNumber({ value = 0, className }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    Math.round(v).toLocaleString(),
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [motionValue, value]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
