import type { ReactNode } from "react";

type BrowserFrameProps = {
  children: ReactNode;
};

export function BrowserFrame({ children }: BrowserFrameProps) {
  return (
    <div className="browser-frame">
      <div className="browser-frame__content">{children}</div>
    </div>
  );
}
