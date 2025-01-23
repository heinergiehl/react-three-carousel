"use client"

import { Canvas } from "@react-three/fiber"
import { WrappedCarousel } from "./components/Carousel"

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <Canvas>
        <WrappedCarousel />
      </Canvas>
    </div>
  )
}
