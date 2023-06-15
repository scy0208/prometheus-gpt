import {  useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import { Main } from '@/components/Main'
import Login from '@/components/login'
import { Auth } from 'aws-amplify'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await Auth.currentSession();
       if (process.env.NEXT_PUBLIC_DISABLED==="true") {
        setDisabled(true);
       }
        setUser(session); // Set the user session if available
      } catch (error) {
        // Handle the error (e.g., user is not authenticated)
      }
      setLoading(false); // Set loading to false after checking the session
    };
    checkSession();
  }, []);
  
  if(disabled) {
    return (
      <main className={inter.className}>
        {/* Render a loading indicator */}
        <div className='flex text-2xl justify-center items-center'>
          <p>试用期结束，请联系管理员</p>
        </div>
      </main>
    )
  }

  // Loading state
  if (loading) {
    return (
      <main className={inter.className}>
        {/* Render a loading indicator */}
        <div>Loading...</div>
      </main>
    );
  }

  // Render the Chat component if the user is authenticated
  // if (user) {
  //   const { idToken } = user;
  //   const { payload } = idToken;
  //   const username = payload['cognito:username'];

  //   return (
  //     <main className={inter.className}>
  //       <Main user={ username }/>
  //     </main>
  //   );
  // }

  // Render the Login component if the user is not authenticated
  return (
    <main className={inter.className}>
      <Main user='wine_consumer'/>
    </main>
  );
}
