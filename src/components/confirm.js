import { useState } from 'react'
import { Auth } from 'aws-amplify';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router'
export default function Confirm({ setStatus, user }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitError, setSubmitError] = useState('');
  const router = useRouter()

  async function confirmSignUp({ code }) {
    try {
      await Auth.confirmSignUp(user.username, code);
      await Auth.signIn(user.username, user.password);
      router.reload()
    } catch (error) {
      console.log('error confirming sign up', error);
      setSubmitError(error.message);
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(confirmSignUp)}>
      <div className="text-black text-s">
        <p>您的账号还未经过邮箱认证，您会收到一封包含验证码的邮件，请查看你的邮箱</p>
      </div>
      <input type="hidden" name="remember" value="true" />
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="code" className="sr-only">Code</label>
          <input id="code" name="code" type="number" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Enterd verification code" {...register("code", { required: true })}/>
        </div>
        {submitError && <p className="text-red-500">{submitError}</p>}
      </div>

      <div>
        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </span>
            Confirm
          </button>
      </div>
    </form>
  )
}
