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

const treeData = new Map();

const maxScoreGroup = {
  group1: { max: 0, real: 0 },
  group2: { max: 0, real: 0 },
  group3: { max: 0, real: 0 },
  group4: { max: 0, real: 0 },
  group5: { max: 0, real: 0 },
  group6: { max: 0, real: 0 },
  group7: { max: 0, real: 0 },
};

const maxScoreMap = new Map();

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [workbook, setWorkbook] = useState(null);
  const [formItems, setFormItems] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableColumns2, setTableColumns2] = useState([]);
  const [change, setChange] = useState(3);
  const [tableData, setTableData] = useState([]);

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

        const temp1 = [];
        const worksheetRadar = workbook.getWorksheet("雷达图（此sheet不显示）");
        worksheetRadar.eachRow(function (row, rowNumber) {
          if (rowNumber > 1 && rowNumber <= 154) {
            temp1.push(row.values);
            const [, stage, scene, content, , s1, s2, s3, s4, s5, s6] =
              row.values;
            treeData.set(`${stage}-${scene}-${content}`, [
              s1,
              s2,
              s3,
              s4,
              s5,
              s6,
            ]);
          }
        });

        console.log(treeData);

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
              console.log(
                `${record["3场景-5阶段"]}-${f.split("-")[0]}-${text}`
              );
              record[f + "-radar"] = treeData.get(
                `${record["3场景-5阶段"]}-${f.split("-")[0]}-${text}`
              );
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
                record[f] = '';
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
            data.push({
              column1RowSpan: 0,
              "平台协同-内容": "合计得分",
              "平台协同-评分": "0",
              "BIM孪生-评分": "0",
              maxScoreColSpan: 0,
              contentColSpan: 2,
              "创新应用-评分": "0",
              isSummary: true,
              key: i + "-summary",
            });
          }
        }
        console.log(maxScoreMap);
        console.log(data);
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
      console.log(value, text, record);
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
          console.log(preRecord);
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
          console.log(nextRecord);
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
        console.log(summary);
        return [...t];
      });
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

  return (
    <div className={styles.main} onClick={() => {}}>
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
