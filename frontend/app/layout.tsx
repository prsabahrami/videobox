import { AuthProvider} from './hooks/useAuth'
import type { Metadata } from 'next'
import React from 'react'
import './global.css'
import Navbar from './navbar'



export const metadata: Metadata = {
  title: 'Videobox',
  description: 'Videobox offers secure, link-based video sharing without downloads, using Actix/Rust, NextJS, AWS S3, and PostgreSQL. It provides instant streaming specifically tailored for educational use, bypassing the limitations and costs of conventional cloud services.',
}

function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /* CRA: app hooks */
  
  // @ts-ignore
  return (
    <html lang="en" className='dark'>
      <body>
        <div className="App">
          {/* CRA: app menu */}
          <Navbar />
          <div>
            {children}
          </div>
        </div> 
      </body>
    </html>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </AuthProvider>
  )
}
