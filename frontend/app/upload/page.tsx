'use client'
import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const FilesAPI = {
    create: async (formData: FormData, accessToken: string) =>
        await fetch('/api/files', {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }),
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [show, setShow] = useState<string>("hidden");
  const [accessToken, setAccessToken] = useState<string>("");

  const auth = useAuth()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await FilesAPI.create(formData, accessToken);

    if (uploadResponse.ok) {
        setMessage("Upload successful!");
    } else {
        console.error("S3 Upload Error:", uploadResponse);
        setMessage("Upload failed.");
    }

    setUploading(false);
  };

  useEffect(() => {
    if (message.length > 0) {
      setShow("block");
    }
  }, [show, message]);

  return (
    <main>
      { !auth.isAuthenticated && <div className="bg-black h-screen sm:h-full sm:py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Please log in to upload a video.
            </h2>
          </div>
        </div>
      </div> }
      { auth.isAuthenticated && <div className="bg-black h-screen sm:h-full sm:py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Upload a Video
            </h2>
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-10 flex max-w-md gap-x-4"
            >
              <input
                id="file"
                type="file"
                className="cursor-pointer min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    setFile(files[0]);
                    setAccessToken(auth.accessToken!);
                  }
                }}
                accept="video/*"
              />
              <button
                className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                type="submit"
                disabled={uploading}
              >
                Upload
              </button>
            </form>
            <div className={`pt-2 relative ${show}`}>
              <div className="absolute left-[40%] mx-auto rounded-md bg-white/5 px-3.5 py-4 text-white">
                {message}
              </div>
            </div>
          </div>
        </div>
      </div> }
    </main>
  );
}