import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Td = styled.td`
  width: 15vh;
`;

export default function Chat(props) {
  const handleClick = (event) => {
    //Prevent the default action of submitting the form
    event.preventDefault();
    props.handleRefresh(props.chatId);
  };

  return (
    <tr>
      <Td>
        <input
          type="button"
          value={props.chatTitle}
          id={props.chatId}
          onClick={handleClick}
        />
      </Td>
    </tr>
  );
}

Chat.propTypes = {
  chatId: PropTypes.string.isRequired,
  chatTitle: PropTypes.string.isRequired,
};
