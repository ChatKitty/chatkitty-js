import { BaseFileMessage, FileUserMessage } from '@chatkitty/core';
import { ChatAppContext } from '../providers/ChatAppProvider';
import React, { useContext, useEffect, useState } from 'react';

import FileIcon from '../assets/images/File_Icon.png';

interface FileMessageProp {
  message: BaseFileMessage | FileUserMessage;
}

const FileMessage: React.FC<FileMessageProp> = ({
  message,
}: FileMessageProp) => {
  const { getURLFile } = useContext(ChatAppContext);

  const [link, setLink] = useState<string>('');

  useEffect(() => {
    getURLFile(message.file.url).then((blob) => {
      if (blob) {
        setLink(URL.createObjectURL(blob));
      } else {
        setLink(message.file.url);
      }
    });
  }, []);

  return (
    <a href={link} download={message.file.name}>
      <div
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '800px',
          maxHeight: '800px',
        }}
      >
        {message.file.contentType === 'image/png' ? (
          <img src={message.file.url} style={{ maxWidth: '100%' }} />
        ) : (
          <img src={FileIcon} style={{ maxWidth: '5%' }} />
        )}
        <p style={{ marginTop: '1px' }}>{message.file.name}</p>
      </div>
    </a>
  );
};

export default FileMessage;
