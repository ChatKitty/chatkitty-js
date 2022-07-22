// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import data from '@emoji-mart/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init, SearchIndex } from 'emoji-mart';
import React, { useContext, useRef } from 'react';
import { FlexColumn, ScrollView, StyledBox } from '@chatkitty/react-ui';
import { Button, Label, LabelSizes, LabelVariants } from '@chatkitty/react-ui';
import { useClickOutside } from '@chatkitty/react-ui';
import { useHover } from '@chatkitty/react-ui';
import { useMediaQuery } from '@chatkitty/react-ui';
import { ThemeContext } from 'styled-components';

init({ data });

type EmojiSuggestionProps = {
  value: string;
  onSelection: (contentWithEmoji: string) => void;
};

const getEmojiSearchTerm = (content: string) => {
  let search = '';
  const colons = content.match(/:([a-z_]+)(:)?/);

  if (colons) {
    if (colons[2] !== undefined) {
      // closing colon is present
      const results: any = SearchIndex.search(colons[1]);

      if (results && results[0] && 'native' in results[0]) {
        content.replace(colons[0], results[0].native);
      }

      search = '';
    } else if (colons[1].length > 1) {
      // colons aren't closed, use the search
      search = colons[1];
    } else if (colons[1]) {
      search = '';
    }
  }

  return search;
};

const EmojiSuggestion: React.FC<EmojiSuggestionProps> = ({
  value,
  onSelection,
}: EmojiSuggestionProps) => {
  const suggestions = useRef<HTMLDivElement>(null);
  const theme = useContext(ThemeContext);
  const isMedium = useMediaQuery(theme.mediaQueries.medium);

  const replaceEmoji = (search: string, emoji: { native: string }) => {
    if ('native' in emoji) {
      const txt = value.replace(`:${search}`, emoji.native);
      onSelection(txt);
    }
  };

  let displayed = false;

  const emojiSearchTerm = getEmojiSearchTerm(value);
  const emojis: any = SearchIndex.search(emojiSearchTerm);

  displayed = !!(emojis && emojis.length > 0);

  useClickOutside([suggestions], () => {
    displayed = false;
  });

  const EmojiResult = ({ emoji }: { emoji: any }) => {
    const [isHovering, hoverProps] = useHover({ mouseEnterDelayMS: 0 });

    return (
      <StyledBox {...hoverProps}>
        <Button hoverBg={theme.colors.active} borderRadius="light">
          <StyledBox
            key={emoji.id}
            onClick={() => replaceEmoji(emojiSearchTerm, emoji)}
            px="2"
            py={[1, 2]}
          >
            {'native' in emoji && emoji.native}
            <Label
              size={LabelSizes.SMALL}
              variant={isHovering ? LabelVariants.INVERSE : LabelVariants.DARK}
            >
              {emoji.colons}
            </Label>
          </StyledBox>
        </Button>
      </StyledBox>
    );
  };

  return (
    <StyledBox position="relative">
      {displayed && (
        <StyledBox
          ref={suggestions}
          bg="backgrounds.panel"
          position="absolute"
          bottom="0"
          border="light"
          borderRadius="light"
        >
          <ScrollView maxHeight="4">
            <StyledBox padding="1" borderBottom="light">
              Suggestions for <b>{emojiSearchTerm}</b>
            </StyledBox>
            <FlexColumn
              padding="1"
              justifyContent="flex-start"
              flexDirection={['row', 'column']}
              flexWrap={['wrap', 'nowrap']}
            >
              {emojis &&
                emojis.slice(0, isMedium ? 35 : 7).map((emoji: any) => (
                  // eslint-disable-next-line react/prop-types
                  <EmojiResult key={emoji.name} emoji={emoji}></EmojiResult>
                ))}
            </FlexColumn>
          </ScrollView>
        </StyledBox>
      )}
    </StyledBox>
  );
};

export default EmojiSuggestion;
