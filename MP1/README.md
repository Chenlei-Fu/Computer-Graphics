# CS418 - Interactive Computer Graphics
## MP1: Dancing Logo
For your first machine problem, you will create **two** animations:
* a 2-D animation of the majestic and inspiring University of Illinois logo (as shown above)
* you will also create a short 2-D animation of your choice…more details below
**The webpage for your application should include a radio button that allows viewers to switch which animation is rendered.**

#### Modeling
02/13 - Runs and renders ☑️ 1 point
02/13 - Logo ☑️ 2 points

#### Animation
1. Use 2 or more affine transformations (such as scaling, rotation, or translation). Use the glMatrix library to implement these as matrix transformations. These transformations should be applied to the vertices in the vertex shader using a uniform variable


2. Implement another motion by directly changing the vertex positions in the vertex buffer. This means you create a new JavaScript array with vertex position. 