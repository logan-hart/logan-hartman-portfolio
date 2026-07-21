import type { ReactNode } from "react";

type BrowserFrameProps = {
  urlLabel: string;
  children: ReactNode;
};

export function BrowserFrame({ urlLabel, children }: BrowserFrameProps) {
  return (
    <div className="browser-frame">
      <div className="browser-frame__bar" aria-hidden="true">
        <span className="browser-frame__dot" />
        <span className="browser-frame__dot" />
        <span className="browser-frame__dot" />
        <span className="browser-frame__url">{urlLabel}</span>
      </div>
      <div className="browser-frame__content">{children}</div>
    </div>
  );
}
