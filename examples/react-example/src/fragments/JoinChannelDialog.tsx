import React, { useContext } from 'react';
import {
  FlexRow,
  Heading,
  HeadingSizes,
  Icon,
  Icons,
  Modal,
  ScrollView,
} from '@chatkitty/react-ui';
import { JoinableChannelListItemView } from '@chatkitty/react-ui';
import { usePaginator } from '@chatkitty/react-ui';

import { ChatAppContext } from '../providers/ChatAppProvider';

const JoinChannelDialog: React.FC = () => {
  const { layout, hideJoinChannel, joinableChannelsPaginator, joinChannel } =
    useContext(ChatAppContext);

  const {
    containerRef,
    boundaryRef,
    items: channels,
  } = usePaginator({
    paginator: () => joinableChannelsPaginator(),
    dependencies: [layout.joinChannel],
  });

  return (
    <Modal open={layout.joinChannel}>
      <FlexRow
        justifyContent="space-between"
        px={[3, 0]}
        paddingBottom={8}
        paddingTop={[8, 0]}
      >
        <Heading size={HeadingSizes.BIG}>Join a Channel</Heading>
        <Icon
          onClick={hideJoinChannel}
          color={'normalText'}
          icon={Icons.Cross}
          title="Close"
          clickable
        />
      </FlexRow>

      <ScrollView ref={containerRef}>
        {channels.map((channel) => {
          const properties = channel.properties as { description: string };

          return (
            <JoinableChannelListItemView
              key={channel.id}
              onClick={() => {
                joinChannel(channel);
              }}
              name={channel.name}
              description={properties.description}
            />
          );
        })}
        <div ref={boundaryRef} />
      </ScrollView>
    </Modal>
  );
};

export default JoinChannelDialog;
