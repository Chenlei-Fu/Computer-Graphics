# MP5: A Simple Physics Engine
[link](https://illinois-cs418.github.io/assignments/mp5.html#detection)

### Results

![result](./result.gif)

### Particles 

You should keep an array or list of particles. Each particle should have the following information associated with it:

* Position
* Velocity
* Radius
* Color
* Mass
How you represent this information is up to you, but `glMatrix.vec3` is a convenient choice for the three-dimensional physical quantities of position, and velocity.

### Instancing
You only need to generate one sphere mesh…you simply draw that mesh in multiple different spots each frame…once for each particle. You can change the location and size of the sphere using a modeling transform. This technique is called instancing.



#### Creation

You should allow users to spawn nn spheres using a button press or mouse click. You can choose nn to be whatever number you wish…have it be more than 11. The spheres should created with the following initial state:

- Random position in the box.
- Semi-random velocity…choose some reasonable magnitude that produces visually appealing results. The direction can be random.
- Randomly generated color…you can choose from a set of 3 more colors or just randomly generate an (r,g,b)(r,g,b) value.
- Semi-random radius…choose something in a range that produces visually appealing results
- Reasonable mass…you can use a uniform mass if you wish

### Physics 

After rendering a frame showing the current position of the spheres, you will need to update the position and velocity of each sphere:

- Compute the acceleration using the force of **gravity**. You can use a value other than 10ms210ms2 but it should produce results that look physically plausible.
- Update the velocity using the acceleration and Euler integration and **drag**.
- Update the position using the current velocity and Euler integration

When a sphere hits the floor and the change in position in the next frame falls below some threshold ϵϵ you should set the velocity to (0,0,0)(0,0,0) and clamp the sphere to the floor and stop moving the sphere. You may want to add a Boolean flag to your particle representation that indicates you should not update the particle anymore

#### Reference

For details on how to implement your physics engine consult the course materials:

- A Physics Engine [Video](https://classtranscribe.illinois.edu/video?id=4800e988-4f5d-4559-a3bc-beae3f3cfd3d&from=sharedlink) [PDF](https://github.com/illinois-cs418/cs418CourseMaterial/raw/master/Lectures/Fall2020/418-Physics.pdf)
- Collision Detection [Video](https://classtranscribe.illinois.edu/video?id=9216122a-bd3b-4641-ab4f-8080949c624b&from=sharedlink) [PDF](https://github.com/illinois-cs418/cs418CourseMaterial/raw/master/Lectures/Fall2020/418-Collide.pdf)
- Euler’s Method [Video](https://classtranscribe.illinois.edu/video?id=bd611499-ac64-4766-98c2-c3eeaebb16e2&from=sharedlink) [PDF](https://github.com/illinois-cs418/cs418CourseMaterial/raw/master/Lectures/Fall2020/418-EulersMethod.pdf)

#### Timesteps

You can use a uniform timestep Δt meaning each new frame is a timestep of size Δt or you can use wall-clock time. To use wall-clock time, your callback function to `requestAnimationFram` should include a single parameter of type [`DOMHighResTimeStamp`.](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp) You can use this timestamp to compute Δt as how much actual time has passed. You may need to scale this elapsed time by some factor to achieve results you are happy with.

### Collisions 

The only collisions you need to check for are between your spheres and the walls.

#### Detection

If you are using an axis-aligned box with an extent of (−m,−m,−m) to (m,m,m) you can detect a collision with a wall by computing the new position (px,py,pz) of a particle and checking if ∥pi±r∥≥m for any of the coordinates. Here, r is the radius of the particle. Your check should consider each wall, not just stop with the first hit you find. You should pick the wall with the earliest hit in the event that the particle’s final position is beyond more than 1 wall.

#### Resolution

![img](http://bocilmania.com/wp-content/uploads/2018/04/intro.png)

When a sphere collides with a wall, you need to compute the point of collision and set the particle position to that point.



### User Interface 

Your app should have two controls:

- A control (button or mouse-click) to spawn spheres.
- A control (button or mouse-click) to remove all spheres

Optionally, you can controls to adjust the parameters of the simulation as well (e.g. acceleration due to gravity).

You should include text on your webpage indicating what these controls are and how to use them.