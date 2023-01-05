const telegramUserLogic = require("../../BL/telegramUserLogic");
const targetLogic = require("../../BL/targetLogic");
const incomeLogic = require("../../BL/incomeLogic");
const expenseLogic = require("../../BL/expenseLogic");
const dashboardLogic = require("../../BL/dashboardLogic");
const sendMessage = require("./bot");
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
} = require("./messagesTemplates");
const { get } = require("mongoose");
///
let currentChatId;
let currentMessage;
let localSendMessage;
let currentUser;
const newMessage = (chatId, message, sendFunc) => {
  currentChatId = chatId;
  currentMessage = message.toLowerCase();
  localSendMessage = sendFunc;
  checkUser();
};
const changeTelegramState = async (state) => {
  return await telegramUserLogic.changeTelegramState(currentChatId, state);
};
const getTargets = async () => {
  let targets = await targetLogic.getAllTargets({
    dashboard: currentUser.defaultDashboard,
  });
  console.log(await targets[0]);
  return targets;
};
const getLastActs = async (target) => {
  let incomes = await incomeLogic.getIncomes(target);
  let expenses = await expenseLogic.getExpenses(target);
  for (
    let index = 0;
    index <
    (incomes.length > expenses.length ? incomes.length : expenses.length);
    index++
  ) {
    if (incomes[index]) {
      incomes[index].type = "income";
    }
    if (expenses[index]) {
      expenses[index].type = "expense";
    }
  }
  let combinedArray = [...incomes, ...expenses];
  combinedArray.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return combinedArray.reverse();
};
const checkUser = async () => {
  currentUser = await telegramUserLogic.getTelegramUser({
    chatId: currentChatId,
  });
  if (currentMessage.toLowerCase() === "deleteall") {
    await targetLogic.deleteAllTargets();
    localSendMessage(currentChatId, "All deleted");
    localSendMessage(currentChatId, mainMessage());
    changeTelegramState("main_userChoise");
    return;
  }
  if (currentMessage.toLowerCase() === "reset") {
    changeTelegramState("initial");
    telegramUserLogic.updateUserDetails(currentChatId, {
      authenticated: false,
    });
    localSendMessage(currentChatId, "reset");
    return;
  }
  if (currentMessage.toLowerCase() === "setup") {
    localSendMessage(currentChatId, mainMessage());
    changeTelegramState("main_userChoise");
    return;
  }
  if (!currentUser || !currentUser?.authenticated) {
    if (!currentUser) {
      localSendMessage(currentChatId, loginMessage());
      let newTelegramUser = await telegramUserLogic.newTelegramUser({
        chatId: currentChatId,
      });
      return;
    } else {
      if (!currentUser.authenticated) {
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
    case "initial":
      if (currentMessage === "1") {
        localSendMessage(currentChatId, inputEmailMessage());
        changeTelegramState("login_sendMail");
        break;
      }
      localSendMessage(currentChatId, loginMessage());
      break;
    case "login_sendMail":
      let user = await telegramUserLogic.getTelegramUser({
        chatId: currentChatId,
      });
      if (!user.email || user.email === "") {
        let inviterUser = await telegramUserLogic.getTelegramUser({
          collabrates: currentMessage,
        });
        if (inviterUser) {
          console.log("appears!", inviterUser);
          let newTelegramUser = await telegramUserLogic.updateUserDetails(
            currentChatId,
            {
              email: currentMessage,
              defaultDashboard: inviterUser.defaultDashboard,
              authenticated: true,
            }
          );
          localSendMessage(
            currentChatId,
            welcomeCollabrate(currentMessage, inviterUser.email)
          );
          setTimeout(() => {
            localSendMessage(currentChatId, mainMessage());
            changeTelegramState("main_userChoise");
          }, 2000);
          return;
          break;
        }
      }

      console.log("user", user, currentMessage);
      if (user && user.email === currentMessage.toLowerCase()) {
        localSendMessage(currentChatId, emailExist());
        changeTelegramState("login_emailExist");
        return;
      }
      user = await telegramUserLogic.updateUserDetails(currentChatId, {
        email: currentMessage,
        authenticated: true,
      });
      let newDashboard = await dashboardLogic.createDashboard({
        name: `${currentMessage}'s dashboard`,
        createdBy: user._id,
      });
      let updatedUser = await telegramUserLogic.updateUserDetails(
        currentChatId,
        { defaultDashboard: newDashboard._id }
      );
      localSendMessage(currentChatId, signedUpSuuccessfully());
      changeTelegramState("main_userChoise");
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

let mainFlow = async (state) => {
  let res;
  let selectedTarget;
  if (currentMessage === "9" && state !== "main_userChoise") {
    localSendMessage(currentChatId, mainMessage());
    changeTelegramState("main_userChoise");
    return;
  }
  switch (state) {
    case "main_initial":
      localSendMessage(currentChatId, mainMessage());
      changeTelegramState("main_userChoise");

      break;
    case "main_userChoise":
      switch (currentMessage) {
        case "1":
          res = await getTargets();
          if (res.length > 0) {
            localSendMessage(currentChatId, showAllTargets(res));
            setTimeout(() => {
              localSendMessage(currentChatId, mainMessage());
              changeTelegramState("main_userChoise");
            }, 2000);
          } else {
            localSendMessage(currentChatId, noTargetsYet());
            setTimeout(() => {
              localSendMessage(currentChatId, mainMessage());
            }, 2000);
            changeTelegramState("main_userChoise");
          }
          break;
        case "2":
          res = await getTargets();
          localSendMessage(currentChatId, chooseTarget(res, "plus"));
          changeTelegramState("main_chooseTargetIncome");
          break;
        case "3":
          res = await getTargets();
          localSendMessage(currentChatId, chooseTarget(res, "minus"));
          changeTelegramState("main_chooseTargetExpense");
          break;
        case "4":
          res = await getTargets();
          localSendMessage(currentChatId, chooseTarget(res, "last"));
          changeTelegramState("main_lastActivities");
          break;
        case "5":
          localSendMessage(currentChatId, targetNameMessage());
          changeTelegramState("main_targetName");
          break;
        case "6":
          localSendMessage(currentChatId, mainMessage());
          changeTelegramState("main_userChoise");
          break;
        case "7":
          localSendMessage(currentChatId, sendCollabrateMail());
          changeTelegramState("main_inputCollabrateEmail");
          break;
        case "8":
          localSendMessage(currentChatId, mainMessage());
          changeTelegramState("main_userChoise");
          break;

        default:
          localSendMessage(currentChatId, followTheInstructions());
          setTimeout(() => {
            localSendMessage(currentChatId, mainMessage());
          }, 1000);
          break;
      }
      break;
    //define new traget
    case "main_targetName":
      telegramUserLogic.saveTempData(currentChatId, "targetDetails", {
        name: currentMessage,
      });
      localSendMessage(currentChatId, targetGoalMessage(currentMessage));
      changeTelegramState("main_targetGoal");
      break;
    case "main_targetGoal":
      if (!isNaN(currentMessage)) {
        parseInt(currentMessage);
        let newTarget = await targetLogic.createNewTarget({
          name: currentUser.targetDetails.name,
          goal: currentMessage,
          createdBy: currentUser._id,
          dashboard: currentUser.defaultDashboard,
        });
        if (newTarget) {
          localSendMessage(
            currentChatId,
            newTargetCompleted(currentUser.targetDetails.name, currentMessage)
          );
          setTimeout(() => {
            localSendMessage(currentChatId, mainMessage());
          }, 2000);
          changeTelegramState("main_userChoise");
        }
      } else {
        localSendMessage(currentChatId, followTheInstructionsNumbers());
      }
      //
      break;
    //create new income
    case "main_chooseTargetIncome":
      if (!isNaN(currentMessage)) {
        parseInt(currentMessage);
        res = await getTargets();

        console.log(currentMessage - 1, res.length - 1);
        if (currentMessage - 1 > res.length - 1) {
          localSendMessage(currentChatId, followTheInstructions());
          setTimeout(() => {
            localSendMessage(currentChatId, chooseTarget(res, "plus"));
          }, 2000);
          break;
        }
        telegramUserLogic.saveTempData(currentChatId, "incomeDetails", {
          target: res[currentMessage - 1]._id,
        });
        localSendMessage(
          currentChatId,
          addIncomeAmount(res[currentMessage - 1].name)
        );
        changeTelegramState("main_chooseIncomeAmount");
      } else {
        localSendMessage(currentChatId, followTheInstructionsNumbers());
      }
      break;
    case "main_chooseIncomeAmount":
      res = await getTargets();
      selectedTarget = res.find((elem) => {
        return (
          elem._id.toString() == currentUser.incomeDetails.target.toString()
        );
      });
      if (!isNaN(currentMessage)) {
        await telegramUserLogic.saveTempData(currentChatId, "incomeDetails", {
          amount: currentMessage,
        });
        localSendMessage(
          currentChatId,
          addIncomeDescription(selectedTarget.name, currentMessage)
        );
        changeTelegramState("main_chooseIncomeDescription");
      } else {
        localSendMessage(currentChatId, followTheInstructionsNumbers());
        setTimeout(() => {
          localSendMessage(currentChatId, addIncomeAmount(selectedTarget.name));
        }, 2000);
      }
      break;

    case "main_chooseIncomeDescription":
      res = await getTargets();
      selectedTarget = res.find((elem) => {
        return (
          elem._id.toString() == currentUser.incomeDetails.target.toString()
        );
      });
      await incomeLogic.createNewIncome({
        amount: currentUser.incomeDetails.amount,
        target: currentUser.incomeDetails.target,
        createdBy: currentUser._id,
        createdAt: new Date(),
        dashboard: currentUser.defaultDashboard,

        description: currentMessage === "לא" ? null : currentMessage,
      });
      console.log("selected", selectedTarget.amount, selectedTarget.goal);
      localSendMessage(
        currentChatId,
        addIncomeCompleted(
          selectedTarget.name,
          currentUser.incomeDetails.amount,
          ((selectedTarget.amount + currentUser.incomeDetails.amount) /
            selectedTarget.goal) *
            100
        )
      );
      setTimeout(() => {
        localSendMessage(currentChatId, mainMessage());
        changeTelegramState("main_userChoise");
      }, 2000);

      break;
    ///

    //create new expense
    case "main_chooseTargetExpense":
      if (!isNaN(currentMessage)) {
        parseInt(currentMessage);
        res = await getTargets();
        console.log(currentMessage - 1, res.length - 1);
        if (currentMessage - 1 > res.length - 1) {
          localSendMessage(currentChatId, followTheInstructions());
          setTimeout(() => {
            localSendMessage(currentChatId, chooseTarget(res, "minus"));
          }, 2000);
          break;
        }
        telegramUserLogic.saveTempData(currentChatId, "expenseDetails", {
          target: res[currentMessage - 1]._id,
        });
        localSendMessage(
          currentChatId,
          addExpenseAmount(res[currentMessage - 1].name)
        );
        changeTelegramState("main_chooseExpenseAmount");
      } else {
        localSendMessage(currentChatId, followTheInstructionsNumbers());
      }
      break;
    case "main_chooseExpenseAmount":
      res = await getTargets();
      selectedTarget = res.find((elem) => {
        return (
          elem._id.toString() == currentUser.expenseDetails.target.toString()
        );
      });
      if (!isNaN(currentMessage)) {
        await telegramUserLogic.saveTempData(currentChatId, "expenseDetails", {
          amount: currentMessage,
        });
        localSendMessage(
          currentChatId,
          addExpenseDescription(selectedTarget.name, currentMessage)
        );
        changeTelegramState("main_chooseExpenseDescription");
      } else {
        localSendMessage(currentChatId, followTheInstructionsNumbers());
        setTimeout(() => {
          localSendMessage(
            currentChatId,
            addExpenseAmount(selectedTarget.name)
          );
        }, 2000);
      }
      break;

    case "main_chooseExpenseDescription":
      res = await getTargets();
      selectedTarget = res.find((elem) => {
        return (
          elem._id.toString() == currentUser.expenseDetails.target.toString()
        );
      });
      await expenseLogic.createNewExpense({
        amount: currentUser.expenseDetails.amount,
        target: currentUser.expenseDetails.target,
        createdBy: currentUser._id,
        createdAt: new Date(),
        dashboard: currentUser.defaultDashboard,
        description:
          currentMessage === "לא"
            ? "המשתמש בחר שלא לרשום תיאור למשיכה זו"
            : currentMessage,
      });
      localSendMessage(
        currentChatId,
        addExpenseCompleted(
          selectedTarget.name,
          currentUser.expenseDetails.amount
        )
      );
      setTimeout(() => {
        localSendMessage(currentChatId, mainMessage());
        changeTelegramState("main_userChoise");
      }, 2000);

      break;
    ///
    case "main_lastActivities":
      if (!isNaN(currentMessage)) {
        parseInt(currentMessage);
        res = await getTargets();
        console.log(currentMessage - 1, res.length - 1);
        if (currentMessage - 1 > res.length - 1) {
          localSendMessage(currentChatId, followTheInstructions());
          setTimeout(() => {
            localSendMessage(currentChatId, chooseTarget(res, "last"));
          }, 2000);
          break;
        }
        selectedTarget = res[currentMessage - 1]._id;
        let lastActs = await getLastActs(selectedTarget);

        localSendMessage(
          currentChatId,
          showLastActivities(
            res[currentMessage - 1].name,
            res[currentMessage - 1].goal,
            lastActs
          )
        );
        setTimeout(() => {
          localSendMessage(currentChatId, mainMessage());
          changeTelegramState("main_userChoise");
        }, 3500);
      } else {
        localSendMessage(currentChatId, followTheInstructionsNumbers());
        setTimeout(() => {
          localSendMessage(currentChatId, chooseTarget(res, "last"));
        }, 2000);
      }

      // localSendMessage(
      //   currentChatId,
      //   showLastActivities("test", array, currentUser.email)
      // );

      break;
    //add collabrate
    case "main_inputCollabrateEmail":
      await telegramUserLogic.updateUserDetails(currentChatId, {
        $push: { collabrates: currentMessage },
      });
      localSendMessage(
        currentChatId,
        collabrateAddedSuccessfully(currentMessage)
      );
      setTimeout(() => {
        localSendMessage(currentChatId, sendBotDetails());
      }, 1500);
      setTimeout(() => {
        localSendMessage(currentChatId, mainMessage());
      }, 8000);
      changeTelegramState("main_userChoise");
      break;
    //
    case "general":
      break;
    default:
      break;
  }
};

module.exports = { newMessage, checkUser, localSendMessage };
