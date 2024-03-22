/** @jsxImportSource @emotion/react */
"use client";

import React from "react";
import { css } from "@emotion/react";

import styles from "./page.module.scss";

const style = css`
  color: hotpink;
`;

const anotherStyle = css({
  textDecoration: "underline",
  "&:hover": {
    color: "lightgreen",
  },
});

export default function AntdPage() {
  return (
    <div css={style}>
      Some hotpink text.
      <div css={anotherStyle}>Some text with an underline.</div>
      <div
        css={{
          textDecoration: "overline",
          "&:hover": {
            color: "red",
          },
          marginTop: 20,
        }}
      >
        Some text with an underline.
      </div>
    </div>
  );
}
