import * as THREE from "three";

const INVOLUTE_STEP = 0.05;
const ORIGIN_VEC2 = new THREE.Vector2(0, 0);
const PI = Math.PI;
const cos = Math.cos;
const sin = Math.sin;
const sqrt = Math.sqrt;
const atan2 = Math.atan2;

// math conversion utils
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
		x: r * cos(w),
		y: r * sin(w)
	}
}

function degToRad(angle) {
	return angle * PI / 180;
}


function involutePoint(t, baseRadius) {
	return new THREE.Vector2(
		baseRadius * (cos(t) + t * sin(t)),
		baseRadius * (sin(t) - t * cos(t))
	)	
}

function generateInvoluteCurve(baseRadius, maxRadius, step = INVOLUTE_STEP) {
	const endPointParam = sqrt((maxRadius ** 2 / baseRadius ** 2) - 1 );
	let pointsArray = [];
	let t = 0;
	let point = involutePoint(t, baseRadius);
	while ( point.length() < maxRadius) {
		point = involutePoint(t, baseRadius);
		pointsArray.push(point);
		t += step;
	};

	point = involutePoint(endPointParam, baseRadius);
	pointsArray.push(point);
	return pointsArray;
}

function rotateVec2Array(array, angle, origin = ORIGIN_VEC2) {
	return array.map(vec => vec.rotateAround(origin, angle)) 
}

function rotateShape(shape, rotationAngle) {
	if (rotationAngle % (2 * PI) == 0) {
		return shape
	} else {
		return new THREE.Shape(rotateVec2Array(shape.getPoints(), rotationAngle));
	}
}

function reflectVec2Array(array, angle) {
	// reflect array of vec2 in ray which makes angle with x-axis
	return array.map((vec) => {
		return new THREE.Vector2(
			cos(2 * angle) * vec.x + sin(2 * angle) * vec.y,
			sin(2 * angle) * vec.x - cos(2 * angle) * vec.y	
		)
	})
}

function generateGearSegment(pitchAngle, baseRadius, maxRadius, minRadius, alpha) {
	
	const involutePoints1 = generateInvoluteCurve(baseRadius, maxRadius);
	// const involutePoints2 = reflectVec2Array(involutePoints1, 1.045 * pitchAngle / 4);
	const involutePoints2 = reflectVec2Array(involutePoints1, pitchAngle / 4 + alpha);
	
	const involuteToothProfile = involutePoints1.concat(involutePoints2.reverse());

	const segmentShape = new THREE.Shape();
	segmentShape.moveTo(baseRadius, 0);
	segmentShape.setFromPoints(involuteToothProfile);
	// TODO: add circular cutout
	let pt = polToCar(minRadius, pitchAngle * 0.5 + 2 * alpha);
	// let pt2 = polToCar(minRadius, pitchAngle - alpha);
	segmentShape.lineTo(pt.x, pt.y);

	pt = polToCar(minRadius, pitchAngle)
	segmentShape.lineTo(pt.x, pt.y);
	segmentShape.lineTo(0,0);
	return segmentShape;
}

function generateGearShape(teeth, mod, pressureAngleDeg = 20) {
	const pressureAngle = degToRad(pressureAngleDeg);
	const pitchAngle = 2 * PI / teeth;
	const pitchCircleRadius = mod * teeth / 2;
	const baseCircleRadius = pitchCircleRadius * cos(pressureAngle);
	const addendum = mod;
	const dedendum = 1.2 * mod;
	const maxRadius = pitchCircleRadius + addendum;
	const minRadius = pitchCircleRadius - dedendum;
	const alpha = (sqrt(pitchCircleRadius**2 - baseCircleRadius**2) / baseCircleRadius) - pressureAngle;
	// console.log(alpha);

	const segment = generateGearSegment(pitchAngle, baseCircleRadius, maxRadius, minRadius, alpha);
	let segments = [];
	for (var i = 0; i < teeth; i++) {
		segments.push(rotateShape(segment, i * pitchAngle))
	}
	return segments
}

function generateGearShapeFromParams(params) {
	const segment = generateGearSegment(params.pitchAngle, params.baseCircleRadius, params.maxRadius, params.minRadius, params.alpha);
	let segments = [];

	for (var i = 0; i < params.teeth; i++) {
		segments.push(rotateShape(segment, i * params.pitchAngle))
	}
	return segments
}

function generateGearParams(teeth, mod, pressureAngleDeg) {
	const pressureAngle = degToRad(pressureAngleDeg);
	const pitchAngle = 2 * PI / teeth;
	const pitchCircleRadius = mod * teeth / 2;
	const baseCircleRadius = pitchCircleRadius * cos(pressureAngle);
	const addendum = mod;
	const dedendum = 1.2 * mod;
	const maxRadius = pitchCircleRadius + addendum;
	const minRadius = pitchCircleRadius - dedendum;
	const alpha = (sqrt(pitchCircleRadius**2 - baseCircleRadius**2) / baseCircleRadius) - pressureAngle;
	return {
		pressureAngle: pressureAngle,
		pitchAngle: pitchAngle,
		pitchCircleRadius: pitchCircleRadius,
		baseCircleRadius: baseCircleRadius,
		addendum: addendum,
		dedendum: dedendum,
		maxRadius: maxRadius,
		minRadius: minRadius,
		alpha: alpha
	}
}

export class System {
	/**
	 * System is responsible for positioning and making sure all gears
	 * in the system can mesh
	 **/
	constructor(mod, pressureAngle) {
		this.gears = [];
		this.mod = mod;
		this.pressureAngle = pressureAngle;
	}

	add(options) {
		const teeth = options.teeth || 11;
		let newGear;
		if (this.gears.length > 0) {
			const lastGear = this.gears[this.gears.length - 1];
			newGear = new Gear(
				teeth,
				this.mod,
				this.pressureAngle,
				lastGear.x + (this.mod * lastGear.teeth / 2) + (this.mod * teeth) / 2,
				0,
				lastGear
			);
		} else {
			newGear = new Gear(
				teeth,
				this.mod,
				this.pressureAngle,
				0, 0)
		}
		this.gears.push(newGear);
	}
}

export class Gear {
	constructor(teeth, mod = 0.7, pressureAngleDeg = 20, x = 0, y = 0, pinion) {
		const gearParams = generateGearParams(teeth, mod, pressureAngleDeg);
		// const shape = generateGearShapeFromParams(gearParams);
		const shape = generateGearShape(teeth, mod, pressureAngleDeg); 
		const geometry = new THREE.ExtrudeGeometry(shape, {
			curveSegments: 12,
			depth: 2,
			bevelEnabled: false
		});
		const material = new THREE.MeshLambertMaterial({
			// wireframe: true,
			color: Math.random() * 0xffffff,
			opacity: 1 });
		const mesh = new THREE.Mesh( geometry, material );

		this.parameters = gearParams;

		this.mesh = mesh;

		this.x = x;
		this.y = y;

		mesh.position.x = x;
		mesh.position.y = y;

		this.teeth = teeth;
		this.mod = mod;
		// this.pressureAngle = this.parameters.pressureAngle;

		this.pinion = pinion;
		this.linkedGears = new Set();
		if (pinion) {
			this.rotationSpeed = -1 * pinion.rotationSpeed * pinion.teeth / this.teeth;
			// initial rotation
			this.mesh.rotation.z = PI - this.parameters.alpha + pinion.mesh.rotation.z * this.rotationSpeed;
		} else {
			this.rotationSpeed = 1;
		}
		console.log(this);
	}

	addToScene(scene) {
		scene.add(this.mesh);
	}
}


// export class Gear2 {
	
// 	constructor(teeth, mod = 0.7, pressureAngle = 20, x = 0, y = 0, pinion) {
// 		const shape = generateGearShape(teeth, mod, pressureAngle);
// 		const geometry = new THREE.ShapeGeometry(shape);
// 		const material = new THREE.MeshBasicMaterial({
// 			// wireframe: true,
// 			color: Math.random() * 0xffffff,
// 			opacity: 0.2 });
// 		const mesh = new THREE.Mesh( geometry, material );
		
// 		this._teeth = teeth;
// 		this._mod = mod;
// 		this._pressureAngle = pressureAngle;
// 		this._x = x;
// 		this._y = y;
// 		this.shape = shape;
// 		this.mesh = mesh;
		
// 		this.mesh.position.x = this._x;
// 		this.mesh.position.y = this._y;
// 		this.pinion = pinion;
// 		this.linkedGears = new Set();
// 		if (pinion) {
// 			this.rotationSpeed = -1 * pinion.rotationSpeed * pinion.teeth / this._teeth; 
// 			// initial rotation
// 			this.mesh.rotation.z = pinion.mesh.rotation.z + PI;
// 		} else {
// 			this.rotationSpeed = 1;
// 			// this.mesh.rotation.z = -2 * Math.PI / this._teeth;
// 		}
// 		// scene.add(mesh);
// 		// this.centre = new THREE.Vector2
// 	}

// 	resetShape() {
// 		this.shape = generateGearShape(this._teeth, this._mod, this._pressureAngle);
// 		this.mesh.position.x = this._x;
// 		this.mesh.position.y = this._y;
// 	}

// 	get teeth() {
// 		return this._teeth;
// 	}

// 	set teeth(newTeeth) {
// 		this._teeth = newTeeth;
// 		this.resetShape();
// 	}

// 	get mod() {
// 		return this._mod;
// 	}

// 	set mod(newMod) {
// 		this._mod = newMod;
// 		this.resetShape();	}

// 	get pressureAngle() {
// 		return this._pressureAngle;
// 	}

// 	set pressureAngle(newPressureAngle) {
// 		this._pressureAngle = newPressureAngle;
// 		this.resetShape();
// 	}

// 	get x() {
// 		return this._x;
// 	}

// 	set x(newX) {
// 		this._x = newX;
// 		this.resetShape();
// 	}

// 	get y() {
// 		return this._x;
// 	}

// 	set y(newY) {
// 		this._y = newY;
// 		this.resetShape();
// 	}

// }
