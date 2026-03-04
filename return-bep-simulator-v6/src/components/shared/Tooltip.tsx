import { useState, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  title: string;
  body: string;
  analogy?: string;
  children: ReactNode;
}

export default function Tooltip({ title, body, analogy, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0, flip: false });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    const flip = spaceAbove < 160;
    const top = flip ? rect.bottom + 8 : rect.top - 8;
    setPos({ left: Math.max(4, rect.left), top, flip });
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <>
      <span ref={triggerRef} className="has-tip" onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </span>
      {visible && createPortal(
        <div
          className={`tip-box show${pos.flip ? ' tip-flip' : ''}`}
          style={{ left: pos.left, top: pos.top }}
        >
          <span className="tip-title">{title}</span>
          <span dangerouslySetInnerHTML={{ __html: body }} />
          {analogy && <span className="tip-analogy">{analogy}</span>}
        </div>,
        document.body,
      )}
    </>
  );
}
