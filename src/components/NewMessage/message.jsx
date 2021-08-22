import React from "react";
import styled from "styled-components";

const Td = styled.td`
  width: 15vh;
`;

export default function Message(props) {
  return (
    <tr>
      <Td>
        {props.sender} says: {props.text}
      </Td>
    </tr>
  );
}

//Message.propTypes = {
//  chatId: PropTypes.string.isRequired,
//  chatTitle: PropTypes.string.isRequired,
//};
