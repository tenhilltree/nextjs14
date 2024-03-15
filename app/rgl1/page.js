"use client";
import React, { useState, useEffect } from "react";
import _ from "lodash";
import GridLayout, { WidthProvider } from "react-grid-layout";
import styles from "./page.module.scss";

const ReactGridLayout = WidthProvider(GridLayout);

const config = {
  className: "layout",
  items: 10,
  cols: 12,
  rowHeight: 30,
  onLayoutChange: function () {},
  // This turns off compaction so you can place items wherever.
  verticalCompact: false,
  // This turns off rearrangement so items will not be pushed arround.
  preventCollision: true,
};

const generateLayout = () => {
  const p = config;
  return _.map(new Array(p.items), function (item, i) {
    const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
    return {
      x: (i * 2) % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
    };
  });
};

const generateDOM = () => {
  return _.map(_.range(config.items), function (i) {
    return (
      <div key={i}>
        <span className="text">{i}</span>
      </div>
    );
  });
};

export default function RGL1() {
  const [layout, setLayout] = useState(generateLayout());
  return (
    <div className={styles.layout}>
      <ReactGridLayout layout={layout} {...config}>
        {generateDOM()}
      </ReactGridLayout>
    </div>
  );
}

import("./test-hook.jsx").then((fn) => fn.default(RGL1));
