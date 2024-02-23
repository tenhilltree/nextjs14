"use client";
import React, { useState, useEffect, useRef, use } from "react";
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

const items = [
  { content: "A", background: "lightpink" },
  { content: "B", background: "lightblue" },
  { content: "C", background: "lightgreen" },
];

let index = 0;
function MyComponent() {
  const ref = useRef();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={styles.main}
      onClick={() => {
        index = (index + 1) % 3;
        ref.current.scrollTo(index);
      }}
    >
      <Parallax
        ref={ref}
        pages={items.length}
        className={styles.container}
        horizontal={true}
      >
        {items.map((item, i) => (
          <ParallaxLayer
            key={item.content}
            offset={i}
            speed={0}
            horizontal={true}
          >
            <div
              className={styles.content}
              style={{ background: item.background }}
            >
              {item.content}
            </div>
          </ParallaxLayer>
        ))}
      </Parallax>
    </div>
  );
}

export default MyComponent;
