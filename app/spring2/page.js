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
import useMeasure from "react-use-measure";
import styles from "./page.module.css";

const items = ["Lorem", "Ipsum", "Dolor", "Sit"];
let openRef = false;
function MyComponent() {
  const [open, setOpen] = useState(false);

  const trails = useTrail(items.length, {
    from: { opacity: 0, x: 20, height: 0 },
    config: { mass: 5, tension: 200, friction: 200 },
    opacity: open ? 1 : 0,
    x: open ? 0 : 20,
    height: open ? 110 : 0,
  });

  useEffect(() => {
    setOpen(true);
  }, []);
  return (
    <div className={styles.main} onClick={() => {}}>
      <div
        className={styles.container}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {trails.map((t, i) => {
          return (
            <div style={{ height: 110 }} key={i}>
              <animated.div style={{ ...t, overflow: "hidden" }}>
                {items[i]}
              </animated.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyComponent;
