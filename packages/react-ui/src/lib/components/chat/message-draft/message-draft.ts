import { IGif } from '@giphy/js-types';
import invariant from 'invariant';

export enum MessageDraftType {
  Text = 'text',
  Giphy = 'giphy',
}

export interface BaseMessageDraft {
  type: MessageDraftType;
}

export interface TextMessageDraft extends BaseMessageDraft {
  type: MessageDraftType.Text;
  text: string;
}

export interface GiphyMessageDraft extends BaseMessageDraft {
  type: MessageDraftType.Giphy;
  query: string;
  gif: IGif;
}

export type MessageDraft = TextMessageDraft | GiphyMessageDraft;

export function isTextMessageDraft(
  draft: MessageDraft
): draft is TextMessageDraft {
  return draft.type === MessageDraftType.Text;
}

export function isGiphyMessageDraft(
  draft: MessageDraft
): draft is GiphyMessageDraft {
  return draft.type === MessageDraftType.Giphy;
}

export const isDraftModified = (draft: MessageDraft): boolean => {
  switch (draft.type) {
    case MessageDraftType.Text:
      return draft.text !== '';
    default:
      invariant(
        false,
        `Cannot determine if message of type "${draft.type}" has been modified.`
      );
  }
};

export const newTextMessageDraft = (
  draft: TextMessageDraft,
  text: string
): TextMessageDraft => {
  if (draft.text === text) {
    return draft;
  }

  return {
    type: MessageDraftType.Text,
    text,
  };
};
