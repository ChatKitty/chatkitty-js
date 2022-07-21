import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';

import { getUniqueColor } from '../../../utilities';
import { FlexColumn, FlexRow } from '../../layout';
import { Button, Label, LabelVariants } from '../../presentation';
import { Avatar } from '../avatar/avatar';

interface JoinableChannelListItemViewProps {
  name: string;
  description: string;
  onClick: () => void;
}

/**
 * Show a single Joinable channel
 */
const JoinableChannelListItemView: React.FC<JoinableChannelListItemViewProps> =
  ({ name, description, onClick }: JoinableChannelListItemViewProps) => {
    const theme = useContext(ThemeContext);
    const color = getUniqueColor(
      name,
      theme.colors.avatars as unknown as string[]
    );
    return (
      <Button hoverBg={theme.backgrounds.contentHover}>
        <FlexRow onClick={onClick} px="1" py="6" borderY="medium">
          <Avatar bg={color}>#</Avatar>
          <FlexColumn marginLeft="5" minHeight="1">
            <Label variant={LabelVariants.DARK}>{name}</Label>
            <Label>{description}</Label>
          </FlexColumn>
        </FlexRow>
      </Button>
    );
  };

export { JoinableChannelListItemView };
