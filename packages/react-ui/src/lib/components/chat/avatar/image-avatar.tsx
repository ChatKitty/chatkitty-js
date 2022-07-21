import React from 'react';
import Styled, { css } from 'styled-components/macro';
import { color } from 'styled-system';

export enum ImageAvatarVariants {
  ROUND = 'round',
}

interface ImageAvatarProps {
  image: string;
}

interface ImageProps {
  /** Specify an Avatar variant */
  variant?: ImageAvatarVariants | false;
}

const RoundImageAvatar = css`
  border-radius: ${(p) => p.theme.radii.round};
`;

export const Image = Styled.img<ImageProps>`
  align-items: center;
  background: ${(p) => p.theme.colors.avatars[0]};
  border-radius: ${(p) => p.theme.radii.medium};
  color: ${(p) => p.theme.colors.onPrimary};
  display: flex;
  flex-shrink: 0;
  font-size: ${(p) => p.theme.fontSizes.card};
  height: 36px;
  justify-content: center;
  line-height: ${(p) => p.theme.fontSizes.card};
  text-transform: uppercase;
  width: 36px;

  ${color}
  ${(props) => props.variant === ImageAvatarVariants.ROUND && RoundImageAvatar}
`;

export const ImageAvatar: React.FC<ImageAvatarProps> = ({
  image,
  ...rest
}: ImageAvatarProps) => {
  return <Image alt={`media from ${image}`} src={image} {...rest} />;
};
