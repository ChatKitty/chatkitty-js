import { isUserMessage, Message, User } from '@chatkitty/core';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlexColumn,
  FlexRow,
  Heading,
  HeadingSizes,
  StyledBox,
} from '@chatkitty/react-ui';

import XIcon from '../assets/images/x-icon.png';
import { ChatAppContext } from '../providers/ChatAppProvider';


import ChatHeader from './ChatHeader';
import ChatMessageInput from './ChatMessageInput';
import ChatMessages from './ChatMessages';
import TypingIndicator from './TypingIndicator';

const Chat: React.FC = () => {
  const {
    channel,
    messages,
    startChatSession,
    cancelReply,
    clearFile,
    prependToMessages,
    currentUser,
    replyMessage,
    userFile,
  } = useContext(ChatAppContext);

  const [typingUsers, setTypingUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!channel) {
      return;
    }
    const session = startChatSession(
      channel,
      (message: Message) => {
        prependToMessages([message]);
      },
      (user: User) => {
        if (currentUser?.id !== user.id) {
          setTypingUsers((typingUsers) => [...typingUsers, user]);
        }
      },
      (user: User) => {
        if (currentUser?.id !== user.id) {
          setTypingUsers(
            typingUsers.splice(
              typingUsers.findIndex((item) => item.id === user.id),
              1
            )
          );
        }
      }
    );

    if (!session) {
      return;
    }

    return session.end;
  }, [channel]);

  const cancelReplyMessage = () => {
    cancelReply();
  }

  const clearUserFile = () => {
    clearFile();
  }

  return channel ? (
    <FlexColumn
      height="100%"
      width="100%"
      position={['fixed', 'static']}
      bg="backgrounds.content"
      borderRight="light"
    >
      <ChatHeader channel={channel} />
      <ChatMessages channel={channel} />
      {messages.length !== 0 ? (<>
        <TypingIndicator typingUsers={typingUsers} />
        {replyMessage && isUserMessage(replyMessage) && <FlexRow alignItems="flex-start">
          <p>Replying to <strong>{replyMessage.user.displayName}</strong> </p>
          <img src={XIcon} style={{width:'15px', cursor:'pointer', marginLeft:'50px'}} onClick={cancelReplyMessage}/>
        </FlexRow>}
      </>) : (
        <StyledBox
          style={{
            position: 'relative',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '50%',
          }}
        >
          <Heading size={HeadingSizes.BIG}>Loading Messages</Heading>
        </StyledBox>
      )}
      <ChatMessageInput />
      <FlexRow marginLeft={'25px'} marginBottom={'10px'}>
        {userFile && <>
          <p>{userFile.name}</p>
          <img src={XIcon} style={{width:'15px', cursor:'pointer', marginLeft:'50px'}} onClick={clearUserFile}/>
        </>}
      </FlexRow>
    </FlexColumn>
  ) : (
    <StyledBox margin="auto">
      <Heading size={HeadingSizes.BIG}>Select channel</Heading>
    </StyledBox>
  );
}; //

export default Chat;
