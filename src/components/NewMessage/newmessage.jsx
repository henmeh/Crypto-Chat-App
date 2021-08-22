import React from "react";
import styled from "styled-components";
import { sendMessage } from "../../functions/functions";
import Message from "./message";

const Table = styled.table`
  font-size: 1.4rem;
  margin: 0px 0px 0px 0px;
`;

export default function NewMessage(props) {

  const sendNewMessage = () => {
    let message = document.getElementById("new-message-text").value;
    sendMessage(message, props.chatId);
  };

  if (props.chatHistory) {
    return (
      <div>
        <input type="text" placeholder="New Message" id="new-message-text" />
        <input
          type="button"
          value="Send Message"
          id="btn-new-message"
          onClick={sendNewMessage}
        />
        <Table className="table table-primary table-bordered">
          <tbody>
            {props.chatHistory.map(({ messageId, sender, text }) => (
              <Message key={messageId} sender={sender} text={text} />
            ))}
          </tbody>
        </Table>
      </div>
    );
  } else {
    return (
      <div>
        <input type="text" placeholder="New Message" id="new-message-text" />
        <input
          type="button"
          value="Send Message"
          id="btn-new-message"
          onClick={sendNewMessage}
        />
      </div>
    );
  }
}

//NewMessage.propTypes = {
//  chatId: PropTypes.string,
//};
