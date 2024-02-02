"use client";

import React from "react";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { useServerInsertedHTML } from "next/navigation";
import { ConfigProvider, DatePicker, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import zhCN from "antd/locale/zh_CN";

dayjs.locale("zh-cn");

const theme = {
  token: {
    fontSize: 16,
    colorPrimary: "#52c41a",
  },
};

const StyledComponentsRegistry = ({ children }) => {
  const cache = React.useMemo(() => createCache(), []);
  const isServerInserted = React.useRef(false);
  // useServerInsertedHTML(() => {
  //   // 避免 css 重复插入
  //   if (isServerInserted.current) {
  //     return;
  //   }
  //   isServerInserted.current = true;
  //   return (
  //     <style
  //       id="antd"
  //       dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
  //     />
  //   );
  // });
  // return (
  //   <StyleProvider cache={cache}>
  //     <ConfigProvider locale={zhCN} theme={theme}>
  //       {children}
  //     </ConfigProvider>
  //   </StyleProvider>
  // );
  return
};

export default StyledComponentsRegistry;
