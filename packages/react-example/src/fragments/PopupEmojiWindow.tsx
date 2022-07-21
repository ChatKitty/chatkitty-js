import { Message } from '@chatkitty/core';
import { ChatAppContext } from '../providers/ChatAppProvider';
import React, { useContext } from 'react';
import { StyledBox } from '@chatkitty/react-ui';

import EmojiInput from './EmojiInput';

interface popupProp {
  message: Message;
}

const PopupEmojiWindow: React.FC<popupProp> = ({ message }: popupProp) => {
  const { currentUser, removeReaction, reactToMessage } =
    useContext(ChatAppContext);

  const emojiClickListener = (emoji: string) => {
    let notIn = true;
    let notReacted = true;

    if (currentUser && message.reactions) {
      for (let i = 0; i < message.reactions.length; i++) {
        if (message.reactions[i].emoji.aliases[0] === emoji) {
          notIn = false;
          for (let j = 0; j < message.reactions[i].users.length; j++) {
            if (message.reactions[i].users[j].id === currentUser.id) {
              removeReaction(emoji, message);
              notReacted = false;
              break;
            }
          }
          if (notReacted) {
            reactToMessage(emoji, message);
            break;
          }
        }
      }
      if (notIn) {
        reactToMessage(emoji, message);
      }
    } else {
      reactToMessage(emoji, message);
    }
  };

  return (
    <StyledBox >
      <EmojiInput value="" onSelection={emojiClickListener} />
    </StyledBox>
  );
};

export default PopupEmojiWindow;
