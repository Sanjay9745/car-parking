'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { CameraIcon, UploadIcon } from 'lucide-react'
import axios from 'axios';

import apiUrl from '@/constants/apiUrl'


export default function CameraCapture() {
    const [imageData, setImageData] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<string | null>(null)
    const [lplate, setLplate] = useState<string>('')
    const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  
  async function uploadImage(formData: FormData) {
      try {
          const response = await axios.post(`${apiUrl}/vehicles/upload`, formData, {
              headers: {
                  'x-access-token': localStorage.getItem('adminToken') || '',
                  'Content-Type': 'multipart/form-data'
              }
          });
  
          if (response.status === 200) {
                setLplate(response.data.lplate || '');
              return { success: true, message: 'Image uploaded successfully!' };
          } else {
              return { success: false, message: 'Image upload failed!' };
          }
      } catch (error) {
          console.error('Error uploading image:', error);
          return { success: false, message: 'An error occurred during image upload. Please try again.' };
      }
  }
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure you have given permission.')
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg')
        setImageData(imageDataUrl)
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const handleUpload = async () => {
    if (imageData) {
      setUploading(true)
      setUploadStatus(null)
      try {
        const response = await fetch(imageData)
        const blob = await response.blob()
        const formData = new FormData()
        formData.append('image', blob, 'capture.jpg')
        const result = await uploadImage(formData)
        setUploadStatus(result.message)
      } catch (err) {
        setError('Failed to upload image. Please try again.')
      } finally {
        setUploading(false)
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await fetch(`${apiUrl}/vehicles/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ lplate })
      });

      if (response.ok) {
        setUploadStatus('License plate submitted successfully!')
      } else {
        setError('Failed to submit license plate.')
      }
    } catch (error) {
      setError('An error occurred during license plate submission. Please try again.')
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera Capture Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Camera Capture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!imageData && (
                <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-lg">
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              {imageData && (
                <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-lg">
                  <img src={imageData} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
              <div className="flex justify-between gap-4">
                {!imageData ? (
                  <>
                    <Button onClick={startCamera} className="flex-1">
                      <CameraIcon className="mr-2 h-4 w-4" />
                      Open Camera
                    </Button>
                    <Button onClick={captureImage} className="flex-1">Capture</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => { setImageData(null); startCamera(); }} className="flex-1">Retake</Button>
                    <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                      <UploadIcon className="mr-2 h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* License Plate Form Card */}
          <Card className="w-full h-fit">
            <CardHeader>
              <CardTitle>Enter License Plate</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="lplate" className="text-sm font-medium text-gray-700">
                    License Plate Number
                  </label>
                  <Input
                    id="lplate"
                    value={lplate}
                    onChange={(e) => setLplate(e.target.value)}
                    placeholder="Enter license plate number"
                    required
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full">Submit License Plate</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {uploadStatus && (
            <Alert>
              <AlertDescription>{uploadStatus}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}