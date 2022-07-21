import { Message, ReactionSummary } from '@chatkitty/core';
import { ChatAppContext } from '../providers/ChatAppProvider';
import React, { useContext } from 'react';
import { StyledBox } from '@chatkitty/react-ui';

interface EmojiProps {
  message: Message;
}

const Reactions: React.FC<EmojiProps> = ({ message }: EmojiProps) => {
  const { currentUser, removeReaction, reactToMessage } =
    useContext(ChatAppContext);

  const emojiClickListener = (reaction: ReactionSummary) => {
    if (currentUser && message.reactions) {
      const reactionFound = message.reactions.find(
        (reactedReaction) =>
          reactedReaction.emoji.character === reaction.emoji.character
      );
      if (reactionFound) {
        const userFound = reactionFound.users.find(
          (user) => user.id === currentUser.id
        );

        if (userFound) {
          removeReaction(reaction.emoji.aliases[0], message);
        } else {
          reactToMessage(reaction.emoji.aliases[0], message);
        }
      }
    }
  };

  return message.reactions ? (
    <StyledBox
      style={{
        marginTop: '1px',
        width: '1px',
        whiteSpace: 'nowrap',
      }}
    >
      {message.reactions.map((reaction) => (
        <div
          key={reaction.emoji.character}
          style={{
            cursor: 'pointer',
            marginRight: '2px',
            display: 'inline-block',
            background: 'grey',
            borderRadius: '25%',
            width: '40px',
            height: '25px',
          }}
          onClick={() => emojiClickListener(reaction)}
        >
          <p
            style={{
              display: 'inline-block',
              verticalAlign: '-8px',
              fontSize: '18px',
            }}
          >
            {reaction.emoji.character}
          </p>
          <p
            style={{
              display: 'inline-block',
              paddingLeft: '2px',
              color: 'white',
              verticalAlign: '-5px',
            }}
          >
            {reaction.count}
          </p>
        </div>
      ))}
    </StyledBox>
  ) : (
    <></>
  );
};

export default Reactions;
