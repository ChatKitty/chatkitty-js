import React, { HTMLAttributes } from 'react';
import Styled from 'styled-components/macro';
import {Heading, HeadingProps} from "../heading/heading";
import {Label, LabelProps} from "../label/label";

interface TitleWrapperProps extends HTMLAttributes<HTMLElement> {
  /** Should the Heading and Label be capitalized */
  capitalize?: boolean;
}

interface TitleProps extends TitleWrapperProps {
  /** Text passed to the Heading */
  heading?: string;
  /** Options passed to the Heading */
  headingProps?: HeadingProps;
  /** Text passsed to the Label */
  label?: string;
  /** Options passed to the Label */
  labelProps?: LabelProps;
}

export const TitleWrapper = Styled.div<TitleWrapperProps>`
  * {
    text-transform: ${(p) => p.capitalize && 'capitalize'}
  }

  ${Heading} {
    margin-bottom: 5px;
  }
`;

export const Title: React.FC<TitleProps> = ({
  heading,
  headingProps,
  label,
  labelProps,
  ...rest
}: TitleProps) => {
  return (
    <TitleWrapper {...rest}>
      {heading && <Heading {...headingProps}>{heading}</Heading>}
      {label && <Label {...labelProps}>{label}</Label>}
    </TitleWrapper>
  );
};
