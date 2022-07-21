import Styled from 'styled-components/macro';
import { flexbox, FlexboxProps, layout, LayoutProps } from 'styled-system';
import {StyledBox} from "../styled-box/styled-box";

export const FlexRow = Styled(StyledBox)<FlexboxProps & LayoutProps>`
  display: flex;
  align-items: center;

  ${flexbox}
  ${layout}
`;
