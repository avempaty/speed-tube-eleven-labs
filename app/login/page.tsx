import { getServerSession } from 'next-auth/next';
import { signIn, signOut } from 'next-auth/react';

const LoginPage = () => {
  // const session = getServerSession()

  // if (session) {
  //   // @ts-ignore
  //   return (
  //     <>
  //       Signed in as {(session as any).user?.email} <br />
  //       <button onClick={() => signOut()}>Sign out</button>
  //     </>
  //   )
  // }

  // return (
  //   <div>
  //     <h1>Sign in with Google</h1>
  //     <button onClick={() => signIn('google')}>Sign in with Google</button>
  //   </div>
  // );
  return <div>login</div>
};

export default LoginPage;
