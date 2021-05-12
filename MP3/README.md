# MP3: Simulating Flight

[Link](https://illinois-cs418.github.io/assignments/mp3.html)

### Result

![result](./result.gif)

### Overview 

For the third machine problem, you will extend your terrain renderer with a simple flight simulator. Your “plane” will fly over the terrain you generate. You will also add the capability of applying fog to your terrain.



### Simulating Flight

The app will be rendering a view of the terrain from the perspective of someone flying over it. The view should automatically move forward at a fixed speed. The user will control the roll and pitch of the airplane through the arrow keys. The controls should be:

- Pressing the left (right) arrow key will make the plane roll to its left (right)

- Pressing the up (down) arrow key will cause the airplane to pitch up (down)

- Pressing the + (-) key will increase (decrease) the airplane’s speed

- Pressing the ESC key will reset the current view to the initial viewpoint and direction

  

### Implementation 

You are required to use quaternions and to have the control behaviors match those described above. Our suggested implementation would be to do the following.

#### Representing Camera Orientation with a Quaternion

Use the [glMatrix library](http://glmatrix.net/) provides support for using [quaternions](http://glmatrix.net/docs/module-quat.html). We would suggest using that library instead of creating your own quaternion class.

Store four variables which maintain state from frame to frame. These are either global, part of a class, or passed as function parameters:

```javascript
var camPosition = glMatrix.vec3.create();           //the camera's current position
var camOrientation = glMatrix.quat.create();        //the camera's current orientation
var float camSpeed = 0.5;                           //the camera's current speed in the forward direction
var camInitialDir = glMatrix.vec3.create();         //the camera's initial view direction  
```

**Important: You will need to find appropriate initial values for these variables. For example, you should not assume that `camSpeed = 0.5;` is appropriate for your app and terrain scale. Similarly, you will need to experimentally find good values for the amounts by which things like `camSpeed` are adjusted when a user presses a key.**

#### User Interaction

Create a function `function animate(timeStamp)` that updates the camera every frame based on the user’s keyboard inputs. This function should be the provided callback before each redraw event…meaning you should call `requestAnimationFrame(animate)` at the end of the`startup` function if you are using the starter code from MP2. You will also call `requestAnimationFrame(animate)` from inside `animate(timeStamp)`.

#### Event Handling

You should write event handling functions for `keyDown` and `keyUp` events that you wish to capture. You can find the details of how to do this in the following:

***Reference\*** Basic JS Event Handling [Video](https://classtranscribe.illinois.edu/video?id=5a493a82-9526-4e2e-935e-fccf810e9140&from=sharedlink) [PDF](https://github.com/illinois-cs418/cs418CourseMaterial/raw/master/Lectures/Fall2020/418-18-1-Interaction.pdf)

A `keyDown` event handler would look something like this:

```javascript
/** 
 * Logs keys as "down" when pressed 
 */
function keyDown(event) {
  keys[event.key] = true;
}
```

Where `keys` is a global dictionary:

```javascript
/** @global The currently pressed keys */
var keys = {};
```

You should register your event handlers in your initialization function (`startup` in the MP2 starter code):

```javascript
document.onkeydown = keyDown;
document.onkeyup = keyUp;
```

This `animate(timeStamp)` function should check `keys` and take appropriate action. Here’s an example:

```javascript
if (keys["="]) { 
   camSpeed += 0.01;
}
if (keys["-"]) {
   camSpeed -= 0.01;
}
...
```

In `animate(timeStamp)` you will need to do the following:

1. Increase or decrease `camSpeed` if the + or - key has been pressed
2. Reset `camOrientation` and `camPosition` to their original values if ESC is pressed
3. Update `camOrientation`
4. Update `camPosition`

#### Handling Orientation Changes

![Roll and Pitch](https://illinois-cs418.github.io/img/rpy.PNG)

Imagine your view has a local coordinate system associated with it. We will associate roll as rotation around the local `Z` axis. We will associate pitch as around the local `X` axis. To update the current orientation of the view, we will generate an Euler angle representation of roll and pitch *changes* in response to key presses.

We then do the following:

1. Create a quaternion from those Euler angles to represent the change in orientation `glMatrix.quat.fromEuler(orientationDelta, eulerX, eulerY, eulerZ);`

2. Calculate the new `camOrientation` by multiplying `camOrientation` with `orientationDelta`

   You should use `glMatrix.quat.multiply(out,a,b);` and make sure you set `a` and `b` to the correct variables to generate the corect order of multiplication.

#### Handling Position Changes

You will update `camPosition` by calculating a displacement vector `deltaPosition` in the forward direction of the view and adding it to `camPosition`.

1. Find the current forward direction by transforming the `camInitialDir` by `camOrientation` You can use `glMatrix.vec3.transformQuat(out,a,q)` to generate current the forward direction `forwardDirection`.
2. Make `forwardDirection` unit length.
3. Set `deltaPosition` to the `forwardDirection` scaled to a length of `camSpeed`
4. Update `camPosition` using `glMatrix.vec3.add(camPosition,camPosition,deltaPosition)`

#### Generating an Updated View

Once you have a new `camOrientation` and `camPosition` you can generate a View matric for the current frame.

You should use `glMatrix.mat4.lookAt(out, eye, center, up)` . Use `camPosition` for the `eye` parameter and generate correct values for `center` and `up` . To compute `up`, you should transform your initial **up** vector, usually (0,1,0)(0,1,0),by `camOrientation`. To compute `center`, the point in space at which you are looking, you should transform `camIntialDir` by `camOrientation` to generate the current view direction. You can than compute `center` as the sum of `camPosition` and the current view direction.



### A Documented User Interface 

You should implement a user interface that minimally implements the arrow-key and +/- key controls described above. Your webpage should include text instructions describing how the user interface works. Simply include text in the HTML file that explains how to control the view and speed.



## Rendering Depth Fog 

Your app should allow a user to generate a scene with fog. The fog will be controlled by checkbox control on the webpage.



### Modified Phong Shading 

The fog computation should be done per-pixel, which means implemented in the fragment shader. The details of how to implement depth fog, along with shader code to do it, can be found in:

***Reference\*** Fog [Video](https://classtranscribe.illinois.edu/video?id=17dc9594-15b8-4917-a38a-f052b6741659&from=sharedlink) [PDF](https://github.com/illinois-cs418/cs418CourseMaterial/raw/master/Lectures/Fall2020/418-Fog.pdf)

Make an effort to make the fog look good. Consider doing the following:

1. Use a white background…or gray…
2. Have the fog color match the background color
3. Experimentally find a value for `fogDensity` that generates a good result.



### User Interface 

You should add a radio to your HTML as described in the [Mozilla HTML Docs here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox)

