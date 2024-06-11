"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Form, Input, Row, Col, Table, Checkbox } from "antd";
import { Wrold } from "./World/World";
import styles from "./page.module.scss";

function MyComponent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const world = new Wrold(document.querySelector("#scene-container"));
    world.render();

    return () => {};
  }, []);

  return (
    <div className={styles.main} onClick={() => {}}>
      <h1>Discoverthreejs.com - Nothing to see here yet :)</h1>
      <div id="scene-container"></div>
    </div>
  );
}

export default MyComponent;
