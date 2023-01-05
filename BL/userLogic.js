const userController = require("../DL/Controllers/UserController");
const bcrypt = require("bcrypt");
const validators = require("../DL/validators");
let salt = 10;
// let salt = 10;
let secret = "asddaasbajsdajsb12r536bf6xe2nudtybyitbs3m23b01bxdrby23udnwjk";
const jwtFn = require("../Middleware/auth");
const { resetPassExpiry, validatePassExpiry } = require("../DL/moment/moment");
const { mail, resetPassMail } = require("../DL/mails/mails");
const { resetPass } = require("../DL/mails/templates");
const { encrypt, decrypt } = require("../DL/crypto-js/encrypt");

const getUserDetails = async (userId) => {
  const requestedUser = await userController.readOne({ _id: userId });
  requestedUser.password = undefined;
  return requestedUser;
};

const getAllUsers = async () => {
  return await userController.read({});
};

const createNewUser = async (user) => {
  try {
    let validate = validators.validateNewUser(user);
    if (!validate.valid) {
      throw { code: 400, message: validate.message };
    }
    const { email } = user;
    const userExist = await userController.readOne({ email });
    if (userExist) throw { code: 409, message: "user Exicst", email };
    let hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    const newUser = await userController.create(user);
    const token = jwtFn.createToken({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      _id: newUser._id,
      email: newUser.email,
    });
    newUser.password = undefined;
    return { token, user: newUser };
  } catch (err) {
    console.log(err);
    return { code: 500, message: "Internal error", err };
  }
};

const login = async (loginDetails) => {
  try {
    const { email, password } = loginDetails;
    const requestedUser = await userController.readOne({ email });
    if (!requestedUser) {
      throw { code: 400, message: "One of your credentials is worng" };
    }

    const dePassword = await bcrypt.compare(
      loginDetails.password,
      requestedUser.password
    );
    if (dePassword) {
      const token = jwtFn.createToken({
        firstName: requestedUser.firstName,
        lastName: requestedUser.lastName,
        _id: requestedUser._id,
        email: requestedUser.email,
      });
      requestedUser.password = undefined;
      return { token, user: requestedUser };
    } else {
      throw { code: 400, message: "One of your credentials is worng" };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};
const updateDefaultDashboard = async (_id, defaultDashboard) => {
  console.log("start update");
  let updated = await userController.update({ _id }, { defaultDashboard });
  updated.password = undefined;
  return updated;
};
const forgetPassword = async (email) => {
  const user = await userController.readOne({ email });
  if (!user) {
    return { code: 404, message: "Cant find this user" };
  }
  const encryptedExpiry = encrypt(resetPassExpiry(10, "minute"));
  const encryptedUserId = encrypt(user._id.toString());
  // resetPassMail({
  //   encryptedExpiry,
  //   encryptedUserId,
  //   firstName: user.firstName,
  //   email,
  // });
  return {
    code: 200,
    message: "Reset mail has been sent",
    expiry: encryptedExpiry,
    user: encryptedUserId,
  };
};
const resetPassword = async ({
  t: encryptedExpiry,
  p: encryptedUser,
  c: newPassword,
}) => {
  let expired = validatePassExpiry(decrypt(encryptedExpiry));
  if (expired) {
    return { code: 403, message: "This link is expired" };
  }
  let userToUpdate = await userController.update(
    { _id: decrypt(encryptedUser) },
    { password: await bcrypt.hash(newPassword, salt) }
  );
  return { code: 200, message: "Your new password is updated" };
};
module.exports = {
  createNewUser,
  getAllUsers,
  login,
  forgetPassword,
  resetPassword,
  getUserDetails,
  updateDefaultDashboard,
};
