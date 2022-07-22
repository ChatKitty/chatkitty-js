// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Picker } from 'emoji-mart';
import React, { useContext } from 'react';
import { Dropdown } from '@chatkitty/react-ui';
import { Icons } from '@chatkitty/react-ui';
import { ThemeContext } from 'styled-components';

interface EmojiInputProps {
  value: string;
  onSelection(contentWithEmoji: string): void;
}

const EmojiInput: React.FC<EmojiInputProps> = ({
  value,
  onSelection,
}: EmojiInputProps) => {
  const theme = useContext(ThemeContext);

  return (
    <Dropdown
      icon={Icons.Emoji}
      right="0"
      bottom="0"
      title="Open emoji selector"
      render={(dismiss) => {
        const addEmoji = (emoji: { colons: never; native: never }) => {
          if ('native' in emoji) {
            if (onSelection.name === 'emojiClickListener') {
              onSelection(`${value}${emoji.colons}`);
            } else {
              onSelection(`${value}${emoji.native}`);
            }
            dismiss();
          }
        };
        return (
          <Picker
            emoji=""
            title=""
            native={true}
            onSelect={addEmoji}
            color={theme.colors.active}
          />
        );
      }}
    />
  );
};

export default EmojiInput;
