import { Suspense, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, Decal, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Shirt({ designUrl, color }: { designUrl: string; color: string }) {
    // Model URL - trying a different common one or just handling the failure
    const gltfUrl = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/t-shirt/model.gltf";

    const { nodes, materials } = useGLTF(gltfUrl) as any;
    const texture = useLoader(THREE.TextureLoader, designUrl);

    return (
        <group>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.T_Shirt_male.geometry}
                material={materials.lambert1}
                material-color={color}
                dispose={null}
            >
                <Decal
                    position={[0, 0.04, 0.15]}
                    rotation={[0, 0, 0]}
                    scale={0.15}
                    map={texture}
                />
            </mesh>
        </group>
    );
}

interface TShirtModelProps {
    designUrl: string;
    color?: string;
}

export function TShirtModel({ designUrl, color = "white" }: TShirtModelProps) {
    const [hasError, setHasError] = useState(false);

    return (
        <div className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing flex flex-col items-center justify-center">
            {hasError ? (
                <div className="text-center space-y-4">
                    <div className="w-24 h-32 bg-gray-100 rounded-lg mx-auto animate-pulse flex items-center justify-center">
                        <span className="text-[10px] font-black opacity-20 italic">3D</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Waiting for 3D Asset</p>
                </div>
            ) : (
                <Canvas shadows camera={{ position: [0, 0, 2], fov: 25 }} onError={() => setHasError(true)}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={0.6}>
                            <Shirt designUrl={designUrl} color={color} />
                        </Stage>
                    </Suspense>
                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        minPolarAngle={Math.PI / 2.2}
                        maxPolarAngle={Math.PI / 2.2}
                    />
                    <ContactShadows position={[0, -0.8, 0]} opacity={0.25} scale={10} blur={1.5} far={0.8} />
                </Canvas>
            )}
        </div>
    );
}
