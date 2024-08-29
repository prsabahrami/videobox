"use client"
import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const FilesAPI = {
    getSignedURL: async (filename: string, courseName: string, accessToken: string) =>
        await fetch('/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({ file_name: filename, course_name: courseName })
        }).then(res => res.json()),
    getCourses: async (accessToken: string) =>
        await fetch('/api/courses', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => res.json()),
    createCourse: async (courseName: string, description: string, accessToken: string) =>
        await fetch('/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({ name: courseName, description: description })
        }).then(res => res.json()),
}

export default function UploadPage() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [existingCourses, setExistingCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [courseDescription, setCourseDescription] = useState<string>("");

  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      FilesAPI.getCourses(auth.accessToken!)
        .then(data => setExistingCourses(data))
        .catch(error => console.error('Error fetching courses:', error));
    }
  }, [auth.isAuthenticated, auth.accessToken]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    if (!selectedCourse) {
      setMessage("Please select a course or create a new one.");
      return;
    }

    setUploading(true);
    setMessage("");
    setUploadProgress(0);

    const course = selectedCourse;

    try {
      // Step 1: Get signed URL
      const { signedURL } = await FilesAPI.getSignedURL(file.name, course, auth.accessToken!);

      // Step 2: Initiate and perform resumable upload to Google Cloud Storage
      const initiateUpload = async () => {
        const response = await fetch(signedURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain; charset=UTF-8',
            'x-goog-resumable': 'start'
          },
        });
        console.log("Signed URL: ", signedURL);
        console.log("Response: ", response);
        const location = response.headers.get('Location');
        console.log("Location: ", location);
        return location;
      };
      
      const performUpload = async (uploadUrl: string) => {
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
            'Content-Length': file.size.toString(),
          },
        });
      
        if (uploadResponse.ok) {
          setMessage("Upload successful!");
          setFile(null);
          setSelectedCourse(null);
        } else {
          setMessage(`Upload failed: ${uploadResponse.statusText}`);
        }
      };
      
      try {
        const uploadUrl = await initiateUpload();
        console.log(uploadUrl);
        console.log("uploading");
        await performUpload(uploadUrl!);

        const transcode = async () => {
          const response = await fetch('/api/transcode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${auth.accessToken}`
            },
            body: JSON.stringify({ file_name: file.name, course_name: course })
          });
          console.log("Transcode response: ", response);
        }
        transcode();
      } catch (error) {
        console.error("Upload Error:", error);
        setMessage("Upload failed due to a network error.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setMessage("Upload failed due to a network error.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="bg-black h-screen sm:h-full sm:py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Please log in to upload a video.
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black h-screen sm:h-full sm:py-24">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Upload a Video
          </h2>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex flex-col max-w-md gap-y-4"
          >
            <input
              id="file"
              type="file"
              className="cursor-pointer min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="video/*"
            />
              <>
                <select
                  value={selectedCourse || ""}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                >
                  <option value="">Select existing course or create new</option>
                  {Array.isArray(existingCourses) && existingCourses.map((course, index) => (
                    <option key={index} value={course}>{course}</option>
                  ))}
                </select>
                {(
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={selectedCourse || ""}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      placeholder="Enter new course name"
                      className="flex-grow rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                    />
                    <input
                      type="text"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      placeholder="Enter course description"
                      className="flex-grow rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCourse) {
                          FilesAPI.createCourse(selectedCourse, courseDescription, auth.accessToken!)
                            .then(data => setExistingCourses([...existingCourses, data.name]))
                            .catch(error => console.error('Error creating course:', error));
                        }
                      }}
                      className="rounded-md bg-blue-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    >
                      Create Course
                    </button>
                  </div>
                )}
              </>
            <button
              className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              type="submit"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${uploadProgress}%`}}></div>
              </div>
              <p className="text-center text-white mt-2">{uploadProgress}% Uploaded</p>
            </div>
          )}
          {message && (
            <p className={`mt-4 text-center ${message.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}