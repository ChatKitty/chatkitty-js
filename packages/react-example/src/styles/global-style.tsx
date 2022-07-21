import { createGlobalStyle } from 'styled-components';

import { Theme } from './theme';

const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  body {
    color: ${({ theme }) => theme.colors.importantText};
    font-family: ${({ theme }) => theme.fonts.app};
    font-size: ${({ theme }) => theme.fontSizes.regular};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    margin: ${({ theme }) => theme.space[0]};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
    margin: 0;
  }

  body,
  html,
  #root {
    height: 100%;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
  
  /* Works on Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.primary[0]} rgba(0, 0, 0, 0);
  }
  
  /* Works on Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 5px;
  }
  
  *::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0);
  }
  
  *::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.primary[0]};
    border-radius: 15px;
    border: 3px solid rgba(0, 0, 0, 0);
  }
`;

export default GlobalStyle;
