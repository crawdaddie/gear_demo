import * as dat from "dat.gui";

export function removeFolder(parent, childFolder) {
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

export function addSystemGui(obj, gui) {
	gui.add(obj, 'addGear');
	gui.add(obj, 'speed', -0.1, 0.1);
	gui.add(obj, 'system_mod', 1, 3.0);
	gui.onFinishChange(obj.changeMod);
	gui.closed = true;
	return gui;
}

export function addGearGui(obj, parent, label) {
	let gui = parent.addFolder(label);
	gui.add(obj, 'teeth', 10, 30, 1)
		.onFinishChange(obj.changeTeeth);

	gui.add(obj, 'angle', -180, 180)
		.onFinishChange(obj.changeAngle);

	gui.add(obj, 'removeGear');

	return gui;
};
