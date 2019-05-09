import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import { Gear } from "./gear";

import * as dat from "dat.gui";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000 )

// dat.gui controls
const GearControls = function() {
	this.speed = 0.01;
	this.system_mod = 2.1;
};

const gearControls = new GearControls();

window.addEventListener('load', (e) => {
	const gui = new dat.GUI();
  	gui.add(gearControls, 'speed', -0.1, 0.1);
  	gui.add(gearControls, 'system_mod', 1, 3.0);
});

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


// camera controls
const cameraControls = new TrackballControls( camera, renderer.domElement );
cameraControls.rotateSpeed = 1.0;
cameraControls.zoomSpeed = 1.2;
cameraControls.panSpeed = 0.8;

cameraControls.staticMoving = true;
cameraControls.dynamicDampingFactor = 0.3;


// lights
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
directionalLight.castShadow = true;
scene.add( directionalLight );


// gears
// mod = pitch circle diameter / teeth
// for two gears to mesh the mod must be the same, so we use global system mod from 
// gear controls
let gears = new Set();
let gear = new Gear(17, gearControls.system_mod);
gear.addToScene(scene);
gears.add(gear);

gear = gear.addGear(15, 1);
gear.addToScene(scene);
gears.add(gear);

gear = gear.addGear(19, Math.PI/2);
gear.addToScene(scene);
gears.add(gear);


function animate() {
	requestAnimationFrame( animate )

	gears.forEach((gear, i) => {
		gear.driveBy(gearControls.speed);
	})

	cameraControls.update();
	renderer.render( scene, camera )
}
animate()