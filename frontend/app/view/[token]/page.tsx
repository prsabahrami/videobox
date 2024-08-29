"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import MuxPlayer from '@mux/mux-player-react'

const VideoAPI = {
  getVideo: async (token: string, accessToken: string): Promise<VideoWithSignedUrl> => {
    const response = await fetch(`/api/view/${token}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
    return response.json();
  }
}
  
export default function VideoPage({ params }: { params: { token: string } }) {
  const [video, setVideo] = useState<VideoWithSignedUrl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const router = useRouter();

  console.log("params.token", params.token);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push('/login');
    } else if (auth.accessToken) {
      console.log("auth.accessToken", auth.accessToken);
      setIsLoading(true);
      VideoAPI.getVideo(params.token, auth.accessToken)
        .then(videoData => {
          setVideo(videoData);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching video:', err);
          setError('Failed to load video. Please try again.');
          setIsLoading(false);
        });
    }
  }, [auth.isAuthenticated, auth.accessToken, params.token, router]);

  if (!auth.isAuthenticated) {
    return null; // Router will redirect, no need to render anything
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Video Not Found</h2>
          <p className="text-gray-700">The requested video could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{video.fileName}</h1>
            <div className="mb-6">
              <p className="text-sm text-gray-500">Course: <span className="font-medium text-gray-700">{video.courseName}</span></p>
            </div>
            <div className="aspect-w-16 aspect-h-9 mb-8">
              <MuxPlayer
                playbackId={video.playbackId}
                metadata={{
                  video_id: video.id,
                  viewer_user_id: auth.session?.userId,
                }}
                streamType="on-demand"
                primaryColor="#000000"
                secondaryColor="#FFFFFF"
                forwardSeekOffset={10}
                backwardSeekOffset={10}
                thumbnailTime={0}
                defaultHiddenCaptions={true}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Video Details</h2>
                <p className="text-sm text-gray-600">Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
