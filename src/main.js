import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import { Gear } from "./gear";
import { degToRad, radToDeg, randInt, randFloat } from "./math";

import { removeFolder, addSystemGui, addGearGui } from "./gui";

import * as dat from "dat.gui";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000 )


const gears = new Set();
let gui = new dat.GUI();

const gearControls = {
	speed: 0.005,
	system_mod: 2.1,
	addGear: function() {
		let gear;
		let gui;
		if (gears.size > 0) {
			const lastGear = [...gears].pop();
			// link new gear to last gear:
			gear = lastGear.addGear(
				randInt(11, 30),
				randFloat(-1 * Math.PI/2, Math.PI/2 )
				);
		} else {
			// create new gear
			gear = new Gear(
				randInt(11, 30),
				this.system_mod);
		};
		const obj = {
			changeAngle: function(value) {
				gears.forEach( g => g.rotation = 0 );
				gear.angle = degToRad(value);
				// ratio unchanged
				gears.forEach( g => g.positionGear().rotateGear());
			},
			changeTeeth: function(teeth) {
				gears.forEach( g => g.rotation = 0 );
				gear.teeth = teeth;
				scene.remove(gear.mesh);
				scene.add(gear.reset());
				gears.forEach( g => g.calculateRatio().positionGear().rotateGear())
			},
			removeGear: function() {
				scene.remove(gear.mesh)
				gear.remove();
				gears.delete(gear);
				gears.forEach( g => {
					g.rotation = 0;
					g.calculateRatio().positionGear().rotateGear();
				});
				removeFolder(systemGui, gui);
			},
			angle: radToDeg(gear.angle),
			teeth: gear.teeth
		};
		gear.addToScene(scene);
		gears.add(gear);
		gui = addGearGui(obj, systemGui, `gear ${gears.size}`);
	},
	changeMod: function(value) {
		gears.forEach( gear => {
			gear.rotation = 0;
			gear.mod = value;
			scene.remove(gear.mesh);
			scene.add(gear.reset());
			gear.calculateRatio();
			gear.positionGear();
			gear.rotateGear();
		});
	}
};
addSystemGui(gearControls, gui);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true})
renderer.setClearColor( 0xffffff, 0 );
camera.position.z = 40;

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

for (var i = 0; i < 5; i++) {
	// add 5 random gears
	gearControls.addGear()
}

function animate() {
	requestAnimationFrame( animate )

	gears.forEach(gear => gear.driveBy(gearControls.speed));

	cameraControls.update();
	renderer.render( scene, camera )
}
animate()