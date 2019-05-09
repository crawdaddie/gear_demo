import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import { Gear } from "./gear";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000 )

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true})
renderer.setClearColor( 0xffffff, 0 );
camera.position.z = 30;

// canvas stuff

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
window.addEventListener( 'resize', () => {
	let width = window.innerWidth
	let height = window.innerHeight
	renderer.setSize( width, height )
	camera.aspect = width / height
	camera.updateProjectionMatrix()
})


// controls
const controls = new TrackballControls( camera, renderer.domElement );
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;

controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;


// lights
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
directionalLight.castShadow = true;
scene.add( directionalLight );


// gears
// mod = pitch circle diameter / teeth
// for two gears to mesh the mod must be the same
const SYSTEM_MOD = 2.1

// gears.push(new Gear(17, SYSTEM_MOD))

let gears = new Set();
let gear = new Gear(17, SYSTEM_MOD);
gear.addToScene(scene);
gears.add(gear);

gear = gear.addGear(15, 1);
gear.addToScene(scene);
gears.add(gear);


gear = gear.addGear(19, Math.PI/2);
gear.addToScene(scene);
gears.add(gear);

// gear = gear.addGear(20, Math.PI/3);
// gear.addToScene(scene);
// gears.add(gear);
// gear = gear.addGear(19, 2);
// gear.addToScene(scene);
// gears.add(gear);

// gear.driveBy(gears[gears.length() - 2].rotation)





function animate() {
	requestAnimationFrame( animate )
	
	// system.gears.forEach((gear, i) => {
	// 	gear.rotation += 0.01 * gear.rotationSpeed;
	// })
	// firstGear.rotation += 0.01;
	gears.forEach((gear, i) => {
		gear.driveBy(0.005);
	})

	// mesh.rotation.z += 0.01;
	controls.update();

	renderer.render( scene, camera )
}
animate()