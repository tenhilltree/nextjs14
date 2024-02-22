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
} from "react-spring";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import useMeasure from "react-use-measure";
import styles from "./page.module.css";

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [ref, { width }] = useMeasure();
  const props = useSpring({
    num: open ? width : 0,
  });
  return (
    <div className={styles.main} onClick={() => {}}>
      <div
        className={styles.container}
        onClick={() => {
          setOpen(!open);
        }}
        ref={ref}
      >
        <animated.div
          className={styles.bg}
          style={{ width: props.num }}
        ></animated.div>
        <animated.div className={styles.num}>
          {props.num.to((v) => Math.floor(v))}
        </animated.div>
      </div>
      <span>Render ID – {Math.random()}</span>
    </div>
  );
}

export default MyComponent;
