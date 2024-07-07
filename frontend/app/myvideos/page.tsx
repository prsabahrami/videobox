"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import VideoComponent from '../../components/VideoComponent'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Button } from '@headlessui/react'
  
interface Videos {
  urls: string[]
  info: PaginationResult<Attachment>
}

interface Video {
  url: string
  info: Attachment
}

interface ShareVideoRequest {
  video_id: number
  shared_with: string
  starts: string
  expires: string
}

const VideosAPI = {
    getVideos: async (page: number, size: number, accessToken: string) =>
        await (await fetch(`/api/files/pg?page=${page}&page_size=${size}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })).json(),
    deleteVideo: async (id: number, accessToken: string) =>
        await fetch(`/api/files/${id}`, { 
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
         }),
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

export default function Videos() {
    const [videos, setVideos] = useState<Videos | null>(null)
    const pageSize = 4
    const [page, setPage] = useState<number>(0)
    const [numPages, setPages] = useState<number>(1)
    const [processing, setProcessing] = useState<boolean>(false)
    const [open, setOpen] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
    const [sharedWithEmail, setSharedWithEmail] = useState('')
    const [startDateTime, setStartDateTime] = useState<string>('')
    const [expirationDateTime, setExpirationDateTime] = useState<string>('')
    const [shareLink, setShareLink] = useState('')
    const [successfulShare, setSuccessfulShare] = useState<boolean | null>(null)

    const auth = useAuth()

    useEffect(() => {
      if (auth.accessToken) {
        VideosAPI.getVideos(page, pageSize, auth.accessToken)
          .then(setVideos)
          .catch(console.error)
      }
    }, [auth.accessToken])

    const openShareModal = (video: Video) => {
      setSelectedVideo(video)
      setOpen(true)
    }
  
    const closeShareModal = () => {
      setOpen(false)
      setSelectedVideo(null)
      setSharedWithEmail('')
      setStartDateTime('')
      setExpirationDateTime('')
      setShareLink('')
      setSuccessfulShare(null)
    }
  
    const handleShare = async () => {
      if (!selectedVideo || !auth.accessToken || !sharedWithEmail) return
      
      try {

        const formattedStartDateTime = new Date(startDateTime).toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          fractionalSecondDigits: 3,
          hour12: false,
          timeZone: 'America/New_York'
        }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2') + ' -0400';

        const formattedExpirationDateTime = new Date(expirationDateTime).toLocaleString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          fractionalSecondDigits: 3,
          hour12: false,
          timeZone: 'America/New_York'
        }).replace(',', '').replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2') + ' -0400';

        console.log("formattedStartDateTime", formattedStartDateTime)
        console.log("formattedExpirationDateTime", formattedExpirationDateTime)

        const shareData: ShareVideoRequest = {
          video_id: selectedVideo.info.id,
          shared_with: sharedWithEmail,
          starts: formattedStartDateTime,
          expires: formattedExpirationDateTime
        }
  
        const response = await VideosAPI.shareVideo(auth.accessToken, shareData)
        setShareLink(`${window.location.origin}/view/${response.share_token}`)
        setSuccessfulShare(true)
      } catch (error) {
        console.error('Error sharing video:', error)
        setSuccessfulShare(false)
      }
      
    }

    
    useEffect(() => {
        if (auth.accessToken) {
            VideosAPI.getVideos(page, pageSize, auth.accessToken).then(setVideos)
        }
    }, [page, pageSize, auth.accessToken])

    return (
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">View your Videos</h2>
            <p className="mt-2 text-lg leading-8 text-white">
              Select any of your videos to show the share options.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {!videos && <p>You don't have any videos yet.</p>}
            {videos && videos.urls.map((url, index) => (
              <div key={videos.info.items[index].id}>
                <VideoComponent url={url} />
                <Button className="inline-flex items-center gap-2 rounded-md bg-gray-7000 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1
                 data-[focus]:outline-white" onClick={() => { 
                  let video = {
                    url: url,
                    info: videos.info.items[index]
                  };
                  openShareModal(video)
                 }}>Share</Button>
              </div>
            ))}
          </div>
        </div>
        
      
      <Dialog open={open} onClose={() => closeShareModal()} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Share Video
                    </DialogTitle>
                    <div className="mt-2">
                      <form onSubmit={(e) => { e.preventDefault(); handleShare(); }}>
                        <div className="mb-4">
                          <label htmlFor="sharedWithEmail" className="block text-sm font-medium text-gray-700">Share with Email</label>
                          <input
                            type="email"
                            id="sharedWithEmail"
                            value={sharedWithEmail}
                            onChange={(e) => setSharedWithEmail(e.target.value)}
                            className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">Start Date and Time</label>
                          <input
                            type="datetime-local"
                            id="startDateTime"
                            value={startDateTime}
                            onChange={(e) => {
                              setStartDateTime(e.target.value);
                            }}
                            className="text-black mt-1 block w-full rounded-md border-gray-3000 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="expirationDateTime" className="block text-sm font-medium text-gray-700">Expiration Date and Time</label>
                          <input
                            type="datetime-local"
                            id="expirationDateTime"
                            value={expirationDateTime}
                            onChange={(e) => {
                              setExpirationDateTime(e.target.value);
                            }}
                            className="text-black mt-1 block w-full rounded-md border-gray-30 shadow-sm focus:border-indigo-30 focus:ring focus:ring-indigo-20 focus:ring-opacity-50"
                          />
                          {expirationDateTime && startDateTime && expirationDateTime < startDateTime && <p className="mt-2 text-red-500">Expiration date and time must be greater than start date and time.</p>}
                        </div>
                        <div className="mt-4">
                          <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Share Video
                          </button>
                          {successfulShare === false && <p className="mt-2 text-red-500">Error sharing video. Please try again.</p>} 
                          {successfulShare === true &&
                            <p className="mt-2 text-green-500">Video shared successfully.</p> 
                          } 
                        </div>
                      </form>
                      {shareLink && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Share this link:</p>
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="text-black mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => closeShareModal()}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      </div>
    )
  }
  