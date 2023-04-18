import { useState } from 'react'
import Head from 'next/head'
import { useForm } from "react-hook-form";

import Register from '../components/register'
import SignIn from '../components/sign-in'
import Confirm from '../components/confirm'

export default function Login() {
  const [status, setStatus] = useState('sign-in')
  const [user, setUser] = useState(null)

  return (
    <div>
      <Head>
        <title>Prometheus-GPT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <img className="mx-auto h-40 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" alt="Workflow" />
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Prometheus-GPT
              </h2>
              <p className="mt-6 text-center text-sm text-gray-900">
                Powered by SpringSun Technology
              </p>
            </div>

            {status === 'sign-in' ? <SignIn setStatus={setStatus} /> : null}
            {status === 'register' ? <Register setStatus={setStatus} setUser={setUser} /> : null}
            {status === 'confirm' ? <Confirm setStatus={setStatus} user={user} /> : null}
          </div>
        </div>
      </main>
    </div>
  )
}
