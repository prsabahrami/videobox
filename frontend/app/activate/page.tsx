"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useQueryParam } from '../hooks/useQueryParam'
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
      <div>
        <label
          htmlFor="activationToken"
          className="block text-xs text-gray-600 uppercase"
        >
          Activation Token
        </label>
        <input
          id="activationToken"
          name="activationToken"
          type="password"
          required
          className="text-black mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
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

export const ActivationPage = () => {
  const auth = useAuth()
  const router = useRouter()
  const token = useQueryParam('token') || '';
  const [activationToken, setActivationToken] = useState<string>(token)
  const [processing, setProcessing] = useState<boolean>(false)

  const activate = async () => {
    setProcessing(true)
    const response = await fetch(
      `/api/auth/activate?activation_token=${activationToken}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    if (response.ok) {
      router.push('/login')
    }
    setProcessing(false)
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-gray-900">Activate Your Account</h3>
          <p className="text-sm text-gray-500">
            Enter your activation token to complete the registration process
          </p>
        </div>
        <Form
          action={async (formData: FormData) => {
            setActivationToken(formData.get('activationToken') as string)
            await activate()
          }}
        >
          <SubmitButton>Activate Account</SubmitButton>
          <p className="mt-4 text-center text-sm text-gray-600">
            {"Need to register? "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
          <p className="text-center text-sm text-gray-600">
            {"Already have an account? "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </Form>
      </div>
    </div>
  )
}

export default ActivationPage
