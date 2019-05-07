function generateGear() {
	const baseRadius = 5;
	const shape = new THREE.Shape();
	shape.moveTo(baseRadius, 0);
	// shape.lineTo(baseRadius, 0);
	// shape.lineTo(1,1);
	// shape.lineTo(1,0);
	// shape.lineTo(0,0);
	return shape;
}


InvoluteCurve = THREE.Curve.create(
	function() {},
	function(t) {
		// default 0 < t < 1
		t += 0.01;
		return new THREE.Vector2(
			5 * (Math.cos(t) + t * Math.sin(t)),
			5 * (Math.sin(t) - t * Math.cos(t))
		)
	} 
);

function addShape(shape, scene) {
	const geometry = new THREE.ShapeGeometry(shape);
	const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	const mesh = new THREE.Mesh( geometry, material )
	return scene.add(mesh);
}