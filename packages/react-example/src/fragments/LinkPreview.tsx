import { MessageLink } from '@chatkitty/core';
import React from 'react';
import { StyledBox } from '@chatkitty/react-ui';

interface LinkPreviewProp {
  links: MessageLink[];
}

const LinkPreview: React.FC<LinkPreviewProp> = ({ links }: LinkPreviewProp) => {
  return (
    <div style={{ marginTop: '5px' }}>
      {links.map((link) => (
        <StyledBox
          key={link.source}
          style={{ width: '400px', borderLeft: '5px solid grey' }}
        >
          <div style={{ marginLeft: '10px' }}>
            <div>
              <a href={link.source}>
                <p style={{ color: 'blue' }}>
                  {link.preview ? link.preview.title : link.source}
                </p>
              </a>
            </div>
            {link.preview && (
              <div>
                <StyledBox>{link.preview.description}</StyledBox>
                <img
                  src={link.preview.image.source}
                  style={{ width: '400px', borderRadius: '5%' }}
                />
              </div>
            )}
          </div>
        </StyledBox>
      ))}
    </div>
  );
};

export default LinkPreview;
