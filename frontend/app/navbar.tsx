'use client'

import { useRouter } from 'next/navigation'
import { useAuth, useAuthCheck } from './hooks/useAuth'


export default function Navbar() {
    useAuthCheck()
    const auth = useAuth()

    const navigate = useRouter()
    return (
        <header className="text-white body-font">
            <div className="container mx-auto flex flex-wrap p-5 md:flex-row">
                <a className="flex title-font font-medium text-white mb-4 md:mb-0 pr-4" href="/">
                    <span className="ml-3 text-3xl">VideoBox</span>
                </a>
                <button
                    className="text-white cursor-pointer text-xl leading-none py-1 border border-solid border-transparent rounded bg-transparent block md:hidden outline-none focus:outline-none ml-auto pb-3"
                    type="button"
                    onClick={() => navigate.push('/')}
                >
                </button>
                <div
                    className={
                        "md:flex flex-grow items-center flex"
                    }
                    id="example-navbar-danger"
                >
                    <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center font-semibold pl-7">
                        <button className="px-3 py-1 mr-1 text-white transition duration-500 ease-in-out transform bg-transparent rounded-lg dark:text-gray-300 md:mt-0 md:ml-1 hover:text-gray-900 hover:bg-gray-100 focus:text-gray-900 focus:bg-gray-200 focus:outline-none focus:shadow-outline" onClick={() => navigate.push('/')}>Home</button>
                        <button className="px-3 py-1 mr-1 text-white transition duration-500 ease-in-out transform bg-transparent rounded-lg dark:text-gray-300 md:mt-0 md:ml-1 hover:text-gray-900 hover:bg-gray-100 focus:text-gray-900 focus:bg-gray-200 focus:outline-none focus:shadow-outline" onClick={() => navigate.push('/about')}>About</button>
                        { auth.isAuthenticated && auth.session?.role === 'Coach' && <button className="px-3 py-1 mr-1 text-white transition duration-500 ease-in-out transform bg-transparent rounded-lg dark:text-gray-300 md:mt-0 md:ml-1 hover:text-gray-900 hover:bg-gray-100 focus:text-gray-900 focus:bg-gray-200 focus:outline-none focus:shadow-outline" onClick={() => navigate.push('/upload')}>Upload</button> }
                        { auth.isAuthenticated && auth.session?.role === 'Coach' && <button className="px-3 py-1 mr-1 text-white transition duration-500 ease-in-out transform bg-transparent rounded-lg dark:text-gray-300 md:mt-0 md:ml-1 hover:text-gray-900 hover:bg-gray-100 focus:text-gray-900 focus:bg-gray-200 focus:outline-none focus:shadow-outline" onClick={() => navigate.push('/myvideos')}>My Videos</button> }
                        { !auth.isAuthenticated && <button onClick={() => navigate.push('/login')} className="px-3 py-1 mr-1 text-white transition duration-500 ease-in-out transform bg-transparent rounded-lg dark:text-gray-300 md:mt-0 md:ml-1 hover:text-gray-900 hover:bg-gray-100 focus:text-gray-900 focus:bg-gray-200 focus:outline-none focus:shadow-outline">
                            Login/Register
                        </button> }
                        { auth.isAuthenticated && <button onClick={() => { auth.logout(); navigate.push('/'); }} className="px-3 py-1 mr-1 text-white transition duration-500 ease-in-out transform bg-transparent rounded-lg dark:text-gray-300 md:mt-0 md:ml-1 hover:text-gray-900 hover:bg-gray-100 focus:text-gray-900 focus:bg-gray-200 focus:outline-none focus:shadow-outline">
                            Logout
                        </button> }
                    </nav>
                </div>
            </div>
        </header>
    );
}