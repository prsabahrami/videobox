import React, { useEffect, useRef } from 'react';

interface VideoComponentProps {
  url: string;
  startTime?: number;
}

const VideoComponent: React.FC<VideoComponentProps> = ({ url, startTime }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && startTime) {
      videoRef.current.currentTime = startTime;
    }
  }, [url, startTime]);

  return (
    <video 
      ref={videoRef} 
      controls 
      width="100%" 
      onLoadedMetadata={() => console.log('Video metadata loaded')}
      controlsList='nodownload'
      onContextMenu={e => e.preventDefault()}
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoComponent;
