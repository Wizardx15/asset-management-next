import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "./supabase"
import bcrypt from "bcryptjs"
import { logActivityServer } from "./activity-logger-server"

declare module "next-auth" {
  interface User {
    role?: string
    id: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id: string
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          await logActivityServer({
            action: 'LOGIN_FAILED',
            entityType: 'auth',
            details: { email: credentials?.email, reason: 'Missing credentials' }
          })
          return null
        }

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user || !user.password) {
          await logActivityServer({
            action: 'LOGIN_FAILED',
            entityType: 'auth',
            details: { email: credentials.email, reason: 'User not found' }
          })
          return null
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) {
          await logActivityServer({
            action: 'LOGIN_FAILED',
            entityType: 'auth',
            details: { email: credentials.email, reason: 'Wrong password' }
          })
          return null
        }

        // Log successful login
        await logActivityServer({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          action: 'LOGIN_SUCCESS',
          entityType: 'auth',
          details: { email: user.email }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
}