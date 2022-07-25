import { Message } from '@chatkitty/core';
import React, { useContext } from 'react';

import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { ChatAppContext } from '../providers/ChatAppProvider';

import MessageListItem from './MessageListItem';

const capitalize = (string: string): string => {
  return string
    .split(' ')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
};

const welcome = (name: string): Message => {
  const message = {
    id: 0,
    type: 'TEXT',
    body: `Welcome to the ChatKitty team demo. 👋👋\n\nWe logged you in as ${capitalize(
      name
    )}.\n\nSend a message now to start interacting with other users. 👇`,
    createdTime: '2021-09-20T07:30:35Z',
  };

  return message as unknown as Message;
};

const WelcomeMessage: React.FC = () => {
  const { currentUser } = useContext(ChatAppContext);

  const welcomeMessage = welcome(currentUser?.displayName || '');

  return (
    <MessageListItem
      message={welcomeMessage}
      key={welcomeMessage.id}
      avatar={<Logo title="ChatKitty" style={{ height: 61, width: 61 }} />}
    />
  );
};

export default WelcomeMessage;
