'use client'

import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Camera as CameraComponent } from 'react-camera-pro'
import { Button } from './ui/button'
import { Camera, CameraOff } from 'lucide-react'

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

    useImperativeHandle(ref, () => ({
      takePhoto: () => {
        if (camera.current) {
          const photo = camera.current.takePhoto()
          onCapture(photo)
        }
      },
      switchCamera: () => {
        if (camera.current) {
          camera.current.switchCamera()
        }
      }
    }))

    return (
      <div className="relative w-full h-[300px]">
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
                onCapture(photo)
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
              <CameraOff className="h-4 w-4 mr-2" />
              Switch Camera
            </Button>
          )}
        </div>
      </div>
    )
  }
)

CameraView.displayName = 'CameraView'
