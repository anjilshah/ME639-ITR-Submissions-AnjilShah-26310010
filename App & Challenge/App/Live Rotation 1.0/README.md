# Rotation Orbit — Aircraft Spatial Frame

Interactive Three.js browser dashboard for visualizing an aircraft/body frame relative to a fixed ground/reference frame.

## Library chosen

The project uses **Three.js 0.176.0** as its 3D graphics library, loaded as an ES module from jsDelivr. It also uses Three.js **OrbitControls** for camera orbit/zoom.

## New spatial behavior

- Ground frame stays fixed at the world origin.
- Aircraft/body frame is rotatable.
- Aircraft is now a visible 3D aircraft model.
- Drag the aircraft in the spatial view to translate its origin in a camera-facing arbitrary plane.
- Translation is **not locked to ground X, Y, or Z axes**.
- Aircraft orientation remains controlled by roll, pitch, yaw, joystick, dials, and direct XYZ entry.
- Dashed line shows the aircraft-origin to ground-origin relationship.
- Live rotation matrix and orthogonality checks remain available.

## Run

Because the project uses JavaScript ES modules, run it from a local server:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Main controls

- Drag aircraft: free translation in an arbitrary plane (the plane follows the current camera view).
- Right-drag / wheel: orbit and zoom the camera.
- 3D attitude joystick: yaw/pitch.
- Roll buttons and dials: roll/pitch/yaw precision.
- Direct X/Y/Z inputs: exact orientation angles.
- Reset: returns aircraft position and orientation to the initial state.
