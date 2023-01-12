let { model } = require("mongoose");
const { getDate } = require("../moment/moment");
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
  let message = `היי, נראה שעוד לא התחברת למערכת שלנו ${emojis.sad}`;
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
exports.emailNotValid = (emailSent) => {
  let message = `אוי יש לנו בעיה ${emojis.warning}${twoLine}האימייל ששלחת לא תקין! ${twoLine}הכתובת מייל ששלחת לנו היא: ${emailSent}${twoLine}בבקשה בדקו שהכתובת נכונה ושלחו שוב${emojis.email}`;

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
exports.mainMessage = (whatElse = false) => {
  // let message = `מה ברצונך לעשות? ${emojis.hugs}${twoLine}1.קבלת תמונת מצב של החסכונות שלי ${emojis.dashboard}${twoLine}2.הפקדה לאחד מהיעדים ${emojis.greenCircle} ${emojis.plus}${twoLine}3.משיכה מאחד מהיעדים ${emojis.orangeCircle} ${emojis.minus}${twoLine}4.תנועות אחרונות ביעדים שלי ${emojis.money}${twoLine}5.הוספת יעד חדש ${emojis.target}${twoLine}6.שינוי סכום היעד באחד מהיעדים שלי ${emojis.restart}${twoLine}7.הוספת שותף.ה לחשבון ${emojis.hugs}${twoLine}8.מחיקת יעד ${emojis.warning}`;
  let message = `מה ברצונך לעשות?`;
  if (whatElse) {
    message = `מה עוד ברצונך לעשות?`;
  }
  return message;
};
exports.chooseRoute = (user) => {
  // let message = `מה ברצונך לעשות? ${emojis.hugs}${twoLine}1.קבלת תמונת מצב של החסכונות שלי ${emojis.dashboard}${twoLine}2.הפקדה לאחד מהיעדים ${emojis.greenCircle} ${emojis.plus}${twoLine}3.משיכה מאחד מהיעדים ${emojis.orangeCircle} ${emojis.minus}${twoLine}4.תנועות אחרונות ביעדים שלי ${emojis.money}${twoLine}5.הוספת יעד חדש ${emojis.target}${twoLine}6.שינוי סכום היעד באחד מהיעדים שלי ${emojis.restart}${twoLine}7.הוספת שותף.ה לחשבון ${emojis.hugs}${twoLine}8.מחיקת יעד ${emojis.warning}`;
  let message = `בחר מסלול מהרשימה:`;
  return message;
};
//Live update for specific route
exports.liveUpdate = ({ exactData }) => {
  let lastUpdateTime = new Date(exactData.dateOfUpdate).toLocaleString();
  if (exactData.time.toString().length > 2) {
    exactData.time = exactData.time.toString().slice(0, 4);
  }
  let message = `עדכון:\n\nמסלול: ${exactData.title}\nזמן נסיעה: ${exactData.time} דקות\nשעת עדכון: ${lastUpdateTime}`;
  if (exactData.avgForThisTime) {
    message = `עדכון:\n\nמסלול: ${exactData.title}\nזמן נסיעה: ${exactData.time} דקות\nזמן  ממוצע לשעה זו: ${exactData.avgForThisTime} דקות\nשעת עדכון: ${lastUpdateTime}`;
  }
  // `Hourly avg: ${resultAvg}`
  return message;
};
//
// Graph updates//
exports.graphWillDelete = (minutes =10) => {
  message = `גרף זה זמין לשימושך ל${minutes} דקות ${emojis.dashboard} ${emojis.time}`
  return message;
};
