import React from "react";
import Chat from "../AllChats/chat";
import styled from "styled-components";

const Table = styled.table`
  font-size: 1.4rem;
  margin: 0px 0px 0px 0px
`;

const Tr = styled.tr`
border: 1px solid #cccccc;
`

export default function ChatList(props) {
    return (
      <Table className="table table-primary table-bordered">
        <thead>
          <Tr>
            <th>All Chats</th>
          </Tr>
        </thead>
        <tbody>
          {props.chatData.map(({ chatId, chatTitle }) => (
            <Chat
              key={chatId}
              chatId={chatId}
              chatTitle={chatTitle}
              handleRefresh={props.handleRefresh}
            />
          ))}
        </tbody>
      </Table>
    );
  
}
