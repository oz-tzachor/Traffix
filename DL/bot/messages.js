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
  targetNameMessage,
  targetGoalMessage,
  followTheInstructionsNumbers,
  showAllTargets,
  chooseTarget,
  addIncomeAmount,
  addIncomeDescription,
  addIncomeCompleted,
  addExpenseAmount,
  addExpenseDescription,
  addExpenseCompleted,
  noTargetsYet,
  newTargetCompleted,
  showLastActivities,
  sendCollabrateMail,
  collabrateAddedSuccessfully,
  sendBotDetails,
  welcomeCollabrate,
  emailNotValid,
  chooseRoute,
  liveUpdate,
  graphWillDelete,
} = require("./messagesTemplates");
const { grabFromWaze } = require("../puppeteer/grabFromWaze");
const { createDataChart } = require("../chart/chart");
const { createWatermark } = require("../jimp/jimp");
const { newMessageId } = require("../../BL/messageIdLogic");
const { emojis } = require("./emojis");
const { manageRouteAvg } = require("../../BL/trafficRouteLogic");
let keyboardsButtons = {
  loginFlow: {
    loginMessage: [["אני רוצה להתחבר!"]],
  },
  mainFlow: {
    mainMessage: [
      ["קבלת עדכון חי על מצב התנועה"],
      ["קבלת נתונים לפי יום בנתיב מסוים"],
    ],
    chooseRoute: [],
  },
};
let addBackToMainMenu = true;
let backToMainMenuText = `חזרה לתפריט הראשי ${emojis.dashboard} ${emojis.restart}`;
let createKeyboaed = (
  arrayOfButtons = keyboardsButtons.mainFlow.mainMessage
) => {
  // console.log("arr", arrayOfButtons);
  return {
    reply_markup: {
      keyboard: [...arrayOfButtons, addBackToMainMenu && [backToMainMenuText]],
    },
  };
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
    localSendMessage(
      currentChatId,
      mainMessage(),
      createKeyboaed(keyboardsButtons.mainFlow.mainMessage)
    );
    changeTelegramState("main_chooseAction");
    return;
  }
  if (currentMessage === "calcavg") {
    manageRouteAvg()
    localSendMessage(currentChatId, "calc avg");
    localSendMessage(
      currentChatId,
      mainMessage(),
      createKeyboaed(keyboardsButtons.mainFlow.mainMessage)
    );
    changeTelegramState("main_chooseAction");
    return;
  }
  if (currentMessage.toLowerCase() === "deleteall") {
    // await trafficRouteLogic.deleteAllTargets();
    localSendMessage(currentChatId, "All deleted");
    localSendMessage(
      currentChatId,
      mainMessage(),
      createKeyboaed(keyboardsButtons.mainFlow.mainMessage)
    );
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
    currentMessage === backToMainMenuText ||
    currentMessage.toLowerCase() === "setup"
  ) {
    localSendMessage(
      currentChatId,
      mainMessage(),
      createKeyboaed(keyboardsButtons.mainFlow.mainMessage)
    );
    changeTelegramState("main_chooseAction");
    return;
  }
  if (!currentUser || !currentUser?.authenticated) {
    if (!currentUser) {
      localSendMessage(
        currentChatId,
        loginMessage(),
        createKeyboaed(keyboardsButtons.loginFlow.loginMessage)
      );
      let newTelegramUser = await telegramUserLogic.newTelegramUser({
        chatId: currentChatId,
      });
      return;
    } else {
      if (currentUser.authenticated) {
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

let loginFlow = async (state) => {
  console.log("login flow state", state);
  switch (state) {
    case "login_initial":
      if (currentMessage === keyboardsButtons.loginFlow.loginMessage[0]) {
        localSendMessage(currentChatId, inputEmailMessage());
        changeTelegramState("login_sendMail");
        break;
      }
      localSendMessage(
        currentChatId,
        loginMessage(),
        createKeyboaed(keyboardsButtons.loginFlow.loginMessage)
      );
      break;
    case "login_sendMail":
      let user = await telegramUserLogic.getTelegramUser({
        chatId: currentChatId,
      });

      if (user && user.email === currentMessage.toLowerCase()) {
        localSendMessage(currentChatId, emailExist());
        changeTelegramState("login_emailExist");
        return;
      }
      let validEmail = validateEmail(currentMessage).valid;
      if (!validEmail) {
        return localSendMessage(currentChatId, emailNotValid(currentMessage));
      }
      user = await telegramUserLogic.updateUserDetails(
        { chatId: currentChatId },
        {
          email: currentMessage,
        }
      );
      localSendMessage(currentChatId, signedUpSuuccessfully());
      changeTelegramState("main_menu");
      setTimeout(() => {
        localSendMessage(currentChatId, mainMessage());
      }, 2000);

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
    default:
      break;
  }
};

let createRoutesKeyboard = (routes) => {
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    keyboardsButtons.mainFlow.chooseRoute[index] = [
      `${index + 1}:  ${route.from} - ${route.to}`,
    ];``
  }
};
//main variables
let routes;
let selectedRouteIndex;
let selectedRouteData;
//
let mainFlow = async (state) => {
  switch (state) {
    case "main_menu":
      //Initial message
      localSendMessage(
        currentChatId,
        "בחר מה תרצה לעשות",
        createKeyboaed(keyboardsButtons.mainFlow.mainMessage)
      );
      changeTelegramState("main_chooseAction");
      break;
    case "main_chooseAction":
      //choose action from the main list
      switch (currentMessage) {
        //////////////////// DIFFRERENT SWITCH CASE/////////
        case keyboardsButtons.mainFlow.mainMessage[0][0]:
          routes = await getRoutes("from to");
          //live route update
          createRoutesKeyboard(routes);
          localSendMessage(
            currentChatId,
            chooseRoute(),
            createKeyboaed(keyboardsButtons.mainFlow.chooseRoute)
          );
          changeTelegramState("main_live_chooseRoute");
          break;
        case keyboardsButtons.mainFlow.mainMessage[1][0]:
          routes = await getRoutes("from to");
          createRoutesKeyboard(routes);
          localSendMessage(
            currentChatId,
            chooseRoute(),
            createKeyboaed(keyboardsButtons.mainFlow.chooseRoute)
          );
          changeTelegramState("main_avg_chooseRoute");
          break;

        default:
          break;
      }
      break;

    /////////////////////Continue the main switch case
    case "main_live_chooseRoute":
      //Data by day
      routes = await getRoutes("from to");
      selectedRouteIndex = Number(currentMessage.slice(0, 1)) - 1;
      if (isNaN(selectedRouteIndex)) {
        // handle wrong input
        break;
      }
      let startGettingFromDb = Date.now();
      selectedRouteData = await trafficRouteLogic.getTrafficRoute({
        _id: routes[selectedRouteIndex]._id,
      });
      console.log(
        "done with DB",
        (Date.now() - startGettingFromDb) / 1000,
        " seconds"
      );
      let startGettingFromWaze = Date.now();

      let exactData = await grabFromWaze(true, selectedRouteData);
      if (!exactData) {
        //Failed to take data now
        localSendMessage(
          currentChatId,
          "לצערנו קרתה תקלה במשיכצ המידע - נסה/י שוב מאוחר יותר"
        );
        setTimeout(() => {
          localSendMessage(currentChatId, mainMessage(true), createKeyboaed());
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
        exactData.avgForThisTime = resultAvg;
      }
      localSendMessage(currentChatId, liveUpdate({ exactData }));
      setTimeout(() => {
        localSendMessage(currentChatId, mainMessage(true), createKeyboaed());
      }, 4500);
      changeTelegramState("main_chooseAction");
      break;

    case "main_avg_chooseRoute":
      routes = await getRoutes("from to");
    selectedRouteIndex =  Number(currentMessage.slice(0, 2)) - 1
      if (isNaN(selectedRouteIndex)) {
        selectedRouteIndex = Number(currentMessage.slice(0, 1)) - 1;
      }
      if (isNaN(selectedRouteIndex)) {
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
                createKeyboaed()
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
                  createKeyboaed()
                );
              }, 4500);
              changeTelegramState("main_chooseAction");
            }
          );
        })
        .catch((e) => {
          console.log("errr", e);
          localSendMessage(currentChatId, "יש לנו תקלה");
          localSendMessage(currentChatId, mainMessage(true), createKeyboaed());
          changeTelegramState("main_chooseAction");
        });

      break;
    default:
      break;
  }
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
