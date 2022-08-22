import React from 'react';
import Styled from 'styled-components/macro';

interface ImageMessageProps {
  /** Specify URL of the image to display */
  image: string;
}

const Image = Styled.img`
  border-radius: ${(p) => p.theme.radii.strong};
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
`;

export const ImageMessage: React.FC<ImageMessageProps> = ({
  image,
  ...rest
}: ImageMessageProps) => {
  return (
    <a href={image} target="_blank" rel="noreferrer">
      <Image alt={`media from ${image}`} src={image} {...rest} />
    </a>
  );
};
