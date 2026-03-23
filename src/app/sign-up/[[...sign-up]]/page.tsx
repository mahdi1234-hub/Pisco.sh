"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/46011e44-1f9d-4c5e-b716-300b8ce1381e_3840w.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <h1
            className="text-white text-3xl font-light tracking-widest uppercase mb-2"
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              letterSpacing: "0.2em",
            }}
          >
            NOVERA
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Create your account
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              cardBox: "shadow-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
