import {
  Message as ChatKittyMessage,
  isFileMessage,
  isTextMessage,
  isUserMessage,
  UserMessageMention,
} from '@chatkitty/core';
import moment from 'moment';
import { ChatAppContext } from '../providers/ChatAppProvider';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import {
  FlexColumn,
  FlexRow,
  Heading,
  Label,
  LabelSizes,
  StyledBox,
} from '@chatkitty/react-ui';
import { useHover } from '@chatkitty/react-ui';

import replyIcon from '../assets/images/reply-icon.png';

import Message from './Message';
import PopupEmojiWindow from './PopupEmojiWindow';
import Reactions from './Reactions';

interface MessageListItemProps {
  message: ChatKittyMessage;
  avatar: ReactElement;
  previousMessage?: ChatKittyMessage;
}

const MessageListItem: React.FC<MessageListItemProps> = ({
  message,
  avatar,
  previousMessage,
}: MessageListItemProps) => {
  const sender: { displayName: string } = isUserMessage(message)
    ? message.user
    : {
        displayName: 'ChatKitty',
      };

  const [isHovering, hoverProps] = useHover({ mouseEnterDelayMS: 0 });
  const { changeReply, getMessageParent, currentUser } =
    useContext(ChatAppContext);
  const [messageParent, setMessageParent] = useState<ChatKittyMessage | null>(
    null
  );
  const [isMentionOrReply, setIsMentionOrReply] = useState<boolean>(false);
  const [sameUser, setSameUser] = useState<boolean | null>(true);

  useEffect(() => {
    getMessageParent(message).then((message) => {
      setMessageParent(message);
      if (
        message &&
        isUserMessage(message) &&
        message.user.id === currentUser?.id
      ) {
        setIsMentionOrReply(true);
      }
    });

    if (previousMessage) {
      const time = moment(message.createdTime);
      const previousTime = moment(previousMessage.createdTime);
      const ellapsedTime = time.diff(previousTime, 'minute');

      setSameUser(
        isUserMessage(previousMessage) &&
          previousMessage.user.displayName === sender.displayName &&
          ellapsedTime < 1
      );
    }
  }, []);

  useEffect(() => {
    if (isTextMessage(message) && message.mentions) {
      message.mentions.map((currentMention) => {
        const mention = currentMention as UserMessageMention;
        if (mention.user.name === currentUser?.name) {
          setIsMentionOrReply(true);
        }
      });
    }
  }, []);

  const changeReplyMessage = () => {
    changeReply(message);
  };

  const scrollToElement = () => {
    const element = document.getElementById(String(messageParent?.id));

    if (element) {
      element.scrollIntoView(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {messageParent && isUserMessage(messageParent) && (
        <FlexRow
          style={{ marginLeft: '20px', cursor: 'pointer' }}
          alignItems="flex-start"
          bg={
            isHovering
              ? 'backgrounds.contentHover'
              : isMentionOrReply
              ? 'yellow'
              : ''
          }
          {...hoverProps}
          onClick={scrollToElement}
        >
          <strong>@{messageParent.user.displayName}</strong>
          {isTextMessage(messageParent) && <p>: {messageParent.body}</p>}
          {isFileMessage(messageParent) && <p>: {messageParent.file.name}</p>}
        </FlexRow>
      )}
      <FlexRow
        py="1"
        px={[5, 6]}
        alignItems="flex-start"
        bg={
          isHovering
            ? 'backgrounds.contentHover'
            : isMentionOrReply
            ? 'yellow'
            : ''
        }
        {...hoverProps}
      >
        {(!sameUser || messageParent || !previousMessage) && avatar}
        <FlexColumn marginLeft="5" flexGrow={1}>
          <FlexRow marginBottom="1">
            {(!sameUser || messageParent || !previousMessage) && (
              <StyledBox marginRight="3">
                <Heading>{sender.displayName}</Heading>
              </StyledBox>
            )}
            {(!sameUser || messageParent || !previousMessage) && (
              <Label size={LabelSizes.SMALL}>
                {moment(message.createdTime).fromNow()}
              </Label>
            )}
          </FlexRow>

          <FlexRow>
            <div
              style={{
                position: 'relative',
                left:
                  sameUser && !messageParent && previousMessage
                    ? '30px'
                    : '0px',
              }}
            >
              <Message message={message} />
            </div>
            {isHovering && (
              <FlexRow
                style={{ position: 'absolute', top: '10px', right: '50px' }}
              >
                <PopupEmojiWindow message={message} />
                <div
                  style={{
                    position: 'absolute',
                    top: '0px',
                    right: '30px',
                    borderRadius: '20%',
                    height: '17px',
                    width: '15px',
                  }}
                >
                  <img
                    src={replyIcon}
                    style={{ width: '20px', cursor: 'pointer' }}
                    onClick={changeReplyMessage}
                  />
                </div>
              </FlexRow>
            )}
          </FlexRow>

          <div
            style={{
              position: 'relative',
              marginLeft:
                sameUser && !messageParent && previousMessage ? '30px' : '0px',
            }}
          >
            <Reactions message={message} />
          </div>
        </FlexColumn>
      </FlexRow>
    </div>
  );
};

export default MessageListItem;
