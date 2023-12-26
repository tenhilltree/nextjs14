"use client";

import React from "react";
import { ConfigProvider, Button } from "antd";
import styles from "./page.module.css";

export default function ReactFlow() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token，影响范围大
          colorPrimary: "#00b96b",
          borderRadius: 4,

          // 派生变量，影响范围小
          colorBgContainer: "#f6ffed",
        },
      }}
    >
      <main className={styles.main}>
        <Button type="primary">Button</Button>
      </main>
    </ConfigProvider>
  );
}
