import { User } from '@chatkitty/core';
import React from 'react';
import { StyledBox } from '@chatkitty/react-ui';

interface TypingIndicatorProp {
  typingUsers: User[];
}

const TypingIndicator: React.FC<TypingIndicatorProp> = ({
  typingUsers,
}: TypingIndicatorProp) => {
  return (
    <StyledBox style={{ whiteSpace: 'nowrap', width: '200px' }}>
      {typingUsers.length < 6 &&
        typingUsers.map((user) => (
          <img
            className="wrapper"
            key={user.id}
            src={user.displayPictureUrl}
            style={{
              display: 'inline-block',
              width: '20px',
              marginLeft: '10px',
              borderRadius: '50%',
            }}
          />
        ))}
      {typingUsers.length >= 6 && (
        <p style={{ paddingLeft: '11px', paddingBottom: '5px' }}>
          several people are typing
        </p>
      )}
      {typingUsers.length < 6 && typingUsers.length > 1 && (
        <p style={{ paddingLeft: '11px', paddingBottom: '5px' }}>are typing</p>
      )}
      {typingUsers.length === 1 && (
        <p style={{ paddingLeft: '11px', paddingBottom: '5px' }}>is typing</p>
      )}
    </StyledBox>
  );
};

export default TypingIndicator;
