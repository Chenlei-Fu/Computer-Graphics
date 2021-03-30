/**
 * @file MP2.js - A simple WebGL rendering engine
 * @author Ian Rudnick <itr2@illinois.edu>
 * @brief Starter code for CS 418 MP2 at the University of Illinois at
 * Urbana-Champaign.
 *
 * Updated Spring 2021 for WebGL 2.0/GLSL 3.00 ES.
 */
/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas to draw on */
var canvas;

/** @global The GLSL shader program */
var shaderProgram;

/** @global An object holding the geometry for your 3D terrain */
var myTerrain;

/** @global The Model matrix */
var modelViewMatrix = glMatrix.mat4.create();
/** @global The Projection matrix */
var projectionMatrix = glMatrix.mat4.create();
/** @global The Normal matrix */
var normalMatrix = glMatrix.mat3.create();

// Material parameters
/** @global Ambient material color/intensity for Phong reflection */
var kAmbient = [227/255, 191/255, 76/255];
/** @global Diffuse material color/intensity for Phong reflection */
var kDiffuse = [227/255, 191/255, 76/255];
/** @global Specular material color/intensity for Phong reflection */
var kSpecular = [227/255, 191/255, 76/255];
/** @global Shininess exponent for Phong reflection */
var shininess = 2;

// Light parameters
/** @global Light position in VIEW coordinates */
var lightPosition = [0, 2, 2];
/** @global Ambient light color/intensity for Phong reflection */
var ambientLightColor = [0.1, 0.1, 0.1];
/** @global Diffuse light color/intensity for Phong reflection */
var diffuseLightColor = [1, 1, 1];
/** @global Specular light color/intensity for Phong reflection */
var specularLightColor = [1, 1, 1];

/** @global Edge color for black wireframe */
var kEdgeBlack = [0.0, 0.0, 0.0];
/** @global Edge color for white wireframe */
var kEdgeWhite = [0.7, 0.7, 0.7];

/** @global Previous time */
var previousTime = new Date().getTime() * 0.0001;

/** @global rotation Angle */
var rotAngle = 0;

/** @global the camera's current position (eyePt) */
var camPosition = glMatrix.vec3.fromValues(0, -1.8, 1.1);

/** @global the camera's current orientation */
var camOrientation = glMatrix.quat.create();

/** @global the camera's initial view direction*/
var camInitialDir = glMatrix.vec3.fromValues(0.0, 2.1, -1);

/** @global The currently pressed keys */
var keys = {};

/** @global degree to make the plane rool to its up */
var eulerZ = 0;

/** @global degree to cause the airplane to pitch up */
var eulerX = 0;

/** @global the camera's current speed in the forward direction */
var camSpeed = 0.0005; // should change


/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


//-----------------------------------------------------------------------------
// Setup functions (run once)
/**
 * Startup function called from the HTML code to start program.
 */
function startup() {
  // Set up the canvas with a WebGL context.
  canvas = document.getElementById("glCanvas");
  gl = createGLContext(canvas);

  // Compile and link the shader program.
  setupShaders();

  // Let the Terrain object set up its own buffers.
  myTerrain = new Terrain(128, -1, 1, -1, 1);
  myTerrain.setupBuffers(shaderProgram);

  // Set the background color to sky blue (you can change this if you like).
  gl.clearColor(0.82, 0.93, 0.99, 1.0);

  gl.enable(gl.DEPTH_TEST);
  document.onkeydown = keyDown;
  document.onkeyup = keyUp;
  requestAnimationFrame(animate);
}


/**
 * Creates a WebGL 2.0 context.
 * @param {element} canvas The HTML5 canvas to attach the context to.
 * @return {Object} The WebGL 2.0 context.
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl2");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}


/**
 * Loads a shader from the HTML document and compiles it.
 * @param {string} id ID string of the shader script to load.
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);

  // Return null if we don't find an element with the specified id
  if (!shaderScript) {
    return null;
  }

  var shaderSource = shaderScript.text;

  var shader;
  if (shaderScript.type === "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type === "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}


/**
 * Sets up the vertex and fragment shaders.
 */
function setupShaders() {
  // Compile the shaders' source code.
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");

  // Link the shaders together into a program.
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // We only need the one shader program for this rendering, so we can just
  // bind it as the current program here.
  gl.useProgram(shaderProgram);

  // Query the index of each attribute and uniform in the shader program.
  shaderProgram.locations = {};
  shaderProgram.locations.vertexPosition =
    gl.getAttribLocation(shaderProgram, "vertexPosition");
  shaderProgram.locations.vertexNormal =
    gl.getAttribLocation(shaderProgram, "vertexNormal");

  shaderProgram.locations.modelViewMatrix =
    gl.getUniformLocation(shaderProgram, "modelViewMatrix");
  shaderProgram.locations.projectionMatrix =
    gl.getUniformLocation(shaderProgram, "projectionMatrix");
  shaderProgram.locations.normalMatrix =
    gl.getUniformLocation(shaderProgram, "normalMatrix");

  shaderProgram.locations.kAmbient =
    gl.getUniformLocation(shaderProgram, "kAmbient");
  shaderProgram.locations.kDiffuse =
    gl.getUniformLocation(shaderProgram, "kDiffuse");
  shaderProgram.locations.kSpecular =
    gl.getUniformLocation(shaderProgram, "kSpecular");
  shaderProgram.locations.shininess =
    gl.getUniformLocation(shaderProgram, "shininess");

  shaderProgram.locations.lightPosition =
    gl.getUniformLocation(shaderProgram, "lightPosition");
  shaderProgram.locations.ambientLightColor =
    gl.getUniformLocation(shaderProgram, "ambientLightColor");
  shaderProgram.locations.diffuseLightColor =
  gl.getUniformLocation(shaderProgram, "diffuseLightColor");
  shaderProgram.locations.specularLightColor =
  gl.getUniformLocation(shaderProgram, "specularLightColor");

  // add maxZ and minZ
  shaderProgram.locations.minZ =
  gl.getUniformLocation(shaderProgram, "minZ");

  shaderProgram.locations.maxZ =
  gl.getUniformLocation(shaderProgram, "maxZ");
}

/**
 * Draws the terrain to the screen.
 */
function draw() {
// Transform the clip coordinates so the render fills the canvas dimensions.
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  // Clear the color buffer and the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Generate the projection matrix using perspective projection.
  const near = 0.1;
  const far = 200.0;
  glMatrix.mat4.perspective(projectionMatrix, degToRad(45),
                            gl.viewportWidth / gl.viewportHeight,
                            near, far);


  // Generate the view matrix using look at.
  handlePositionChanges();
  generateUpdatedView();

  setMatrixUniforms();
  setLightUniforms(ambientLightColor, diffuseLightColor, specularLightColor,
                   lightPosition);

  // Draw the triangles, the wireframe, or both, based on the render selection.
  if (document.getElementById("polygon").checked) {
    setMaxMinElevationUniforms();
    setMaterialUniforms(kAmbient, kDiffuse, kSpecular, shininess);
    myTerrain.drawTriangles();
  }
  else if (document.getElementById("wirepoly").checked) {
    setMaxMinElevationUniforms();
    setMaterialUniforms(kAmbient, kDiffuse, kSpecular, shininess);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);
    myTerrain.drawTriangles();
    gl.disable(gl.POLYGON_OFFSET_FILL);
    setMaterialUniforms(kEdgeBlack, kEdgeBlack, kEdgeBlack, shininess);
    myTerrain.drawEdges();
  }
  else if (document.getElementById("wireframe").checked) {
    setMaterialUniforms(kEdgeBlack, kEdgeBlack, kEdgeBlack, shininess);
    myTerrain.drawEdges();
  }
}


/**
 * Sends the three matrix uniforms to the shader program.
 */
function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.locations.modelViewMatrix, false,
                      modelViewMatrix);
  gl.uniformMatrix4fv(shaderProgram.locations.projectionMatrix, false,
                      projectionMatrix);

  // We want to transform the normals by the inverse-transpose of the
  // Model/View matrix
  glMatrix.mat3.fromMat4(normalMatrix,modelViewMatrix);
  glMatrix.mat3.transpose(normalMatrix,normalMatrix);
  glMatrix.mat3.invert(normalMatrix,normalMatrix);

  gl.uniformMatrix3fv(shaderProgram.locations.normalMatrix, false,
                      normalMatrix);
}


/**
 * Sends material properties to the shader program.
 * @param {Float32Array} a Ambient material color.
 * @param {Float32Array} d Diffuse material color.
 * @param {Float32Array} s Specular material color.
 * @param {Float32} alpha shininess coefficient
 */
function setMaterialUniforms(a, d, s, alpha) {
  gl.uniform3fv(shaderProgram.locations.kAmbient, a);
  gl.uniform3fv(shaderProgram.locations.kDiffuse, d);
  gl.uniform3fv(shaderProgram.locations.kSpecular, s);
  gl.uniform1f(shaderProgram.locations.shininess, alpha);
}


/**
 * Set max and min elevation uniforms
 */
function setMaxMinElevationUniforms() {
  let minZ = myTerrain.getMinElevation();
  let maxZ = myTerrain.getMaxElevation();
  gl.uniform1f(shaderProgram.locations.minZ, minZ);
  gl.uniform1f(shaderProgram.locations.maxZ, maxZ);
}


/**
 * Sends light information to the shader program.
 * @param {Float32Array} a Ambient light color/intensity.
 * @param {Float32Array} d Diffuse light color/intensity.
 * @param {Float32Array} s Specular light color/intensity.
 * @param {Float32Array} loc The light position, in view coordinates.
 */
function setLightUniforms(a, d, s, loc) {
  gl.uniform3fv(shaderProgram.locations.ambientLightColor, a);
  gl.uniform3fv(shaderProgram.locations.diffuseLightColor, d);
  gl.uniform3fv(shaderProgram.locations.specularLightColor, s);
  gl.uniform3fv(shaderProgram.locations.lightPosition, loc);
}

/**
 * Animates...allows user to change the geometry view between
 * wireframe, polgon, or both.
 */
 function animate(currentTime) {
   // speed up
  if (keys["="]) {
    camSpeed += 0.0001;
  }
  // speed down
  if (keys["-"]) {
    camSpeed -= 0.0001;
  }
  // roll to left
  if (keys["ArrowLeft"]) {
    eulerZ -= 0.02;
    handleEulerZAngles();
  }
  // roll to right
  if (keys["ArrowRight"]) {
    eulerZ += 0.02;
    handleEulerZAngles();
  }
  // pitch up
  if (keys["ArrowUp"]) {
    eulerX += 0.02;
    handleEulerXAngles()
  }
  // pitch down
  if (keys["ArrowDown"]) {
    eulerX -= 0.02;
    handleEulerXAngles();
  }
  // ESC
  if (keys["Escape"]) {
    resetToInitialView();
  }

  // Draw the frame.
  draw(currentTime);
  // Animate the next frame.
  requestAnimationFrame(animate);
}



//-----------------------------------------------------------------------------
// Event Handling Functions

/**
 * Logs keys as "down" when pressed
 * setting to true when keys are pressed
 * Referenced by
 * 1. https://illinois-cs418.github.io/assignments/mp3.html
 * 2. [418-18-1-interaction.pdf]
 */
function keyDown(event) {
  console.log("Key up ", event.key, " code ", event.code);
  if (event.key === "+" || event.key === "-" || event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Escape") {
    event.preventDefault();
  }
  keys[event.key] = true;
}


/**
 * Logs keys as "up" when pressed
 * setting to false when no keys are pressed
 * Referenced by
 * https://illinois-cs418.github.io/assignments/mp3.html
 */
function keyUp(event) {
  console.log("Key up ", event.key, " code ", event.code);
  keys[event.key] = false;
}


/**
 * Handle Position Changes
 */
function handlePositionChanges() {
  let forwardDirection = getCurViewDirection();

  // 3. set deltaPosition to the forwardDirection scaled by camSpeed
  let deltaPosition = glMatrix.vec3.create();
  glMatrix.vec3.scale(deltaPosition, forwardDirection, camSpeed);
  console.log("speed", camSpeed);
  // Update camPosition
  glMatrix.vec3.add(camPosition,camPosition,deltaPosition);
}


/**
 * Handle Arrow Left and Arrow Right Keys (Roll)
 */
function handleEulerZAngles() {
  let orientationDelta = glMatrix.quat.create();
  glMatrix.quat.fromEuler(orientationDelta, 0, 0, eulerZ);
  glMatrix.quat.multiply(camOrientation, camOrientation, orientationDelta);
}


/**
 * Handle Arrow Up and Down Right Keys (Pitch)
 */
function handleEulerXAngles() {
  let orientationDelta = glMatrix.quat.create();
  glMatrix.quat.fromEuler(orientationDelta, eulerX, 0, 0);
  glMatrix.quat.multiply(camOrientation, camOrientation, orientationDelta);
}


/**
 * reset the current view to the initial viewpoint and direction
 */
function resetToInitialView() {
  camPosition = glMatrix.vec3.set(camPosition, 0, -1.8, 1.1);
  camOrientation = glMatrix.quat.identity(camOrientation);
  camInitialDir = glMatrix.vec3.set(camInitialDir, 0.0, 2.1, -1);
  eulerZ = 0;
  eulerX = 0;
}


/**
 * Generate updated view
 */
function generateUpdatedView() {
  // use camPosition for the eye parameter
  let eyePt = glMatrix.vec3.clone(camPosition);

  // compute up
  let up = getCurUpVector();

  // compute center
  let center = glMatrix.vec3.create();
  let currentViewDir = getCurViewDirection();
  glMatrix.vec3.add(center, camPosition, currentViewDir);

  glMatrix.mat4.lookAt(modelViewMatrix, eyePt, center, up);
}


/**
 * Get current view direction
 * @return: current view direction (vec3)
 */
function getCurViewDirection() {
  let currentViewDir = glMatrix.vec3.create();
  console.log("camOrientation", camOrientation);
  glMatrix.vec3.transformQuat(currentViewDir, camInitialDir, camOrientation)
  glMatrix.vec3.normalize(currentViewDir, currentViewDir);
  return currentViewDir;
}

/**
 * Get current up vector
 * @return {vec3} up vector
 */
function getCurUpVector() {
  let up = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
  glMatrix.vec3.transformQuat(up, up, camOrientation);
  return up;
}
