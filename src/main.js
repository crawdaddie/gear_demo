import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import { Gear } from "./gear";
import { degToRad, radToDeg, randInt, randFloat } from "./math";

import * as dat from "dat.gui";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000 )



// const aspect = window.innerWidth / window.innerHeight;
// const d = 20;
// const camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
// // camera.position.set( 20, 20, 20 ); // all components equal
// camera.lookAt( scene.position ); // or the origin

const gears = new Set();
const gearControls = {
	speed: 0.005,
	system_mod: 2.1,
	addGear: function() {
		let newgear;
		if (gears.size > 0) {
			const lastGear = [...gears].pop();
			// link new gear to last gear:
			newgear = lastGear.addGear(
				randInt(11, 30),
				randFloat(-1 * Math.PI/2, Math.PI/2 )
				);
		} else {
			// create new gear
			newgear = new Gear(
				randInt(11, 30),
				this.system_mod);
		}
		addGui(newgear, `gear ${gears.size}`)
		newgear.addToScene(scene);
		gears.add(newgear);
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

const systemGui = new dat.GUI();
systemGui.add(gearControls, 'addGear');
systemGui.add(gearControls, 'speed', -0.1, 0.1);
systemGui.add(gearControls, 'system_mod', 1, 3.0)
	.onFinishChange(gearControls.changeMod);

systemGui.closed = true;

function removeFolder(parent, childFolder) {
	let newFolders = {};
	let i = 0;
	let folder;
	parent.removeFolder(childFolder);
	for (var key in parent.__folders) {
		folder = parent.__folders[key];
		folder.name = `gear ${i}`;
		newFolders[`gear ${i}`] = folder;
		i++;
	};
	parent.__folders = newFolders;
}

function addGui(gear, label) {
	let gui = systemGui.addFolder(label);
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
	gui.add(obj, 'teeth', 10, 30, 1)
		.onFinishChange(obj.changeTeeth);

	gui.add(obj, 'angle', -180, 180)
		.onFinishChange(obj.changeAngle);

	gui.add(obj, 'removeGear');

	return gui;
};




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