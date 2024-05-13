"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ExcelJS from "exceljs";
import { Button, Form, Input, Row, Col, Table, Checkbox } from "antd";
import styles from "./page.module.css";

const tableWidth = [
  "9%",
  "20%",
  "4.1%",
  "4.1%",
  "20%",
  "4.1%",
  "4.1%",
  "4.1%",
  "22%",
  "4.1%",
  "4.1%",
];

const table3Width = ["10%", "10%", "43.4%", "9%", "9%", "9.3%", "9.3%"];

const treeData = new Map();

// const maxScoreGroup = {
//   group1: { max: 0, real: 0 },
//   group2: { max: 0, real: 0 },
//   group3: { max: 0, real: 0 },
//   group4: { max: 0, real: 0 },
//   group5: { max: 0, real: 0 },
//   group6: { max: 0, real: 0 },
//   group7: { max: 0, real: 0 },
// };

const maxScoreMap = new Map();

const maxRadarScoreMap = new Map();

let radarData = [0, 0, 0, 0, 0, 0];

const radarTotal = [];

let summaryRows = [];

let columns3 = [
  "五大阶段",
  "场景",
  "评分项",
  `分项得分（百分制）`,
  "组合得分（百分制）",
  "权重系数",
  "最终评分",
];

let stages = ["平台协同", "BIM孪生", "创新应用"];

const tableColumns3 = columns3.map((c, i) => ({
  title: c,
  key: i + 1,
  dataIndex: i + 1,
  width: table3Width[i],
  onCell: (_, index) => {
    let j = i;
    if (i === 4) {
      j = 1;
    } else if (i === 5 || i === 6) {
      j = 0;
    }
    return {
      rowSpan: _[`${j + 1}-rowSpan`],
    };
  },
  className: i === 2 ? "score-level-3" : "",
}));

const scoreWeightMap = {
  投资与策划: 0.15,
  规划与设计: 0.25,
  生产与供应: 0.25,
  施工与交付: 0.3,
  运营与消纳: 0.05,
};

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [workbook, setWorkbook] = useState(null);
  const [formItems, setFormItems] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableColumns2, setTableColumns2] = useState([]);
  const [change, setChange] = useState(2);
  const [tableData, setTableData] = useState([]);
  const [radar100, setRadar100] = useState([0, 0, 0, 0, 0, 0]);
  const [totalScore, setTotalScore] = useState(0);
  const [tableData3, setTableData3] = useState([]);

  useEffect(() => {
    const fetchExcel = async () => {
      try {
        // 使用AJAX获取Excel文件
        const response = await fetch("template.xlsx");
        const arrayBuffer = await response.arrayBuffer();

        // 使用ExcelJS读取Excel文件
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheetInfo = workbook.getWorksheet("项目概况");
        const items = [];
        worksheetInfo.eachRow(function (row, rowNumber) {
          // console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
          if (rowNumber !== 1) {
            row.eachCell(function (cell, colNumber) {
              // console.log("Cell " + colNumber + " = " + cell.value);
              items.push({
                text: cell.text,
                ...cell.fullAddress,
              });
            });
          }
        });
        // console.log(items);
        setFormItems(items);

        const worksheetRadar = workbook.getWorksheet("雷达图（此sheet不显示）");
        const data3 = [];
        worksheetRadar.eachRow(function (row, rowNumber) {
          if (rowNumber > 1 && rowNumber <= 154) {
            const temp1 = [];
            const temp2 = { key: rowNumber };
            // debugger;
            row.eachCell((cell, colNumber) => {
              const { fullAddress, text, isMerged, _mergeCount } = cell;
              // temp1.push(text.trim());

              if (colNumber > 4) {
                if (isMerged) {
                  if (_mergeCount > 0) {
                    let matches = cell.note.texts[1].text.match(/\d+/g);
                    maxRadarScoreMap.set(
                      `${temp1[0]}-${temp1[1]}-${temp1[2]}-${colNumber}`,
                      {
                        max: Number(matches[1]),
                        single: Number(matches[0]),
                        current: 0,
                      }
                    );
                  } else {
                  }
                  temp1.push({
                    value: text.trim(),
                    group: `${temp1[0]}-${temp1[1]}-${worksheetRadar
                      .getCell(cell.master.row, 3)
                      .text.trim()}-${colNumber}`,
                  });
                } else {
                  temp1.push({ value: text.trim() });
                }
                // console.log(text, isMerged, _mergeCount);
              } else {
                temp1.push(text.trim());

                temp2[colNumber] = text.trim();
                // if (isMerged) {
                if (isMerged && _mergeCount > 0) {
                  temp2[colNumber + "-rowSpan"] = _mergeCount + 1;
                } else if (isMerged && _mergeCount === 0) {
                  temp2[colNumber + "-rowSpan"] = 0;
                } else {
                  temp2[colNumber + "-rowSpan"] = 1;
                }
                // }
              }
            });
            temp2[6] = scoreWeightMap[temp2[1]];
            temp2[4] = 0;
            temp2[5] = 0;
            data3.push(temp2);
            const [stage, scene, content, s1, s2, s3, s4, s5, s6] = temp1;
            let groupPrefix = `${stage}-${scene}-${content}-`;
            treeData.set(`${stage}-${scene}-${content}`, {
              index: rowNumber - 2,
              radar: [
                { value: Number(s1.value), group: s1.group },
                { value: Number(s2.value), group: s2.group },
                { value: Number(s3.value), group: s3.group },
                { value: Number(s4.value), group: s4.group },
                { value: Number(s5.value), group: s5.group },
                { value: Number(s6.value), group: s6.group },
              ],
            });
          } else if (rowNumber === 155) {
            row.eachCell((cell, colNumber) => {
              const { fullAddress, text, isMerged, _mergeCount } = cell;
              if (colNumber > 4) {
                radarTotal[colNumber - 5] = Number(text);
              }
            });
          }
        });

        // console.log(data3);
        setTableData3(data3);
        // console.log(maxRadarScoreMap);
        // console.log(treeData);
        // return;

        const worksheetModel = workbook.getWorksheet("365价值模型"); // 获取第一个工作表
        const row1 = worksheetModel.getRow(1);
        const row2 = worksheetModel.getRow(2);

        const columns2 = [];
        let fullWidth = 0;
        for (let i = 1; i <= row2.cellCount - 1; i++) {
          let cell = row2.getCell(i);
          let column = worksheetModel.getColumn(i);
          let width = column.width;
          fullWidth += width;
          const { fullAddress, text, isMerged, _mergeCount } = cell;
          if (_mergeCount > 0) {
            columns2.push({
              text: "maxScore",
              begin: fullAddress.col,
              end: fullAddress.col + _mergeCount,
              width,
              colSpan: 0,
              onCell: (_, index) => {
                const { maxScoreRowSpan, maxScoreColSpan, contentColSpan } = _;
                return {
                  rowSpan: maxScoreRowSpan,
                  colSpan: maxScoreColSpan,
                };
              },
            });
            fullWidth += worksheetModel.getColumn(i + 1).width;
            columns2.push({
              text,
              begin: fullAddress.col,
              end: fullAddress.col,
              width: worksheetModel.getColumn(i + 1).width,
              colSpan: 2,
              onCell: (_, index) => {
                const { maxScoreRowSpan, maxScoreColSpan, contentColSpan } = _;
                return {
                  colSpan: contentColSpan,
                };
              },
            });
          } else {
            columns2.push({
              text,
              begin: fullAddress.col,
              end: fullAddress.col,
              width,
              colSpan: 1,
              ...(i === 1
                ? {
                    onCell: (_, index) => {
                      const { column1RowSpan } = _;
                      return {
                        rowSpan: column1RowSpan,
                      };
                    },
                  }
                : {}),
            });
          }
          i += _mergeCount;
        }
        // console.log(columns2);

        const columns = [];
        let columnCount = 0;
        for (let i = 1; i <= row1.cellCount; i++) {
          let cell = row1.getCell(i);
          const { fullAddress, text, isMerged, _mergeCount } = cell;
          if (cell.text) {
            let antdColumn = {
              title: text,
              key: text,
              dataIndex: text,
              begin: fullAddress.col,
              end: fullAddress.col + _mergeCount,
            };
            let mergeBegin = columns2.findIndex((v, index) => {
              return v.begin === antdColumn.begin;
            });
            let mergeEnd = columns2.findIndex((v, index) => {
              return v.end === antdColumn.end;
            });
            if (true || mergeBegin !== mergeEnd) {
              antdColumn.children = [];
              //Todo column width
              columns2.slice(mergeBegin, mergeEnd + 1).forEach((c) => {
                let showText = c.text !== "价值映射" ? c.text : "选择";
                let newKey = `${text}-${showText}`;
                antdColumn.children.push({
                  title: showText,
                  key: newKey,
                  dataIndex: newKey,
                  begin: c.begin,
                  end: c.end,
                  colSpan: c.colSpan,
                  onCell: c.onCell,
                  // Math.floor((c.width * 100) / fullWidth).toFixed(2) + "%",
                  width: tableWidth[columnCount],
                  textWrap: "word-break",
                  className: c.text === "内容" ? "content-column" : "",
                });
                columnCount++;
                c.text = `${text}-${c.text}`;
              });
            }
            columns.push(antdColumn);
          }
          i += _mergeCount;
        }
        // console.log(columns);
        setTableColumns(columns);

        const data = [];
        summaryRows = [];

        // console.log(worksheetModel.rowCount);
        for (let i = 3; i < worksheetModel.rowCount; i++) {
          let row = worksheetModel.getRow(i);
          let nextRow = worksheetModel.getRow(i + 1);
          let record = {};
          row.eachCell((cell, colNumber) => {
            if (colNumber >= 12) return;
            const { _mergeCount, col, row, text } = cell;
            let f = columns2[colNumber - 1].text;
            record[f] = text;

            if (f.endsWith("-内容")) {
              record[f + "-selected"] = false;
              // console.log(
              //   `${record["3场景-5阶段"]}-${f.split("-")[0]}-${text}`
              // );
              record[f + "-radar"] = treeData.get(
                `${record["3场景-5阶段"]}-${f.split("-")[0]}-${text}`
              )?.radar;
              if (!record[f + "-radar"]) {
                debugger;
              }
            }
            if (f === "创新应用-maxScore") {
              if (_mergeCount > 1) {
                maxScoreMap.set(text, {
                  max: text.match(/\d+/)[0],
                  current: 0,
                });
                record.maxScoreGroup = text;
                record.maxScoreRowSpan = _mergeCount + 1;
              } else if (_mergeCount === 1) {
                record[f] = "";
                record.maxScoreColSpan = 0;
                record.contentColSpan = 2;
              } else {
                record.maxScoreGroup = text;
                // maxScoreMap.set("text", { max: 0, current: 0 });
                record.maxScoreRowSpan = 0;
              }
            } else if (f === "3场景-5阶段") {
              if (_mergeCount > 0) {
                record.column1RowSpan = _mergeCount + 2;
              } else {
                record.column1RowSpan = 0;
              }
            }
            // console.log(cell.value);
          });
          record.key = i;
          data.push(record);
          if (row.getCell(1).text !== nextRow.getCell(1).text) {
            let summaryRow = {
              column1RowSpan: 0,
              "平台协同-内容": "合计得分",
              "平台协同-评分": "0",
              "BIM孪生-评分": "0",
              maxScoreColSpan: 0,
              contentColSpan: 2,
              "创新应用-评分": "0",
              isSummary: true,
              key: i + "-summary",
            };
            data.push(summaryRow);
            summaryRows.push(summaryRow);
          }
        }
        // console.log(summaryRows);
        // console.log(maxScoreMap);
        // console.log(data);
        setTableData(data);

        // 准备导出工作簿
        setWorkbook(workbook);
      } catch (error) {
        console.error("Error fetching or parsing the Excel file:", error);
      }
    };

    const newExcel = () => {
      const workbook = new ExcelJS.Workbook();

      // create a sheet with red tab colour
      const sheet1 = workbook.addWorksheet("My Sheet1", {
        properties: { tabColor: { argb: "FFC0000" } },
      });
      sheet1.getCell("L5").value = `超前直观体5`;
      sheet1.getCell("L50").value = `超前直观体50`;
      sheet1.getCell("L200").value = `超前直观体200`;

      sheet1.headerFooter.differentOddEven = true;
      sheet1.headerFooter.oddFooter = "&LPage &P of &N";
      sheet1.headerFooter.evenFooter = "Page &P of &N wahahah";
      // sheet1.autoFilter = 'A1:C1';
      sheet1.getCell("A1").note = "Hello, ExcelJS!";
      sheet1.getCell("B1").note = {
        texts: [
          {
            font: {
              size: 12,
              color: { theme: 0 },
              name: "Calibri",
              family: 2,
              scheme: "minor",
            },
            text: "This is ",
          },
          {
            font: {
              italic: true,
              size: 12,
              color: { theme: 0 },
              name: "Calibri",
              scheme: "minor",
            },
            text: "a",
          },
          {
            font: {
              size: 12,
              color: { theme: 1 },
              name: "Calibri",
              family: 2,
              scheme: "minor",
            },
            text: " ",
          },
          {
            font: {
              size: 12,
              color: { argb: "FFFF6600" },
              name: "Calibri",
              scheme: "minor",
            },
            text: "colorful",
          },
          {
            font: {
              size: 12,
              color: { theme: 1 },
              name: "Calibri",
              family: 2,
              scheme: "minor",
            },
            text: " text ",
          },
          {
            font: {
              size: 12,
              color: { argb: "FFCCFFCC" },
              name: "Calibri",
              scheme: "minor",
            },
            text: "with",
          },
          {
            font: {
              size: 12,
              color: { theme: 1 },
              name: "Calibri",
              family: 2,
              scheme: "minor",
            },
            text: " in-cell ",
          },
          {
            font: {
              bold: true,
              size: 12,
              color: { theme: 1 },
              name: "Calibri",
              family: 2,
              scheme: "minor",
            },
            text: "format",
          },
        ],
        margins: {
          insetmode: "custom",
          inset: [0.25, 0.25, 0.35, 0.35],
        },
        protection: {
          locked: true,
          lockText: false,
        },
        editAs: "twoCells",
      };

      sheet1.addTable({
        name: "MyTable",
        ref: "A6",
        headerRow: true,
        totalsRow: true,
        style: {
          theme: "TableStyleDark3",
          showRowStripes: true,
        },
        columns: [
          { name: "Date", totalsRowLabel: "Totals:", filterButton: true },
          { name: "Amount", totalsRowFunction: "sum", filterButton: false },
        ],
        rows: [
          [new Date("2019-07-20"), 70.1],
          [new Date("2019-07-21"), 70.6],
          [new Date("2019-07-22"), 70.1],
        ],
      });

      setWorkbook(workbook);
    };

    fetchExcel();
    // newExcel();
  }, [change]);

  useEffect(() => {
    const checkboxChange = (value, text, record, index) => {
      // console.log(value, text, record);
      record[`${text}-内容-selected`] = value;
      setTableData((t) => {
        maxScoreMap.values().forEach((m) => {
          m.current = 0;
        });
        let summary = 0;
        if (value) {
          if (text === "创新应用" && record["maxScoreGroup"]) {
            let m = maxScoreMap.get(record[`maxScoreGroup`]);
            let diff = Math.min(m.max - m.current, record[`${text}-评分`] || 0);
            m.current += diff;
            summary += diff;
          } else {
            summary += Number(record[`${text}-评分`] || 0);
          }
        }

        let pre = index - 1;
        while (true) {
          let preRecord = t[pre];
          if (preRecord?.["3场景-5阶段"] !== record["3场景-5阶段"]) break;
          // console.log(preRecord);
          if (preRecord[`${text}-内容-selected`]) {
            if (text === "创新应用" && preRecord["maxScoreGroup"]) {
              let m = maxScoreMap.get(preRecord[`maxScoreGroup`]);
              let diff = Math.min(
                m.max - m.current,
                preRecord[`${text}-评分`] || 0
              );
              m.current += diff;
              summary += diff;
            } else {
              summary += Number(preRecord[`${text}-评分`] || 0);
            }
          }
          pre--;
        }
        let next = index + 1;
        while (true) {
          let nextRecord = t[next];
          if (nextRecord?.["3场景-5阶段"] !== record["3场景-5阶段"]) {
            nextRecord[`${text}-评分`] = summary;
            break;
          }
          // console.log(nextRecord);
          if (nextRecord[`${text}-内容-selected`]) {
            // summary += Number(nextRecord[`${text}-评分`] || 0);
            if (text === "创新应用" && nextRecord["maxScoreGroup"]) {
              let m = maxScoreMap.get(nextRecord[`maxScoreGroup`]);
              let diff = Math.min(
                m.max - m.current,
                nextRecord[`${text}-评分`] || 0
              );
              m.current += diff;
              summary += diff;
            } else {
              summary += Number(nextRecord[`${text}-评分`] || 0);
            }
          }
          next++;
        }
        // console.log(summary);
        let total1 = 0;
        summaryRows.forEach((row) => {
          for (let i = 1; i < tableColumns.length; i++) {
            total1 += +row[tableColumns[i].title + "-评分"];
          }
        });
        setTotalScore(total1);
        return [...t];
      });

      let r = record[`${text}-内容-radar`];
      radarData = radarData.map((i, index) => {
        let realS = value ? r[index].value : -r[index].value;
        if (maxRadarScoreMap.has(r[index].group)) {
          let t = maxRadarScoreMap.get(r[index].group);

          if (value) {
            realS = Math.max(0, Math.min(t.max - t.current, t.single));
            t.current += t.single;
          } else {
            realS = Math.min(
              0,
              Math.max(t.current - t.max - t.single, -t.single)
            );
            t.current -= t.single;
          }
        }
        return i + realS;
      });
      // console.log(radarData);
      setRadar100(
        radarData.map((r, i) => Math.ceil((r * 100) / radarTotal[i]))
      );
    };

    tableColumns.forEach((c) => {
      c.children.forEach((cc) => {
        if (cc.title === "选择") {
          cc.render = (_, record, index) => {
            return record[`${c.title}-内容`] ? (
              <>
                <Checkbox
                  checked={record[`${c.title}-内容-selected`]}
                  onChange={(e) =>
                    checkboxChange(e.target.checked, c.title, record, index)
                  }
                />
              </>
            ) : null;
          };
        }
      });
    });
    setTableColumns2([...tableColumns]);
  }, [tableColumns]);

  const exportExcel = async (workbook) => {
    if (workbook) {
      // 使用ExcelJS导出工作簿为Buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // 创建Blob对象用于下载
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // 创建下载链接
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "modified.xlsx";
      downloadLink.click();
    }
  };

  const onFinish = (values) => {
    console.log("Success:", values);
    const worksheetInfo = workbook.getWorksheet("项目概况");
    Object.keys(values).forEach((key, index) => {
      // let item = formItems.find((item) => item.text === key);
      let item = formItems[index];
      worksheetInfo.getCell(item.row, item.col + 1).value =
        values[key]?.toString();
    });
    setWorkbook(workbook);
    exportExcel(workbook);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const showTable3 = () => {
    tableData.forEach((x) => {
      stages.forEach((s) => {
        if (x[`${s}-内容`] && x[`${s}-内容-selected`]) {
          tableData3[
            treeData.get(`${x["3场景-5阶段"]}-${s}-${x[s + "-内容"]}`).index
          ]["4"] = Math.ceil(x[`${s}-评分`] / scoreWeightMap[x["3场景-5阶段"]]);
        }
      });
    });

    let total1 = 0;
    let rr = 0;
    let sceneRows = [];
    let stageRows = [];
    for (let i = 0; i < tableData3.length; ) {
      stageRows.push(i);
      i += tableData3[i]["2-rowSpan"];
    }

    for (let i = 0; i < tableData3.length; ) {
      sceneRows.push(i);
      i += tableData3[i]["1-rowSpan"];
    }

    console.log(sceneRows);
    let xx = 0;
    let yy = 0;

    summaryRows.forEach((row) => {
      let sss = 0;
      for (let i = 1; i < tableColumns.length; i++) {
        let n = +row[tableColumns[i].title + "-评分"];
        sss += n;
        let item = tableData3[stageRows[xx++]];
        item["5"] = Math.ceil(n / scoreWeightMap[item["1"]]);
      }
      let itemSSS = tableData3[sceneRows[yy++]];
      itemSSS["7"] = sss;
    });

    console.log(tableData);
    console.log(tableData3);
    console.log(treeData);
    setTableData3([...tableData3]);
  };

  return (
    <div className={styles.main} onClick={() => {}}>
      <div onClick={showTable3}>{totalScore}</div>
      <br />
      {radar100.join("-")}
      <Table
        columns={tableColumns2}
        dataSource={tableData}
        rowKey="key"
        bordered
        pagination={false}
        rowClassName={(record, index) =>
          record.isSummary ? "summary-row" : ""
        }
      />

      <Table
        columns={tableColumns3}
        dataSource={tableData3}
        rowKey="key"
        bordered
        pagination={false}
        rowClassName={(record, index) =>
          record.isSummary ? "summary-row" : ""
        }
      />
      {/* <Form
        name="basic"
        layout="horizontal"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 1100,
          margin: "atuo",
        }}
        initialValues={{}}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Row gutter={24}>
          {formItems.map((item) => {
            const { text } = item;
            return (
              <Col span={8} key={text}>
                <Form.Item
                  label={text}
                  name={text}
                  rules={[
                    {
                      required: false,
                      message: "Please input your username!",
                    },
                  ]}
                >
                  <Input placeholder={text} />
                </Form.Item>
              </Col>
            );
          })}
        </Row>

        <Form.Item
          wrapperCol={{
            offset: 0,
            span: 24,
          }}
        >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form> */}
    </div>
  );
}

export default MyComponent;
