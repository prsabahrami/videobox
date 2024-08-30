"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export const RegisterPage = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [role, setRole] = useState<'Student' | 'Coach'>('Student')
  const [coachKey, setCoachKey] = useState<string>('')
  const [error, setError] = useState<string>('')

  const navigate = useRouter()

  const register = async () => {
    if (!email || !password || (role === 'Coach' && !coachKey)) {
      setError('Please fill in all required fields')
      return
    }
    if (role === 'Coach' && coachKey !== 'Dr25142233') {
      setError('Invalid coach key')
      return
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })
      if (response.ok) {
        navigate.push('/activate')
      } else {
        const data = await response.json()
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred during registration')
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-black">Create Account</h3>
          <p className="text-sm text-gray-500">
            Create an account to get started
          </p>
        </div>
        <Form
          action={async (formData: FormData) => {
            setEmail(formData.get('email') as string)
            setPassword(formData.get('password') as string)
            setRole(formData.get('role') as 'Student' | 'Coach')
            setCoachKey(formData.get('coachKey') as string)
            await register()
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
          <div>
            <label htmlFor="password" className="block text-xs text-gray-600 uppercase">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
          </div>
          <div className="relative">
            <label htmlFor="role" className="block text-xs text-gray-600 uppercase">
              Role
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                onChange={(e) => setRole(e.target.value as 'Student' | 'Coach')}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-8 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm text-black "
              >
                <option value="Student">Student</option>
                <option value="Coach">Coach</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          {role === 'Coach' && (
            <div>
              <label htmlFor="coachKey" className="block text-xs text-gray-600 uppercase">
                Coach Key
              </label>
              <input
                id="coachKey"
                name="coachKey"
                type="password"
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm text-black"
              />
            </div>
          )}
          <SubmitButton>Sign up</SubmitButton>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <p className="text-center text-sm text-gray-600">
            {"Already have an account? "}
            <Link href="/login" className="font-semibold text-gray-800">
              Sign in
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}

export default RegisterPage