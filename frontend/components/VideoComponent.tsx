import React, { useEffect, useRef } from 'react';

export default function VideoComponent({ url }: { url: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.setAttribute('controlsList', 'nodownload');
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={url}
      frameBorder="0"
      allowFullScreen
      allow="fullscreen"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
