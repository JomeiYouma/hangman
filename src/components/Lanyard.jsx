import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Text, useTexture } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import profilePicture from '../assets/photoProfileDetourage.png'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

const IdentityCard = ({ isMobile }) => {
  const photoTexture = useTexture(profilePicture)

  return (
    <group scale={2.15} position={[0, -1.2, -0.05]}>
      <mesh>
        <boxGeometry args={[1.68, 2.34, 0.08]} />
        <meshPhysicalMaterial color="#0e1519" roughness={0.42} metalness={0.72} clearcoat={isMobile ? 0.2 : 0.9} />
      </mesh>

      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.56, 2.2]} />
        <meshBasicMaterial color="#071418" transparent opacity={0.94} />
      </mesh>

      <mesh position={[0, 0.65, 0.05]}>
        <planeGeometry args={[1.33, 0.52]} />
        <meshBasicMaterial color="#ff5b78" transparent opacity={0.14} />
      </mesh>

      <mesh position={[-0.53, 0.66, 0.054]}>
        <circleGeometry args={[0.18, 64]} />
        <meshBasicMaterial color="#311019" transparent opacity={0.85} />
      </mesh>

      <mesh position={[-0.53, 0.66, 0.056]}>
        <circleGeometry args={[0.16, 64]} />
        <meshBasicMaterial map={photoTexture} transparent alphaTest={0.15} />
      </mesh>

      <mesh position={[0, -0.07, 0.05]}>
        <planeGeometry args={[1.3, 0.02]} />
        <meshBasicMaterial color="#ff6e85" transparent opacity={0.24} />
      </mesh>

      <mesh position={[0, -0.82, 0.05]}>
        <planeGeometry args={[1.22, 0.38]} />
        <meshBasicMaterial color="#0f2324" transparent opacity={0.8} />
      </mesh>

      <Text position={[0, 0.82, 0.058]} fontSize={0.075} color="#ffb8c3" anchorX="center" anchorY="middle" maxWidth={1.25} textAlign="center">
        YOUMA
      </Text>

      <Text position={[0, 0.56, 0.058]} fontSize={0.072} color="#7fd8ff" anchorX="center" anchorY="middle" textAlign="center">
        WEB FULL STACK
      </Text>

      <Text position={[0, -0.2, 0.058]} fontSize={0.058} color="#9fd3ff" anchorX="center" anchorY="middle" maxWidth={1.16} textAlign="center">
        Agent Operational Name : R. MADORE
      </Text>

      <Text position={[0, -0.83, 0.058]} fontSize={0.058} color="#ff70ac" anchorX="center" anchorY="middle" textAlign="center">
        ACCESS LEVEL: AUTHORIZED
      </Text>

      <Text position={[0, -1.0, 0.058]} fontSize={0.045} color="#ff95a4" anchorX="center" anchorY="middle" textAlign="center">
        CIPHER BREACH UNIT
      </Text>
    </group>
  )
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()

  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 }
  const curveRef = useRef(
    new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]),
  )

  const [dragged, setDragged] = useState(false)
  const [hovered, setHovered] = useState(false)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.1, 0]])

  useEffect(() => {
    if (!hovered) {
      return undefined
    }

    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
    }

    if (fixed.current) {
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped) {
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        }

        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
      })

      curveRef.current.points[0].copy(j3.current.translation())
      curveRef.current.points[1].copy(j2.current.lerped)
      curveRef.current.points[2].copy(j1.current.lerped)
      curveRef.current.points[3].copy(fixed.current.translation())
      curveRef.current.curveType = 'chordal'
      band.current.geometry.setPoints(curveRef.current.getPoints(isMobile ? 16 : 32))

      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />

        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.05]} />
          <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(event) => {
              event.target.releasePointerCapture(event.pointerId)
              setDragged(false)
            }}
            onPointerDown={(event) => {
              event.target.setPointerCapture(event.pointerId)
              setDragged(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())))
            }}
          >
            <IdentityCard isMobile={isMobile} />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} lineWidth={1} resolution={isMobile ? [900, 1600] : [1200, 1200]} />
      </mesh>
    </>
  )
}

export default function Lanyard({ position = [0, 0, 20], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI * 0.4} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>

        <Environment blur={0.8}>
          <Lightformer intensity={2} color="#ff9aa8" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#ff8396" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#b2e8ff" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}
