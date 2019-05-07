import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
const renderer = new THREE.WebGLRenderer({ antialias: true})

function choose(arr) {
	const i = Math.floor(Math.random() * arr.length);
	return arr[i];
}

renderer.setSize( window.innerWidth, window.innerHeight )
// sets renderer background color
let color = new THREE.Color(0,0,0);
renderer.setClearColor( color )
document.body.appendChild( renderer.domElement )
camera.position.z = 5

// resize canvas on resize window
window.addEventListener( 'resize', () => {
	let width = window.innerWidth
	let height = window.innerHeight
	renderer.setSize( width, height )
	camera.aspect = width / height
	camera.updateProjectionMatrix()
})

// basic cube
const geometry = new THREE.BoxGeometry( 1, 1, 1)
const material = new THREE.MeshStandardMaterial( { color: 0xff0051, flatShading: true, metalness: 0, roughness: 1 })
const cube = new THREE.Mesh ( geometry, material )
scene.add( cube )

// wireframe cube
const wf_geometry = new THREE.BoxGeometry( 3, 3, 3)
const wf_material = new THREE.MeshBasicMaterial( {
	color: "#dadada", wireframe: true, transparent: true
})
const wireframeCube = new THREE.Mesh ( wf_geometry, wf_material )
scene.add( wireframeCube )

// ambient light
const ambientLight = new THREE.AmbientLight ( 0xffffff, 0.2)
scene.add( ambientLight )

// point light
const pointLight = new THREE.PointLight( 0xffffff, 1 );
pointLight.position.set( 25, 50, 25 );
scene.add( pointLight );


function animate() {
	requestAnimationFrame( animate )
	cube.rotation.x += 0.04;
	cube.rotation.z += 0.04;
	wireframeCube.rotation.x -= 0.01;
	wireframeCube.rotation.y -= 0.01;
	color.r = Math.max(0, color.r + 0.01 * choose([1, -1]));
	color.g = Math.max(0, color.g + 0.01 * choose([1, -1]));
	color.b = Math.max(0, color.b + 0.01 * choose([1, -1]));
	// color = color;
	renderer.setClearColor(color);
	renderer.render( scene, camera )
}
animate()