'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, MapPin } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Component() {
    const router = useRouter()
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Thank You for Parking!</CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button onClick={()=>router.push('/vehicles')}>Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}