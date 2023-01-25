const telegramUserLogic = require("../../BL/telegramUserLogic");
const trafficRouteLogic = require("../../BL/trafficRouteLogic");
const trafficUpdateLogic = require("../../BL/trafficUpdateLogic");
const { validateEmail } = require("../validators/userSchemaJoi");
const { calcQurater } = require("../common/commonFunctions");
const {
  loginMessage,
  greetingMessage,
  inputEmailMessage,
  inputPassword,
  repeatPassword,
  signedUpSuuccessfully,
  emailExist,
  resetEmail,
  retypeEmail,
  followTheInstructions,
  mainMessage,
  emailNotValid,
  chooseRoute,
  liveUpdate,
  graphWillDelete,
  scheduleUpdatesFirstMessage,
  chooseScheduleTime,
  scheduleUpdateAddSuccessfully,
  scheduleAlertsFirtMessage,
  scheduleAlertsChooseFromHour,
  scheduleAlertsChooseToHour,
  scheduleAlertsAddSuccessfully,
  codeSent,
  codeIsInvalid,
  codeIsValid,
  firstTimeMainMenu,
  sendLastName,
} = require("./messagesTemplates");
const { grabFromWaze } = require("../puppeteer/grabFromWaze");
const { createDataChart } = require("../chart/chart");
const { createWatermark } = require("../jimp/jimp");
const { newMessageId } = require("../../BL/messageIdLogic");
const { emojis } = require("./emojis");
const { manageRouteAvg } = require("../../BL/trafficRouteLogic");
const { verificationCodeRequests } = require("../../BL/verificationCodeLogic");
const { sendVerificationCode } = require("../mails/templates");
const mails = require("../mails/mails");
let keyboardsButtons = {
  loginFlow: {
    loginMessage: [["אני רוצה להתחבר"]],
  },
  mainFlow: {
    mainMessage: [
      ["קבלת עדכון חי על מצב התנועה" + emojis.coolGuy],
      ["קבלת נתונים לפי יום בנתיב מסוים" + emojis.dashboard],
      ["קבלת עדכוני תנועה בשעה קבועה" + emojis.fix],
      ["קבלת התראות על עומסים בטווח שעות מוגדר     " + emojis.warning],
      [`שליחת בקשה להוספת נתיב ${emojis.plus}`],
      [`תרומה לפעילות של Traffix ${emojis.money} ${emojis.heartFace}`],
    ],
    chooseRoute: [],
    chooseHour: [],
  },
};
let addBackToMainMenu = true;
let backToMainMenuText = `חזרה לתפריט הראשי ${emojis.dashboard} ${emojis.restart}`;
let createKeyboard = (arrayOfButtons) => {
  let arr = [];
  if (!arrayOfButtons) {
    //Mean that this i the main message
    arr = [...keyboardsButtons.mainFlow.mainMessage];
    arrayOfButtons = arr;
    addBackToMainMenu = false;
  } else {
    arr = [...arrayOfButtons];
    if (currentUser?.authenticated) {
      addBackToMainMenu = true;
    }
  }
  if (addBackToMainMenu) {
    arr.push([backToMainMenuText]);
  }
  return {
    reply_markup: {
      keyboard: [...arr],
    },
  };
};
let extractUserSelection = (string) => {
  let res = Number(string.slice(0, 2)) - 1;
  if (isNaN(res)) {
    res = Number(string.slice(0, 1)) - 1;
  }
  return res;
};
//
// mainMessage:[
//   'קבלת עדכון חי על מצב התנועה',

//       ]
///
let currentChatId;
let currentMessage;
let localSendMessage;
let localSendImage;
let localDeleteMessage;
let currentUser;
const newMessage = (chatId, message, sendFunc, imageFunc, deleteFunc) => {
  currentChatId = chatId;
  currentMessage = message.toLowerCase();
  localSendMessage = sendFunc;
  localSendImage = imageFunc;
  localDeleteMessage = deleteFunc;
  checkUser();
};
const changeTelegramState = async (state) => {
  let updateState = await telegramUserLogic.updateUserDetails(
    { chatId: currentChatId },
    { state }
  );
  return updateState;
};
let getRoutes = async (selectExpression = null) => {
  let routes = await trafficRouteLogic.getTrafficRoutes(
    { isActive: true },
    selectExpression
  );
  return routes;
};
const checkUser = async () => {
  currentUser = await telegramUserLogic.getTelegramUser({
    chatId: currentChatId,
  });
  if (currentMessage === "/start") {
    checkUser();
    // localSendMessage(
    //   currentChatId,
    //   mainMessage(),
    //   createKeyboard(keyboardsButtons.mainFlow.mainMessage)
    // );
    // changeTelegramState("main_chooseAction");
    return;
  }
  if (currentMessage === "calcavg") {
    manageRouteAvg();
    localSendMessage(currentChatId, "calc avg");
    localSendMessage(currentChatId, mainMessage(), createKeyboard());
    changeTelegramState("main_chooseAction");
    return;
  }
  if (currentMessage.toLowerCase() === "deleteall") {
    // await trafficRouteLogic.deleteAllTargets();
    localSendMessage(currentChatId, "All deleted");
    localSendMessage(currentChatId, mainMessage(), createKeyboard());
    changeTelegramState("main_chooseAction");
    return;
  }

  if (currentMessage.toLowerCase() === "reset") {
    changeTelegramState("login_initial");
    telegramUserLogic.updateUserDetails(
      { chatId: currentChatId },
      {
        authenticated: false,
      }
    );
    localSendMessage(currentChatId, "reset");
    return;
  }
  if (
    (currentUser &&
      currentUser.authenticated &&
      currentMessage === backToMainMenuText) ||
    currentMessage.toLowerCase() === "setup"
  ) {
    localSendMessage(currentChatId, mainMessage(), createKeyboard());
    changeTelegramState("main_chooseAction");
    return;
  }
  if (!currentUser || !currentUser?.authenticated) {
    if (!currentUser) {
      localSendMessage(
        currentChatId,
        loginMessage(),
        createKeyboard(keyboardsButtons.loginFlow.loginMessage)
      );
      let newTelegramUser = await telegramUserLogic.newTelegramUser({
        chatId: currentChatId,
      });
      return;
    } else {
      if (!currentUser.authenticated) {
        addBackToMainMenu = false;
        loginFlow(currentUser.state);
      } else {
        mainFlow(currentUser.state);
      }
    }
  } else {
    if (currentUser.state === "initial") {
      loginFlow(currentUser.state);
    } else {
      mainFlow(currentUser.state);
    }
  }
};
let valid;
let loginFlow = async (state) => {
  console.log("login flow state", state);
  switch (state) {
    case "login_initial":
      if (currentMessage === keyboardsButtons.loginFlow.loginMessage[0][0]) {
        localSendMessage(currentChatId, inputEmailMessage());
        changeTelegramState("login_sendMail");
        break;
      } else {
        localSendMessage(
          currentChatId,
          loginMessage(),
          createKeyboard(keyboardsButtons.loginFlow.loginMessage)
        );
        break;
      }
      // localSendMessage(
      //   currentChatId,
      //   loginMessage(),
      //   createKeyboard(keyboardsButtons.loginFlow.loginMessage)
      // );
      break;
    case "login_sendMail":
      let user = await telegramUserLogic.getTelegramUser({
        email: currentMessage,
      });
      if (
        user &&
        user.email === currentMessage.toLowerCase() &&
        user._id.toString() !== currentUser._id.toString()
      ) {
        localSendMessage(currentChatId, emailExist());
        changeTelegramState("login_emailExist");
        return;
      }
      let validEmail = validateEmail(currentMessage).valid;
      if (!validEmail) {
        return localSendMessage(currentChatId, emailNotValid(currentMessage));
      }

      let code = await verificationCodeRequests.createVerificationCode(
        currentUser
      );
      await mails.sendVerificationCode(currentMessage, code);
      user = await telegramUserLogic.updateUserDetails(
        { chatId: currentChatId },
        {
          email: currentMessage,
        }
      );
      localSendMessage(currentChatId, codeSent(currentMessage));
      changeTelegramState("login_send_code");
      break;
    case "login_emailExist":
      if (currentMessage === "1") {
        //
        localSendMessage(currentChatId, retypeEmail());
        changeTelegramState("login_sendMail");
      } else if (currentMessage === "2") {
        //timer for the 5 minutes valid
        localSendMessage(currentChatId, resetEmail(currentUser.email));
        //send mail with 4 digit verification
        changeTelegramState("login_resetMail");
        //
      } else {
        localSendMessage(currentChatId, followTheInstructions());
        setTimeout(() => {
          localSendMessage(currentChatId, emailExist());
        }, 2000);
      }
      break;
    case "login_send_code":
      if (currentMessage.length > 6 || isNaN(Number(currentMessage))) {
        //handle wrong input
      }
      valid = await verificationCodeRequests.validateVerificationCode(
        currentUser,
        currentMessage
      );

      if (valid === -1) {
        //handle invalid code
        localSendMessage(
          currentChatId,
          codeIsInvalid(currentUser.email, currentMessage)
        );
        changeTelegramState("login_resend_code");
        return;
      }
      if (valid === 0) {
        // code expired
        return;
      }
      localSendMessage(currentChatId, codeIsValid());
      changeTelegramState("login_send_firstName");
      break;
    //
    case "login_resend_code":
      if (currentMessage === "9") {
        localSendMessage(currentChatId, retypeEmail());
        changeTelegramState("login_sendMail");
        return;
      }
      if (currentMessage.length > 6 || isNaN(Number(currentMessage))) {
        //handle wrong input
      }
      valid = await verificationCodeRequests.validateVerificationCode(
        currentUser,
        currentMessage
      );
      if (valid === -1) {
        //handle invalid code
        localSendMessage(
          currentChatId,
          codeIsInvalid(currentUser.email, currentMessage)
        );
        return;
      }
      if (valid === 0) {
        // code expired
      }
      localSendMessage(currentChatId, codeIsValid());
      changeTelegramState("login_send_firstName");
      break;
    case "login_send_firstName":
      if (currentMessage.length < 2) {
        //handle short name wrong input
        return;
      }
      await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { firstName: currentMessage }
      );
      localSendMessage(currentChatId, sendLastName(currentMessage));
      changeTelegramState("login_send_lastName");
      break;
    case "login_send_lastName":
      if (currentMessage.length < 2) {
        //handle short name wrong input
        return;
      }
      await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { lastName: currentMessage }
      );

      localSendMessage(
        currentChatId,
        signedUpSuuccessfully(currentUser.firstName, currentMessage)
      );
      await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { authenticated: true }
      );
      setTimeout(() => {
        localSendMessage(currentChatId, firstTimeMainMenu(), createKeyboard());
        setTimeout(() => {
          localSendMessage(
            currentChatId,
            "בחר מה תרצה לעשות",
            createKeyboard()
          );
          changeTelegramState("main_chooseAction");
        }, 4000);
      }, 2000);
      break;
    default:
      break;
  }
};

let createRoutesKeyboard = (routes) => {
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    keyboardsButtons.mainFlow.chooseRoute[index] = [
      `${index + 1}:  ${route.from} - ${route.to}`,
    ];
    ``;
  }
};
//main variables
let routes;
let selectedRouteIndex;
let selectedRouteId;
let clockArr;
let selectedRouteData;
let hours;
let selectedHour;
let copyHour;
//
let mainFlow = async (state) => {
  switch (state) {
    case "main_menu":
      //Initial message
      localSendMessage(currentChatId, "בחר מה תרצה לעשות", createKeyboard());
      changeTelegramState("main_chooseAction");
      break;
    case "main_chooseAction":
      //choose action from the main list
      switch (currentMessage) {
        //////////////////// DIFFRERENT SWITCH CASE/////////
        case keyboardsButtons.mainFlow.mainMessage[0][0]:
          //live update - last data grabbed from waze;
          routes = await getRoutes("from to");
          //live route update
          createRoutesKeyboard(routes);
          localSendMessage(
            currentChatId,
            chooseRoute(),
            createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
          );
          changeTelegramState("main_live_chooseRoute");
          break;
        case keyboardsButtons.mainFlow.mainMessage[1][0]:
          //Daily graph - now creating new graph - later will pick th ephoto and send it to the user;
          routes = await getRoutes("from to");
          createRoutesKeyboard(routes);
          localSendMessage(
            currentChatId,
            chooseRoute(),
            createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
          );
          changeTelegramState("main_avg_chooseRoute");
          break;
        case keyboardsButtons.mainFlow.mainMessage[2][0]:
          //Getting updates in scheduled hour
          routes = await getRoutes("from to");
          createRoutesKeyboard(routes);
          localSendMessage(
            currentChatId,
            scheduleUpdatesFirstMessage(),
            createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
          );
          changeTelegramState("main_schedule_chooseRoute");
          break;
        case keyboardsButtons.mainFlow.mainMessage[3][0]:
          //Getting alerts when traffic jam starting in specific range of hours;
          routes = await getRoutes("from to");
          createRoutesKeyboard(routes);
          localSendMessage(
            currentChatId,
            scheduleAlertsFirtMessage(),
            createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
          );
          changeTelegramState("main_alert_chooseRoute");
          break;

        default:
          break;
      }
      break;

    /////////////////////Continue the main switch case
    case "main_live_chooseRoute":
      //Data by day
      selectedRouteIndex = extractUserSelection(currentMessage);
      if (isNaN(selectedRouteIndex)) {
        // handle wrong input
        localSendMessage(
          currentChatId,
          followTheInstructions(),
          createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
        );
        return;
        break;
      }
      routes = await getRoutes("from to");
      let startGettingFromDb = Date.now();
      if (!routes[selectedRouteIndex]) {
        localSendMessage(
          currentChatId,
          followTheInstructions(),
          createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
        );
        return;
      }
      selectedRouteData = await trafficRouteLogic.getTrafficRoute({
        _id: routes[selectedRouteIndex]._id,
      });
      console.log(
        "done with DB",
        (Date.now() - startGettingFromDb) / 1000,
        " seconds"
      );
      let startGettingFromWaze = Date.now();

      let exactData = await trafficUpdateLogic.getTrafficUpdate(
        { route: selectedRouteData._id },
        { sort: { createdAt: -1 } }
      );
      console.log("exact", exactData.time);
      console.log("exact", exactData.dateOfUpdate);
      // let exactData = await grabFromWaze(true, selectedRouteData);
      if (!exactData) {
        //Failed to take data now
        localSendMessage(
          currentChatId,
          "לצערנו קרתה תקלה במשיכצ המידע - נסה/י שוב מאוחר יותר"
        );
        setTimeout(() => {
          localSendMessage(currentChatId, mainMessage(true), createKeyboard());
        }, 4500);
        changeTelegramState("main_chooseAction");
      }
      console.log(
        "done with Waze",
        (Date.now() - startGettingFromWaze) / 1000,
        " seconds"
      );
      let day = new Date().getDay();
      let hour = new Date().getHours();
      let quarter = calcQurater(new Date().getMinutes() / 60);
      let hourlyData = selectedRouteData.avgByDays[day][hour]["hourAvg"];
      let quarterData = selectedRouteData.avgByDays[day][hour][quarter];
      let resultAvg = getRelativlyHourlyData(hourlyData, quarterData);
      if (resultAvg !== 0) {
        exactData.avgForThisTime = Math.floor(resultAvg);
      }
      localSendMessage(currentChatId, liveUpdate({ exactData }));
      setTimeout(() => {
        localSendMessage(currentChatId, mainMessage(true), createKeyboard());
      }, 3000);
      changeTelegramState("main_chooseAction");
      break;

    case "main_avg_chooseRoute":
      routes = await getRoutes("from to");
      selectedRouteIndex = extractUserSelection(currentMessage);
      if (isNaN(selectedRouteIndex)) {
        localSendMessage(
          currentChatId,
          followTheInstructions(),
          createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
        );
        return;
        // handle wrong input
        break;
      }
      selectedRouteData = await trafficRouteLogic.getTrafficRoute({
        _id: routes[selectedRouteIndex]._id,
      });
      let messageId;
      createDataChart(selectedRouteData)
        .then(async (imagePath) => {
          createWatermark(imagePath, selectedRouteData._id).then(
            async (pathWithWaterMark) => {
              // await sendImage(chatId, pathWithWaterMark);
              console.log("image path", pathWithWaterMark);
              messageId = await localSendImage(
                currentChatId,
                pathWithWaterMark
              );
              localSendMessage(
                currentChatId,
                graphWillDelete(),
                createKeyboard()
              );
              console.log("messageId", messageId.message_id);
              await newMessageId({
                chatId: currentChatId,
                messageId: messageId.message_id,
              });
              // setTimeout(() => {
              //   localDeleteMessage(currentChatId, messageId.message_id);
              // }, 7000);
              setTimeout(() => {
                localSendMessage(
                  currentChatId,
                  mainMessage(true),
                  createKeyboard()
                );
              }, 4500);
              changeTelegramState("main_chooseAction");
            }
          );
        })
        .catch((e) => {
          console.log("errr", e);
          localSendMessage(currentChatId, "יש לנו תקלה");
          localSendMessage(currentChatId, mainMessage(true), createKeyboard());
          changeTelegramState("main_chooseAction");
        });

      break;

    case "main_schedule_chooseRoute":
      selectedRouteIndex = extractUserSelection(currentMessage);
      if (isNaN(selectedRouteIndex)) {
        // handle wrong input
        console.log("wrong input in main_schedule_chooseRoute ");
        localSendMessage(
          currentChatId,
          followTheInstructions(),
          createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
        );
        return;
        return;
      }
      routes = await getRoutes("from to");
      selectedRouteId = routes.find(
        (route, index) => index === selectedRouteIndex
      );

      if (!selectedRouteId) {
        //handle wrong input
        localSendMessage(
          currentChatId,
          followTheInstructions(),
          createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
        );
        return;
      }
      await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { "storeDetails.route": selectedRouteId._id }
      );
      console.log("sel", selectedRouteId);
      clockArr = createClock();
      localSendMessage(
        currentChatId,
        chooseScheduleTime(selectedRouteId),
        createKeyboard(clockArr)
      );
      changeTelegramState("main_schedule_chooseTime");
      break;

    case "main_schedule_chooseTime":
      hours = createClock(0, true);
      selectedHour = hours.find((hourTime) => hourTime === currentMessage);
      if (!selectedHour) {
        //handle wrong input
        localSendMessage(
          currentChatId,
          followTheInstructions(),
          createKeyboard(keyboardsButtons.mainFlow.chooseRoute)
        );
        return;
      }
      copyHour = selectedHour;
      if (selectedHour[0] === "0") {
        selectedHour = selectedHour.slice(1, 2);
      } else {
        selectedHour = selectedHour.slice(0, 2);
      }
      selectedRouteData = await trafficRouteLogic.getTrafficRoute({
        _id: currentUser.storeDetails.route,
      });
      //
      let updateTime = {
        route: currentUser.storeDetails.route,
        hour: selectedHour,
      };
      let update = await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { $push: { updates: updateTime } }
      );
      //
      console.log("update:", update);
      console.log("selectedHpur is:", selectedHour);
      localSendMessage(
        currentChatId,
        scheduleUpdateAddSuccessfully(selectedRouteData, copyHour),
        createKeyboard()
      );
      changeTelegramState("main_chooseAction");
      break;

    case "main_alert_chooseRoute":
      routes = await getRoutes("from to");
      selectedRouteIndex = extractUserSelection(currentMessage);
      selectedRouteId = routes.find(
        (route, index) => index === selectedRouteIndex
      );
      await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { "storeDetails.route": selectedRouteId._id }
      );
      clockArr = createClock();
      localSendMessage(
        currentChatId,
        scheduleAlertsChooseFromHour(selectedRouteId),
        createKeyboard(clockArr)
      );
      changeTelegramState("main_alert_chooseFromHour");

      break;
    case "main_alert_chooseFromHour":
      hours = createClock(0, true);
      selectedHour = hours.find((hourTime) => hourTime === currentMessage);
      copyHour = selectedHour;
      if (!selectedHour) {
        //handle wrong input
        localSendMessage(
          currentChatId,
          followTheInstructions(),
          createKeyboard(createClock())
        );
        return;
      }
      if (selectedHour[0] === "0") {
        selectedHour = selectedHour.slice(1, 2);
      } else {
        selectedHour = selectedHour.slice(0, 2);
      }
      routes = await getRoutes("from to");

      selectedRouteId = routes.find(
        (route, index) =>
          route._id.toString() === currentUser.storeDetails.route
      );
      await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { "storeDetails.fromHour": selectedHour }
      );
      clockArr = createClock(Number(selectedHour) + 1);
      localSendMessage(
        currentChatId,
        scheduleAlertsChooseToHour(copyHour),
        createKeyboard(clockArr)
      );
      changeTelegramState("main_alert_chooseToHour");
      break;
    case "main_alert_chooseToHour":
      hours = createClock(0, true);
      selectedHour = hours.find((hourTime) => hourTime === currentMessage);
      copyHour = selectedHour;
      if (!selectedHour) {
        //handle wrong input
        localSendMessage(
          currentChatId,
          followTheInstructions(),
          createKeyboard(
            createClock(Number(currentUser.storeDetails.fromHour) + 1)
          )
        );
        return;
      }
      if (selectedHour[0] === "0") {
        selectedHour = selectedHour.slice(1, 2);
      } else {
        selectedHour = selectedHour.slice(0, 2);
      }
      routes = await getRoutes("from to");
      selectedRouteId = routes.find(
        (route) => route._id.toString() === currentUser.storeDetails.route
      );
      await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { "storeDetails.toHour": selectedHour }
      );
      let newAlert= {
        route: currentUser.storeDetails.route,
        fromHour: currentUser.storeDetails.fromHour,
        toHour: selectedHour,
      };
       await telegramUserLogic.updateUserDetails(
        { _id: currentUser._id },
        { $push: { alerts: newAlert } }
      );
      clockArr = createClock(Number(selectedHour));
      localSendMessage(
        currentChatId,
        scheduleAlertsAddSuccessfully(
          selectedRouteId,
          convertHour(currentUser.storeDetails.fromHour),
          copyHour
        ),
        createKeyboard()
      );
      changeTelegramState("main_chooseAction");
      break;
    default:
      localSendMessage(
        currentChatId,
        "בחר מה תרצה לעשות",
        createKeyboard(keyboardsButtons.mainFlow.mainMessage)
      );
      changeTelegramState("main_chooseAction");
      break;
  }
};
let convertHour = (hour, type = "full") => {
  if (type === "full") {
    if (hour.length === 1) {
      hour = `0${hour}`;
    }
    hour = `${hour}:00`;
  } else {
    if (hour[0] === "0") {
      hour = hour.slice(1, 2);
    } else {
      hour = hour.slice(0, 2);
    }
  }
  return hour;
};

let createClock = (from = 0, oneArr = false) => {
  let arr = [];
  for (let index = from; index < 24; index++) {
    let hour = index.toString();
    if (hour.length === 1) {
      hour = `0${hour}`;
    }
    hour = `${hour}:00`;
    if (oneArr) {
      arr.push(hour);
    } else {
      arr.push([hour]);
    }
  }
  return arr;
};
let getRelativlyHourlyData = (quarterly, hourly) => {
  let quarterWeight = Math.min(
    1,
    hourly.count > 0 ? quarterly.count / hourly.count : 0
  );
  let hourlyWeight = 1 - quarterWeight;
  let result = hourly.value * hourlyWeight + quarterly.value * quarterWeight;
  return result;
};
module.exports = { newMessage, checkUser };
