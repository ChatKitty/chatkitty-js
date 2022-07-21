import emojiRegex from 'emoji-regex';
import React from 'react';
import Linkify from 'react-linkify';
import Styled, { css } from 'styled-components/macro';

export enum TextMessageSizes {
  BIG = 'BIG',
}

interface TextWrapperProps {
  /** Specify a Message size */
  size?: TextMessageSizes | false;
}

interface TextMessageProps extends TextWrapperProps {
  /** Display a text copy */
  text: string;
}

const BigMessage = css`
  font-size: ${(p) => p.theme.fontSizes.large};
`;

const Wrapper = Styled.div<TextWrapperProps>`
  background: ${(p) => p.theme.backgrounds.message};
  border-radius: ${(p) => p.theme.radii.strong};
  border-top-left-radius: ${(p) => p.theme.radii.square};
  box-shadow: ${(p) => p.theme.shadows[0]};
  color: ${(p) => p.theme.colors.messageText};
  line-height: 1.5;
  padding: ${(p) => p.theme.space[4]};
  text-align: left;
  white-space: pre-wrap;
  width: fit-content;
  word-break: break-word;

  ${(props) => props.size === TextMessageSizes.BIG && BigMessage}
`;

// Check if there are only 3 or less emoji in the message
const isEmphasized = (msg: string): boolean => {
  const trimmed = msg.trim();
  if (trimmed.length <= 15) {
    const emoji = msg.match(emojiRegex());
    return emoji ? emoji.length <= 3 && emoji.join('') === trimmed : false;
  } else {
    return false;
  }
};

export const TextMessage: React.FC<TextMessageProps> = ({
  text,
  size,
  ...rest
}: TextMessageProps) => {
  return (
    <Linkify>
      <Wrapper
        size={size || (isEmphasized(text) ? TextMessageSizes.BIG : undefined)}
        {...rest}
      >
        {text}
      </Wrapper>
    </Linkify>
  );
};
