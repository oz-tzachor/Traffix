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
  let message = `שלחת מספר שאינו נכלל באופציות ששלחנו  ${twoLine}השתדלו להקפיד על ההוראות ${emojis.fix}`;
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
  let message = `מעולה! ${emojis.smiley}${twoLine}אנחנו נשמח מאד שתצטרפו אלינו! ככה נוכל לעזורלכם לנהל טוב יותר את השגרה שלכם!${twoLine}להמשך התהליך אנא שלחו את כתובת המייל שלכם${emojis.email}`;
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

exports.codeSent = (email) => {
  let codeValidTime = 5;
  let message = `שלחנו לתיבת המייל ${email} קוד אימות בן 6 ספרות.\n\nאנא בדקו את תיבת המייל ושלחו כאן חזרה את קוד האימות\n\nאם אינכם רואים את הקוד,בדקו גם בתיבת הספאם\n\nקוד זה בתוקף ל${codeValidTime} דקות בלבד\n\n אז מה הקוד שקיבלתם? ${emojis.password}`;
  return message;
};
exports.codeIsInvalid = (email, code) => {
  let message = `אופס ${emojis.sad}\n\nהקוד ששלחתם לנו לא מתאים למה ששמור אצלנו במערכת ${emojis.x}\n\nאנחנו שלחנו את הקוד למייל:\n${email}\n\nהקוד שקיבלנו מכם הוא: ${code}\n\nלתיקון של הקוד ששלחתם,שלחו עכשיו את הקוד הנכון.\n\nלתיקון כתובת המייל שלחו את הספרה 9 `;
  return message;
};
exports.codeIsValid = () => {
  let message = `יש!\n\nזה הקוד הנכון ששלחנו אליכם! ${emojis.fix}\n\nאנחנו תיכף מסיימים את ההרשמה!\n\nאנא שלחו שם פרטי:`;
  return message;
};
exports.sendLastName = (firstName) => {
  let message = `היי ${firstName}!\n\nכיף שהצטרפת אלינו!\n\nאנחנו ממש בשלב האחרון,אנא שלחו שם משפחה:`;
  return message;
};
exports.signedUpSuuccessfully = (firstName, lastName) => {
  let message = `${firstName} ${lastName}!\n\nברוכים הבאים  לTraffix!\n\nאנחנו מאד מתרגשים שהצטרפתם אלינו!`;
  return message;
};
exports.firstTimeMainMenu = (firstName, lastName) => {
  let message = `בטראפיקס אנחנו מציעים המון פיצ'רים שיעזרו לך להתנהל בצורה נוחה יותר בכבישים\n\nתיכף תראו את התפריט הראשי של המערכת,ממנו תוכלו לנווט לכל חלקי המערכת ולהגדיר לעצמכם את השירותים שיעזרו לכם!\n\nבכל שלב תוכלו לחזור לתפריט הראשי- חפשו את הכפתור המתאים!\n\nמאחלים לכם בהצלחה!\n\nצוות Traffix`;
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
  let message = `עדכון:\n\nמסלול: ${exactData.title}\nזמן נסיעה: ${exactData.time} דקות\nשעת עדכון: ${lastUpdateTime}\n`;
  if (exactData.avgForThisTime) {
    message = `עדכון:\n\nמסלול: ${exactData.title}\nזמן נסיעה: ${exactData.time} דקות\nזמן  ממוצע לשעה זו: ${exactData.avgForThisTime} דקות\nשעת עדכון: ${lastUpdateTime}\n`;
  }
  // `Hourly avg: ${resultAvg}`
  return message;
};
//
// Graph updates//
exports.graphWillDelete = (minutes = 10) => {
  message = `גרף זה זמין לשימושך ל${minutes} דקות ${emojis.dashboard} ${emojis.time}`;
  return message;
};
//Schedule updates
exports.scheduleUpdatesFirstMessage = () => {
  message = `נהדר! בואו נתקדם!\nשירות זה מאפשר לך לקבל עדכון בשעה קבועה לגבי משך הנסיעה במסלול שתבחרו!\nלצורך זה נצטרך לבחור את המסלול הרצוי\nאנא בחרו מסלול שעליו תרצו לקבל הודעות קבועות:`;
  return message;
};
exports.chooseScheduleTime = (route) => {
  message = `מעולה!\nבחרתם במסלול: ${route.from}-${route.to}\n\nעכשיו צריך לבחור את השעה שבה תרצו לקבל את ההודעה עם המידע על המסלול שבחרתם:`;
  return message;
};
exports.scheduleUpdateAddSuccessfully = (route, hour) => {
  message = `יש! ${emojis.confirm}\n\nהוספנו בהצלחה את ההודעה המתוזמנת הזו!\n\nמסלול: ${route.from}-${route.to}\n\nשעה: ${hour}\n\nאין עליכם!${emojis.heartFace}\n\nבמידה ותרצו להוסיף הודעות נוספות/שעות נוספות תוכלו לעשות זאת מהתפריט הראשי!`;
  return message;
};
//Schdule hour range for alerts about traffic jams;
exports.scheduleAlertsFirtMessage = () => {
  message = `נהדר! בואו נתקדם!\n\nשירות זה יאפשר לכם לקבל התראה כשמתחיל עומס תנועה בנתיב שתבחרו בתוך טווח שעות שתתבקשו להגדיר\n\nאז קודם כל,אנא בחרו את המסלול עליו תרצו לקבל התראות עומס תנועה:`;
  return message;
};
exports.scheduleAlertsChooseFromHour = (route) => {
  message = `מעולה!\nבחרתם במסלול: ${route.from}-${route.to}\n\nעכשיו צריך לבחור את טווח השעות שבה תרצו לקבל את ההתראה על עומס תנועה שמתחיל להיווצר במסלול שבחרתם\n\nראשית,אנא בחרו שעת התחלה(שעה שהחל ממנה תרצו לקבל התראות):`;
  return message;
};
exports.scheduleAlertsChooseToHour = (hour) => {
  message = `מצוין! ${emojis.smiley}\n\n בחרת לקבל התראות החל מהשעה ${hour}\n\nעכשיו צריך לבחור עד איזה שעה תרצו לקבל התראות:`;
  return message;
};
exports.scheduleAlertsAddSuccessfully = (route, fromHour, toHour) => {
  message = `יאיי! ${emojis.smiley}\n\nשמרנו את ההתראה הזו ${emojis.confirm}\n\nמסלול: ${route.from}-${route.to}\n\nבין השעות: ${fromHour}-${toHour}\n\nבמידה ותרצו להוסיף התראות חדשות על מסלולים נוספים,תוכלו לעשות זאת מהתפריט הראשי!`;
  return message;
};
