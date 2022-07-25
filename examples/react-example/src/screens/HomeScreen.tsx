import MemberList from '../fragments/MemberList';
import React from 'react';
import { FlexRow } from '@chatkitty/react-ui';

import Chat from '../fragments/Chat';
import JoinChannelDialog from '../fragments/JoinChannelDialog';
import Menu from '../fragments/Menu';

const HomeScreen: React.FC = () => {
  return (
    <FlexRow height="100%">
      <Menu />
      <Chat />
      <JoinChannelDialog />
      <MemberList />
    </FlexRow>
  );
};

export default HomeScreen;
