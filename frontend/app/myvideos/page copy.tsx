"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import VideoComponent from '../../components/VideoComponent'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

interface Video {
  id: number
  url: string
  title: string
}

const VideoAPI = {
  getVideos: async (accessToken: string): Promise<Video[]> => {
    return (await fetch('/api/files', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      method: 'GET'
    })).json()
  },
  shareVideo: async (accessToken: string, shareData: ShareVideoRequest): Promise<{ share_token: string }> => {
    return (await fetch('/api/files/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(shareData)
    })).json()
  }
}

interface ShareVideoRequest {
  video_id: number
  shared_with: number
  start_time: number | null
  expires_at: string | null
}

export default function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [sharedWithUserId, setSharedWithUserId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [expirationDate, setExpirationDate] = useState<Date | null>(null)
  const [shareLink, setShareLink] = useState('')
  const auth = useAuth()

  useEffect(() => {
    if (auth.accessToken) {
      VideoAPI.getVideos(auth.accessToken)
        .then(setVideos)
        .catch(console.error)
    }
  }, [auth.accessToken])

  const openShareModal = (video: Video) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  const closeShareModal = () => {
    setIsModalOpen(false)
    setSelectedVideo(null)
    setSharedWithUserId('')
    setStartTime('')
    setExpirationDate(null)
    setShareLink('')
  }

  const handleShare = async () => {
    if (!selectedVideo || !auth.accessToken) return

    try {
      const shareData: ShareVideoRequest = {
        video_id: selectedVideo.id,
        shared_with: parseInt(sharedWithUserId),
        start_time: startTime ? parseFloat(startTime) : null,
        expires_at: expirationDate ? expirationDate.toISOString() : null
      }

      const response = await VideoAPI.shareVideo(auth.accessToken, shareData)
      setShareLink(`${window.location.origin}/shared/${response.share_token}`)
    } catch (error) {
      console.error('Error sharing video:', error)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">My Videos</h1>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {videos.map(video => (
          <div key={video.id} className="group">
            <VideoComponent url={video.url} />
            <h3 className="mt-4 text-sm text-gray-700">{video.title}</h3>
            <button 
              onClick={() => openShareModal(video)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Share
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeShareModal}
        contentLabel="Share Video Modal"
      >
        <h2 className="text-2xl mb-4">Share Video</h2>
        <input
          type="number"
          value={sharedWithUserId}
          onChange={(e) => setSharedWithUserId(e.target.value)}
          placeholder="User ID to share with"
          className="block w-full mb-2 p-2 border rounded"
        />
        <input
          type="number"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Start time in seconds"
          step="0.1"
          className="block w-full mb-2 p-2 border rounded"
        />
        <DatePicker
          selected={expirationDate}
          onChange={(date: Date | null) => setExpirationDate(date)}
          placeholderText="Select expiration date (optional)"
          className="block w-full mb-2 p-2 border rounded"
        />
        <button 
          onClick={handleShare}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Share
        </button>
        {shareLink && (
          <div>
            <p>Share this link:</p>
            <input type="text" value={shareLink} readOnly />
          </div>
        )}
      </Modal>
    </div>
  )
}
