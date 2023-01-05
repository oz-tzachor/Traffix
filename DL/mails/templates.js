const lineBreak = "<br/>";

const styles = {
  greeting: { header: "border:1px solid red" },
};
const greeting = (firstName) => {
  return `<div style=dir:ltr>
  <h2 style=${styles.greeting.header}>
  Hi ${firstName}!
  </h2>
  <h3>
  Wer'e so happpy to see you with us!</h3>
  <a  href='https://www.google.com'>
  <button>
  Google
  </button>
  </a>
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

const htmlTemplates = { greeting, resetPass };
module.exports = htmlTemplates;
