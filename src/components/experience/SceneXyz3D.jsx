import React, { useRef, useState, useEffect, forwardRef, useMemo, useImperativeHandle } from 'react';
import { ScrollControls, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber';
import { SceneManager } from '../../managers/SceneManager.js';
import { Controls } from '../logic/Controls.jsx';
import { SceneZone } from './SceneZone.jsx';
import { ScrollWrapper } from '../helpers/ScrollWrapper.jsx';
import { PhysicsObjects } from '../logic/PhyicsObjects.jsx';
import { InteractionManager } from '../../managers/InteractionManager.js';
import { CameraManager } from '../../managers/CameraManager.js';
import { Video } from '../logic/Video';
import { generateKey } from '../../utils/BaseUtils.js';
import { Media } from '../logic/Media.jsx';


export const SceneXyz3D = (props) =>  
{
    const { camera } = useThree();
    const { scene, animations } = useGLTF(props.path);
    const { mixer, actions } = useAnimations(animations, scene);

    const controlsRef = useRef(null);
    const [ sceneManager, setSceneManager ] = useState(null);
    const [ interactionManager, setInteractionManager ] = useState(null);
    const [ cameraManager, setCameraManager ] = useState(null);


    const initializeManagers = (scroll) =>
    {
        if (sceneManager)
        {
            return;
        }

        const tempSceneManager = new SceneManager(scene, controlsRef.current, animations, actions, mixer);
        setSceneManager(tempSceneManager);

        const tempCameraManager = new CameraManager(tempSceneManager, controlsRef.current, camera);
        setCameraManager(tempCameraManager);

        const tempInteractionManager = new InteractionManager(props.setShowPopup, props.setPopupContent, tempCameraManager.goToSceneZoneByName, tempSceneManager.playAnimation, tempSceneManager.playSound);

        setInteractionManager(tempInteractionManager);
        const siteData = tempSceneManager.getSiteData();

        props.setXyzAPI({
            goToSceneZoneByIndex: tempCameraManager.goToSceneZoneByIndex,
            goToSceneZoneByName: tempCameraManager.goToSceneZoneByName,
            getSceneManager: () => { return tempSceneManager },
            getCameraManager: () => { return tempCameraManager },
            getInteractionManager: () => { return tempInteractionManager },
            getSiteData: () => { return siteData }
        })
    };

    // UseFrame hook for animations and interactions
    useFrame(() =>
    {
        if (!cameraManager) return;
        cameraManager.update();
    });


    return (
        <>
            <Controls innerRef={controlsRef} />

            <ScrollWrapper onReady={initializeManagers}>

                <primitive object={scene}>

                    {controlsRef.current
                        && sceneManager
                        && sceneManager.getSceneZones().map((object, key) => (
                            <SceneZone
                                interactionManager={interactionManager}
                                isDebugging={props.isDebugging}
                                object={object}
                                key={key}
                            />
                        ))}

                </primitive>

                {sceneManager
                    && <PhysicsObjects
                        debug={props.isDebugging}
                        sceneManager={sceneManager}
                        interactionManager={interactionManager}
                        isDebugging={props.isDebugging}
                    />
                }

                <Media sceneManager={sceneManager} interactionManager={interactionManager} />


                {props.children}

            </ScrollWrapper>
        </>
    );
};
