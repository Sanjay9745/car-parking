'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { CameraIcon, UploadIcon, RefreshCwIcon, CropIcon, Check } from 'lucide-react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import "@/components/css/switch.css"
import axios from 'axios'
import apiUrl from '@/constants/apiUrl'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import useAdminProtected from '@/hooks/useAdminProtected'

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<string> {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty')
      }
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
    }, 'image/jpeg')
  })
}

export default function AddEntry() {
  const router = useRouter();
  const { toast } = useToast()
  const [imageData, setImageData] = useState<string | null>(null)
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [lplate, setLplate] = useState<string>('')
  const [entryType, setEntryType] = useState<string>('entry')
  const [facingMode, setFacingMode] = useState<string>('environment')
  const [isCropping, setIsCropping] = useState(false)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 50,
    x: 5,
    y: 25
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    useAdminProtected().then((isProtected: boolean) => {
      if (!isProtected) {
        router.push('/admin/login')
      }
    }).catch(() => {
      router.push('/admin/login')
    });
    if (error || uploadStatus) {
      const timer = setTimeout(() => {
        setError(null)
        setUploadStatus(null)
      }, 5000) // Clear the alert messages after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [error, uploadStatus])

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      streamRef.current = stream
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
        setCroppedImageData(null)
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startCropping = () => {
    setIsCropping(true)
  }

  const completeCrop = async () => {
    if (imgRef.current && crop.width && crop.height) {
      try {
        const croppedImg = await getCroppedImg(imgRef.current, crop as PixelCrop)
        setCroppedImageData(croppedImg)
        setIsCropping(false)
      } catch (err) {
        setError('Failed to crop image')
      }
    }
  }

  const handleUpload = async () => {
    const imageToUpload = croppedImageData || imageData
    if (imageToUpload) {
      setUploading(true)
      setUploadStatus(null)
      try {
        const response = await fetch(imageToUpload)
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
      let entry = entryType === 'entry' ? 'entry' : 'exit'
      const response = await fetch(`${apiUrl}/vehicles/${entry}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('adminToken') || ''
        },
        body: JSON.stringify({ lplate, entryType })
      });

      if (response.ok) {
        setUploadStatus('License plate submitted successfully!');
        setImageData(null);
        setCroppedImageData(null);
        startCamera();
        if (entryType === 'entry') {
                       toast({
              title: "Select Slot",
              description: "Select Slot to park the vehicle",
              action:<ToastAction altText="Try again" onClick={()=>router.push('/admin/slots?lplate='+lplate)}>Select Slot</ToastAction>
            });
        }
        setLplate('');
      } else {
        setError('Failed to submit license plate.')
      }
    } catch (error) {
      setError('An error occurred during license plate submission. Please try again.')
    }
  }

  const toggleCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment')
    startCamera()
  }

  const toggleEntryType = () => {
    setEntryType(prevType => (prevType === 'entry' ? 'exit' : 'entry'))
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <Button className="my-2" onClick={()=>router.push('/admin/dashboard')}>Return to Dashboard</Button>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera Capture Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Camera Capture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!imageData && !croppedImageData && (
                <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-lg">
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              {imageData && !croppedImageData && (
                <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-lg">
                  {isCropping ? (
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      aspect={undefined}
                    >
                      <img
                        ref={imgRef}
                        src={imageData}
                        alt="To crop"
                        className="w-full h-full object-contain"
                      />
                    </ReactCrop>
                  ) : (
                    <img src={imageData} alt="Captured" className="w-full h-full object-contain" />
                  )}
                </div>
              )}
              {croppedImageData && (
                <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-lg">
                  <img src={croppedImageData} alt="Cropped" className="w-full h-full object-contain" />
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
              
              <div className="flex justify-between gap-4">
                {!imageData && !croppedImageData ? (
                  <>
                    <Button onClick={startCamera} className="flex-1">
                      <CameraIcon className="mr-2 h-4 w-4" />
                      Open Camera
                    </Button>
                    <Button onClick={captureImage} className="flex-1">Capture</Button>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 w-full">
                    <Button onClick={() => { 
                      setImageData(null); 
                      setCroppedImageData(null);
                      setIsCropping(false);
                      startCamera(); 
                    }} className="flex-1">
                      Retake
                    </Button>
                    
                    {imageData && !croppedImageData && !isCropping && (
                      <Button onClick={startCropping} className="flex-1">
                        <CropIcon className="mr-2 h-4 w-4" />
                        Crop
                      </Button>
                    )}
                    
                    {isCropping && (
                      <Button onClick={completeCrop} className="flex-1">
                        <Check className="mr-2 h-4 w-4" />
                        Complete Crop
                      </Button>
                    )}
                    
                    {(imageData || croppedImageData) && !isCropping && (
                      <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                  </div>
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
                <div className="space-y-2">
                  <label htmlFor="entryType" className="text-sm font-medium text-gray-700">
                    Entry Type
                  </label>
                  <label className="switch" aria-label="Toggle Entry Type">
                    <input
                      type="checkbox"
                      checked={entryType === 'exit'}
                      onChange={toggleEntryType}
                    />
                    <span className="entry">Entry</span>
                    <span className="exit">Exit</span>
                  </label>
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
      <Toaster/>
    </div>
  );
}