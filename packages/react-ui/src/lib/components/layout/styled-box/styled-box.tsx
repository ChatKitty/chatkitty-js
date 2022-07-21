import Styled from 'styled-components/macro';
import {
  background,
  BackgroundProps,
  border,
  BorderProps,
  color,
  ColorProps,
  layout,
  LayoutProps,
  position,
  PositionProps,
  space,
  SpaceProps,
} from 'styled-system';

export const StyledBox = Styled.div<
  SpaceProps &
    LayoutProps &
    PositionProps &
    ColorProps &
    BackgroundProps &
    BorderProps
>`
  ${space}
  ${layout}
  ${position}
  ${color}
  ${background}
  ${border}
`;
