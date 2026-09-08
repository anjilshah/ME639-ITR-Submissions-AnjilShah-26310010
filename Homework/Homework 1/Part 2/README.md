# ME 639 – Introduction to Robotics

## Homework 1 – Part 2: Implementation & Visualization

This repository contains my implementation for Part 2 of Homework 1 for
ME 639 – Introduction to Robotics.

The work includes:

- MuJoCo rotation composition and visualization
- Numerical verification of skew-symmetric identities
- ROS 2 TF broadcasting and RViz2 visualization

---

## Problem 7 – Rotation Sandbox

The provided asymmetric-body MuJoCo model is used to demonstrate
current-frame and fixed-frame rotation composition.

### Rotation Sequence

The main experiment uses:

- Rotation 1: Z +90°
- Rotation 2: X +90°

### Experiment 1 – Current / Body Frame

The rotations are composed using right multiplication:

```text
R_new = R_old @ R_step
```

The body frame is represented by:

```text
Xb, Yb, Zb
```

### Experiment 2 – Fixed / Space Frame

The rotations are composed using left multiplication:

```text
R_new = R_step @ R_old
```

The fixed space frame is represented by:

```text
Xg, Yg, Zg
```

### Result

The two experiments produce different final orientations:

```text
R1 != R2
```

The asymmetric body makes the difference visually clear in MuJoCo.

### Demonstration Video

[Watch the Problem 7 MuJoCo Demonstration](https://youtu.be/JtrZr5Mzqf0)

### Code

```text
scripts/01_rotation_sandbox.py
```

---

## Problem 8 – Verifying the Skew-Symmetric Identities

Problem 8 numerically verifies the two identities established in
Problem 5 using a MuJoCo simulation with a time-varying angular
velocity.

### Identities Tested

```text
R(v × w) = (Rv) × (Rw)

R hat(ω) Rᵀ = hat(Rω)
```

### Simulation

The identities were checked at:

```text
5 simulated time points
5 random vector sets per time point
```

The actual rotation matrix R(t) obtained from MuJoCo was used for the
calculations.

### Numerical Results

```text
Identity 1:
R(v × w) = (Rv) × (Rw)

Maximum residual = 1.289e-15
Mean residual    = 8.201e-16


Identity 2:
R hat(ω) Rᵀ = hat(Rω)

Maximum residual = 1.156e-15
Mean residual    = 7.390e-16
```

The residuals are approximately at floating-point machine precision.

### Supporting Data

The complete numerical results are included in:

```text
scripts/problem8_residuals.csv
```

A copy of the numerical data is also available here:

[Problem 8 Numerical Results – CSV](https://drive.google.com/file/d/1OYHun3hAgnxb5r06Hdie2fAbr6YOBCAI/view?usp=sharing)

### Interpretation

The small residuals strongly support the identities numerically.
However, numerical simulation does not replace the symbolic proof.
Only a finite number of numerical cases are tested, and floating-point
arithmetic introduces small numerical errors.

### Code

```text
scripts/02_verify_skew_properties.py
```

---

## Problem 9 – Current Frame vs Fixed Frame in ROS/RViz

**Optional / Bonus Task**

Problem 9 extends the current-frame versus fixed-frame experiment to
ROS 2 using TF and RViz2.

### TF Frames

```text
world
├── space_frame
└── body_frame
```

`space_frame` represents the fixed reference frame and `body_frame`
represents the rotating body.

### Rotation Sequence

The same two rotations from Problem 7 are used:

```text
Rotation 1: Z +90°
Rotation 2: X +90°
```

### Current / Body Frame

```text
R_new = R_old @ R_step
```

### Fixed / Space Frame

```text
R_new = R_step @ R_old
```

### Live Toggle

The ROS parameter

```text
compose_frame
```

controls the composition mode.

Current frame:

```bash
ros2 param set /hw01_tf_broadcaster compose_frame current
```

Fixed frame:

```bash
ros2 param set /hw01_tf_broadcaster compose_frame fixed
```

The parameter can be changed while RViz2 is running.

### RViz2

In RViz2:

```text
Fixed Frame = space_frame
```

and add a `TF` display to visualize the frames.

### Code

```text
ros_ws/src/hw01_tf_demo/hw01_tf_demo/tf_broadcaster_node.py
```

The complete ROS 2 package is located in:

```text
ros_ws/src/hw01_tf_demo/
```

---

## Project Structure

```text
ME639-HW1-Part2-AnjilShah/
│
├── model/
│   └── asymmetric_body.xml
│
├── scripts/
│   ├── 01_rotation_sandbox.py
│   ├── 02_verify_skew_properties.py
│   ├── problem8_residuals.csv
│   └── utils.py
│
├── ros_ws/
│   ├── README.md
│   └── src/
│       └── hw01_tf_demo/
│           ├── package.xml
│           ├── setup.py
│           ├── setup.cfg
│           ├── resource/
│           │   └── hw01_tf_demo
│           └── hw01_tf_demo/
│               ├── __init__.py
│               └── tf_broadcaster_node.py
│
├── README.md
├── requirements.txt
└── .gitignore
```

---

## How to Run

### Problem 7

From the project root:

```bash
python3 scripts/01_rotation_sandbox.py
```

### Problem 8

From the project root:

```bash
python3 scripts/02_verify_skew_properties.py
```

The numerical results are saved to:

```text
scripts/problem8_residuals.csv
```

### Problem 9

From the ROS workspace:

```bash
cd ros_ws
colcon build --symlink-install
source install/setup.bash
ros2 run hw01_tf_demo tf_broadcaster_node
```

In another terminal:

```bash
source ~/Downloads/code-templates/hw01-mujoco-rotations/ros_ws/install/setup.bash
rviz2
```

Set the RViz2 Fixed Frame to:

```text
space_frame
```

and add a `TF` display.

---

## Source Code Repository

GitHub:

https://github.com/anjilshah/ME639-HW1-Part2-AnjilShah

---

## AI Use

AI assistance was used as a coding and debugging aid at selected
stuck points during the implementation. I edited and ran the code
myself and verified the MuJoCo results, numerical residuals,
ROS 2 parameters, and RViz2 setup.