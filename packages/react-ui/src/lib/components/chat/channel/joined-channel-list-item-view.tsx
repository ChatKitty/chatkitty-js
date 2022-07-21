import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';

import { useMediaQuery } from '../../../hooks';
import { useHover } from '../../../hooks';
import { getUniqueColor } from '../../../utilities';
import { ListItem } from '../../layout';
import { Icon, Icons, LabelVariants, Title } from '../../presentation';
import { Avatar } from '../avatar/avatar';
import { ImageAvatar } from '../avatar/image-avatar';

interface JoinedChannelListItemViewProps {
  selected: boolean;
  id: number;
  name: string;
  displayPicture: string | null;
  unreadMessageCount: number;
  onClick: () => void;
  onLeave: () => void;
}

/**
 * Show a single joined channel
 */
const JoinedChannelListItemView: React.FC<JoinedChannelListItemViewProps> = ({
  selected,
  id,
  name,
  displayPicture,
  onClick,
  onLeave,
  unreadMessageCount,
}: JoinedChannelListItemViewProps) => {
  const [isHovering, hoverProps] = useHover({ mouseEnterDelayMS: 0 });
  const theme = useContext(ThemeContext);
  const isTouch = useMediaQuery(theme.mediaQueries.touch);
  const color = getUniqueColor(
    name,
    theme.colors.avatars as unknown as string[]
  );

  return (
    <ListItem
      key={id}
      onClick={onClick}
      bg={
        selected
          ? theme.backgrounds.primaryActive
          : isHovering
          ? theme.backgrounds.primaryHover
          : 'transparent'
      }
      {...hoverProps}
      clickable
    >
      {displayPicture ? (
        <ImageAvatar image={displayPicture} />
      ) : (
        <Avatar bg={color} color={theme.colors.selectedText}>
          #
        </Avatar>
      )}
      <Title
        label={name}
        labelProps={{
          variant: LabelVariants.INVERSE,
          bold: unreadMessageCount > 0,
        }}
      ></Title>

      <Icon
        icon={Icons.Leave}
        color="onPrimary"
        title="Leave Channel"
        hidden={!(isHovering || isTouch)}
        onClick={(e) => {
          e.stopPropagation();
          onLeave();
        }}
      />
    </ListItem>
  );
};

export { JoinedChannelListItemView };
