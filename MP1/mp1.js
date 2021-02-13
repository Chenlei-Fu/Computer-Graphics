/**
 * @file A WebGL example drawing a Illini Logo with colors
 * @author Chenlei Fu <chenlei2@eillinois.edu>
 *
 * Updated Spring 2021 to use WebGL 2.0 and GLSL 3.00
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The vertex array object for the triangle */
var vertexArrayObject;

/** @global The rotation angle of our triangle */
var rotAngle = 0;

/** @global The ModelView matrix contains any modeling and viewing transformations */
var modelViewMatrix = glMatrix.mat4.create();

/** @global Records time last frame was rendered */
var previousTime = 0;

/** @global Records time currentframe was rendered */
var currentTime = 0;

/** @global The state of animation */
var state = 0;

/** @global Scale Vector */
var scaleVec = glMatrix.vec3.create();

/** @global The clock for counts */
var clock = 0;







/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
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
 * Loads a shader.
 * Retrieves the source code from the HTML document and compiles it.
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
    var shaderScript = document.getElementById(id);

    // If we don't find an element with the specified id
    // we do an early exit
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
 * Set up the fragment and vertex shaders.
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

    // We only use one shader program for this example, so we can just bind
    // it as the current program here.
    gl.useProgram(shaderProgram);

    // Query the index of each attribute in the list of attributes maintained
    // by the GPU.
    shaderProgram.vertexPositionAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.vertexColorAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexColor");

    //Get the index of the Uniform variable as well
    shaderProgram.modelViewMatrixUniform =
    gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
}

/**
 * Set up the buffers to hold the logo's vertex positions.
 */
function setupLogoPosition() {
    // Create the vertex array object, which holds the list of attributes for
    // the triangle.
    vertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObject);

    // Create a buffer for positions, and bind it to the vertex array object.
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    // Define a triangle in clip coordinates.
    const t = 30;
    var orangeVertices = [
        /*
            __________________
            |                |   --- Top Bar
            |____|      |____|
                 |      |
                 |      |
                 |      |        --- Body Bar
                 |      |
                 |      |
            |____|      |____|
            |                |   --- Bottom Bar
            |________________|
           */

        // Orange Top Bar
        -10.0/t, 15.0/t, 0.0,
        -10.0/t, 9.0/t, 0.0,
        10.0/t, 15.0/t, 0.0,
        -10.0/t, 9.0/t, 0.0,
        10.0/t, 15.0/t, 0.0,
        10.0/t, 9.0/t, 0.0,

        // Orange Body Top Bar
        -4.5/t,9.0/t, 0.0,
        -4.5/t, -9.0/t, 0.0,
        4.5/t, 9.0/t, 0.0,
        4.5/t, 9.0/t, 0.0,
        -4.5/t, -9.0/t, 0.0,
        4.5/t, -9.0/t, 0.0,

        // Orange Bottom Bar
        -10.0/t, -15.0/t, 0.0,
        -10.0/t, -9.0/t, 0.0,
        10.0/t, -15.0/t, 0.0,
        -10.0/t, -9.0/t, 0.0,
        10.0/t, -15.0/t, 0.0,
        10.0/t, -9.0/t, 0.0,



    ];


    var blueVertices = [
        // Blue Top Bar
        -10.5/t, 15.5/t, 0.0,
        -10.5/t, 15.0/t, 0.0,
        10.5/t, 15.5/t, 0.0,
        -10.5/t, 15.0/t, 0.0,
        10.5/t, 15.0/t, 0.0,
        10.5/t, 15.5/t, 0.0,

        // Blue top left
        -10.5/t,15.0/t,0.0,
        -10.0/t,15.0/t,0.0,
        -10.5/t,9.0/t,0.0,
        -10.0/t,15.0/t,0.0,
        -10.5/t,9.0/t,0.0,
        -10.0/t,9.0/t,0.0,

        // blue top right
        10.5/t,15.0/t,0.0,
        10.0/t,15.0/t,0.0,
        10.5/t,9.0/t,0.0,
        10.0/t,15.0/t,0.0,
        10.5/t,9.0/t,0.0,
        10.0/t,9.0/t,0.0,

        // blue top left bottom
        -10.5/t,9.0/t,0.0,
        -10.0/t,8.5/t,0.0,
        -4.5/t,9.0/t,0.0,
        -4.5/t,9.0/t,0.0,
        -10.0/t,8.5/t,0.0,
        -4.5/t,8.5/t,0.0,

        // blue top right bottom
        10.5/t,9.0/t,0.0,
        10.0/t,8.5/t,0.0,
        4.5/t,9.0/t,0.0,
        4.5/t,9.0/t,0.0,
        10.0/t,8.5/t,0.0,
        4.5/t,8.5/t,0.0,

        // blue body left bar
        -4.5/t,9.0/t, 0.0,
        -4.5/t, -9.0/t, 0.0,
        -5/t, 9.0/t, 0.0,
        -5/t, 9.0/t, 0.0,
        -4.5/t, -9.0/t, 0.0,
        -5/t, -9.0/t, 0.0,

        // blue body right bar
        4.5/t,9.0/t, 0.0,
        4.5/t, -9.0/t, 0.0,
        5/t, 9.0/t, 0.0,
        5/t, 9.0/t, 0.0,
        4.5/t, -9.0/t, 0.0,
        5/t, -9.0/t, 0.0,

        // blue bottom left bottom
        -10.5/t,-9.0/t,0.0,
        -10.0/t,-8.5/t,0.0,
        -4.5/t,-9.0/t,0.0,
        -4.5/t,-9.0/t,0.0,
        -10.0/t,-8.5/t,0.0,
        -4.5/t,-8.5/t,0.0,

        // blue bottom right bottom
        10.5/t,-9.0/t,0.0,
        10.0/t,-8.5/t,0.0,
        4.5/t,-9.0/t,0.0,
        4.5/t,-9.0/t,0.0,
        10.0/t,-8.5/t,0.0,
        4.5/t,-8.5/t,0.0,

        // Blue bottom left
        -10.5/t,-15.0/t,0.0,
        -10.0/t,-15.0/t,0.0,
        -10.5/t,-9.0/t,0.0,
        -10.0/t,-15.0/t,0.0,
        -10.5/t,-9.0/t,0.0,
        -10.0/t,-9.0/t,0.0,

        // blue bottom right
        10.5/t,-15.0/t,0.0,
        10.0/t,-15.0/t,0.0,
        10.5/t,-9.0/t,0.0,
        10.0/t,-15.0/t,0.0,
        10.5/t,-9.0/t,0.0,
        10.0/t,-9.0/t,0.0,

        // Blue Bottom Bar
        -10.5/t, -15.5/t, 0.0,
        -10.5/t, -15.0/t, 0.0,
        10.5/t, -15.5/t, 0.0,
        -10.5/t,-15.0/t, 0.0,
        10.5/t,-15.0/t, 0.0,
        10.5/t, -15.5/t, 0.0,
    ];

    var vertices = orangeVertices.concat(blueVertices);

    // Populate the buffer with the position data.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numberOfItems = 90;

    // Binds the buffer that we just made to the vertex position attribute.
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
}

/**
 * Set up the buffers to hold the logo's vertex colors.
 */
function setupLogoColor() {

    // Do the same steps for the color buffer.
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    const blue = [19/225, 41/225, 75/225, 1.0];
    const orange = [232/225, 74/225, 39/225, 1.0];
    var colors = [];
    for(let i = 0; i < 18; i++) {
        colors.push(...orange);
    }
    for(let i = 0; i < 72; i++) {
        colors.push(...blue);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 4;
    vertexColorBuffer.numItems = 90;

    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
}


/**
 * Set up the buffers to hold the triangle's vertex positions and colors.
 */
function setupBuffers() {

    setupLogoPosition();
    setupLogoColor();

    //Enable each attribute we are using in the VAO.
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // Unbind the vertex array object to be safe.
    gl.bindVertexArray(null);
}


/**
 * Draws a frame to the screen.
 */
function draw() {
    // Transform the clip coordinates so the render fills the canvas dimensions.
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // Clear the screen.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use the vertex array object that we set up.
    gl.bindVertexArray(vertexArrayObject);

    // Send the ModelView matrix with our transformations to the vertex shader.
    gl.uniformMatrix4fv(shaderProgram.modelViewMatrixUniform,
                      false, modelViewMatrix);

    // Render the triangle.
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);

    // Unbind the vertex array object to be safe.
    gl.bindVertexArray(null);
}


/**
 * Animates the logo by affine transformation with scaling
 */
function affine_scaling() {
    // Read the speed slider from the web page.
    let speed = document.getElementById("speed").value;

    let fac = degToRad(clock);
    glMatrix.vec3.set(scaleVec, Math.cos(degToRad(fac)), Math.cos(degToRad(fac)), 1);
    glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, scaleVec);
}


/**
 * Animates the logo by affine transformation with rotation
 */
function affine_rotation() {
    // Read the speed slider from the web page.
    var speed = document.getElementById("speed").value;
    // Convert the time to seconds.
    currentTime = new Date().getTime() * 0.001;
    // Subtract the previous time from the current time.
    var deltaTime = currentTime - previousTime;
    // Remember the current time for the next frame.
    previousTime = currentTime;

    // Update geometry to rotate 'speed' degrees per second.
    rotAngle += speed * deltaTime;
    if (rotAngle > 360.0)
        rotAngle = 0.0;
    glMatrix.mat4.fromZRotation(modelViewMatrix, degToRad(rotAngle));
}


/**
 * Animates the logo by affine transformation with rotation
 */
function affine_translation() {

}


/**
 * Animates the triangle by updating the ModelView matrix with a rotation
 * each frame.
 */
 function animate(currentTime) {




    affine_rotation();
    setupBuffers();

    // Draw the frame.
    draw();

    // Animate the next frame. The animate function is passed the current time in
    // milliseconds.
    requestAnimationFrame(animate);
}


/**
 * Startup function called from html code to start the program.
 */
 function startup() {
  console.log("Starting animation...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  requestAnimationFrame(animate);
  gl.enable(gl.DEPTH_TEST);
}

