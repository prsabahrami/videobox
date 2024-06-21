import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import assert, {ok} from "node:assert";


const FilesAPI = {
    get: async (page: number, size: number, accessToken: string) =>
        await (await fetch(`/api/files/pg?page=${page}&page_size=${size}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })).json(),
    create: async (formData: FormData, accessToken: string) =>
        await fetch('/api/files', {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }),
    delete: async (id: number) =>
        await fetch(`/api/files/${id}`, { method: 'DELETE' })
}

export const Files = () => {
    const [filespages, setFilesPages] = useState<PaginationResult<Attachment>>()
    const pageSize = 5
    const [page, setPage] = useState<number>(0)
    const [numPages, setPages] = useState<number>(1)
    const [processing, setProcessing] = useState<boolean>(false)

    const auth = useAuth()
    const createFile = async (form: FormData) => {
        setProcessing(true)
        if (auth.accessToken) {
            await FilesAPI.create(form, auth.accessToken!)
        }
        if (auth.accessToken) {
            setFilesPages(await FilesAPI.get(page, pageSize, auth.accessToken))
        }
        const el = document.getElementById("file")! as HTMLInputElement
        el.value = ''
        setProcessing(false)
    }

    const deleteFile = async (file: Attachment) => {
        setProcessing(true)
        await FilesAPI.delete(file.id)
        if (auth.accessToken) {
            setFilesPages(await FilesAPI.get(page, pageSize, auth.accessToken))
        }
        setProcessing(false)
    }

    useEffect(() => {
        setProcessing(true)
        if (auth.accessToken) {
            FilesAPI.get(page, pageSize, auth.accessToken).then((files) => {
                setFilesPages(files)
                setProcessing(false)
            })
        }
    }, [])

    useEffect(() => {
        setProcessing(true)
        if (auth.accessToken) {
            FilesAPI.get(page, pageSize, auth.accessToken).then((filepage) => {
                setFilesPages(filepage)
                setProcessing(false)
            })
        }
    }, [page])

    useEffect(() => {
        if (filespages) setPages(filespages?.num_pages)
    }, [filespages])

    useEffect(() => {
        if (page < 0) setPage(0)
        if (numPages != 0 && page >= numPages) setPage(numPages - 1)
    }, [page, numPages])

    return (
        <div style={{display: 'flex', flexFlow: 'column', textAlign: 'left'}}>
            <h1>Files</h1>
            {(!filespages || filespages.total_items == 0) && "No files, upload some!"}
            {filespages?.items && filespages?.items.map((file) =>
                (
                    <div className="Form" key={file.id}>
                        <div style={{flex: 1}}>
                            {file.name}
                        </div>
                        <div>
                            <a href="http://google.com" className="todos-pagination">
                                download
                            </a>
                            &nbsp;
                            <a href="#" className="App-link" onClick={() => deleteFile(file)}>
                                delete
                            </a>
                        </div>
                    </div>
                )
            )}
            <div className="Form">
                <div style={{display: 'flex'}}>
                    <input
                        style={{flex: 1}}
                        id="file"
                        type="file"
                        placeholder="New file..."
                        multiple={false}
                    />
                    <button
                        disabled={processing || !auth.isAuthenticated || !auth.session}
                        style={{height: '40px'}}
                        onClick={() => {
                            const form = new FormData()
                            const el = document.getElementById("file")! as HTMLInputElement
                            form.append("file", el.files![0])
                            createFile(form).then(r => {
                                console.log(r)
                            })
                        }}
                    >
                        Upload
                    </button>
                </div>
            </div>
            <div className="Form">
                <div style={{display: 'flex'}}>
                    <button disabled={processing || page === 0} onClick={() => setPage(page - 1)}>{`<<`}</button>
                    <span style={{flex: 1, textAlign: 'center'}}>
            Page {page + 1} of {numPages}
          </span>
                    <button
                        disabled={processing || page === numPages - 1}
                        onClick={() => setPage(page + 1)}
                    >{`>>`}</button>
                </div>
            </div>
        </div>
    )
}