"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  animated,
  useSpring,
  useSpringValue,
  useSpringRef,
  useTransition,
  useChain,
  useTrail,
  useSprings,
  config,
} from "react-spring";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import useMeasure from "react-use-measure";
import styles from "./page.module.css";

const items = [
  { content: "A", background: "lightpink" },
  { content: "B", background: "lightblue" },
  { content: "C", background: "lightgreen" },
];

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const transRef = useSpringRef();

  const transitions = useTransition(index, {
    from: { opacity: 1, transform: "translate3d(100%,0,0)" },
    enter: { opacity: 1, transform: "translate3d(0%,0,0)" },
    leave: { opacity: 1, transform: "translate3d(-100%,0,0)" },
    config: { mass: 5, tension: 200, friction: 20 },
    exitBeforeEnter: false,
  });

  // useEffect(() => {
  //   transRef.start();
  // }, [index, transRef]);

  return (
    <div
      className={styles.main}
      onClick={() => {
        setIndex((1 + index) % items.length);
      }}
    >
      {transitions((style, item) => {
        return (
          <animated.div
            className={styles.container}
            style={{ background: items[item].background, ...style }}
            onClick={() => {}}
          >
            {items[item].content}
          </animated.div>
        );
      })}
    </div>
  );
}

export default MyComponent;
