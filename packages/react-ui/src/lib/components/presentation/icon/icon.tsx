import React, { SVGProps } from 'react';
import Styled from 'styled-components/macro';
import { color } from 'styled-system';

import { ReactComponent as Add } from '../../../svg/add.svg';
import { ReactComponent as Back } from '../../../svg/back.svg';
import { ReactComponent as Call } from '../../../svg/call.svg';
import { ReactComponent as Cross } from '../../../svg/cross.svg';
import { ReactComponent as Emoji } from '../../../svg/emoji.svg';
import { ReactComponent as Giphy } from '../../../svg/giphy.svg';
import { ReactComponent as Leave } from '../../../svg/leave.svg';
import { ReactComponent as People } from '../../../svg/people.svg';
import { ReactComponent as Presence } from '../../../svg/presence.svg';
import { ReactComponent as Search } from '../../../svg/search.svg';
import { ReactComponent as Send } from '../../../svg/send.svg';

interface IconWrapperProps {
  /** Show pointer cursor on hover */
  clickable?: boolean;
  hidden?: boolean;
}

export enum Icons {
  Add = 'Add',
  Back = 'Back',
  Call = 'Call',
  Cross = 'Cross',
  Emoji = 'Emoji',
  Giphy = 'Giphy',
  Leave = 'Leave',
  People = 'People',
  Presence = 'Presence',
  Search = 'Search',
  Send = 'Send',
}

interface IconProps extends IconWrapperProps, SVGProps<SVGSVGElement> {
  /** Icon file to display */
  icon: Icons;
  /** Human readable name */
  title?: string;
}

const IconComponents: {
  [key in Icons]: typeof Add;
} = {
  Add,
  Back,
  Call,
  Cross,
  Emoji,
  Giphy,
  Leave,
  People,
  Presence,
  Search,
  Send,
};

const Wrapper = Styled.object<IconWrapperProps>`
  cursor: ${(p) => p.clickable && 'pointer'};

  svg {
    // Block display is needed to remove whitespace underneath inline elements
    display: ${(p) => (p.hidden ? 'none' : 'block')};
    ${color}
  }
`;

// This component could be simplified further with dynamic SVG file imports:
// https://stackoverflow.com/questions/61339259/how-to-dynamically-import-svg-and-render-it-inline
// Unfortunately at the time of implementation there's an issue with create-react-app that prevents this solution:
// https://github.com/facebook/create-react-app/issues/5276
// ie. "ReactComponent" comes in as undefined when used inside of a dynamic import

export const Icon: React.FC<IconProps> = ({
                                            icon,
                                            clickable,
                                            hidden,
                                            color,
                                            ...rest
                                          }: IconProps) => {
  const IconFile = IconComponents[icon];

  return (
    <Wrapper {...{ color, clickable, hidden }}>
      <IconFile {...rest} />
    </Wrapper>
  );
};
