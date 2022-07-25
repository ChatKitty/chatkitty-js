import {
  isUserMentionedNotification,
  isUserMessage,
  Notification,
} from '@chatkitty/core';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlexColumn, FlexRow, StyledBox } from '@chatkitty/react-ui';

import UserAvatar from './UserAvatar';

import '../styles/slide.css';

interface NotificationProp {
  notification: Notification;
}

const DisplayNotification: React.FC<NotificationProp> = ({
  notification,
}: NotificationProp) => {
  const [isMentionNotification, setIsMentionNotification] =
    useState<boolean>(false);

  useEffect(() => {
    if (isUserMentionedNotification(notification)) {
      setIsMentionNotification(true);
    }
  });

  return (
    <StyledBox
      className="slideIn"
      style={{
        width: '250px',
        height: '90px',
        background: 'white',
        position: 'absolute',
        bottom: '5px',
        left: '5px',
        borderRadius: '5%',
        cursor: 'pointer',
      }}
    >
      {isUserMentionedNotification(notification) &&
        isUserMessage(notification.data.message) && (
          <FlexRow>
            <div style={{ marginLeft: '5px' }}>
              <UserAvatar
                user={notification.data.message.user}
                style={{
                  display: 'inline-block',
                  width: '35px',
                  borderRadius: '50%',
                }}
              />
            </div>
            <FlexColumn style={{ marginLeft: '10px', marginTop: '15px' }}>
              <strong>#{notification.channel?.name}</strong>
              <p
                style={{
                  width: '200px',
                  height: '40px',
                  overflow: 'hidden',
                  marginBottom: '5px',
                }}
              >
                {isMentionNotification ? (
                  <p>
                    {' '}
                    <strong>
                      {notification.data.message.user.displayName}
                    </strong>{' '}
                    mentioned you in a message
                  </p>
                ) : (
                  <p>
                    <strong>
                      {notification.data.message.user.displayName}:
                    </strong>{' '}
                    {notification.body}
                  </p>
                )}
              </p>
              {moment(notification.createdTime).format('LT')}
            </FlexColumn>
          </FlexRow>
        )}
    </StyledBox>
  );
};

export default DisplayNotification;
