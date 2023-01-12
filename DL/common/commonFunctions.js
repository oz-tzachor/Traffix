let calcQurater = (min) => {
    let quart;
    if (min <= 0.25) {
      quart = "1";
    } else if (min <= 0.5) {
      quart = "2";
    } else if (min <= 0.75) {
      quart = "3";
    } else if (min <= 1) {
      quart = "4";
    }
    if (!quart) {
      console.log("quart undefeind");
    }
    return quart;
  };


  module.exports={calcQurater,}