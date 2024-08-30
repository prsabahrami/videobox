"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useFormStatus } from 'react-dom'

function Form({
  action,
  children,
}: {
  action: any;
  children: React.ReactNode;
}) {
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  return (
    <form
      action={action}
      className="flex flex-col space-y-4 bg-gray-50 px-4 py-4 sm:px-16"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-xs text-gray-600 uppercase"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="user@videobox.com"
          autoComplete="email"
          required={!isGoogleAuth}
          className="text-black mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-xs text-gray-600 uppercase"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required={!isGoogleAuth}
          className="text-black mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
      {/* @ts-ignore */}
      {React.Children.map(children, child => 
        React.isValidElement(child) && child.type === GoogleAuthButton
        ? React.cloneElement(child as React.ReactElement<{ setIsGoogleAuth: (value: boolean) => void }>, { setIsGoogleAuth })
        : child
      )}
    </form>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending}
      className="flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none text-black"
    >
      {children}
      {pending && (
        <svg
          className="animate-spin ml-2 h-4 w-4 text-black"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      <span aria-live="polite" className="sr-only" role="status">
        {pending ? 'Loading' : 'Submit form'}
      </span>
    </button>
  );
}

function GoogleAuthButton({ setIsGoogleAuth }: { setIsGoogleAuth: (value: boolean) => void }) {
  const auth = useAuth()
  return (
    <button
      type="button"
      className="gsi-material-button w-full mt-4"
      onClick={() => {
        setIsGoogleAuth(true);
        auth.loginOIDC('google');
      }}
    >
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" className="display: block;">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
        <span className="gsi-material-button-contents">Continue with Google</span>
      </div>
    </button>
  );
}

export const LoginPage = () => {
  const auth = useAuth()
  const navigate = useRouter()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate.push('/')
    }
  }, [auth.isAuthenticated, navigate])

  const login = async () => {
    let res = await auth.login(email, password)
    if (!res) {
      setError('Invalid email or password')
    }
  }

  if (auth.isAuthenticated) {
    return <div>Already logged in. Redirecting you to the home page...</div>
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-black">Sign In</h3>
          <p className="text-sm text-gray-500">
            Use your email and password to sign in
          </p>
        </div>
        <Form
          action={async (formData: FormData) => {
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            if (email && password) {
              setEmail(email)
              setPassword(password)
              await login()
            }
          }}
        >
          <SubmitButton>Sign in</SubmitButton>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {/* @ts-ignore */}
          <GoogleAuthButton />
          <p className="text-center text-sm text-gray-600 mt-4">
            {"Don't have an account? "}
            <Link href="/register" className="font-semibold text-gray-800">
              Sign up
            </Link>
            {' for free.'}
          </p>
        </Form>
      </div>
    </div>
  );
}

export default LoginPage