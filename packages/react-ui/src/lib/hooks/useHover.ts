import React, { useState } from 'react';

export interface UseHoverOptions {
  mouseEnterDelayMS?: number;
  mouseLeaveDelayMS?: number;
}

export type HoverProps = Pick<
  React.HTMLAttributes<HTMLElement>,
  'onMouseEnter' | 'onMouseLeave'
>;

export function useHover({
  mouseEnterDelayMS = 200,
  mouseLeaveDelayMS = 0,
}: UseHoverOptions = {}): [boolean, HoverProps] {
  const [isHovering, setIsHovering] = useState(false);
  let mouseEnterTimer: ReturnType<typeof setTimeout>;
  let mouseOutTimer: ReturnType<typeof setTimeout>;
  return [
    isHovering,
    {
      onMouseEnter: () => {
        clearTimeout(mouseOutTimer);
        mouseEnterTimer = setTimeout(
          () => setIsHovering(true),
          mouseEnterDelayMS
        );
      },
      onMouseLeave: () => {
        clearTimeout(mouseEnterTimer);
        mouseOutTimer = setTimeout(
          () => setIsHovering(false),
          mouseLeaveDelayMS
        );
      },
    },
  ];
}
