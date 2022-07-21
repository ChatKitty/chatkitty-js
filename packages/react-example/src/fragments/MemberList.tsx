import { User } from '@chatkitty/core';
import { ChatAppContext } from '../providers/ChatAppProvider';
import React, { useContext, useEffect, useState } from 'react';
import { Icon, Icons, StyledBox, useMediaQuery } from '@chatkitty/react-ui';
import { Drawer, Heading, HeadingVariants } from '@chatkitty/react-ui';
import { ThemeContext } from 'styled-components';

import UserAvatar from './UserAvatar';

const MemberList: React.FC = () => {
  const theme = useContext(ThemeContext);
  const isMedium = useMediaQuery(theme.mediaQueries.medium);

  const { layout, channel, memberListGetter } = useContext(ChatAppContext);

  const [channelMembers, setChannelMembers] = useState<User[] | null>([]);

  useEffect(() => {
    if (!channel) {
      return;
    }
    memberListGetter(channel).then((resolved) => {
      setChannelMembers(resolved);
    });
  }, [channel]);

  return channel ? (
    <Drawer
      open={layout.menu || isMedium}
      background={theme.backgrounds.primary}
    >
      <div>
        {channel?.name !== null && (
          <Heading
            variant={HeadingVariants.INVERSE}
            style={{ fontSize: '25px', marginTop: '30px', marginLeft: '10px' }}
          >
            {channel?.name}
          </Heading>
        )}
      </div>

      <div>
        {channel?.creator != null && (
          <div>
            <Heading
              variant={HeadingVariants.INVERSE}
              style={{
                marginTop: '30px',
                marginLeft: '10px',
                marginBottom: '15px',
              }}
            >
              Owner
            </Heading>
            <StyledBox>
              <UserAvatar
                user={channel?.creator}
              />
              <Icon
                icon={Icons.Presence}
                title={
                  channel.creator.presence.online
                    ? 'Connected'
                    : 'Not connected'
                }
                color={channel.creator.presence.online ? 'success' : 'inactive'}
                style={{
                  display: 'inline',
                }}
              />
              <p
                style={{
                  display: 'inline',
                  marginLeft: '10px',
                  width: '100px',
                  color: 'yellow',
                  verticalAlign: '10px',
                }}
              >
                {channel.creator.displayName}
              </p>
            </StyledBox>
          </div>
        )}
      </div>

      <Heading
        variant={HeadingVariants.INVERSE}
        style={{ marginTop: '30px', marginLeft: '10px' }}
      >
        Channel Members
      </Heading>
      <StyledBox style={{ marginTop: '15px' }}>
        {channelMembers?.map((user) => (
          <StyledBox key={user.id}>
            {user.name !== channel?.creator?.name && (
              <div>
                <UserAvatar
                  user={user}
                />
                <Icon
                  icon={Icons.Presence}
                  title={user.presence.online ? 'Connected' : 'Not connected'}
                  color={user.presence.online ? 'success' : 'inactive'}
                  style={{
                    display: 'inline',
                  }}
                />
                <p
                  style={{
                    display: 'inline',
                    marginLeft: '10px',
                    width: '100px',
                    color: 'white',
                    verticalAlign: '7px',
                  }}
                >
                  {user.displayName}
                </p>
              </div>
            )}
          </StyledBox>
        ))}
      </StyledBox>
    </Drawer>
  ) : (
    <Drawer
      open={layout.menu || isMedium}
      background={theme.backgrounds.primary}
    >
      <Heading
        variant={HeadingVariants.INVERSE}
        style={{ fontSize: '20px', marginTop: '30px', marginLeft: '10px' }}
      >
        Please Select a Channel
      </Heading>
    </Drawer>
  );
};

export default MemberList;
