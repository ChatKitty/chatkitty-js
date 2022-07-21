import React, { HTMLAttributes } from 'react';
import Styled from 'styled-components/macro';

import { TitleWrapper } from '../../presentation';
import {FlexRow} from "../flex-row/flex-row";

interface ListItemProps extends HTMLAttributes<HTMLElement> {
  /** Show pointer cursor on hover */
  clickable?: boolean;
  // Using ${color} from styled-system conflicts with React types
  /** Specify a background color of the item */
  bg?: string | false;
}

const ListItemWrapper = Styled.div<ListItemProps>`
  background-color: ${(p) => p.bg};
  cursor: ${(p) => p.clickable && 'pointer'};

  ${TitleWrapper} {
    flex-grow: 1;
    margin-left: ${(p) => p.theme.space[6]};
  }
`;

export const ListItem: React.FC<ListItemProps> = ({
  children,
  ...rest
}: ListItemProps) => {
  return (
    <ListItemWrapper {...rest}>
      <FlexRow minHeight={2} px={6}>
        {children}
      </FlexRow>
    </ListItemWrapper>
  );
};
