import { User } from '@chatkitty/core';
import React from 'react';
import { StyledBox } from '@chatkitty/react-ui';

interface UserAvatarProp {
  user: User;
  style?: React.CSSProperties | undefined;
}

const UserAvatar: React.FC<UserAvatarProp> = ({
  user,
  style,
}: UserAvatarProp) => {
  return (
    <StyledBox
      style={{
        display: 'inline',
      }}
    >
      <img
        src={user.displayPictureUrl}
        style={
          style
            ? style
            : {
                borderRadius: '50%',
                width: '25px',
                marginLeft: '10px',
                marginTop: '5px',
              }
        }
      />
    </StyledBox>
  );
};

export default UserAvatar;
