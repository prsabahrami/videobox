"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import VideoComponent from '../../components/VideoComponent'
  
const FilesAPI = {
    getPage: async (page: number, size: number, accessToken: string) =>
        await (await fetch(`/api/files/pg?page=${page}&page_size=${size}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })).json(),
    delete: async (id: number, accessToken: string) =>
        await fetch(`/api/files/${id}`, { 
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
         })
}

export default function Videos() {
    const [filespages, setFilesPages] = useState<[string[], PaginationResult<Attachment>] | null>(null)
    const pageSize = 4
    const [page, setPage] = useState<number>(0)
    const [numPages, setPages] = useState<number>(1)
    const [processing, setProcessing] = useState<boolean>(false)

    const auth = useAuth()

    useEffect(() => {
        if (auth.accessToken) {
            FilesAPI.getPage(page, pageSize, auth.accessToken).then(setFilesPages)
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
            {!filespages && <p>You don't have any videos yet.</p>}
            {filespages && filespages[0] && filespages[0].map((url: string) => (
              <VideoComponent url={url} />
            ))}
          </div>
        </div>
      </div>
    )
  }
  