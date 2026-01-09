import { Gltf, useTexture, CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import { AppearanceMode, VFXEmitter, VFXParticles } from "wawa-vfx";
import useChatbot from "../hooks/useChatbot";
import { CameraManager } from "./CameraManager";
import { Character } from "./Character";
import { Cloud, Environment, Sparkles } from "@react-three/drei";


useTexture.preload("textures/star_07.png");

export const Experience = () => {
  const snowTexture = useTexture("textures/star_07.png");
  const setAppLoaded = useChatbot((state) => state.setAppLoaded);
  const cameraControls = useRef();
  const { cameraZoomed } = useChatbot();

  useEffect(() => {
    setAppLoaded();
  }, []);

  useEffect(() => {
    cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);
  return (
    <>
      {/* <CameraManager /> */}
      <CameraControls ref={cameraControls} />
      <Character rotation-y={degToRad(0)} scale={1.0} />

      <directionalLight
        position={[-3, 3, 10]}
        intensity={2.5}
        color={"white"}
        castShadow
        shadow-bias={0.005}
        shadow-mapSize-width={128}
        shadow-mapSize-height={128}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-top={25}
        shadow-camera-right={15}
        shadow-camera-bottom={-25}
        shadow-camera-left={-15}
      />
      <directionalLight
        position={[3, 3, 10]}
        intensity={1.2}
        color={"mediumpurple"}
      />
      <directionalLight position={[0, 0, -10]} intensity={9} color={"orange"} />
      <Environment preset="sunset" environmentIntensity={0.5} />
      <mesh
        position-z={-5}
        position-y={0.05}
        receiveShadow
        rotation-x={-Math.PI / 2}
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial color="#21282a" opacity={0.6} />
      </mesh>
      {/* https://sketchfab.com/3d-models/lowp-christmas-cc0-asset-pack-debacc83c8ee421ebd222969a74aca63 */}
      <Gltf
        rotation-y={degToRad(0)}
        position-y={0}
        src="models/kleeblatt_quest_home_environment.glb"
      />

      {/* <Environment files="/models/kleeblatt_quest_home_environment.glb" background ground={{ height: 5, radius: 15, scale: 100 }} /> */}

      <VFXParticles
        name="snow"
        settings={{
          nbParticles: 10000,
          gravity: [1, -3, 0],
          renderMode: "billboard",
          appearance: AppearanceMode.Circular,
          intensity: 18,
          fadeSize: [0, 0.5],
          fadeAlpha: [0, 0],
        }}
        alphaMap={snowTexture}
      />
      <VFXEmitter
        emitter="snow"
        settings={{
          duration: 2,
          nbParticles: 1000,
          loop: true,
          spawnMode: "time",
          startPositionMin: [-20, 25, -50],
          startPositionMax: [10, 20, 50],
          directionMin: [-5, 0, 5],
          directionMax: [5, -1, 5],
          particlesLifetime: [0.5, 5],
          speed: [0.1, 4],
          size: [0.01, 1],
          colorStart: ["white", "skyblue", "#fff98b"],
        }}
      />
    </>
  );
};
