/**
 * @file Terrain.js - A simple 3D terrain model for WebGL
 * @author Ian Rudnick <itr2@illinois.edu>
 * @brief Starter code for CS 418 MP2 at the University of Illinois at
 * Urbana-Champaign.
 *
 * Updated Spring 2021 for WebGL 2.0/GLSL 3.00 ES.
 *
 * You'll need to implement the following functions:
 * setVertex(v, i) - convenient vertex access for 1-D array
 * getVertex(v, i) - convenient vertex access for 1-D array
 * generateTriangles() - generate a flat grid of triangles
 * shapeTerrain() - shape the grid into more interesting terrain
 * calculateNormals() - calculate normals after warping terrain
 *
 * Good luck! Come to office hours if you get stuck!
 */

class Terrain {
    /**
     * Initializes the members of the Terrain object.
     * @param {number} div Number of triangles along the x-axis and y-axis.
     * @param {number} minX Minimum X coordinate value.
     * @param {number} maxX Maximum X coordinate value.
     * @param {number} minY Minimum Y coordinate value.
     * @param {number} maxY Maximum Y coordinate value.
     */
    constructor(div, minX, maxX, minY, maxY) {
        this.div = div;
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;

        // Allocate the vertex array
        this.positionData = [];
        // Allocate the normal array.
        this.normalData = [];
        // Allocate the triangle array.
        this.faceData = [];
        // Allocate an array for edges so we can draw a wireframe.
        this.edgeData = [];
        console.log("Terrain: Allocated buffers");

        this.generateTriangles();
        console.log("Terrain: Generated triangles");

        this.generateLines();
        console.log("Terrain: Generated lines");

        this.shapeTerrain();
        console.log("Terrain: Sculpted terrain");

        this.calculateNormals();
        console.log("Terrain: Generated normals");

        // You can use this function for debugging your buffers:
        this.printBuffers();
    }


    //-------------------------------------------------------------------------
    // Vertex access and triangle generation - your code goes here!
    /**
     * Set the x,y,z coords of the ith vertex
     * @param {Object} v An array of length 3 holding the x,y,z coordinates.
     * @param {number} i The index of the vertex to set.
     */
    setVertex(v, i) {
        // MP2: Implement this function!
        this.positionData[i * 3] = v[0];
        this.positionData[i * 3 + 1] = v[1];
        this.positionData[i * 3 + 2] = v[2];
    }


    /**
     * Returns the x,y,z coords of the ith vertex.
     * @param {Object} v An array of length 3 to hold the x,y,z coordinates.
     * @param {number} i The index of the vertex to get.
     */
    getVertex(v, i) {
        // MP2: Implement this function!
        v[0] = this.positionData[i * 3];
        v[1] = this.positionData[i * 3 + 1];
        v[2] = this.positionData[i * 3 + 2];
    }


    /**
     * fill out position data and face data
     */
    generateTriangles() {
        // MP2: Implement the rest of this function!

        // positionData: 1D array of floats
        const deltaX = (this.maxX - this.minX) / this.div;
        const deltaY = (this.maxY - this.minY) / this.div;
        for (let i = 0; i <= this.div; i++) {
            for(let j = 0; j <= this.div; j++) {
                this.positionData.push(this.minX + deltaX * j);
                this.positionData.push(this.minY + deltaY * i);
                this.positionData.push(0);
            }
        }


        // faceData
        for (let i = 0; i < this.div; i++) {
            for(let j = 0; j < this.div; j++) {
                // bottom left index
                let bottomLeft = (i * (this.div + 1)) + j;
                let triangular1 = [bottomLeft, bottomLeft+1, bottomLeft + this.div + 1];
                let triangular2 = [bottomLeft + 1, bottomLeft + this.div + 2, bottomLeft + this.div + 1];
                this.faceData.push(...triangular1);
                this.faceData.push(...triangular2);
            }
        }

        // We'll need these to set up the WebGL buffers.
        this.numVertices = this.positionData.length/3;
        this.numFaces = this.faceData.length/3;
    }


    /**
     * Construct plane, raise and lower vertices, parameters
     */
    shapeTerrain() {
        // MP2: Implement this function!

        // set up some variables
        let iter = 100
        let delta = 0.01
        let H = 0.0143

        for(let i = 0; i < iter; i++) {
            // construct a random fault plane
            let p = this.generateRandomPoint();
            let n = this.generateRandomNormalVec();

            // raise and lower vertices
            for(let j = 0; j < this.numVertices; j++) {
                // step1: get vertex b, test which side (b - p) * n >= 0
                let b = glMatrix.vec3.create();
                this.getVertex(b, j);

                let sub = glMatrix.vec3.create();
                glMatrix.vec3.subtract(sub, b, p);

                let dist = glMatrix.vec3.distance(b, p);

                let funcValue = this.calculateCoefficientFunction(dist);

                if (glMatrix.vec3.dot(sub, n) > 0)
                    b[2] += delta * funcValue
                else
                    b[2] -= delta * funcValue

                this.setVertex(b, j);
            }
            delta = delta / (2**H);
        }
    }


    /**
     * Generate random point p in the rectangle <xMin, yMin, 0><xMax, yMax, 0>
     * @return: gl.vec3 object with calculated random x and y
     */
    generateRandomPoint() {
        let p = glMatrix.vec3.create();
        let x = Math.random() * (this.maxX - this.minX) + this.minX;
        let y = Math.random() * (this.maxY - this.minY) + this.minY;
        glMatrix.vec3.set(p, x, y, 0);
        return p;
    }

    /**
     * Generate random normal vector for the plane <x, y, 0>
     * @return: gl.vec3 object with calculated random x and y
     */
    generateRandomNormalVec() {
        let tmp = glMatrix.vec2.create()
        tmp = glMatrix.vec2.random(tmp);
        return glMatrix.vec3.fromValues(tmp[0], tmp[1], 0);
    }


    calculateCoefficientFunction(r) {
        let bottomLeft = glMatrix.vec3.fromValues(this.minX, this.minY, 0);
        let topRight = glMatrix.vec3.fromValues(this.maxX, this.maxY, 0);
        let R = glMatrix.vec3.distance(topRight, bottomLeft);
        return Math.pow(1 - Math.pow(r/R, 2), 2);
    }


    /**
     * Calculate the normals for each triangle
     * 1. generate per-vertex normals
     * 2. triangle area-weighted average
     */
    calculateNormals() {
        // MP2: Implement this function!

        // initialize an NArray containing M normals
        let normals = [];
        for(let i = 0; i < this.numVertices; i++) {
            normals.push([0, 0, 0]);
        }

        // iterate all triangles
        for(let i = 0; i < this.numFaces; i++) {
            let indices = this.getTriangleVertexByIndex(i);
            let vertices = this.createAndGetPosDataByIndex(indices);
            let N = this.computeNormalForTriangles(vertices[0], vertices[1], vertices[2]);

            // average vertex normals by scale with factor 0.5
            glMatrix.vec3.scale(N, N, 0.5);

            indices.forEach(function(index) {
                normals[index] = normals[index].map((a, i) => a + N[i]);
            })
        }

        // normalize each normal in N array to unit length
        for(let i = 0; i < this.numVertices; i++) {
            let tmp = glMatrix.vec3.fromValues(normals[i][0], normals[i][1], normals[i][2]);
            glMatrix.vec3.normalize(tmp, tmp);
            this.normalData.push(...tmp);
        }
    }



    /**
     * Get Triangle's Vertex by Index
     * @param idx: the index of face data
     * @return: an array of triangular vertex at this index
     */
    getTriangleVertexByIndex(idx) {
        if(idx < 0 || idx >= this.numFaces) {
            throw 'Invalid idx!';
        }
        let res = [];
        for(let i = 0; i < 3; i++) {
            res.push(this.faceData[idx * 3 + i]);
        }
        return res;
    }


    /**
     * Computer Normal N for the Triangle using N = (v2 - v1) cross (v3 - v1)
     * @param v1: the first vector of the triangle
     * @param v2: the second vector of the triangle
     * @param v3: the third vector of the triangle
     * @return cross: the cross product of (v2 - v1) and (v3 - v1)
     */
    computeNormalForTriangles(v1, v2, v3) {
        let sub1 = glMatrix.vec3.create();
        let sub2 = glMatrix.vec3.create();
        glMatrix.vec3.subtract(sub1, v2, v1);
        glMatrix.vec3.subtract(sub2, v3, v1);
        let res = glMatrix.vec3.create();
        glMatrix.vec3.cross(res, sub1, sub2);
        return res;
    }


    /**
     * Create vec3 object and get the vertex position data by index
     * @param indices of face data
     * @return vec3 object
     */
    createAndGetPosDataByIndex(indices) {
        let res = []
        for (let i = 0; i < indices.length; i++) {
            let tmp = glMatrix.vec3.create();
            this.getVertex(tmp, indices[i]);
            res.push(tmp);
        }
        return res;
    }


    //-------------------------------------------------------------------------
    // Setup code (run once)
    /**
     * Generates line data from the faces in faceData for wireframe rendering.
     */
    generateLines() {
        for (var f = 0; f < this.faceData.length/3; f++) {
            // Calculate index of the face
            var fid = f*3;
            this.edgeData.push(this.faceData[fid]);
            this.edgeData.push(this.faceData[fid+1]);

            this.edgeData.push(this.faceData[fid+1]);
            this.edgeData.push(this.faceData[fid+2]);

            this.edgeData.push(this.faceData[fid+2]);
            this.edgeData.push(this.faceData[fid]);
        }
    }


    /**
     * Sets up the WebGL buffers and vertex array object.
     * @param {object} shaderProgram The shader program to link the buffers to.
     */
    setupBuffers(shaderProgram) {
        // Create and bind the vertex array object.
        this.vertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(this.vertexArrayObject);

        // Create the position buffer and load it with the position data.
        this.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positionData),
                      gl.STATIC_DRAW);
        this.vertexPositionBuffer.itemSize = 3;
        this.vertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.vertexPositionBuffer.numItems, " vertices.");

        // Link the position buffer to the attribute in the shader program.
        gl.vertexAttribPointer(shaderProgram.locations.vertexPosition,
                               this.vertexPositionBuffer.itemSize, gl.FLOAT,
                               false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexPosition);

        // Specify normals to be able to do lighting calculations
        this.vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalData),
                      gl.STATIC_DRAW);
        this.vertexNormalBuffer.itemSize = 3;
        this.vertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.vertexNormalBuffer.numItems, " normals.");

        // Link the normal buffer to the attribute in the shader program.
        gl.vertexAttribPointer(shaderProgram.locations.vertexNormal,
                               this.vertexNormalBuffer.itemSize, gl.FLOAT,
                               false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexNormal);

        // Set up the buffer of indices that tells WebGL which vertices are
        // part of which triangles.
        this.triangleIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.faceData),
                      gl.STATIC_DRAW);
        this.triangleIndexBuffer.itemSize = 1;
        this.triangleIndexBuffer.numItems = this.faceData.length;
        console.log("Loaded ", this.triangleIndexBuffer.numItems, " triangles.");

        // Set up the index buffer for drawing edges.
        this.edgeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.edgeData),
                      gl.STATIC_DRAW);
        this.edgeIndexBuffer.itemSize = 1;
        this.edgeIndexBuffer.numItems = this.edgeData.length;

        // Unbind everything; we want to bind the correct element buffer and
        // VAO when we want to draw stuff
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }


    //-------------------------------------------------------------------------
    // Rendering functions (run every frame in draw())
    /**
     * Renders the terrain to the screen as triangles.
     */
    drawTriangles() {
        gl.bindVertexArray(this.vertexArrayObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.triangleIndexBuffer.numItems,
                        gl.UNSIGNED_INT,0);
    }


    /**
     * Renders the terrain to the screen as edges, wireframe style.
     */
    drawEdges() {
        gl.bindVertexArray(this.vertexArrayObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
        gl.drawElements(gl.LINES, this.edgeIndexBuffer.numItems,
                        gl.UNSIGNED_INT,0);
    }


    //-------------------------------------------------------------------------
    // Debugging
    /**
     * Prints the contents of the buffers to the console for debugging.
     */
    printBuffers() {
        for (var i = 0; i < this.numVertices; i++) {
            console.log("v ", this.positionData[i*3], " ",
                              this.positionData[i*3 + 1], " ",
                              this.positionData[i*3 + 2], " ");
        }
        for (var i = 0; i < this.numVertices; i++) {
            console.log("n ", this.normalData[i*3], " ",
                              this.normalData[i*3 + 1], " ",
                              this.normalData[i*3 + 2], " ");
        }
        for (var i = 0; i < this.numFaces; i++) {
            console.log("f ", this.faceData[i*3], " ",
                              this.faceData[i*3 + 1], " ",
                              this.faceData[i*3 + 2], " ");
        }
    }

} // class Terrain
//

var glMatrix = require('gl-matrix');
// const { mat4, vec3 } = gl;

var terrain = new Terrain(2, 0, 4, 0, 4);
terrain.calculateNormals();

