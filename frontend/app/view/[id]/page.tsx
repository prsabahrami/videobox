"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import VideoComponent from '../../../components/VideoComponent'

const VideoAPI = {
  getVideo: async (id: string, accessToken: string): Promise<string> => {
    return (await fetch(`/api/files/view?id=${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      method: 'GET'
    })).json()
  }
}

export default function VideoPage({ params }: { params: { id: string } }) {
  const [videoURL, setVideoURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push('/login');
    } else if (auth.accessToken) {
      setIsLoading(true);
      VideoAPI.getVideo(params.id, auth.accessToken)
        .then(url => {
          console.log('Received video URL:', url);
          setVideoURL(url);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching video:', error);
          setIsLoading(false);
        });
    }
  }, [auth.isAuthenticated, auth.accessToken, params.id, router]);

  if (!auth.isAuthenticated) {
    return <div>Please log in to view this video.</div>;
  }

  if (isLoading) {
    return <div>Loading video...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <p className="mt-2 text-lg leading-8 text-white">
          Watch your selected video below.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
        <VideoComponent url={videoURL} />
      </div>
    </div>
  )
}
