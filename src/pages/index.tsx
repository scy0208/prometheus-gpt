import Image from 'next/image'
import { Inter } from 'next/font/google'
import useSWR, { useSWRConfig } from 'swr'
import Chat from '@/components/chat'
import Login from '@/components/login'
import { Auth } from 'aws-amplify'

const inter = Inter({ subsets: ['latin'] })

const fetcher = async () => {
  return Auth.currentAuthenticatedUser()
}

export default function Home() {

  const { cache } = useSWRConfig()
  const { data: user, error } = useSWR('user', fetcher)

  if (user) {
    return (
      <main className={inter.className}>
        <Chat />
      </main>
    )
  } else {
    return (
    <main className={inter.className}>
      <Login />
    </main>)
  }
}
