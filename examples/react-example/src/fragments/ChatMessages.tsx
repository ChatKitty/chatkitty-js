import { Channel, isUserMessage } from '@chatkitty/core';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlexColumn, ScrollView } from '@chatkitty/react-ui';
import { Avatar, AvatarVariants } from '@chatkitty/react-ui';
import { usePaginator } from '@chatkitty/react-ui';
import { getUniqueColor } from '@chatkitty/react-ui';
import { ThemeContext } from 'styled-components';

import { ChatAppContext } from '../providers/ChatAppProvider';

import MessageListItem from './MessageListItem';
import UserAvatar from './UserAvatar';
import WelcomeMessage from './WelcomeMessage';

interface ChatMessagesProps {
  channel: Channel;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  channel,
}: ChatMessagesProps) => {
  const theme = useContext(ThemeContext);

  const { messages, messagesPaginator, appendToMessages } =
    useContext(ChatAppContext);

  const [height, setHeight] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { containerRef, boundaryRef } = usePaginator({
    paginator: () => {
      if (!channel) {
        return;
      }

      return messagesPaginator(channel);
    },
    onPageFetched: (items) => {
      appendToMessages(items);
    },
    dependencies: [channel],
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollPosition = event.currentTarget?.scrollTop;

    if (scrollPosition) {
      setScrollPosition(scrollPosition);
    }
  };

  const restoreScrollPosition = () => {
    if (containerRef.current) {
      if (scrollPosition) {
        containerRef.current.scrollTo(0, scrollPosition);
      } else {
        // scroll to bottom
        containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
      }
    }
  };

  const current = containerRef.current;

  // when history is pulled, scroll down to compensate
  const newHeight = current?.scrollHeight;
  useEffect(() => {
    if (height === 0 && newHeight) {
      setHeight(newHeight);
    } else if (newHeight && newHeight !== height) {
      if (current) {
        current.scrollTop += newHeight - height;
      }
      setHeight(newHeight);
    }
  }, [newHeight, height, current]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const hasReachedBottom = current
    ? current.scrollHeight - current.clientHeight === current.scrollTop
    : false;

  useEffect(() => {
    if (hasReachedBottom) {
      scrollToBottom();
    }
  }, [messages.length, hasReachedBottom, scrollToBottom]);

  useEffect(() => {
    restoreScrollPosition();
  }, []);

  return (
    <ScrollView ref={containerRef} onScroll={handleScroll}>
      <FlexColumn
        minHeight="100%"
        flexGrow={1}
        paddingBottom="1"
        flexDirection="column-reverse"
      >
        <div ref={messagesEndRef} />
        {messages.map((message, index) => (
          <div key={message.id} id={String(message.id)}>
            <MessageListItem
              message={message}
              previousMessage={
                index < messages.length - 1 ? messages[index + 1] : undefined
              }
              avatar={
                isUserMessage(message) ? (
                  <UserAvatar
                    user={message.user}
                    style={{
                      display: 'inline-block',
                      width: '35px',
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <Avatar
                    variant={AvatarVariants.ROUND}
                    bg={getUniqueColor('system', theme.colors.avatars)}
                  >
                    C
                  </Avatar>
                )
              }
            />
          </div>
        ))}
        {messages.length !== 0 && <WelcomeMessage />}
        <div ref={boundaryRef} />
        {/* This moves the list of messages to the bottom, since there's a bug with flex-end scroll */}
        <FlexColumn flex="1 1 auto"></FlexColumn>
      </FlexColumn>
    </ScrollView>
  );
};

export default ChatMessages;
