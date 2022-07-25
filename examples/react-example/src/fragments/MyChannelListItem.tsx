import { Channel } from '@chatkitty/core';
import React, { useContext, useEffect, useState } from 'react';
import { JoinedChannelListItemView } from '@chatkitty/react-ui';

import { ChatAppContext } from '../providers/ChatAppProvider';

interface MyChannelListItemProps {
  channel: Channel;
}

const MyChannelListItem: React.FC<MyChannelListItemProps> = ({
  channel,
}: MyChannelListItemProps) => {
  const {
    channel: selectedChannel,
    channelDisplayName,
    channelDisplayPicture,
    channelUnreadMessagesCount,
    showChat,
    leaveChannel,
  } = useContext(ChatAppContext);

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    channelUnreadMessagesCount(channel).then((count) =>
      setUnreadMessagesCount(count)
    );
  }, [channel]);

  return (
    <JoinedChannelListItemView
      id={channel.id}
      name={channelDisplayName(channel)}
      displayPicture={channelDisplayPicture(channel)}
      onLeave={() => {
        leaveChannel(channel);
      }}
      selected={channel.id === selectedChannel?.id}
      key={channel.id}
      unreadMessageCount={unreadMessagesCount}
      onClick={() => showChat(channel)}
    />
  );
};

export default MyChannelListItem;
