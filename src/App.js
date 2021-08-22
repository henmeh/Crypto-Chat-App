import React, { useEffect } from "react";
import Header from "./components/Header/Header";
import moralis from "moralis";
import styled from "styled-components";
import {
  getGroupChats,
  getHistory,
  Login,
  Logout,
} from "./functions/functions";
import NewChat from "./components/NewChat/newchat";
import AllChats from "./components/AllChats/allchats";
import NewMessage from "./components/NewMessage/newmessage";

const Div1 = styled.div`
  text-align: center;
`;

const Div2 = styled.div`
  text-align: center;
  float: left;
`;

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const initialUser = moralis.User.current();

function App() {
  const [user, setUser] = React.useState(initialUser);
  const [chatData, setChatData] = React.useState([]);
  const [chatId, setChatId] = React.useState();
  const [chatHistory, setChatHistory] = React.useState();

  const init = async function (_chatId) {
    let query = new moralis.Query("Message");
    let subscription = await query.subscribe();

    subscription.on("create", async (object) => {
      if (object.get("chatId") === _chatId) {
        const messages = await getHistory(_chatId);
        let allMessages = [];
        for (let i = 0; i < messages.length; i++) {
          const object = {
            messageId: messages[i].id,
            sender: messages[i].attributes.sender,
            text: messages[i].attributes.text,
          };
          allMessages.push(object);
        }
        setChatHistory(allMessages);
      }
    });
  };

  init(chatId);

  const componentDidMount = async () => {
    if (user) {
      let allChats = [];
      const chats = await getGroupChats();
      for (let i = 0; i < chats.length; i++) {
        const object = {
          chatId: chats[i].id,
          chatTitle: chats[i].attributes.title,
        };
        allChats.push(object);
      }
      setChatData(allChats);
    }
  };

  useEffect(() => {
    if (chatData.length === 0) {
      //component did mount
      componentDidMount();
    } else {
      //component did update
    }
  });

  const onLogin = async () => {
    let user = await Login();
    setUser(user);
  };

  const onLogout = async () => {
    let user = await Logout();
    setUser(user);
  };

  const handleRefresh = async (_chatId) => {
    setChatId(_chatId);
    const messages = await getHistory(_chatId);
    let allMessages = [];
    for (let i = 0; i < messages.length; i++) {
      const object = {
        messageId: messages[i].id,
        sender: messages[i].attributes.sender,
        text: messages[i].attributes.text,
      };
      allMessages.push(object);
    }
    setChatHistory(allMessages);
  };

  return (
    <Div1>
      <Header user={user} onLogin={onLogin} onLogout={onLogout} />
      <Div2>
        <AllChats chatData={chatData} handleRefresh={handleRefresh} />
      </Div2>
      <Div2>
        <NewChat />
      </Div2>
      <Div2>
        <NewMessage chatId={chatId} chatHistory={chatHistory} />
      </Div2>
    </Div1>
  );
}

export default App;
