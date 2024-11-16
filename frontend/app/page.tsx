'use client'

import useProtected from "@/hooks/useProtected";
import { useRouter } from "next/navigation";

const { useEffect } = require('react');

export default function Home() {
  const router = useRouter();
   useEffect(()=> {
   useProtected().then((isProtected:boolean) => {
     if (!isProtected) {
       router.push('/auth');
       return;
     }else{
       router.replace('/vehicles');
     }
    }).catch(() => {
        router.push('/auth');
        return;
    });
  }, [])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold">
        Welcome to <a className="text-blue-600" href="https://nextjs.org">Next.js!</a>
      </h1>
    </div>
  )
}