import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Text, useTexture } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import profilePicture from '../assets/photoProfileDetourage.png'
import './Lanyard.css'

extend({ MeshLineGeometry, MeshLineMaterial })

const CornerBracket = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0.04, 0, 0]}>
      <planeGeometry args={[0.08, 0.005]} />
      <meshBasicMaterial color="#2af7a4" transparent opacity={0.85} />
    </mesh>
    <mesh position={[0, -0.04, 0]}>
      <planeGeometry args={[0.005, 0.08]} />
      <meshBasicMaterial color="#2af7a4" transparent opacity={0.85} />
    </mesh>
  </group>
)

const IdentityCard = ({ isMobile }) => {
  const photoTexture = useTexture(profilePicture)

  return (
    <group scale={2.15} position={[0, -1.2, -0.05]}>
      {/* Corps métallique de la carte */}
      <mesh>
        <boxGeometry args={[1.68, 2.34, 0.08]} />
        <meshPhysicalMaterial
          color="#070f0c"
          roughness={0.32}
          metalness={0.68}
          clearcoat={isMobile ? 0.25 : 1}
          clearcoatRoughness={0.18}
          reflectivity={0.5}
        />
      </mesh>

      {/* Liseré vert métallique */}
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[1.62, 2.28]} />
        <meshBasicMaterial color="#1b8d65" transparent opacity={0.5} />
      </mesh>

      {/* Panneau frontal sombre */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.56, 2.2]} />
        <meshBasicMaterial color="#04100c" transparent opacity={0.96} />
      </mesh>

      {/* === HEADER === */}
      <mesh position={[0, 0.97, 0.05]}>
        <planeGeometry args={[1.5, 0.14]} />
        <meshBasicMaterial color="#0a1e16" transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, 0.88, 0.052]}>
        <planeGeometry args={[1.5, 0.004]} />
        <meshBasicMaterial color="#2af7a4" transparent opacity={0.75} />
      </mesh>

      <Text position={[-0.7, 0.97, 0.058]} fontSize={0.045} color="#2af7a4" anchorX="left" anchorY="middle" textAlign="left">
        ◆ IDENTITY CARD
      </Text>
      <Text position={[0.7, 0.97, 0.058]} fontSize={0.04} color="#7ec99a" anchorX="right" anchorY="middle" textAlign="right">
        ID // 042-A7
      </Text>

      {/* === PHOTO === */}
      {/* Anneau extérieur */}
      <mesh position={[0, 0.42, 0.05]}>
        <ringGeometry args={[0.31, 0.345, 64]} />
        <meshBasicMaterial color="#1b8d65" transparent opacity={0.9} />
      </mesh>
      {/* Halo */}
      <mesh position={[0, 0.42, 0.049]}>
        <circleGeometry args={[0.38, 64]} />
        <meshBasicMaterial color="#082018" transparent opacity={0.85} />
      </mesh>
      {/* Fond photo */}
      <mesh position={[0, 0.42, 0.052]}>
        <circleGeometry args={[0.31, 64]} />
        <meshBasicMaterial color="#020806" transparent opacity={1} />
      </mesh>
      {/* Photo */}
      <mesh position={[0, 0.42, 0.055]}>
        <circleGeometry args={[0.29, 64]} />
        <meshBasicMaterial map={photoTexture} transparent alphaTest={0.15} />
      </mesh>

      {/* === NOM === */}
      <Text position={[0, 0, 0.058]} fontSize={0.14} color="#d8ffe5" anchorX="center" anchorY="middle" maxWidth={1.4} textAlign="center">
        YOUMA
      </Text>
      {/* Underline */}
      <mesh position={[0, -0.09, 0.052]}>
        <planeGeometry args={[0.4, 0.003]} />
        <meshBasicMaterial color="#2af7a4" transparent opacity={0.8} />
      </mesh>

      <Text position={[0, -0.18, 0.058]} fontSize={0.058} color="#7ec99a" anchorX="center" anchorY="middle" textAlign="center">
        WEB · FULL · STACK
      </Text>

      {/* === BLOC INFOS === */}
      {/* Séparateur horizontal */}
      <mesh position={[0, -0.46, 0.052]}>
        <planeGeometry args={[1.3, 0.003]} />
        <meshBasicMaterial color="#1b8d65" transparent opacity={0.4} />
      </mesh>

      <Text position={[-0.6, -0.56, 0.058]} fontSize={0.036} color="#7ec99a" anchorX="left" anchorY="middle" textAlign="left">
        AGENT
      </Text>
      <Text position={[-0.6, -0.63, 0.058]} fontSize={0.054} color="#b5ffcb" anchorX="left" anchorY="middle" textAlign="left">
        R. MADORE
      </Text>

      <Text position={[0.6, -0.56, 0.058]} fontSize={0.036} color="#7ec99a" anchorX="right" anchorY="middle" textAlign="right">
        UNIT
      </Text>
      <Text position={[0.6, -0.63, 0.058]} fontSize={0.054} color="#b5ffcb" anchorX="right" anchorY="middle" textAlign="right">
        CIPHER-01
      </Text>

      {/* Séparateur horizontal */}
      <mesh position={[0, -0.72, 0.052]}>
        <planeGeometry args={[1.3, 0.003]} />
        <meshBasicMaterial color="#1b8d65" transparent opacity={0.4} />
      </mesh>

      {/* === FOOTER === */}
      <mesh position={[0, -0.93, 0.05]}>
        <planeGeometry args={[1.42, 0.2]} />
        <meshBasicMaterial color="#0a1e16" transparent opacity={0.95} />
      </mesh>
      {/* Bandeau d'accent */}
      <mesh position={[-0.66, -0.93, 0.052]}>
        <planeGeometry args={[0.06, 0.2]} />
        <meshBasicMaterial color="#2af7a4" transparent opacity={0.9} />
      </mesh>

      <Text position={[-0.58, -0.87, 0.058]} fontSize={0.04} color="#2af7a4" anchorX="left" anchorY="middle" textAlign="left">
        ACCESS LEVEL
      </Text>
      <Text position={[-0.58, -0.95, 0.058]} fontSize={0.058} color="#d8ffe5" anchorX="left" anchorY="middle" textAlign="left">
        AUTHORIZED
      </Text>

      <Text position={[0.66, -0.87, 0.058]} fontSize={0.036} color="#7ec99a" anchorX="right" anchorY="middle" textAlign="right">
        CLEARANCE
      </Text>
      <Text position={[0.66, -0.95, 0.058]} fontSize={0.05} color="#b5ffcb" anchorX="right" anchorY="middle" textAlign="right">
        // BREACH
      </Text>

      <Text position={[0, -1.06, 0.058]} fontSize={0.034} color="#56a079" anchorX="center" anchorY="middle" textAlign="center">
        CIPHER BREACH UNIT · CLASSIFIED
      </Text>

      {/* === COINS DÉCORATIFS === */}
      <CornerBracket position={[-0.74, 1.04, 0.052]} rotation={[0, 0, 0]} />
      <CornerBracket position={[0.74, 1.04, 0.052]} rotation={[0, 0, -Math.PI / 2]} />
      <CornerBracket position={[0.74, -1.04, 0.052]} rotation={[0, 0, Math.PI]} />
      <CornerBracket position={[-0.74, -1.04, 0.052]} rotation={[0, 0, Math.PI / 2]} />
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

        <Environment blur={0.85}>
          <Lightformer intensity={2.2} color="#9dffe0" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={2.8} color="#56e6b2" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={2.4} color="#c9ffe9" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={1.4} color="#1b8d65" position={[0, 2, -2]} rotation={[0, 0, 0]} scale={[60, 0.4, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}
