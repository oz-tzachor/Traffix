const messageIdController = require("../DL/Controllers/messageIdController");
// const { deleteMessage } = require("../DL/bot/bot");
const { getDate } = require("../DL/moment/moment");
async function getTelegramUser(filter) {
  const user = await messageIdController.readOne(filter);
  return user;
}
//
async function getMessageIds(filter) {
  const message = await messageIdController.read(filter);
  return message;
}
//

async function newMessageId(newUserDetails) {
  const newMessageId = await messageIdController.create(newUserDetails);
  return newMessageId;
}
//
async function updateMessageId(filter, newUserDetails) {
  const newUser = await messageIdController.update(filter, newUserDetails, {
    new: true,
  });
  return newUser;
}
async function checkForDeletingMessageId(callbackDelete) {

  try{

    console.log('checking');
    let date = getDate();
    let hour = date.hour();
    date = date.set({ hour: hour - 5});
    let filt = {
      createdAt: {
        $gte: date,
      },
    };
    let messages = await getMessageIds({...filt });
    console.log("messages  ", messages.length);
    messages= messages.filter((item)=>{
      let now = getDate()
      let creationDate =  getDate(item.createdAt);
      return now.diff(creationDate,'minutes') >= 10
    })
    console.log("messages to delete ", messages.length);

    for (let index = 0; index < messages.length; index++) {
      const messageToDelete = messages[index];
      let {chatId,messageId}=messageToDelete
      await deleteMessageId({chatId,messageId},callbackDelete)
      
    }
  }catch(e){
    console.log('e',e);
  }
}
  
  async function deleteMessageId(filter,callbackDelete) {
    try{

      let { chatId, messageId } = filter;
      await callbackDelete(chatId, messageId).then(async () => {
        const deleted = await messageIdController.deleteTotal(filter);
        console.log('deleted');
        return true;
      });
    }catch(e){
      console.log('e',e);
      return false
    }
}

module.exports = {
  newMessageId,
  getTelegramUser,
  updateMessageId,
  getMessageIds,
  checkForDeletingMessageId,
  deleteMessageId,
};
