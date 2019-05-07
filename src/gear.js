import * as THREE from "three";

function carToPol(x, y) {
	// returns r / 'radius' (distance to origin)
	// and w (angle from x axis - in RADIANS!!)
	return {
		r: Math.sqrt(x*x + y*y),
		w: Math.atan2(y,x)
	}
}

function polToCar(r, w) {
	return {
		x: r * Math.cos(w),
		y: r * Math.sin(w)
	}
}

export function generateGearShape(teeth, mod, pressureAngle) {
	const shape = new THREE.Shape();
	const pitchCircleDiameter = mod * teeth;
	const baseRadius = pitchCircleDiameter/2;
	const addendum = 1;
	const dedendum = 1;
	const toothSlope = 0.1;
	const pitchAngle = 2 * Math.PI / teeth;
	const toothThicknessAngle = pitchAngle * 0.5;
	let pt;
	shape.moveTo(baseRadius, 0);


	for (var i = 0; i < teeth; i++) {
		// tooth sloping out (TODO: involute curve instead of line)
		pt = polToCar(baseRadius + addendum, i * pitchAngle + toothSlope);
		shape.lineTo(pt.x, pt.y);

		// tooth outside edge:
		shape.absarc(0, 0, baseRadius + addendum,
			i * pitchAngle + toothSlope,
			i * pitchAngle + toothThicknessAngle - toothSlope
			);

		// tooth sloping back in:
		pt = polToCar(baseRadius, i * pitchAngle + toothThicknessAngle);
		shape.lineTo(pt.x, pt.y);

		// filling out rest of arc til next tooth:
		let nextStart = polToCar(baseRadius, (i + 1) * pitchAngle);
		
		// let rootClearanceCircleCentre = {
		// 	x: (nextStart.x + pt.x)/2,
		// 	y: (nextStart.y + pt.y)/2
		// };
		let rootClearanceCircleCentre = 
		shape.arc()
		// shape.absarc(0, 0, baseRadius,
		// 	i * pitchAngle + toothThicknessAngle,
		// 	(i + 1) * pitchAngle
		// )
	}

	return shape;
}


export function addShape(shape, scene) {
	const geometry = new THREE.ShapeGeometry(shape);
	const material = new THREE.MeshBasicMaterial({ color: 0x3f4b52, opacity: 0.5 });
	const mesh = new THREE.Mesh( geometry, material );
	return scene.add(mesh);
}