'use client'

import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Camera as CameraComponent } from 'react-camera-pro'
import { Button } from './ui/button'
import { Camera, SwitchCamera, Check, X, XCircle } from 'lucide-react'
import Image from 'next/image'


export interface CameraProps {
  onCapture: (image: string) => void
  onClose: () => void
}

export interface CameraRef {
  takePhoto: () => void
  switchCamera: () => void
}

export const CameraView = forwardRef<CameraRef, CameraProps>(
  ({ onCapture, onClose }, ref) => {
    const camera = React.useRef<any>(null)
    const [numberOfCameras, setNumberOfCameras] = useState(0)
    const [tempPhoto, setTempPhoto] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({
      takePhoto: () => {
        if (camera.current) {
          const photo = camera.current.takePhoto()
          setTempPhoto(photo)
        }
      },
      switchCamera: () => {
        if (camera.current) {
          camera.current.switchCamera()
        }
      }
    }))

    const handleConfirm = () => {
      if (tempPhoto) {
        onCapture(tempPhoto)
      }
    }

    const handleRetake = () => {
      setTempPhoto(null)
    }

    return (
      <div className="relative aspect-square w-full">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white/90"
          onClick={onClose}
        >
          <XCircle className="h-5 w-5" />
        </Button>

        {tempPhoto ? (
          <div className="relative h-full">
            <div className="relative aspect-square w-full">
              <Image 
                src={tempPhoto} 
                alt="Captured photo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                variant="destructive"
                onClick={handleRetake}
              >
                <X className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button
                onClick={handleConfirm}
              >
                <Check className="h-4 w-4 mr-2" />
                Use Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            <CameraComponent
              ref={camera}
              numberOfCamerasCallback={setNumberOfCameras}
              aspectRatio={1}
              facingMode="environment"
              errorMessages={{
                noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
                canvas: 'Canvas is not supported.',
              }}
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                onClick={() => {
                  if (camera.current) {
                    const photo = camera.current.takePhoto()
                    setTempPhoto(photo)
                  }
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              {numberOfCameras > 1 && (
                <Button
                  variant="outline"
                  onClick={() => camera.current?.switchCamera()}
                >
                  <SwitchCamera className="h-4 w-4 mr-2" />
                  Switch Camera
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

CameraView.displayName = 'CameraView'
