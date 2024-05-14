"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ExcelJS from "exceljs";
import { Button, Form, Input, Row, Col, Table, Checkbox } from "antd";
import styles from "./page.module.css";

// 3大场景
let scenes = ["平台协同", "BIM孪生", "创新应用"];

const editTableWidth = [
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

const scoreTableWidth = ["10%", "10%", "43.4%", "9%", "9%", "9.3%", "9.3%"];

// key: 阶段 - 场景 - 内容
const fullLevelsMap = new Map();

// 模型表里最多得分
const maxScoreMap = new Map();
// 合计得分行
let summaryRows = [];

// 雷达图表里最多得分
const maxRadarScoreMap = new Map();
let radarData = [0, 0, 0, 0, 0, 0];
const radarTotal = [0, 0, 0, 0, 0, 0];

let scoreTableColumns = [
  "五大阶段",
  "场景",
  "评分项",
  `分项得分（百分制）`,
  "组合得分（百分制）",
  "权重系数",
  "最终评分",
].map((c, i) => ({
  title: c,
  key: i + 1,
  dataIndex: i + 1,
  width: scoreTableWidth[i],
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
  const [workbook, setWorkbook] = useState(null);
  const [formItems, setFormItems] = useState([]);
  const [editTableColumns, setEditTableColumns] = useState([]);
  const [editTableData, setEditTableData] = useState([]);
  const [radar100, setRadar100] = useState([0, 0, 0, 0, 0, 0]);
  const [totalScore, setTotalScore] = useState(0);
  const [scoreTableData, setScoreTableData] = useState([]);

  useEffect(() => {
    const checkboxChange = (value, scene, record, index, tableColumns) => {
      record[`${scene}-内容-selected`] = value;
      setEditTableData((t) => {
        maxScoreMap.values().forEach((m) => {
          m.current = 0;
        });
        let summary = 0;
        calculateRecordScore(record);
        let pre = index - 1;
        while (true) {
          let preRecord = t[pre];
          if (preRecord?.["3场景-5阶段"] !== record["3场景-5阶段"]) break;
          calculateRecordScore(preRecord);
          pre--;
        }
        let next = index + 1;
        while (true) {
          let nextRecord = t[next];
          if (nextRecord?.["3场景-5阶段"] !== record["3场景-5阶段"]) {
            nextRecord[`${scene}-评分`] = summary;
            break;
          }
          calculateRecordScore(nextRecord);
          next++;
        }

        let _totalScore = 0;
        summaryRows.forEach((row) => {
          for (let i = 1; i < tableColumns.length; i++) {
            _totalScore += +row[tableColumns[i].title + "-评分"];
          }
        });
        setTotalScore(_totalScore);
        return [...t];

        function calculateRecordScore(preRecord) {
          if (preRecord[`${scene}-内容-selected`]) {
            if (scene === "创新应用" && preRecord["maxScoreGroup"]) {
              let m = maxScoreMap.get(preRecord[`maxScoreGroup`]);
              let diff = Math.min(
                m.max - m.current,
                preRecord[`${scene}-评分`] || 0
              );
              m.current += diff;
              summary += diff;
            } else {
              summary += Number(preRecord[`${scene}-评分`] || 0);
            }
          }
        }
      });

      let recordRadar = record[`${scene}-内容-radar`];
      radarData = radarData.map((cur, index) => {
        let radarItemValue = value
          ? recordRadar[index].value
          : -recordRadar[index].value;
        if (maxRadarScoreMap.has(recordRadar[index].group)) {
          let t = maxRadarScoreMap.get(recordRadar[index].group);

          if (value) {
            radarItemValue = Math.max(0, Math.min(t.max - t.current, t.single));
            t.current += t.single;
          } else {
            radarItemValue = Math.min(
              0,
              Math.max(t.current - t.max - t.single, -t.single)
            );
            t.current -= t.single;
          }
        }
        return cur + radarItemValue;
      });

      setRadar100(
        radarData.map((r, i) => Math.ceil((r * 100) / radarTotal[i]))
      );
    };

    const fetchExcel = async () => {
      try {
        //rule
        const response = await fetch("智能建造.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        //rule
        const worksheetInfo = workbook.getWorksheet("项目概况");
        const _formItems = [];
        worksheetInfo.eachRow((row, rowNumber) => {
          //rule
          if (rowNumber !== 1) {
            row.eachCell((cell, colNumber) => {
              const { address, col, row, text } = cell;
              _formItems.push({
                address,
                col,
                row,
                text,
              });
            });
          }
        });
        setFormItems(_formItems);

        //rule
        const worksheetRadar = workbook.getWorksheet("雷达图（此sheet不显示）");
        const _scoreTableData = [];
        worksheetRadar.eachRow((row, rowNumber) => {
          //rule
          if (rowNumber > 1 && rowNumber <= 154) {
            const radarRecord = [];
            const scoreTableRecord = { key: rowNumber };
            row.eachCell((cell, colNumber) => {
              const { text, isMerged, _mergeCount } = cell;
              //rule
              if (colNumber > 4) {
                if (isMerged) {
                  if (_mergeCount > 0) {
                    //rule
                    let matches = cell.note.texts[1].text.match(/\d+/g);
                    maxRadarScoreMap.set(
                      `${radarRecord[0]}-${radarRecord[1]}-${radarRecord[2]}-${colNumber}`,
                      {
                        max: Number(matches[1]),
                        single: Number(matches[0]),
                        current: 0,
                      }
                    );
                  }
                  radarRecord.push({
                    value: text.trim(),
                    //rule
                    group: `${radarRecord[0]}-${radarRecord[1]}-${worksheetRadar
                      .getCell(cell.master.row, 3)
                      .text.trim()}-${colNumber}`,
                  });
                } else {
                  radarRecord.push({ value: text.trim() });
                }
              } else {
                radarRecord.push(text.trim());

                scoreTableRecord[colNumber] = text.trim();
                // 合并单元格
                if (isMerged && _mergeCount > 0) {
                  scoreTableRecord[colNumber + "-rowSpan"] = _mergeCount + 1;
                } else if (isMerged && _mergeCount === 0) {
                  scoreTableRecord[colNumber + "-rowSpan"] = 0;
                } else {
                  scoreTableRecord[colNumber + "-rowSpan"] = 1;
                }
              }
            });
            // 分项得分
            scoreTableRecord[4] = 0;
            // 组合得分
            scoreTableRecord[5] = 0;
            // 权重系数
            scoreTableRecord[6] = scoreWeightMap[scoreTableRecord[1]];

            _scoreTableData.push(scoreTableRecord);

            const [stage, scene, content, s1, s2, s3, s4, s5, s6] = radarRecord;
            fullLevelsMap.set(`${stage}-${scene}-${content}`, {
              //rule
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
            // 读取雷达图总计
            row.eachCell((cell, colNumber) => {
              const { text } = cell;
              if (colNumber > 4) {
                radarTotal[colNumber - 5] = Number(text);
              }
            });
          }
        });

        setScoreTableData(_scoreTableData);
        workbook.removeWorksheet(worksheetRadar.id);

        //rule
        const worksheetModel = workbook.getWorksheet("365价值模型");
        const row1 = worksheetModel.getRow(1);
        const row2 = worksheetModel.getRow(2);

        const excelRow2Columns = [];
        let fullWidth = 0;
        for (let i = 1; i <= row2.cellCount - 1; i++) {
          let cell = row2.getCell(i);
          let excelColumn = worksheetModel.getColumn(i);
          let width = excelColumn.width;
          fullWidth += width;
          const { col, text, isMerged, _mergeCount } = cell;
          if (_mergeCount > 0) {
            excelRow2Columns.push({
              text: "maxScore",
              begin: col,
              end: col,
              width,
              colSpan: 0,
              onCell: (_, index) => {
                const { maxScoreRowSpan, maxScoreColSpan } = _;
                return {
                  rowSpan: maxScoreRowSpan,
                  colSpan: maxScoreColSpan,
                };
              },
            });
            fullWidth += worksheetModel.getColumn(i + 1).width;
            excelRow2Columns.push({
              text,
              begin: col,
              end: col + _mergeCount,
              width: worksheetModel.getColumn(i + 1).width,
              colSpan: 2,
              onCell: (_, index) => {
                const { contentColSpan } = _;
                return {
                  colSpan: contentColSpan,
                };
              },
            });
          } else {
            excelRow2Columns.push({
              text,
              begin: col,
              end: col,
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
          if (text === "价值映射") {
            cell.value = "选择";
          }
        }

        const _editTableColumns = [];
        let columnCount = 0;
        for (let i = 1; i <= row1.cellCount; i++) {
          let cell = row1.getCell(i);
          const { col, text, isMerged, _mergeCount } = cell;
          if (cell.text) {
            let antdColumn = {
              title: text,
              key: text,
              dataIndex: text,
              begin: col,
              end: col + _mergeCount,
            };
            let mergeBegin = excelRow2Columns.findIndex((v, index) => {
              return v.begin === antdColumn.begin;
            });
            let mergeEnd = excelRow2Columns.findIndex((v, index) => {
              return v.end === antdColumn.end;
            });
            if (true || mergeBegin !== mergeEnd) {
              antdColumn.children = [];
              excelRow2Columns.slice(mergeBegin, mergeEnd + 1).forEach((c) => {
                //rule
                let showText = c.text !== "价值映射" ? c.text : "选择";
                let newKey = `${text}-${showText}`;
                let andtChildColumn = {
                  title: showText,
                  key: newKey,
                  dataIndex: newKey,
                  begin: c.begin,
                  end: c.end,
                  colSpan: c.colSpan,
                  onCell: c.onCell,
                  // Math.floor((c.width * 100) / fullWidth).toFixed(2) + "%",
                  width: editTableWidth[columnCount],
                  textWrap: "word-break",
                  className: c.text === "内容" ? "content-column" : "",
                };
                if (showText === "选择") {
                  andtChildColumn.render = (_, record, index) => {
                    return record[`${text}-内容`] ? (
                      <>
                        <Checkbox
                          checked={record[`${text}-内容-selected`]}
                          onChange={(e) =>
                            checkboxChange(
                              e.target.checked,
                              text, //场景
                              record,
                              index,
                              _editTableColumns
                            )
                          }
                        />
                      </>
                    ) : null;
                  };
                }
                antdColumn.children.push(andtChildColumn);
                columnCount++;
                // 列名内容加上‘场景-’前缀
                c.text = `${text}-${c.text}`;
              });
            }
            _editTableColumns.push(antdColumn);
          }
          i += _mergeCount;
        }
        setEditTableColumns([..._editTableColumns]);

        const _editTableData = [];
        summaryRows = [];

        for (let i = 3; i < worksheetModel.rowCount; i++) {
          let row = worksheetModel.getRow(i);
          let nextRow = worksheetModel.getRow(i + 1);
          let record = {};
          row.eachCell((cell, colNumber) => {
            if (colNumber >= 12) return;
            const { _mergeCount, col, row, text } = cell;
            let f = excelRow2Columns[colNumber - 1].text;
            record[f] = text;

            if (f.endsWith("-内容")) {
              record[f + "-selected"] = false;
              record[f + "-position"] = [row, col + 1];
              // console.log(
              //   `${record["3场景-5阶段"]}-${f.split("-")[0]}-${text}`
              // );
              record[f + "-radar"] = fullLevelsMap.get(
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
          _editTableData.push(record);
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
            _editTableData.push(summaryRow);
            summaryRows.push(summaryRow);
          }
        }
        setEditTableData(_editTableData);

        setWorkbook(workbook);
      } catch (error) {
        console.error("Error fetching or parsing the Excel file:", error);
      }
    };

    fetchExcel();
  }, []);

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
    let analysisStage = {};
    let analysisScene = {};
    const worksheetModel = workbook.getWorksheet("365价值模型");
    editTableData.forEach((x) => {
      scenes.forEach((scene) => {
        let stage = x["3场景-5阶段"];
        let valueMap = x[`${scene}-价值映射`];
        if (x[`${scene}-内容`] && x[`${scene}-内容-selected`]) {
          // 得分表里每一个评分项的得分
          scoreTableData[
            fullLevelsMap.get(`${stage}-${scene}-${x[scene + "-内容"]}`).index
          ]["4"] = Math.ceil(x[`${scene}-评分`] / scoreWeightMap[stage]);

          //价值映射
          analysisStage[stage] =
            analysisStage[stage] ||
            new Array(6).fill(null).map(() => new Set());
          valueMap.split("、").forEach((v) => {
            analysisStage[stage][Number(v) - 1].add(x[`${scene}-内容`]);
          });

          analysisScene[scene] =
            analysisScene[scene] ||
            new Array(6).fill(null).map(() => new Set());
          valueMap.split("、").forEach((v) => {
            analysisScene[scene][Number(v) - 1].add(x[`${scene}-内容`]);
          });
          let position = x[`${scene}-内容-position`];
          worksheetModel.getCell(position[0], position[1]).value = "✓";
        } else if (
          x[`${scene}-内容`] &&
          !x.key.toString().endsWith("-summary")
        ) {
          analysisStage[stage] =
            analysisStage[stage] ||
            new Array(6).fill(null).map(() => new Set());
          analysisScene[scene] =
            analysisScene[scene] ||
            new Array(6).fill(null).map(() => new Set());
          let position = x[`${scene}-内容-position`];
          worksheetModel.getCell(position[0], position[1]).value = "";
        }
      });
    });
    console.log(analysisStage);
    console.log(analysisScene);

    let sceneRows = [];
    let stageRows = [];
    for (let i = 0; i < scoreTableData.length; ) {
      stageRows.push(i);
      i += scoreTableData[i]["2-rowSpan"];
    }

    for (let i = 0; i < scoreTableData.length; ) {
      sceneRows.push(i);
      i += scoreTableData[i]["1-rowSpan"];
    }

    console.log(sceneRows);
    let xx = 0;
    let yy = 0;

    summaryRows.forEach((row) => {
      let sss = 0;
      for (let i = 1; i < editTableColumns.length; i++) {
        let n = +row[editTableColumns[i].title + "-评分"];
        sss += n;
        let item = scoreTableData[stageRows[xx++]];
        item["5"] = Math.ceil(n / scoreWeightMap[item["1"]]);
      }
      let itemSSS = scoreTableData[sceneRows[yy++]];
      itemSSS["7"] = sss;
    });

    console.log(editTableData);
    console.log(scoreTableData);
    console.log(fullLevelsMap);
    setScoreTableData([...scoreTableData]);

    worksheetModel.getRow(1).eachCell((cell, colNumber) => {
      const { address, col, row, text } = cell;
      if (analysisScene[text]) {
        let texts = [];
        analysisScene[text]?.forEach((arr, i) => {
          arr = Array.from(arr);
          if (!arr.length) return;
          if (text === "平台协同") {
            if (arr.filter((a) => a.endsWith("在线协同")).length > 1) {
              arr = Array.from(
                new Set(
                  arr.map((a) =>
                    a.endsWith("在线协同") ? "平台计划在线协同" : a
                  )
                )
              );
            }
          }
          if (i == 0) {
            texts.push(`1、通过应用${arr.join("、")}，实现结构安全；\n`);
          } else if (i === 1) {
            texts.push(`2、通过应用${arr.join("、")}，实现成本优；\n`);
          } else if (i === 2) {
            texts.push(`3、通过应用${arr.join("、")}，实现低碳智慧；\n`);
          } else if (i === 3) {
            texts.push(`4、通过应用${arr.join("、")}，实现品质好；\n`);
          } else if (i === 4) {
            texts.push(`5、通过应用${arr.join("、")}，实现施工快；\n`);
          } else if (i === 5) {
            texts.push(`6、通过应用${arr.join("、")}，实现人工省。\n`);
          }
        });
        worksheetModel.getCell(125, col).value = texts.join("");
      }
    });

    const titleMap = {
      投资与策划: "强排规划、价值分析辅助投资决策，三图两表上平台\n",
      规划与设计:
        "超前直观体验，优化空间关系，减少设计差错，创新技术体系，辅助方案决策\n",
      生产与供应: "孪生智能制造，一件一码JIT，平台撮合招采\n",
      施工与交付:
        "精准共享排程，复杂工艺仿真，低碳智慧施工，孪生交付（实物+数据资产（资产负债表））\n",
      运营与消纳: "智慧楼宇、数字运维，城市大脑、国家资产\n",
    };

    worksheetModel.getColumn(1).eachCell((cell, rowNumber) => {
      const { address, col, row, text } = cell;
      if (analysisStage[text]) {
        let title = titleMap[text];
        let texts = [];

        analysisStage[text]?.forEach((arr, i) => {
          arr = Array.from(arr);
          if (!arr.length) return;
          if (i == 0) {
            texts.push(`1、通过应用${arr.join("、")}，实现结构安全；\n`);
          } else if (i === 1) {
            texts.push(`2、通过应用${arr.join("、")}，实现成本优；\n`);
          } else if (i === 2) {
            texts.push(`3、通过应用${arr.join("、")}，实现低碳智慧；\n`);
          } else if (i === 3) {
            texts.push(`4、通过应用${arr.join("、")}，实现品质好；\n`);
          } else if (i === 4) {
            texts.push(`5、通过应用${arr.join("、")}，实现施工快；\n`);
          } else if (i === 5) {
            texts.push(`6、通过应用${arr.join("、")}，实现人工省。\n`);
          }
        });
        worksheetModel.getCell(rowNumber, 12).value = {
          richText: [
            { font: { name: "宋体", size: 12, bold: true }, text: title },
            { font: { name: "宋体", size: 11 }, text: texts.join("") },
          ],
        };
      }
    });
    setWorkbook(workbook);
  };

  return (
    <div className={styles.main} onClick={() => {}}>
      <div onClick={showTable3}>{totalScore}</div>
      <br />
      {radar100.join("-")}
      <Form
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
      </Form>
      <Table
        columns={editTableColumns}
        dataSource={editTableData}
        rowKey="key"
        bordered
        pagination={false}
        rowClassName={(record, index) =>
          record.isSummary ? "summary-row" : ""
        }
      />

      <Table
        columns={scoreTableColumns}
        dataSource={scoreTableData}
        rowKey="key"
        bordered
        pagination={false}
        rowClassName={(record, index) =>
          record.isSummary ? "summary-row" : ""
        }
      />
    </div>
  );
}

export default MyComponent;
