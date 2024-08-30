"use client";

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

export default function ResetPage() {
  const auth = useAuth()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState<string>('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState<string>('')
  const [error, setError] = useState<string>('')

  const reset = async () => {
    if (newPassword !== newPasswordConfirmation) {
      setError('Passwords do not match')
      return
    }
    try {
      const resetToken = new URLSearchParams(window.location.search).get('token')
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword,
        }),
      })
      if (response.ok) {
        router.push('/login')
      } else {
        const data = await response.json()
        setError(data.error || 'Password reset failed')
      }
    } catch (err) {
      setError('An error occurred during password reset')
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
          <h3 className="text-xl font-semibold text-black">Reset Password</h3>
          <p className="text-sm text-gray-500">
            Enter your new password below
          </p>
        </div>
        <Form
          action={async (formData: FormData) => {
            setNewPassword(formData.get('newPassword') as string)
            setNewPasswordConfirmation(formData.get('newPasswordConfirmation') as string)
            await reset()
          }}
        >
          <div>
            <label htmlFor="newPassword" className="block text-xs text-gray-600 uppercase">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="newPasswordConfirmation" className="block text-xs text-gray-600 uppercase">
              Confirm New Password
            </label>
            <input
              id="newPasswordConfirmation"
              name="newPasswordConfirmation"
              type="password"
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
          </div>
          <SubmitButton>Reset Password</SubmitButton>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
