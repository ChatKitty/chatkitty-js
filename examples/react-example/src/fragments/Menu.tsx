import React, { useContext } from 'react';
import {
  Drawer,
  FlexColumn,
  FlexRow,
  Heading,
  HeadingVariants,
  Icon,
  Icons,
  StyledBox,
} from '@chatkitty/react-ui';
import { useMediaQuery } from '@chatkitty/react-ui';
import { ThemeContext } from 'styled-components';

import { ReactComponent as Logo } from '../assets/images/logo.svg';
import { ChatAppContext } from '../providers/ChatAppProvider';

import CurrentUserStatus from './CurrentUserStatus';
import MyChannels from './MyChannels';

const Menu: React.FC = () => {
  const theme = useContext(ThemeContext);
  const isMedium = useMediaQuery(theme.mediaQueries.medium);

  const { layout, hideMenu } = useContext(ChatAppContext);

  return (
    <Drawer
      open={layout.menu || isMedium}
      background={theme.backgrounds.primary}
    >
      <StyledBox
        position="absolute"
        right="0"
        padding="6"
        display={['block', 'none']}
      >
        <Icon
          onClick={() => hideMenu()}
          icon={Icons.Cross}
          title="Close channels"
          color={theme.colors.onPrimary}
          clickable
        />
      </StyledBox>

      <StyledBox padding={6}>
        <FlexRow>
          <Logo title="ChatKitty" style={{ height: 61, width: 61 }} />
          <StyledBox paddingLeft={4}>
            <FlexColumn minHeight={1}>
              <Heading variant={HeadingVariants.INVERSE}>
                {theme.custom.companyName}
              </Heading>
              <CurrentUserStatus />
            </FlexColumn>
          </StyledBox>
        </FlexRow>
      </StyledBox>

      <MyChannels />
    </Drawer>
  );
};

export default Menu;
