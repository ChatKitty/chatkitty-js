import {
  Message as ChatKittyMessage,
  isFileMessage,
  isTextMessage,
} from '@chatkitty/core';
import React from 'react';
import { TextMessage } from '@chatkitty/react-ui';

import FileMessage from './FileMessage';
import LinkPreview from './LinkPreview';

type MessageProps = {
  message: ChatKittyMessage;
};

const Message: React.FC<MessageProps> = ({ message }: MessageProps) => {

  return (
    <>
      {isTextMessage(message) && (
        <>
          <TextMessage text={message.body} />
          {message.links && <LinkPreview links={message.links} />}
        </>
      )}
      {isFileMessage(message) &&
          <FileMessage message={message} />
      }
    </>
  );
};

export default Message;
