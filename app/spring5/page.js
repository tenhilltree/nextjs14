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
  to,
} from "react-spring";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { useGesture, useScroll } from "@use-gesture/react";
import useMeasure from "react-use-measure";
import styles from "./page.module.css";

const imgs = [
  "image1.jpg",
  "image2.jpg",
  "image3.jpg",
  "image4.jpg",
  "image5.jpg",
  "image1.jpg",
  // "image2.jpg",
];

const calcX = (y, ly) => -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x, lx) => (x - lx - window.innerWidth / 2) / 20;

const wheel = (y) => {
  const imgHeight = 180;
  return `translateY(${-imgHeight * (y < 0 ? 5 : 0) - (y % (imgHeight * 5))}px`;
};

function MyComponent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);

    return () => {
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
    };
  }, []);

  const domTarget = useRef(null);
  const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(
    () => ({
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      zoom: 0,
      x: 0,
      y: 0,
      config: { mass: 5, tension: 1000, friction: 40 },
    })
  );

  const [{ wheelY }, wheelApi] = useSpring(() => ({ wheelY: 0 }));

  useGesture(
    {
      onDrag: ({ active, offset: [x, y] }) =>
        api({ x, y, rotateX: 0, rotateY: 0, scale: active ? 1 : 1.1 }),
      onPinch: ({ offset: [d, a] }) => {
        api.start({ zoom: d, rotateZ: a });
      },
      onMove: ({ xy: [px, py], dragging }) =>
        !dragging &&
        api({
          rotateX: calcX(py, y.get()),
          rotateY: calcY(px, x.get()),
          scale: 1.1,
        }),
      onHover: ({ hovering }) =>
        !hovering && api({ rotateX: 0, rotateY: 0, scale: 1 }),
      onWheel: ({ event, offset: [, y] }) => {
        event.preventDefault();
        wheelApi.set({ wheelY: y });
      },
    },
    { target: domTarget, eventOptions: { passive: false } }
  );

  return (
    <div className={styles.main} onClick={() => {}}>
      <animated.div
        ref={domTarget}
        className={styles.container}
        style={{
          transform: "perspective(600px)",
          x,
          y,
          scale: to([scale, zoom], (s, z) => {
            // console.log("aaa", s, z);
            return s + z;
          }),
          rotateX,
          rotateY,
          rotateZ,
        }}
      >
        <animated.div style={{ transform: wheelY.to(wheel) }}>
          {imgs.map((img, i) => (
            <div key={i} style={{ backgroundImage: `url(${img})` }} />
          ))}
        </animated.div>
      </animated.div>
    </div>
  );
}

export default MyComponent;
