const moralis = require("moralis");

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

//async function init() {
//  window.web3 = await moralis.Web3.enable();
//}

//init();

module.exports = {

  init: async function () {
    let query = new moralis.Query("Message");
    let subscription = await query.subscribe();

    subscription.on("create", (object) => {
      return object;
      //console.log(chatId);
      //console.log(object);
      //const newObject = {
      //  messageId: object.id,
      //  sender: object.attributes.sender,
      //  text: object.attributes.text,
      //};
      //chatHistory.push(newObject);
    })
    //setChatHistory(allMessages);
      //if (object.get("group") == chatId) {
      //  var listItem = document.createElement("li");
      //  listItem.innerHTML =
      //    object.get("sender") + " says:<br>" + object.get("text") + "<br>";
      //  historyList.appendChild(listItem);
      //}
    //});
  },

  Login: async function () {
    try {
      const user = await moralis.authenticate();
      return user;
    } catch (error) {
      console.log(error);
    }
  },

  Logout: async function () {
    try {
      await moralis.User.logOut();
      return false;
    } catch (error) {
      console.log(error);
    }
  },

  setNewGroupChat: async function (_title) {
    try {
      console.log(_title);
      const GroupChats = moralis.Object.extend("GroupChats");
      const groupChats = new GroupChats();

      groupChats.set("title", _title);
      groupChats.save();
    } catch (error) {
      console.log(error);
    }
  },

  getGroupChats: async function () {
    try {
      const GroupChats = moralis.Object.extend("GroupChats");
      const query = new moralis.Query(GroupChats);
      const results = await query.find();
      return results;
    } catch (error) {
      console.log(error);
    }
  },

  sendMessage: async function (_message, _chatId) {
    try {
      const user = await moralis.User.current();
      const Message = moralis.Object.extend("Message");
      const message = new Message();

      message.set("sender", user.get("ethAddress"));
      message.set("text", _message);
      message.set("chatId", _chatId);

      message.save();
    } catch (error) {
      console.log(error);
    }
  },

  getHistory: async function (_chatId) {
    try {
      const message = moralis.Object.extend("Message");
      const query = new moralis.Query(message);
      query.equalTo("chatId", _chatId);
      const results = await query.find();
      return results;
    } catch (error) {
      console.log(error);
    }
  },
};
