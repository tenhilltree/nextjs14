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

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.main} onClick={() => {}}>
      <div className={styles.container} onClick={() => {}}></div>
    </div>
  );
}

export default MyComponent;
