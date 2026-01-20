'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  variant: 'signin' | 'signup';
}

export default function AuthSplitLayout({
  children,
  variant,
}: AuthSplitLayoutProps) {
  const isSignIn = variant === 'signin';

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT – FORM */}
      <motion.div
        initial={{ x: isSignIn ? 0 : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: isSignIn ? '-100%' : '100%' }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="w-full lg:w-1/2 flex items-center justify-center bg-white relative z-10"
      >
        {children}
      </motion.div>

      {/* RIGHT – IMAGE PANEL */}
      <motion.div
        initial={{ x: isSignIn ? 0 : '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: isSignIn ? '100%' : '-100%' }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center"
        style={{
          backgroundImage: "url('/mutiara.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* White overlay */}
        <div className="absolute inset-0 bg-white/60" />

        {/* Content */}
        <div className="relative z-10 text-center">
          <Image
            src="/logo.png"
            alt="Hotel Mutiara"
            width={160}
            height={160}
            priority
          />

          <p className="mt-6 text-lg font-medium text-gray-800">
            Premium Experience Awaits You
          </p>
        </div>
      </motion.div>
    </div>
  );
}
