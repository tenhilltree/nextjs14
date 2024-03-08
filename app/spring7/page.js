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
  useSpringRef,
} from "react-spring";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import useMeasure from "react-use-measure";
import styles from "./page.module.css";
import data from "./data";

function MyComponent() {
  const [open, setOpen] = useState(false);
  const springApi = useSpringRef();

  const { size, ...rest } = useSpring({
    ref: springApi,
    config: config.stiff,
    from: { size: "20%", background: "hotpink" },
    to: {
      size: open ? "100%" : "20%",
      background: open ? "white" : "hotpink",
    },
  });

  const transApi = useSpringRef();
  const transition = useTransition(open ? data : [], {
    ref: transApi,
    trail: 400 / data.length,
    from: { opacity: 0, scale: 0 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0 },
  });

  useChain(open ? [springApi, transApi] : [transApi, springApi], [
    0,
    open ? 0.1 : 0.6,
  ]);

  return (
    <div className={styles.main} onClick={() => {}}>
      <animated.div
        style={{ ...rest, width: size, height: size }}
        className={styles.container}
        onClick={() => setOpen((open) => !open)}
      >
        {transition((style, item) => (
          <animated.div
            className={styles.item}
            style={{ ...style, background: item.css }}
          />
        ))}
      </animated.div>
    </div>
  );
}

export default MyComponent;
