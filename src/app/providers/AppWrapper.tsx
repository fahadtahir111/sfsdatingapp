/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AuthProvider from "./AuthProvider";
import StreamVideoProvider from "./StreamVideoProvider";
import ToastProvider from "./ToastProvider";

export default function AppWrapper({ 
  children,
  initialUser 
}: { 
  children: React.ReactNode,
  initialUser: any 
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        {initialUser ? (
          <StreamVideoProvider user={initialUser}>
            {children}
          </StreamVideoProvider>
        ) : (
          children
        )}
      </ToastProvider>
    </AuthProvider>
  );
}
