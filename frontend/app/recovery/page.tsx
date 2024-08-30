"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'

function Form({
  action,
  children,
}: {
  action: any;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16"
    >
      {children}
    </form>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending}
      className="flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none bg-black text-white hover:bg-gray-800"
    >
      {children}
      {pending && (
        <svg
          className="animate-spin ml-2 h-4 w-4 text-white"
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
    </button>
  );
}

export default function RecoveryPage() {
  const auth = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)

  const recover = async () => {
    try {
      const response = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Password recovery failed')
      }
    } catch (err) {
      setError('An error occurred during password recovery')
    }
  }

  if (auth.isAuthenticated) {
    router.push('/')
    return <div>Already logged in. Redirecting you to the home page...</div>
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-black">Account Recovery</h3>
          <p className="text-sm text-gray-500">
            Enter your email address to recover your account
          </p>
        </div>
        <Form
          action={async (formData: FormData) => {
            setEmail(formData.get('email') as string)
            await recover()
          }}
        >
          <div>
            <label htmlFor="email" className="block text-xs text-gray-600 uppercase">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="user@videobox.com"
              autoComplete="email"
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
          </div>
          <SubmitButton>Recover Account</SubmitButton>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">Recovery email sent. Please check your inbox.</p>}
          <p className="text-center text-sm text-gray-600">
            {"Remember your password? "}
            <Link href="/login" className="font-semibold text-gray-800">
              Sign in
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}