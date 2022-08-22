import {
  Message as ChatKittyMessage,
  isFileMessage,
  isTextMessage,
} from '@chatkitty/core';
import React from 'react';
import {ImageMessage, TextMessage} from '@chatkitty/react-ui';

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
      {isFileMessage(message) && <ImageMessage image={message.file.url} />}
    </>
  );
};

export default Message;
