let watermark = require("jimp-watermark");
//
const fs = require("fs");
const createWatermark = async (currentImagePath, routeId) => {
  return new Promise(async (resolve, reject) => {
    let waterMarkPath = `uploads/graph/watermarks/${routeId}.png`;
    let logoPath = "assets/images/watermark2.jpg";
    var options = {
      ratio: 0.65, // Should be less than one
      opacity: 0.2, //Should be less than one
      dstPath: waterMarkPath,
    };
    watermark
      .addWatermark(currentImagePath, logoPath, options)
      .then((data) => {
        setTimeout(()=>{
          resolve(data.destinationPath);
        },2000)

      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports = { createWatermark };
