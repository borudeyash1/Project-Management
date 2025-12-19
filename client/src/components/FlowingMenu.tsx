import React from 'react';
import { gsap } from 'gsap';

interface MenuItem {
  link: string;
  text: string;
  image: string;
  description?: string;
}

interface FlowingMenuProps {
  items?: MenuItem[];
}

function FlowingMenu({ items = [] }: FlowingMenuProps) {
  return (
    <div className="w-full h-full overflow-hidden rounded-3xl">
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItemComponent key={idx} {...item} isFirst={idx === 0} isLast={idx === items.length - 1} />
        ))}
      </nav>
    </div>
  );
}

function MenuItemComponent({ link, text, image, description, isFirst, isLast }: MenuItem & { isFirst?: boolean; isLast?: boolean }) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): string => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    setIsHovered(true);
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' });
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    setIsHovered(false);
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' });
  };

  const repeatedMarqueeContent = Array.from({ length: 4 }).map((_, idx) => (
    <React.Fragment key={idx}>
      <span className="text-[#060010] font-medium text-[3vh] leading-[1.2] px-[2vw]">
        {description || text}
      </span>
      <div
        className="w-[200px] h-[7vh] mx-[2vw] rounded-[20px] bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url(${image})` }}
      />
    </React.Fragment>
  ));

  const borderRadius = isFirst ? 'rounded-t-3xl' : isLast ? 'rounded-b-3xl' : '';

  return (
    <div 
      className={`flex-1 relative overflow-hidden text-center shadow-[0_-1px_0_0_rgba(255,255,255,0.1)] ${borderRadius}`} 
      style={{ backgroundColor: '#006397' }} 
      ref={itemRef}
    >
      <a
        className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-white text-[4vh] hover:text-[#060010] focus:text-white focus-visible:text-[#060010] transition-colors duration-300"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </a>
      <div
        className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none bg-white translate-y-[101%] ${borderRadius}`}
        ref={marqueeRef}
      >
        <div className="h-full w-[200%] flex" ref={marqueeInnerRef}>
          <div 
            className={`flex items-center relative h-full w-[200%] will-change-transform ${isHovered ? '' : 'animate-marquee'}`}
            style={isHovered ? { animationPlayState: 'paused' } : {}}
          >
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
