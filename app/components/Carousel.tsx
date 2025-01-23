import React, { useRef } from "react"
import CarouselItem from "./CarouselItem"
import { images } from "./settings"
import { Html, useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as Three from "three"
import gsap from "gsap"
import { CarouselProvider, useCarousel } from "./context"
function Carousel() {
  const rootGroupRef = useRef<Three.Group | null>(null)
  const progressRef = useRef(0)
  const prevProgressRef = useRef(0)
  const scrollSpeedRef = useRef(0)
  const textures = images.map((img) => useTexture(img))
  const { viewport } = useThree()
  const items = rootGroupRef.current?.children || []
  const totalItems = items?.length || 0

  const { settings, activeIndex } = useCarousel()

  const handleWheel = (e: WheelEvent) => {
    if (activeIndex !== null) return
    const delta = e.deltaY * 0.15
    let newProgress = progressRef.current + delta

    // snapp progress to the nearest item and clamp it, so that progress is between 0 and 100
    newProgress = Math.round(newProgress)
    newProgress = Math.max(0, Math.min(100, newProgress))
    progressRef.current = newProgress
  }

  useFrame(() => {
    const rawProgress = progressRef.current
    const scrollSpeed = rawProgress - prevProgressRef.current
    scrollSpeedRef.current = scrollSpeed
    prevProgressRef.current = rawProgress
    // clamp progress between 0 and 100
    const progress = Math.max(0, Math.min(100, rawProgress))

    // calculate the centerIndex and distances
    const fraction = (progress / 100) * totalItems
    const centerIndex = Math.round(fraction)

    items.forEach((item, index) => {
      const distance = index - centerIndex
      const y = -distance * (settings.height + settings.itemGap)
      const z = -Math.abs(distance) * 0.5
      const scale = distance === 0 ? 2.5 : 1.7
      item.visible = Math.abs(distance) <= 1
      if (activeIndex !== null) {
        item.visible = activeIndex === index
      }
      gsap.to(item.position, {
        x: 0,
        y,
        z,
        duration: 2,
        ease: "power3.out",
      })
      gsap.to(item.scale, {
        x: scale,
        y: scale,
        z: scale,
        duration: 2,
        ease: "power3.out",
      })

      const material = (item.children[0] as Three.Mesh)
        .material as Three.ShaderMaterial
      // animate uGrayOverlray
      gsap.to(material.uniforms.uGrayOverlay.value, {
        x: 0.7,
        y: 0.7,
        z: 0.7,
        w: distance === 0 ? 0 : 0.7,
        duration: 2,
        ease: "power3.out",
      })

      // uDistance
      gsap.to(material.uniforms.uDistance, {
        value: Math.abs(distance) > 0 ? 1 : 0,
        duration: 2,
        ease: "power3.out",
      })
      //   material.uniforms.uScrollSpeed.value = scrollSpeed

      // uScrollSpeed
      gsap.to(material.uniforms.uScrollSpeed, {
        value: scrollSpeed,
        duration: 2,
        ease: "power3.out",
      })

      material.uniforms.uTime.value = performance.now() / 1000

      const tl = gsap.timeline()
      const htmlOverlayLeft = activeIndex !== null ? "-40vw" : "-100vw"
      const htmlOverlayOpacity = activeIndex !== null ? 1 : 0
      if (!rootGroupRef.current) return
      tl.to(rootGroupRef.current.rotation, {
        x: settings.rotation[0],
        y: settings.rotation[1],
        z: settings.rotation[2],
        duration: 0.8,
        ease: "power3.out",
      })
        .to(rootGroupRef.current.position, {
          x: settings.position[0],
          y: settings.position[1],
          z: 0,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(htmlOverlayRef.current, {
          opacity: htmlOverlayOpacity,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(
          htmlOverlayRef.current,
          {
            x: htmlOverlayLeft,
            duration: 0.8,
            ease: "power3.out",
          },
          "<-0.3"
        )
    })
  })
  const htmlOverlayRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Html>
        <div
          ref={htmlOverlayRef}
          className="absolute z-0 top-0 left-0 w-full "
          style={{ transform: "translateX(-100vw)", opacity: 0 }}
        >
          <div className="relative flex flex-col items-start justify-center h-full w-[400px]">
            <h2 className="text-2xl font-bold mb-4 ">
              Some interesting details
            </h2>
            <p className="mb-4 ">
              {" "}
              Details about the selected card will be displayed here. Details
              about the selected card will be displayed here. Details about the
              selected card will be displayed here.
            </p>
          </div>
        </div>
      </Html>

      <group>
        <mesh onWheel={(e) => handleWheel(e.nativeEvent)} position={[0, 0, -1]}>
          <planeGeometry args={[viewport.width, viewport.height]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <group ref={rootGroupRef}>
          {textures.map((texture, index) => (
            <CarouselItem key={index} index={index} texture={texture} />
          ))}
        </group>
      </group>
    </>
  )
}

export const WrappedCarousel = () => {
  return (
    <CarouselProvider>
      <Carousel />
    </CarouselProvider>
  )
}
