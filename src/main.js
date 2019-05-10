import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import { Gear, degToRad, radToDeg } from "./gear";

import * as dat from "dat.gui";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000 )


const systemGui = new dat.GUI();

const GEARS = new Set();

function addGui(gear, label) {
	let gui = systemGui.addFolder(label);
	const obj = {
		changeAngle: function(value) {
			GEARS.forEach( g => g.rotation = 0 );
			gear.angle = degToRad(value);
			GEARS.forEach( g => {
				g.positionGear();
				g.rotateGear();
			});

		},
		changeTeeth: function(teeth) {
			GEARS.forEach( g => g.rotation = 0 );
			gear.teeth = teeth;
			scene.remove(gear.mesh);
			scene.add(gear.reset());

			GEARS.forEach( g => {
				g.calculateRatio();
				g.positionGear();
				g.rotateGear();
			})
		},
		angle: radToDeg(gear.angle),
		teeth: gear.teeth
	}
	gui.add(obj, 'teeth', 10, 30, 1)
		.onFinishChange(obj.changeTeeth);

	gui.add(obj, 'angle', -180, 180)
		.onFinishChange(obj.changeAngle);

	return gui;
};

const gearControls = {
	speed: 0.005,
	system_mod: 2.1,
	addGear: function() {
		let newgear;
		if (GEARS.size > 0) {
			const lastGear = [...GEARS].pop();
			// link new gear to last gear:
			newgear = lastGear.addGear(
				Math.floor(Math.random() * 10 + 11),
				Math.random() * Math.PI - Math.PI/2 );
		} else {
			// create new gear
			newgear = new Gear(
				Math.floor(Math.random() * 10 + 11),
				this.system_mod);
		}
		addGui(newgear, `gear ${GEARS.size}`)
		newgear.addToScene(scene);
		GEARS.add(newgear);
	},
	changeMod: function(value) {
		GEARS.forEach( gear => {
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


systemGui.add(gearControls, 'addGear');
systemGui.add(gearControls, 'speed', -0.1, 0.1);
systemGui.add(gearControls, 'system_mod', 1, 3.0)
	.onFinishChange(gearControls.changeMod);

systemGui.closed = true;

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

	GEARS.forEach((gear, i) => {
		gear.driveBy(gearControls.speed);
	})

	cameraControls.update();
	renderer.render( scene, camera )
}
animate()