"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  animated,
  useSpring,
  useSpringValue,
  useTransition,
  useChain,
  useTrail,
  useSprings,
  config,
} from "react-spring";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import styles from "./page.module.css";

function MyComponent() {
  const [begin, setBegin] = useState(false);
  const { background } = useSpring({
    from: { background: "var(--step0)" },
    to: [
      { background: "var(--step0)" },
      { background: "var(--step1)" },
      { background: "var(--step2)" },
      { background: "var(--step3)" },
      { background: "var(--step4)" },
    ],
    config: config.molasses,
    loop: {
      reverse: true,
    },
  });

  useEffect(() => {
    setBegin(true);
  }, []);
  return (
    <div className={styles.main}>
      <div className={styles.container} onClick={() => {}}>
        <animated.div
          className={styles.child1}
          style={{ background }}
        ></animated.div>
        <div className={styles.child2}></div>
      </div>
      <animated.div
        className={styles.bg}
        style={{ background }}
        onClick={() => {}}
      ></animated.div>
    </div>
  );
}

export default MyComponent;
