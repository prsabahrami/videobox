"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
      <main className="flex min-h-screen flex-col items-center justify-top">
        <div className="relative z-[-1] flex place-items-center before:absolute before:h-[10px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
            src="/logo.png"
            alt="Videobox Logo"
            width={300}
            height={300}
            priority
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Welcome to Videobox</h1>
          <p className="text-lg">The best video platform for everyone</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <label htmlFor="videoId" className="text-lg">Enter Video ID:</label>
          <input type="number" id="videoId" name="videoId" className="mt-2 p-2 border rounded text-black" placeholder="Video ID" />
          <button onClick={() => {
            if (document.getElementById("videoId") !== null) {
              const videoId = document.getElementById("videoId") as HTMLInputElement;
              if (videoId.value.length > 0) {
                router.push(`/view/${videoId.value}`);
              }
            }
          }} className="mt-4 p-2 bg-blue-500 text-white rounded">Watch Video</button>
        </div>
      </main>
  )
}
