const lineBreak = "<br/>";

const styles = {
  greeting: { header: "border:1px solid red" },
};
const sendVerificationCode = (email, code) => {
  return `<div style="dir:"rtl"; color:green;">
  <h2>
  היי!
  </h2>
  <h3>
 אנחנו מאד שמחים שהצטרפתם אלינו!</h3>
<h2>
קוד האימות הוא : ${code}
</h2>
  </div>`;
};
const resetPass = (details) => {
  let resetLink = `http://home-page/reset-password?e=${details.encryptedExpiry}&u=${details.encryptedUserId}`;
  return `<div style = dir:ltr> 
  <h2 style=${styles.greeting.header}>
  Hi ${details.firstName}!
  </h2>
  <h3>
  Here is link for reset password, please click the button!</h3>
  <a href=${resetLink}>
  <button>
  Reset-Password
  </button>
  </a>
  </div>`;
};

const htmlTemplates = { sendVerificationCode, resetPass };
module.exports = htmlTemplates;
