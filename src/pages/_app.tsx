import '@/styles/globals.css'
import { Amplify } from 'aws-amplify'
import type { AppProps } from 'next/app'

Amplify.configure({
  aws_cognito_region: process.env.NEXT_PUBLIC_AUTH_REGION, // (required) - Region where Amazon Cognito project was created
  aws_user_pools_id: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID, // (optional) -  Amazon Cognito User Pool ID
  aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_AUTH_WEB_CLIENT_ID, // (optional) - Amazon Cognito App Client ID (App client secret needs to be disabled)
  ssr: true,
})

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
