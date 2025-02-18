import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const TerrarioModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(300, 300);
    containerRef.current.appendChild(renderer.domElement);

    // Create terrarium container
    const jarGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const jarMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      transmission: 0.9,
    });
    const jar = new THREE.Mesh(jarGeometry, jarMaterial);
    scene.add(jar);

    // Add plants
    const plantGeometry = new THREE.ConeGeometry(0.3, 1, 32);
    const plantMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const plant = new THREE.Mesh(plantGeometry, plantMaterial);
    plant.position.y = -0.5;
    scene.add(plant);

    // Add lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      jar.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} />;
};

export default TerrarioModel;
