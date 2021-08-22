import React from "react";
import { setNewGroupChat } from "../../functions/functions";

const createChat = () => {
  let chatTitle = document.getElementById("group-name-text").value;
  setNewGroupChat(chatTitle);
};

export default function NewChat() {
  return (
    <div>
      <input type="text" placeholder="Group name" id="group-name-text" />
      <input type="button" value="Create" id="btn-new-group-chat" onClick={createChat}/>
    </div>
  );
}

/*Balance.propTypes = {
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  ticker: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  decimals: PropTypes.number.isRequired,
};*/
