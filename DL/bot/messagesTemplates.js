let { model } = require("mongoose");
let { dealWithMessage } = require("./bot");
let { emojis } = require("./emojis");
let oneLine = "\n";
let twoLine = "\n\n";
let threeLine = "\n\n\n";

//General
let percentage = (number) => {
  let numLength = number.toString().length;
  if (numLength > 2) {
    if (numLength === 3) {
      return number;
    }
    if (numLength > 3) {
      return number.toString().slice(0, 4);
    }
  }
  return number;
};
let addBackOption = () => {
  let message = `${twoLine}לחזרה לתפריט הראשי אנא שלח: 9 ${emojis.restart} ${emojis.x}`;
  return message;
};
exports.followTheInstructions = () => {
  let message = `שלחת מספר שאינו נכלל באופציות ששלחנו כאן למעלה ${twoLine}תשתדל להקפיד על ההוראות ${emojis.fix}`;
  return message;
};
exports.followTheInstructionsNumbers = () => {
  let message = `בבקשה לשלוח מספרים בלבד ${emojis.numbers}`;
  return message;
};

//login process
exports.loginMessage = () => {
  let message = `היי, נראה שעוד לא התחברת למערכת שלנו ${emojis.sad}${twoLine}אם ברצונך להתחבר - אנא שלח 1 `;
  return message;
};
exports.inputEmailMessage = () => {
  let message = `מעולה! ${emojis.smiley}${twoLine}אנחנו נשמח מאד שתצטרף אלינו! ככה נוכל לעזור לך לנהל כמו שצריךאת החסכון ליום גשום!${twoLine}
  להמשך התהליך אנא שלח את כתובת המייל שלך ${emojis.email}`;
  return message;
};

exports.emailExist = () => {
  let message = `אוי יש לנו בעיה ${emojis.warning}${twoLine}משתמש אחר כבר נרשם עם המייל הזה.${twoLine}מה אפשר לעשות?${oneLine}1.שליחה של מייל אחר${oneLine}2.עדכון של המייל הזה לחשבון הטלגרם הזה שאנחנו מתכתבים בו עכשיו`;

  return message;
};
exports.retypeEmail = () => {
  let message = `אוקיי,בוא ננסה שוב ${emojis.restart}${twoLine}בבקשה שלח לנו את כתובת המייל החדשה שאיתה תרצה להירשם ${emojis.email}`;
  return message;
};
exports.resetEmail = (email) => {
  let message = `יאללה בוא נעדכן את המייל שלך לחשבון הטלגרם הזה!${twoLine}שלחנו אל המייל הזה:${oneLine}${email}${twoLine} קוד בן 4 ספרות שישמש לאיפוס החשבון והגדרת המייל הזה בתור מייל ברירת המחדל${threeLine}הקוד בתוקף ל-5 דקות בלבד!${twoLine}אז מה הקוד שקיבלת?`;
  return message;
};

exports.signedUpSuuccessfully = () => {
  let message = `מצוין! נרשמת למערכת שלנו! כן, זה עד כדי כך פשוט! ${emojis.coolGuy}`;
  return message;
};

//Main proccess
exports.mainMessage = (user) => {
  let message = `מה ברצונך לעשות? ${emojis.hugs}${twoLine}1.קבלת תמונת מצב של החסכונות שלי ${emojis.dashboard}${twoLine}2.הפקדה לאחד מהיעדים ${emojis.greenCircle} ${emojis.plus}${twoLine}3.משיכה מאחד מהיעדים ${emojis.orangeCircle} ${emojis.minus}${twoLine}4.תנועות אחרונות ביעדים שלי ${emojis.money}${twoLine}5.הוספת יעד חדש ${emojis.target}${twoLine}6.שינוי סכום היעד באחד מהיעדים שלי ${emojis.restart}${twoLine}7.הוספת שותף.ה לחשבון ${emojis.hugs}${twoLine}8.מחיקת יעד ${emojis.warning}`;
  return message;
};
exports.targetNameMessage = () => {
  let message = `יאללה יוצרים יעד! ${emojis.target}${twoLine}הדבר הראשון שאנחנו צריכים בשביל יעד זה את השם שלו.${twoLine}אז איך היית קורא ליעד שלך?`;
  message += addBackOption();
  return message;
};
exports.targetGoalMessage = (targetName) => {
  let message = `השם שבחרת ליעד שלך הוא:${targetName}${twoLine}הדבר השני שצריך כדי ליצור יעד הוא לבחור את הסכום שאליו אנחנו שואפים ${emojis.money}${threeLine}שלח לי את סכום היעד שאליו אתה שואף ונתקדם ${emojis.plus}${twoLine}בבקשה לשלוח רק מספרים- ככה זה עובד ${emojis.claps}`;
  message += addBackOption();
  return message;
};
exports.newTargetCompleted = (targetName, targetGoal) => {
  let message = `ישש! ${emojis.smiley}${twoLine}היעד נוצר בהצלחה ${emojis.target} ${emojis.confirm}${threeLine}שם: ${targetName} ${emojis.saved}${twoLine}יעד: ${targetGoal} ${emojis.creditCard}${threeLine}בהצלחה ${emojis.prayingHands}`;
  return message;
};

///get targets
exports.showAllTargets = (targets) => {
  let message = `הנה היעדים שלך :${twoLine}`;
  let totalAmount = 0;
  let totalGoal = 0;
  targets.map((target, index) => {
    let { name, amount, goal } = target;
    totalAmount += amount;
    totalGoal += goal;
    message += `${index + 1}.${name} ${
      emojis.redFlag
    }${twoLine}כרגע בקופה : ${amount}₪ ${emojis.money}${oneLine}יעד: ${goal}₪ ${
      emojis.target
    }${oneLine}אחוזי השלמה של היעד: ${percentage((amount / goal) * 100)}% ${
      emojis.sandClock
    }${twoLine}\n`;
  });
  message += `חסכת סך הכל ${totalAmount}₪${oneLine}שזה כבר ${percentage(
    (totalAmount / totalGoal) * 100
  )}% מסך כל היעדים שהצבת!${twoLine}כל הכבוד! ${emojis.claps} ${emojis.crown}`;
  return message;
};
exports.chooseTarget = (targets, type) => {
  let message =
    type === "plus"
      ? `לאיזה מהיעדים תרצה להפקיד? ${emojis.plus}${twoLine}`
      : `מאיזה מהיעדים תרצה למשוך? ${emojis.minus}${twoLine}`;
  if (type === "last") {
    message = `בחר יעד כדי לראות את התנועות האחרונות בו ${emojis.dashboard}${twoLine}`;
  }
  targets.map((target, index) => {
    let { name, amount, goal } = target;
    message += `${index + 1}.${name} ${
      emojis.redFlag
    }${twoLine}כרגע בקופה : ${amount}₪ ${emojis.money}${oneLine}יעד: ${goal}₪ ${
      emojis.target
    }${oneLine}אחוזי השלמה של היעד: ${percentage((amount / goal) * 100)}% ${
      emojis.sandClock
    }${twoLine}`;
  });
  message += addBackOption();
  return message;
};
exports.noTargetsYet = () => {
  let message = `אוי, נראה שעוד לא יצרת יעד ${emojis.sad}${twoLine}אבל לא נורא! תוכל לעשות את זה בקלות בתפריט הראשי באופציה מספר : 5 ${emojis.coolGuy}`;
  return message;
};
///

//Add new income
exports.addIncomeAmount = (targetName) => {
  let message = `בחרת להפקיד ליעד: ${targetName}${twoLine}מה הסכום שברצונך להוסיף? ${emojis.money}(מספרים בלבד ${emojis.numbers})`;
  message += addBackOption();

  return message;
};
exports.addIncomeDescription = (targetName, incomeAmount) => {
  let message = `מעולה! בחרת להוסיף ליעד ${targetName} סכום של : ${incomeAmount}₪${twoLine}עכשיו אפשר להוסיף טקסט להפקדה הזו כדי שתמיד נזכור במה מדובר!${twoLine}מה התיאור שתרצה לכתוב להפקדה זו?${threeLine}אם אתה לא רוצה לשמור שום תיאור אנא שלח :"לא"`;
  message += addBackOption();
  return message;
};
exports.addIncomeCompleted = (targetName, incomeAmount, targetProgress) => {
  console.log("targetProgress", targetProgress);
  let message = `אליפות! ${
    emojis.claps
  }${twoLine}הפקדת ${incomeAmount}₪ ליעד: ${targetName}! ${
    emojis.coolGuy
  }${twoLine}חסכת כבר ${percentage(targetProgress)}% מהיעד הזה! ${emojis.fix}${
    emojis.confirm
  }`;
  return message;
};

//add new expense
exports.addExpenseAmount = (targetName) => {
  let message = `בחרת למשוך מהיעד: ${targetName}${twoLine}מה הסכום שברצונך למשוך? ${emojis.money}(מספרים בלבד ${emojis.numbers})`;
  message += addBackOption();

  return message;
};
exports.addExpenseDescription = (targetName, expenseAmount) => {
  let message = `אוקיי! בחרת למשוך מהיעד: ${targetName} סכום של : ${expenseAmount}₪${twoLine}עכשיו צריך להוסיף טקסט למשיכה הזו הזו כדי שתמיד נזכור במה מדובר ונוכל לעקוב אחרי החסכונות שלנו ${emojis.saved}!${twoLine}מה התיאור שתרצה לכתוב למשיכה זו?`;
  message += addBackOption();

  return message;
};
exports.addExpenseCompleted = (targetName, expenseAmount) => {
  let message = `סיימנו! ${emojis.confirm}${twoLine}משכת ${expenseAmount}₪ מהיעד: ${targetName}! ${emojis.minus}${emojis.money}`;
  return message;
};

//last activities

exports.showLastActivities = (targetName, targetGoal, activities) => {
  let message;
  if (!activities.length > 0) {
    return (message = `עוד אין תנועות ביעד: ${targetName} ${emojis.hugs}${twoLine}אז קדימה! זה הזמן להתחיל לחסוך! ${emojis.password} ${emojis.money}`);
  }
  message = `הנה התנועות האחרונות של היעד :${targetName}${twoLine}`;
  let totalIncomes = 0;
  let totalExpenses = 0;
  activities.map((activity) => {
    let { type, amount, createdAt, description, createdBy } = activity;
    if (type === "income") {
      message += `הפקדה ${emojis.greenCircle} ${emojis.plus}${twoLine}`;
      totalIncomes += amount;
    } else {
      message += `משיכה ${emojis.orangeCircle} ${emojis.minus}${twoLine}`;
      totalExpenses += amount;
    }
    message += `סכום: ${amount}₪ ${emojis.money}${oneLine}${
      description ? `תיאור: ${description}${oneLine}` : ``
    }תאריך:${new Date(createdAt)
      .toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" })
      .replace(/\D/g, "/")}${oneLine}שעה: ${new Date(
      createdAt
    ).toLocaleTimeString("he-IL", {
      timeZone: "Asia/Jerusalem",
    })}${oneLine}על ידי: ${createdBy.email}${threeLine}`;
  });
  message += `סך כל ההפקדות: ${totalIncomes}₪ ${
    emojis.greenCircle
  }${oneLine}סך כל המשיכות: ${totalExpenses}₪ ${
    emojis.orangeCircle
  }${oneLine}מצב הקופה כרגע: ${totalIncomes - totalExpenses}₪ ${
    emojis.money
  } ${oneLine}יעד הקופה: ${targetGoal}₪ ${
    emojis.target
  }${oneLine}התקדמות באחוזים: ${percentage(
    (totalIncomes / targetGoal) * 100
  )}% ${emojis.sandClock}${twoLine}אתה בדרך הנכונה! ${emojis.claps}`;
  return message;
};

//add collabrate
exports.sendCollabrateMail = () => {
  let message = `יאללה מגניב!${twoLine}שלח.י לנו את כתובת המייל של השותף.ה שתרצה.י להוסיף לחשבון שלך ואנחנו נדאג שזה יקרה,לך נשאר רק להזכיר לו לשלוח הודעה בטלגרם לבוט  שלנו.${twoLine}אז מה המיייל שלו?`;
  message += addBackOption();
  return message;
};
exports.collabrateAddedSuccessfully = (email) => {
  let message = `שמרנו את המייל שלו ${email} ${emojis.confirm}${twoLine} עכשיו רק תדאג.י שהחבר.ה ייצור איתנו קשר.${twoLine}בהודעה הבאה נשלח את הקיצור דרך לשיחה איתנו ככה שתוכל.י לשתף איתו.ה בקלות!`;
  return message;
};
exports.sendBotDetails = () => {
  let message = `@RainyDaySavebot`;
  return message;
};
exports.welcomeCollabrate = (collabrateEmail, inviterEmail) => {
  let message = `היי ${collabrateEmail}!${twoLine}הוזמנת לכאן על ידי ${inviterEmail} ${twoLine}מעכשיו אתה חלק מניהול החסכונות שלו אז ברוך הבא! ${emojis.smiley}${threeLine}אנחנו נשמח לעזור לכם לנהל טוב את החסכונות שלכם ליום גשום!${twoLine} אז יאללה בואו נצא לדרך! ${emojis.coolGuy}`;
  return message;
};
//

// ₪
