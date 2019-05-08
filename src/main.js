import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import { generateGearShape, generateInvoluteCurve, Gear, System, addShape } from "./gear";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000 )



const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true})

renderer.setClearColor( 0xffffff, 0 );
// const backgroundPlane = new THREE.PlaneBufferGeometry(2 * window.innerWidth, 2 * window.innerHeight);
// const texture = new THREE.TextureLoader().load( "../static/images/gearhead.jpg");
// texture.wrapS = THREE.RepeatWrapping;
// texture.wrapT = THREE.RepeatWrapping;
// texture.repeat.set( 4, 4 );
// const planeMaterial = new THREE.MeshLambertMaterial({ map: texture });
// const plane = new THREE.Mesh(backgroundPlane, planeMaterial);
// plane.receiveShadow = true;
// scene.add(plane);

camera.position.z = 30;



renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
window.addEventListener( 'resize', () => {
	let width = window.innerWidth
	let height = window.innerHeight
	renderer.setSize( width, height )
	camera.aspect = width / height
	camera.updateProjectionMatrix()
})



const controls = new TrackballControls( camera, renderer.domElement );
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;



controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;


const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
directionalLight.castShadow = true;
scene.add( directionalLight );
// const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.2 );
// scene.add( ambientLight );




// system of gears should all have the same module
const system = new System(4);
system.add({ teeth: 12 });
system.add({ teeth: 8 });
// system.add({ teeth: 14 });
system.add({ teeth: 5 });

system.gears.forEach(gear => {
	// scene.add(gear.mesh);
	gear.addToScene(scene)
	gear.mesh.position.x -= 30;
});

function animate() {
	requestAnimationFrame( animate )
	
	system.gears.forEach((gear, i) => {
		gear.mesh.rotation.z += 0.01 * gear.rotationSpeed;
	})

	// mesh.rotation.z += 0.01;
	controls.update();

	renderer.render( scene, camera )
}
animate()