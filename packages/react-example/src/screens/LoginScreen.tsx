import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  ButtonVariants,
  FlexColumn,
  FlexRow,
  Heading,
  HeadingSizes,
  HeadingVariants,
  Input,
  InputVariants,
  Label,
  LabelVariants,
  StyledBox,
} from '@chatkitty/react-ui';
import { ThemeContext } from 'styled-components';

import image from '../assets/images/background.png';
import logo from '../assets/images/banner-logo.svg';
import screenshot from '../assets/images/chat-app-screenshot.png';
import { ChatAppContext } from '../providers/ChatAppProvider';

const LoginScreen: React.FC = () => {
  const theme = useContext(ThemeContext);

  const { login, loading } = useContext(ChatAppContext);

  const [username, setUsername] = useState('');

  useEffect(() => {
    login(username);
  }, []);

  return (
    <FlexColumn
      py={[0, '10vh']}
      px={[0, '15%']}
      height="100%"
      backgroundImage={`url(${image})`}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <FlexRow alignItems="stretch" flexGrow={1}>
        <FlexColumn
          justifyContent="flex-end"
          display={['none', 'none', 'flex']}
          background={theme.backgrounds.login}
          borderTopLeftRadius="strong"
          borderBottomLeftRadius="strong"
          maxWidth="360px"
        >
          <StyledBox px="8" py="2">
            <Heading
              size={HeadingSizes.HUGE}
              variant={HeadingVariants.INVERSE}
              textAlign="center"
            >
              {theme.custom.tagLine}
            </Heading>
          </StyledBox>
          <FlexRow justifyContent="center">
            <img alt="ChatKitty chat app screenshot" src={screenshot} />
          </FlexRow>
        </FlexColumn>

        <FlexRow
          bg="backgrounds.content"
          flexGrow={1}
          justifyContent="center"
          borderRadius={['square', 'strong', 'strong']}
          borderTopLeftRadius={['square', 'strong', 'square']}
          borderBottomLeftRadius={['square', 'strong', 'square']}
        >
          <FlexColumn>
            <StyledBox
              height="50px"
              backgroundImage={`url(${logo})`}
              backgroundRepeat="no-repeat"
              backgroundPosition="center"
            />
            <StyledBox paddingTop="6" paddingBottom="1">
              <Label variant={LabelVariants.DARK}>Username</Label>
            </StyledBox>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant={InputVariants.DARK}
            />

            <StyledBox marginTop="8">
              <Button
                variant={ButtonVariants.PRIMARY}
                onClick={() => login(username)}
              >
                {loading ? 'Loading' : 'Log In'}
              </Button>
            </StyledBox>
          </FlexColumn>
        </FlexRow>
      </FlexRow>
    </FlexColumn>
  );
};

export default LoginScreen;
