import React from 'react';
import { ThemeProvider } from 'styled-components';

import ChatAppRouter from './navigation/ChatAppRouter';
import ChatAppContextProvider from './providers/ChatAppProvider';
import { appTheme } from './styles';
import GlobalStyle from './styles/global-style';
import Normalize from './styles/normalize';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <ChatAppContextProvider>
        <Normalize />
        <GlobalStyle />
        <ChatAppRouter />
      </ChatAppContextProvider>
    </ThemeProvider>
  );
};

export default App;
