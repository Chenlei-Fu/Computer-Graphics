# MP5: A Simple Physics Engine
## Particles  
You should keep an array or list of particles. Each particle should have the following information associated with it:
* Position
* Velocity
* Radius
* Color
* Mass
How you represent this information is up to you, but `glMatrix.vec3` is a convenient choice for the three-dimensional physical quantities of position, and velocity.

### Instancing
You only need to generate one sphere mesh…you simply draw that mesh in multiple different spots each frame…once for each particle. You can change the location and size of the sphere using a modeling transform. This technique is called instancing.