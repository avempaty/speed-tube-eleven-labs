import GoogleProvider from "next-auth/providers/google"
import { AuthOptions } from "next-auth"
import { get } from "env-var"
import CustomAuthAdapter from "./CustomAuthAdapter"

const GOOGLE_ID = get("GOOGLE_ID").required().asString()
const GOOGLE_SECRET = get("GOOGLE_SECRET").required().asString()
// const NEXTAUTH_SECRET = get('NEXTAUTH_SECRET').required().asString();
const NEXTAUTH_URL = get("NEXTAUTH_URL").asString()
console.log("NEXTAUTH_URL", NEXTAUTH_URL)

const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV === "development",

  // logger:

  theme: {
    colorScheme: "auto",
    // logo: "/images/logo.svg",
    // brandColor: "#000",
    // brandText: "#000",
  },

  useSecureCookies: false,

  // cookies: {
  //   sessionToken: CookieOption,
  //   callbackUrl: CookieOption,
  //   csrfToken: CookieOption,
  //   pkceCodeVerifier: CookieOption,
  //   state: CookieOption,
  //   nonce: CookieOption,
  // },

  adapter: CustomAuthAdapter(),

  providers: [
    GoogleProvider({
      clientId: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
      // authorization: {
      //   params: {
      //     prompt: "consent",
      //     access_type: "offline",
      //     response_type: "code"
      //   }
      // }
    }),
    // Passwordless / email sign in
    // EmailProvider({
    //   server: process.env.MAIL_SERVER,
    //   from: 'NextAuth.js <no-reply@example.com>'
    // }),
  ],

  // secret: NEXTAUTH_SECRET,

  // session: {
  //   strategy: "database",
  //   maxAge: 30 * 24 * 60 * 60, // 30 days
  //   updateAge: 24 * 60 * 60, // 24 hours
  //   generateSessionToken: async () => {
  //     // uuid
  //   }
  // },

  // jwt: {...},

  // pages: {
  //   signIn: "/auth/signin",
  //   signOut: "/auth/signout",
  //   error: "/auth/error",
  //   verifyRequest: "/auth/verify-request",
  //   newUser: "/auth/new-user",
  // },

  callbacks: {
    // session({user, session}) {
    //   if (session.user) {
    //     session.user.id = user.id;
    //   }

    //   return session;
    // },
    redirect({ url, baseUrl }) {
      console.log("REDIRECT", url, baseUrl)
      const newUrl = url.startsWith(baseUrl) ? url : baseUrl

      if (process.env.NODE_ENV === "development") {
        return newUrl.replace(/^https/, "http")
      }

      console.log("REDIRECT", url, baseUrl, newUrl)
      return newUrl
    },
  },
}

export default authOptions
