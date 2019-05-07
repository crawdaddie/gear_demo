import * as THREE from "three";

import { generateGearShape, generateInvoluteCurve, Gear, System, addShape } from "./gear";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000 )

const renderer = new THREE.WebGLRenderer({ antialias: true})
renderer.setClearColor( 0xffffff, 1);
camera.position.z = 50;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
window.addEventListener( 'resize', () => {
	let width = window.innerWidth
	let height = window.innerHeight
	renderer.setSize( width, height )
	camera.aspect = width / height
	camera.updateProjectionMatrix()
})
// system of gears should all have the same module

const system = new System(3);
system.add({ teeth: 9 });
system.add({ teeth: 10 });
system.add({ teeth: 14 });
system.add({ teeth: 11 });

system.gears.forEach(gear => {
	scene.add(gear.mesh);
	gear.x -= 25;
});


// const shape = new THREE.Shape();

// let involutePoints1 = generateInvoluteCurve(9, 15);
// let involutePoints2 = involutePoints1.map((vec) => {
// 	// reflection in ray with half pitch angle
// 	return new THREE.Vector2(
// 		Math.cos(1) * vec.x + Math.sin(1) * vec.y,
// 		Math.sin(1) * vec.x - Math.cos(1) * vec.y
// 	)
// });

// const involuteCurve = involutePoints1.concat(involutePoints2.reverse())


// shape.moveTo(4, 0);
// shape.setFromPoints(involuteCurve);

// shape.absarc(0, 0)
// shape.lineTo(0,0)

// addShape(shape, scene);

// console.log(generateInvoluteCurve(4, 5));

function animate() {
	requestAnimationFrame( animate )
	
	system.gears.forEach((gear, i) => {
		gear.mesh.rotation.z += 0.001 * gear.rotationSpeed;
	})

	renderer.render( scene, camera )
}
animate()