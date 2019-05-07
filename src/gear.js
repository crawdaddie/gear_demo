import * as THREE from "three";

const INVOLUTE_STEP = 0.001;
const ORIGIN_VEC2 = new THREE.Vector2(0, 0);

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
		x: r * Math.cos(w),
		y: r * Math.sin(w)
	}
}

function degToRad(angle) {
	return angle * Math.PI / 180;
}


function involutePoint(t, baseRadius) {
	return new THREE.Vector2(
		baseRadius * (Math.cos(t) + t * Math.sin(t)),
		baseRadius * (Math.sin(t) - t * Math.cos(t))
	)	
}

export function generateInvoluteCurve(baseRadius, maxRadius) {
	const endPointParam = Math.sqrt((maxRadius ** 2 / baseRadius ** 2) - 1 );
	let pointsArray = [];
	let t = 0;
	let point = involutePoint(t, baseRadius);
	while ( point.length() < maxRadius) {
		point = involutePoint(t, baseRadius);
		pointsArray.push(point);
		t += INVOLUTE_STEP;
	};

	point = involutePoint(endPointParam, baseRadius);
	pointsArray.push(point);
	return pointsArray;
}

export function	generateGearShape(teeth, mod, pressureAngleDeg = 20) {

	const shape = new THREE.Shape();


	const toothSlope = 0.05;
	const pitchAngle = 2 * Math.PI / teeth;
	const toothThicknessAngle = pitchAngle * 0.5;


	// printing gear info:
	const pitchCircleDiameter = mod * teeth;
	const pitchCircleRadius = pitchCircleDiameter / 2;
	const baseCircleDiameter = pitchCircleDiameter * Math.cos(degToRad(pressureAngleDeg));
	const addendum = mod;
	const dedendum = 1.25 * mod; 
	const toothDepth = 2.25 * mod;
	const tipDiameter = pitchCircleDiameter + addendum;
	const tipRadius = tipDiameter / 2;
	const rootDiameter = pitchCircleDiameter - 2.5 * mod;
	const rootRadius = rootDiameter / 2;
		
	const baseCircleRadius = baseCircleDiameter / 2;

	let pt;

	// generate involute curve segments

	const involutePoints1 = generateInvoluteCurve(baseCircleRadius, tipRadius);
	const involutePoints2 = involutePoints1.map((vec) => {
		// reflection in ray with theta half pitch angle
		return new THREE.Vector2(
			Math.cos(pitchAngle / 2) * vec.x + Math.sin(pitchAngle / 2) * vec.y,
			Math.sin(pitchAngle / 2) * vec.x - Math.cos(pitchAngle / 2) * vec.y
		)
	});

	const involutePoints = involutePoints1.concat(involutePoints2.reverse());

	shape.moveTo(baseCircleRadius, 0);

	for (var i = 0; i < teeth; i++) {
		// tooth sloping out (TODO: involute curve instead of line)
		// involute curve should start at baseCircle - move to pitchCircle
		// shape.setFromPoints(involutePoints.map((vec) => {
		// 	return vec.rotateAround(ORIGIN_VEC2, i * pitchAngle)
		// }))

		// .forEach((vec) => {
		// 	shape.lineTo(vec.x, vec.y)
		// });

		shape.setFromPoints(involutePoints.map(vec => {
			return vec.rotateAround(ORIGIN_VEC2, i * pitchAngle)
		}));
		// involutePoints.map(vec => {
		// 	return vec.rotateAround(ORIGIN_VEC2, i * pitchAngle)
		// }).forEach(vec => {
		// 	shape.lineTo(vec.x, vec.y)
		// });

		// pt = polToCar()
		// shape.setFromPoints()

		
		// pt = polToCar(pitchCircleRadius, i * pitchAngle);
		// shape.lineTo(pt.x, pt.y);

		// pt = polToCar(pitchCircleRadius + addendum, i * pitchAngle + toothSlope);
		// shape.lineTo(pt.x, pt.y);

		// // ---------------------------------




		// // tooth outside edge:
		// shape.absarc(0, 0, pitchCircleRadius + addendum,
		// 	i * pitchAngle + toothSlope,
		// 	i * pitchAngle + toothThicknessAngle - toothSlope
		// 	);

		// // // tooth sloping back in:
		// pt = polToCar(pitchCircleRadius, i * pitchAngle + toothThicknessAngle);
		// shape.lineTo(pt.x, pt.y);

		// pt = polToCar(baseCircleRadius, i * pitchAngle + toothThicknessAngle);
		// shape.lineTo(pt.x, pt.y);

		pt = polToCar(rootRadius, i * pitchAngle + toothThicknessAngle);
		shape.lineTo(pt.x, pt.y);

		shape.absarc(0, 0, rootRadius,
			i * pitchAngle + toothThicknessAngle,
			(i + 1) * pitchAngle
			);

		pt = polToCar(baseCircleRadius, (i + 1) * pitchAngle)
		shape.lineTo(pt.x, pt.y);
	}

	return shape;
};

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
	
	constructor(teeth, mod = 0.7, pressureAngle = 20, x = 0, y = 0, pinion) {
		const shape = generateGearShape(teeth, mod, pressureAngle);
		const geometry = new THREE.ShapeBufferGeometry(shape);
		const material = new THREE.MeshBasicMaterial({
			// wireframe: true,
			color: Math.random() * 0xffffff,
			opacity: 0.2 });
		const mesh = new THREE.Mesh( geometry, material );
		
		this._teeth = teeth;
		this._mod = mod;
		this._pressureAngle = pressureAngle;
		this._x = x;
		this._y = y;
		this.shape = shape;
		this.mesh = mesh;
		
		this.mesh.position.x = this._x;
		this.mesh.position.y = this._y;
		this.pinion = pinion;
		this.linkedGears = new Set();
		if (pinion) {
			this.rotationSpeed = -1 * pinion.rotationSpeed * pinion.teeth / this._teeth; 
			// initial rotation
			this.mesh.rotation.z = pinion.mesh.rotation.z + Math.PI;
		} else {
			this.rotationSpeed = 1;
			// this.mesh.rotation.z = -2 * Math.PI / this._teeth;
		}
		// scene.add(mesh);
		// this.centre = new THREE.Vector2
	}

	resetShape() {
		this.shape = generateGearShape(this._teeth, this._mod, this._pressureAngle);
		this.mesh.position.x = this._x;
		this.mesh.position.y = this._y;
	}

	get teeth() {
		return this._teeth;
	}

	set teeth(newTeeth) {
		this._teeth = newTeeth;
		this.resetShape();
	}

	get mod() {
		return this._mod;
	}

	set mod(newMod) {
		this._mod = newMod;
		this.resetShape();	}

	get pressureAngle() {
		return this._pressureAngle;
	}

	set pressureAngle(newPressureAngle) {
		this._pressureAngle = newPressureAngle;
		this.resetShape();
	}

	get x() {
		return this._x;
	}

	set x(newX) {
		this._x = newX;
		this.resetShape();
	}

	get y() {
		return this._x;
	}

	set y(newY) {
		this._y = newY;
		this.resetShape();
	}

}


export function addShape(shape, scene) {
	const geometry = new THREE.ShapeGeometry(shape);
	const material = new THREE.MeshBasicMaterial({ color: 0x3f4b52, opacity: 0.5 });
	const mesh = new THREE.Mesh( geometry, material );
	scene.add(mesh);
	return mesh;
}