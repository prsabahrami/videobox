"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import MuxPlayer from '@mux/mux-player-react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Button } from '@headlessui/react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { FaShare, FaTrash, FaClock, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';

const VideosAPI = {
    getVideos: async (accessToken: string): Promise<VideoWithSignedUrl[]> => {
        const response = await fetch(`/api/videos`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return await response.json();
    },
    deleteVideo: async (id: number, accessToken: string) =>
        await fetch(`/api/delete/${id}`, { 
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
         }),
    shareVideo: async (accessToken: string, shareData: ShareVideoRequest): Promise<{ share_token: string }> => {
        return (await fetch('/api/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(shareData)
        })).json()
    }
}

interface VideoFilters {
    startDate?: Date;
    endDate?: Date;
    courseName?: string;
}

export default function Videos() {
    const [videos, setVideos] = useState<VideoWithSignedUrl[]>([])
    const [filteredVideos, setFilteredVideos] = useState<VideoWithSignedUrl[]>([])
    const [pageSize, setPageSize] = useState<number>(8)
    const [page, setPage] = useState<number>(1)
    const [filters, setFilters] = useState<VideoFilters>({})
    const [processing, setProcessing] = useState<boolean>(false)
    const [open, setOpen] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState<VideoWithSignedUrl | null>(null)
    const [sharedWithEmail, setSharedWithEmail] = useState('')
    const [startDateTime, setStartDateTime] = useState<Date | null>(null)
    const [expirationDateTime, setExpirationDateTime] = useState<Date | null>(null)
    const [shareLink, setShareLink] = useState('')
    const [successfulShare, setSuccessfulShare] = useState<boolean | null>(null)
    const [courseNames, setCourseNames] = useState<string[]>([])

    const auth = useAuth()

    useEffect(() => {
      if (auth.accessToken) {
        fetchVideos();
      }
    }, [auth.accessToken])

    useEffect(() => {
      applyFilters();
    }, [videos, filters, pageSize])

    const fetchVideos = async () => {
      try {
        setProcessing(true);
        const data = await VideosAPI.getVideos(auth.accessToken!);
        setVideos(data);
        // Extract unique course names from the videos data
        const uniqueCourseNames = Array.from(new Set(data.map(video => video.courseName)));
        setCourseNames(uniqueCourseNames);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setProcessing(false);
      }
    }

    const applyFilters = () => {
      let filtered = [...videos];
      if (filters.startDate) {
        filtered = filtered.filter(video => new Date(video.createdAt) >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(video => new Date(video.createdAt) <= filters.endDate!);
      }
      if (filters.courseName) {
        filtered = filtered.filter(video => video.courseName === filters.courseName);
      }
      setFilteredVideos(filtered);
      setPage(1);
    }

    const openShareModal = (video: VideoWithSignedUrl) => {
      setSelectedVideo(video)
      setOpen(true)
    }
  
    const closeShareModal = () => {
      setOpen(false)
      setSelectedVideo(null)
      setSharedWithEmail('')
      setStartDateTime(null)
      setExpirationDateTime(null)
      setShareLink('')
      setSuccessfulShare(null)
    }
  
    const handleShare = async () => {
      if (!selectedVideo || !auth.accessToken || !sharedWithEmail) return
      
      try {
        const formatDateTime = (date: Date | null) => {
          if (!date) return null;
          return date.toISOString();
        };

        const shareData: ShareVideoRequest = {
          videoId: selectedVideo.id,
          sharedWith: sharedWithEmail,
          courseName: selectedVideo.courseName,
          starts: formatDateTime(startDateTime),
          expires: formatDateTime(expirationDateTime)
        }
  
        const response = await VideosAPI.shareVideo(auth.accessToken, shareData)
        setShareLink(`${window.location.origin}/view/${response.share_token}`)
        setSuccessfulShare(true)
      } catch (error) {
        console.error('Error sharing video:', error)
        setSuccessfulShare(false)
      }
    }

    const handleDelete = async (id: number) => {
      if (confirm('Are you sure you want to delete this video?')) {
        try {
          await VideosAPI.deleteVideo(id, auth.accessToken!);
          fetchVideos();
        } catch (error) {
          console.error('Error deleting video:', error);
        }
      }
    }

    const handleFilterChange = (filterName: keyof VideoFilters, value: string | Date | null) => {
      setFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    }

    const paginatedVideos = filteredVideos.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredVideos.length / pageSize);

    const VideoCard = ({ video, onShare, onDelete }: { video: VideoWithSignedUrl; onShare: (video: VideoWithSignedUrl) => void; onDelete: (id: number) => void }) => (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <MuxPlayer
          playbackId={video.playbackId}
          metadata={{
            video_id: video.id,
            video_title: video.fileName,
            viewer_user_id: auth.session?.userId,
          }}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{video.fileName}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <FaGraduationCap className="mr-2" />
            <span>Course: {video.courseName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <FaCalendarAlt className="mr-2" />
            <span>Created: {new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <FaClock className="mr-2" />
            <span>Duration: {video.duration ? formatDuration(video.duration) : 'Loading...'}</span>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => onShare(video)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <FaShare className="mr-2" />
              Share
            </button>
            <button
              onClick={() => onDelete(video.id)}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );

    // Helper function to format duration
    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">View your Videos</h2>
            <p className="mt-2 text-lg leading-8 text-white">
              Manage and share your uploaded videos.
            </p>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4 text-black">
            <DatePicker
              selected={filters.startDate}
              onChange={(date: Date | null) => handleFilterChange('startDate', date)}
              placeholderText="Filter by Start Date"
              className="p-2 rounded"
            />
            <DatePicker
              selected={filters.endDate}
              onChange={(date: Date | null) => handleFilterChange('endDate', date)}
              placeholderText="Filter by End Date"
              className="p-2 rounded"
            />
            <select
              value={filters.courseName || ''}
              onChange={(e) => handleFilterChange('courseName', e.target.value)}
              className="p-2 rounded"
            >
              <option value="">All Courses</option>
              {courseNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="p-2 rounded"
            >
              <option value={4}>4 per page</option>
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
              <option value={16}>16 per page</option>
            </select>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {processing && <p>Loading videos...</p>}
            {!processing && paginatedVideos.length === 0 && <p>No videos match your criteria.</p>}
            {!processing && paginatedVideos.map((item: VideoWithSignedUrl) => (
              <VideoCard
                key={item.id}
                video={item}
                onShare={openShareModal}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="mx-2 px-4 py-2 bg-gray-200 rounded"
            >
              Previous
            </Button>
            <span className="mx-2 py-2">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="mx-2 px-4 py-2 bg-gray-200 rounded"
            >
              Next
            </Button>
          </div>
        </div>
        
      
      <Dialog open={open} onClose={() => closeShareModal()} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-visible rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
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
                          <DatePicker
                            selected={startDateTime}
                            onChange={(date: Date | null) => setStartDateTime(date)}
                            showTimeSelect
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="expirationDateTime" className="block text-sm font-medium text-gray-700">Expiration Date and Time</label>
                          <DatePicker
                            selected={expirationDateTime}
                            onChange={(date: Date | null) => setExpirationDateTime(date)}
                            showTimeSelect
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
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