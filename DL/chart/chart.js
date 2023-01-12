const chartNodeJs = require("chartjs-node-canvas");
const width = 800; // define width and height of canvas
const height = 500;
const fs = require("fs");
const chartCallback = (ChartJS) => {
  console.log("chart built");
};
let watermark = require("jimp-watermark");
const { createWatermark } = require("../jimp/jimp");
const canvasRenderService = new chartNodeJs.ChartJSNodeCanvas({
  width,
  height,
  chartCallback,
});
let createDataChart = async (route, type = "daily") => {
  return new Promise(async (resolve, reject) => {
    try {
      let avgByDays = route.avgByDays;
      let day = new Date().getDay() -1;
      let dataInput = [];
      let labelsInput = [];
      let lastKnownData = 0;
      let sum = 0;
      Object.keys(avgByDays[day]).forEach((hour) => {
        let hourAvg = avgByDays[day][hour]["hourAvg"].value;
        if (hourAvg === 0) {
          hourAvg = lastKnownData;
        } else {
          lastKnownData = hourAvg;
        }
        sum += hourAvg;
        if(Number(hour)>4 &&Number(hour)<=23){

          if (hourAvg !== 0 && !isNaN(hourAvg)) {
            dataInput.push(hourAvg);
          }
          let hourToSave = `${hour}:00`;
          if (hourToSave) {
            labelsInput.push(hourToSave);
          } else {
            labelsInput.push("");
          }
        }
      });
      let maxValue = Math.floor(Math.max(...dataInput) * 1.2);
      let minValue = Math.floor(Math.min(...dataInput) * 0.8);
      let dataObj = {
        dataInput,
        labelsInput,
        maxValue,
        minValue,
        route,
        type,
        chartType: "line",
      };
      let imageRes = await createImage(dataObj);
      //save the chart
      let chatId = 160151970;
      let imagePath = `uploads/graph/raw`;
      // let imagePath = `uploads/${Date.now()}.png`;
      if (imageRes) {
        // if (!fs.existsSync(imagePath)) {
        //   fs.mkdirSync(imagePath);
        // }
        // imagePath += `/${type}`;
        // if (!fs.existsSync(imagePath)) {
        //   fs.mkdirSync(imagePath);
        // }
        imagePath += `/${route._id}.png`;
        fs.writeFile(imagePath, imageRes, "utf8", async function (err) {
          if (err) throw err;
          console.log("File saved.");
          resolve(imagePath);
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
const createImage = async (dataObj) => {
  let { dataInput, labelsInput, maxValue, minValue, route, type, chartType } =
    dataObj;
  try {
    let colors = {
      mainOrange: "#f39c12",
      mainPurple: "#7D56A5",
    };

    let dataSetsCommon = {
      pointRadius: 0,
      hitRadius: 3,
      spanGaps: true,
      borderWidth: 2,
      backgroundColor: "white",
    };
    let data = {
      //   labels,
      labels: labelsInput,
      datasets: [
        {
          label: `${new Date(route.lastAvgUpdate).toLocaleDateString()}`,
          data: dataInput,
          borderColor: colors.mainOrange,
          backgroundColor: "white",
          ...dataSetsCommon,
        },
      ],
    };
    const options = {
      type: chartType, // for line chart
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "שעה ביום ",
            },
            // <-- axis is not array anymore, unlike before in v2.x: '[{'
            grid: {
              borderColor: colors.mainOrange, // <-- this line is answer to initial question
              borderWidth: 2,
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: "זמן נסיעה",
            },
            // <-- axis is not array anymore, unlike before in v2.x: '[{'
            grid: {
              // color: "rgba(0,255,0,0.1)",
              borderColor: colors.mainOrange, // <-- this line is answer to initial question
              display: true,
              borderWidth: 2,
            },
            min: minValue,
            max: maxValue,
            ticks: {
              // steps: tabUnit === "CM" ? 5 : null,
              stepSize: 1,
            },
          },
        },
        responsive: false,
        tension: 0.3,
        showLine: true,
        plugins: {
          title: {
            display: true,
            text: `${route.from} - ${route.to}`,
            align: "center",
          },
          legend: {
            display: true,
          },
          //   tooltip: {
          //     //fonts of the hover box
          //     titleFont: {
          //       family: "commic-sans-ms",
          //     },
          //     bodyFont: {
          //       weight: "bold",
          //     },
          //     bodyColor: mainOrange,
          //     titleColor: "white",
          //     titleAlign: "center",
          //     footerSpacing: 7,
          //     displayColors: false,
          //     bodyAlign: "center",
          //     callbacks: {
          //       label: function (context) {
          //         let formattedValue = context?.formattedValue;
          //         if (formattedValue) {
          //           console.log(formattedValue, tabUnit);
          //           formattedValue += ` ${tabUnit}`;
          //         }
          //         return formattedValue;
          //       },
          //     },
          //   },
        },
      },
    };
    options.data = data;
    // let config = options;
    const imageRes = await canvasRenderService.renderToBuffer(options);
    // const dataUrl = await canvasRenderService.renderToDataURL(configuration);
    // const stream = canvasRenderService.renderToStream(configuration);
    // const dataUrl = await canvasRenderService.renderToDataURL(configuration); // converts chart to image
    return imageRes;
  } catch (e) {
    console.log("error in chart", e);
  }
};

module.exports = {
  createDataChart, //for exporting to another file
};
