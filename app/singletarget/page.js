"use client";
import React from "react";
import styles from "./page.module.scss";

let items = ["Glass", "Banana", "Paper"];

export default function SingleTarget() {
  return (
    <>
      <div className={styles.dropArea}></div>
      <div className={styles.dragArea}>
        {items.map((item) => {
          return (
            <div key={item} className={styles.dragItem}>
              {item}
            </div>
          );
        })}
      </div>
    </>
  );
}
