const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
const renderer = new THREE.WebGLRenderer({ antialias: true})
renderer.setClearColor( 0xffffff, 1);
camera.position.z = 20

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
window.addEventListener( 'resize', () => {
	let width = window.innerWidth
	let height = window.innerHeight
	renderer.setSize( width, height )
	camera.aspect = width / height
	camera.updateProjectionMatrix()
})


// const gear = generateGear();
// addShape(gear, scene);
// scene.add(gearMesh);
var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
var geometry = new THREE.Geometry();
geometry.vertices.push(new THREE.Vector3(-10,0,0));
geometry.vertices.push(new THREE.Vector3(0,10,0));
geometry.vertices.push(new THREE.Vector3(10,0,0));
var line = new THREE.Line( geometry, material)

scene.add( line )

function animate() {
	requestAnimationFrame( animate )
	renderer.render( scene, camera )
}
animate()