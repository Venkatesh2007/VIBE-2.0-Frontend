// import { useAnimations, useGLTF } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { MeshPhysicalMaterial } from "three";
// import { lerp, randInt } from "three/src/math/MathUtils.js";
// import { VISEMES } from "wawa-lipsync";
// import useChatbot from "../hooks/useChatbot";
// import { useRef } from "react";

// export const Character = ({ ...props }) => {
//   const { scene } = useGLTF("models/modernGirl.glb");

//   const { animations } = useGLTF("/models/animations.glb");

//   const group = useRef();
//   const { actions, mixer } = useAnimations(animations, group);

//   // const { actions, mixer } = useAnimations(animations, scene);
//   const lipsyncManager = useChatbot((state) => state.lipsyncManager);

//   useEffect(() => {
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         child.castShadow = true;
//         child.receiveShadow = false;
//         child.frustumCulled = false;
//         child.material = new MeshPhysicalMaterial({
//           ...child.material,
//           roughness: 1,
//           ior: 2.2,
//           iridescence: 0.7,
//           iridescenceIOR: 1.3,
//           reflectivity: 1,
//         });
//       }
//     });
//   }, [scene]);

//   const status = useChatbot((state) => state.status);
//   const [animation, setAnimation] = useState(
//     animations.find((a) => a.name === "Idle") ? "Idle" : animations[0].name // Check if Idle animation exists otherwise use first animation
//   );
//   useEffect(() => {
//     const action = {
//       playing: ["Talking", "Talking 2 ", "Talking 3"][randInt(0, 2)],
//       loading: "Thinking",
//       idle: "Idle",
//     }[status];

//     setAnimation(action);
//   }, [actions, status]);

//   useEffect(() => {
//     if (mixer.time < 0.01) {
//       actions[animation]?.reset().play();
//     } else {
//       actions[animation]?.reset().fadeIn(0.5).play();
//     }
//     return () => {
//       actions[animation]?.fadeOut(0.5);
//     };
//   }, [animation, actions]);

//   // Blend Shapes
//   const avatarSkinnedMeshes = useMemo(() => {
//     const skinnedMeshes = [];
//     scene.traverse((child) => {
//       if (child.isSkinnedMesh) {
//         skinnedMeshes.push(child);
//       }
//     });
//     return skinnedMeshes;
//   }, [scene]);

//   const lerpMorphTarget = useCallback(
//     (target, value, speed = 0.1) => {
//       avatarSkinnedMeshes.forEach((skinnedMesh) => {
//         if (!skinnedMesh.morphTargetDictionary) {
//           return;
//         }
//         const morphIndex = skinnedMesh.morphTargetDictionary[target];
//         if (morphIndex !== undefined) {
//           const currentValue = skinnedMesh.morphTargetInfluences[morphIndex];
//           skinnedMesh.morphTargetInfluences[morphIndex] = lerp(
//             currentValue,
//             value,
//             speed
//           );
//         }
//       });
//     },
//     [avatarSkinnedMeshes]
//   );

//   const [blink, setBlink] = useState(false);

//   useEffect(() => {
//     let blinkTimeout;
//     const nextBlink = () => {
//       blinkTimeout = setTimeout(() => {
//         setBlink(true);
//         setTimeout(() => {
//           setBlink(false);
//           nextBlink();
//         }, 150);
//       }, randInt(1000, 5000));
//     };
//     nextBlink();
//     return () => clearTimeout(blinkTimeout);
//   }, []);

//   useFrame(() => {
//     lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
//     lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);
//     if (lipsyncManager) {
//       lipsyncManager.processAudio();
//       const currentViseme = lipsyncManager.viseme;
//       Object.values(VISEMES).forEach((viseme) => {
//         lerpMorphTarget(viseme, viseme === currentViseme ? 1 : 0, 0.2);
//       });
//     }
//   });

//   return (
//     <group {...props}>
//       <primitive object={scene} />
//     </group>
//   );
// };

// useGLTF.preload("models/modernGirl.glb");
// useGLTF.preload("models/animations.glb");


import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { MeshPhysicalMaterial } from "three";
import * as THREE from "three";
import { lerp, randInt } from "three/src/math/MathUtils.js";
import { VISEMES } from "wawa-lipsync";
import useChatbot from "../hooks/useChatbot";

// 1. Re-include your expression mapping
// const facialExpressions = {
//   default: { mouthDimpleLeft: 0.18, mouthDimpleRight: 0.25, mouthSmileLeft: 0.17, mouthSmileRight: 0.22 },
//   smile: { browInnerUp: 0.17, eyeSquintLeft: 0.4, eyeSquintRight: 0.44, noseSneerLeft: 0.17, noseSneerRight: 0.14, mouthPressLeft: 1, mouthPressRight: 1 },
//   funnyFace: { mouthPucker: 0.33, mouthShrugUpper: 0.74, cheekPuff: 0.74, jawOpen: 0.03, mouthSmileLeft: 0.39, mouthSmileRight: 0.38 },
//   sad: { mouthFrownLeft: 1, mouthFrownRight: 1, mouthShrugLower: 0.78, browInnerUp: 0.45, eyeSquintLeft: 0.72, eyeSquintRight: 0.75, eyeLookDownLeft: 0.5, eyeLookDownRight: 0.5, jawForward: 1 },
//   surprised: { browInnerUp: 0.42, eyeWideLeft: 0.51, eyeWideRight: 0.5, jawOpen: 0.27, mouthFunnel: 0.16, mouthDimpleLeft: 1, mouthDimpleRight: 1 },
//   angry: { browDownLeft: 1, browDownRight: 1, eyeSquintLeft: 1, eyeSquintRight: 1, jawForward: 1, mouthPucker: 0.17, mouthShrugLower: 0.49, noseSneerLeft: 1, noseSneerRight: 0.42, cheekSquintLeft: 1, cheekSquintRight: 1 },
//   crazy: { browInnerUp: 0.9, jawForward: 1, noseSneerLeft: 0.57, noseSneerRight: 0.51, eyeLookInLeft: 0.96, eyeLookInRight: 0.96, jawOpen: 0.96, mouthDimpleLeft: 0.96, mouthDimpleRight: 0.96, mouthSmileLeft: 0.55, mouthSmileRight: 0.38, tongueOut: 0.96 },
// };

const facialExpressions = {
  default: { 
    mouthDimpleLeft: 0.12, 
    mouthDimpleRight: 0.12, 
    mouthSmileLeft: 0.05, 
    mouthSmileRight: 0.05 
  },
  smile: { 
    eyeSquintLeft: 0.25, 
    eyeSquintRight: 0.25, 
    mouthSmileLeft: 0.45, 
    mouthSmileRight: 0.45, 
    mouthDimpleLeft: 0.3, 
    mouthDimpleRight: 0.3,
    cheekSquintLeft: 0.2,
    cheekSquintRight: 0.2
  },
  funnyFace: { 
    mouthPucker: 0.45, 
    noseSneerLeft: 0.6, 
    eyeLookInLeft: 0.3, 
    eyeLookInRight: 0.3, 
    jawLeft: 0.2, 
    mouthLeft: 0.2 
  },
  sad: { 
    mouthFrownLeft: 0.6, 
    mouthFrownRight: 0.6, 
    browInnerUp: 0.4, 
    browOuterDownLeft: 0.3,
    browOuterDownRight: 0.3,
    eyeLookDownLeft: 0.3, 
    eyeLookDownRight: 0.3,
    mouthShrugLower: 0.4
  },
  surprised: { 
    browInnerUp: 0.7, 
    eyeWideLeft: 0.6, 
    eyeWideRight: 0.6, 
    jawOpen: 0.2, 
    mouthFunnel: 0.3 
  },
  angry: { 
    browDownLeft: 0.8, 
    browDownRight: 0.8, 
    eyeSquintLeft: 0.5, 
    eyeSquintRight: 0.5, 
    noseSneerLeft: 0.7, 
    noseSneerRight: 0.7, 
    mouthTightenerLeft: 0.5, 
    mouthTightenerRight: 0.5,
    jawForward: 0.3 
  },
  crazy: { 
    browInnerUp: 0.8, 
    eyeWideLeft: 0.7, 
    eyeWideRight: 0.1, // Asymmetric eyes look "crazier"
    jawOpen: 0.5, 
    tongueOut: 0.8, 
    mouthStretchLeft: 0.4, 
    mouthStretchRight: 0.4 
  },
};

export const Character = ({ ...props }) => {
  const { scene, nodes } = useGLTF("models/modernGirl.glb");
  const { animations } = useGLTF("/models/animations.glb");
  const group = useRef();

  // Connect to Zustand
  const lipsyncManager = useChatbot((state) => state.lipsyncManager);
  const messages = useChatbot((state) => state.messages);
  const status = useChatbot((state) => state.status);

  const { actions } = useAnimations(animations, group);

  // useEffect(() => {
  //   console.log("Available animations:", Object.keys(actions));
  // }, [actions]);

  // State for current animation and expression
  const [animation, setAnimation] = useState("Idle");
  const [facialExpression, setFacialExpression] = useState("default");

  // 2. Watch for the latest message to trigger Animation and Expression
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.sender === "bot") {
      if (latestMessage.animation) setAnimation(latestMessage.animation);
      if (latestMessage.facialExpression) setFacialExpression(latestMessage.facialExpression);
    }
  }, [messages]);

  // 3. Fallback logic for loading/idle states
  useEffect(() => {
    if (status === "loading") {
      setAnimation("Idle"); // Changed from "idle" to "Idle"
      setFacialExpression("default");
    } else if (status === "Idle") {
      setAnimation("Idle");
      setFacialExpression("default");
    }
  }, [status]);

  // 4. Handle Animation Playback
  useEffect(() => {
    // Fallback to "Idle" if the requested animation doesn't exist in actions
    const actionName = actions[animation] ? animation : "Idle";
    const action = actions[actionName];

    if (action) {
      action.reset().fadeIn(0.5).play();
      return () => action.fadeOut(0.5);
    }
  }, [animation, actions]);

  // Blend Shape Setup
  const avatarSkinnedMeshes = useMemo(() => {
    const meshes = [];
    scene.traverse((child) => { if (child.isSkinnedMesh) meshes.push(child); });
    return meshes;
  }, [scene]);

  const lerpMorphTarget = useCallback((target, value, speed = 0.1) => {
    avatarSkinnedMeshes.forEach((mesh) => {
      const index = mesh.morphTargetDictionary?.[target];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences[index], value, speed
        );
      }
    });
  }, [avatarSkinnedMeshes]);

  const [blink, setBlink] = useState(false);

  // 5. Blinking & Face Frame Loop
  useFrame(() => {
    // Blinking
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    // Facial Expressions
    const mapping = facialExpressions[facialExpression] || facialExpressions.default;

    // We get all possible morph targets from the main mesh
    const targetMesh = nodes.Wolf3D_Avatar || avatarSkinnedMeshes[0];
    if (targetMesh && targetMesh.morphTargetDictionary) {
      Object.keys(targetMesh.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;

        const targetValue = mapping[key] || 0;
        lerpMorphTarget(key, targetValue, 0.1);
      });
    }

    // Lipsync (Real-time from Manager)
    if (lipsyncManager && status === "playing") {
      lipsyncManager.processAudio();
      const currentViseme = lipsyncManager.viseme;
      Object.values(VISEMES).forEach((viseme) => {
        lerpMorphTarget(viseme, viseme === currentViseme ? 1 : 0, 0.25);
      });
    } else {
      // Close mouth when not playing
      Object.values(VISEMES).forEach((viseme) => lerpMorphTarget(viseme, 0, 0.1));
    }
  });

  // Blink Interval
  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); nextBlink(); }, 150);
      }, randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload("models/modernGirl.glb");
useGLTF.preload("models/animations.glb");