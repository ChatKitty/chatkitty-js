import React, { useContext } from 'react';

import { ChatAppContext } from '../providers/ChatAppProvider';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import { Wrapper } from '../styles';

const ChatAppRouter: React.FC = () => {
  const { currentUser } = useContext(ChatAppContext);

  return <Wrapper>{currentUser ? <HomeScreen /> : <LoginScreen />}</Wrapper>;
};

export default ChatAppRouter;
