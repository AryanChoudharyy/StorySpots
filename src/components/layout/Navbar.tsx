// src/components/layout/Navbar.tsx
'use client'

import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { MapIcon, UserIcon } from 'lucide-react'
import { Session } from '@supabase/supabase-js'
import { useState } from 'react'

interface NavbarProps {
  session: Session | null
}

export function Navbar({ session }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-black shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <MapIcon className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl">StorySpots</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/" 
              className="px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Explore
            </Link>
            {session && (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/my-stories" 
                  className="px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  My Stories
                </Link>
                <Link 
                  href="/profile" 
                  className="px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>
              </>
            )}
            <AuthButton session={session} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md hover:bg-gray-100"
          >
            Explore
          </Link>
          {session && (
            <>
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link
                href="/my-stories"
                className="block px-3 py-2 rounded-md hover:bg-gray-100"
              >
                My Stories
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Profile
              </Link>
            </>
          )}
          <div className="px-3 py-2">
            <AuthButton session={session} />
          </div>
        </div>
      </div>
    </nav>
  )
}