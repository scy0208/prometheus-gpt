import { useState } from 'react'
import { useRouter} from 'next/router'
import { Auth } from 'aws-amplify';
import { useForm } from "react-hook-form";
export default function SignIn({ setStatus }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitError, setSubmitError] = useState('');

  const router = useRouter()

  async function signIn({ email, password }) {
    try {
      await Auth.signIn(email, password);
      router.reload()
    } catch (error) {
      console.log('error signing in', error);
      setSubmitError(error.message);
    }
  }

  return (

    <form className="mt-8 space-y-6" onSubmit={handleSubmit(signIn)}>
      <input type="hidden" name="remember" value="true" />
      <div className="rounded-md shadow-sm -space-y-px">
      <div>
          <label htmlFor="email-address" className="sr-only">Email address</label>
          <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" 
          {...register('email', { 
            required: 'Email is required.'})}/>
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" 
          {...register('password', { 
            required: 'Password is required.'})}/>
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        {submitError && <p className="text-red-500">{submitError}</p>}
      </div>

      <div className="flex items-center justify-end">
        <div className="text-sm">
          <button
            className="font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => setStatus('register')}
          >
            注册账号
          </button>
        </div>
      </div>

      <div>
        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </span>
          登录
        </button>
      </div>
    </form>
  )
}
