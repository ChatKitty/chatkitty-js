import { Channel } from '@chatkitty/core';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlexRow,
  Heading,
  HeadingVariants,
  Icon,
  Icons,
  ScrollView,
} from '@chatkitty/react-ui';
import { usePaginator } from '@chatkitty/react-ui';

import { ChatAppContext } from '../providers/ChatAppProvider';

import DisplayNotification from './DisplayNotification';
import MyChannelListItem from './MyChannelListItem';

const MyChannels: React.FC = () => {
  const {
    joinedChannelsPaginator,
    onJoinedChannel,
    onLeftChannel,
    loading,
    currentUser,
    currentNotification,
    showChat,
    showJoinChannel,
  } = useContext(ChatAppContext);
  const [notificationView, setNotificationView] = useState<boolean>(false);
  const [channelList, setChannelList] = useState<Channel[]>([]);

  const {
    items: channels,
    append,
    remove,
    containerRef,
    boundaryRef,
  } = usePaginator({
    paginator: () => joinedChannelsPaginator(),
    onInitialPageFetched: (items) => {
      if (items) {
        showChat(items[0]);
        setChannelList(items);
      }
    },
    dependencies: [currentUser],
  });

  useEffect(() => {
    return onJoinedChannel((channel) => {
      append([channel]);
    });
  }, [currentUser]);

  useEffect(() => {
    return onLeftChannel((channel) => {
      remove((c) => c.id === channel.id);
    });
  }, [currentUser]);

  useEffect(() => {

    if (currentNotification) {
      setNotificationView(true);

      const interval = setTimeout(() => {
        setNotificationView(false);
        clearTimeout(interval);
      }, 10000);
    }
  }, [currentNotification]);

  const onClick = () => {
    setNotificationView(false);
    if (currentNotification?.channel) {
      if (channelList) {
        const currentNotificationChannelId = currentNotification.channel.id;
        channelList.find((currentChannel) => {
          if (currentChannel.id === currentNotificationChannelId) {
            showChat(currentChannel);
          }
        });
      }
    }
  };

  return loading ? (
    <div>Loading...</div>
  ) : (
    <>
      <FlexRow
        justifyContent="space-between"
        mx={6}
        marginBottom={1}
        display="relative"
      >
        <Heading variant={HeadingVariants.INVERSE}>Channels</Heading>
        <Icon
          icon={Icons.Add}
          color={'onPrimary'}
          onClick={() => {
            showJoinChannel();
          }}
          title="Join channel"
          clickable
        />
      </FlexRow>

      <ScrollView ref={containerRef}>
        {channels.map((channel) => (
          <MyChannelListItem key={channel.id} channel={channel} />
        ))}
        <div ref={boundaryRef} />
      </ScrollView>
      {notificationView && currentNotification && (
        <div onClick={onClick}>
          <DisplayNotification
            notification={currentNotification}
          />
        </div>
      )}
    </>
  );
};

export default MyChannels;
