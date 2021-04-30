/**
 * @fileoverview Sphere.js - Class for triangulated meshes of spheres.
 * @author Ian Rudnick <itr2@illinois.edu>
 */

class Sphere {
    /**
     * Constructs a Sphere object with position and normal arrays for WebGL.
     * @param {number} numSubDivisions The number of times to subdivide each
     * triangle in the mesh; more subdivisions creates a smoother sphere.
     */
    constructor(numSubDivisions)
    {
        this.vertexArray = [];
        this.normalArray = [];
        this.numTriangles = 0;

        // Create a regular tetrahedron.
        var a = glMatrix.vec4.fromValues(0.0, 0.0, -1.0, 0);
        var b = glMatrix.vec4.fromValues(0.0, 0.942809, 0.333333, 0);
        var c = glMatrix.vec4.fromValues(-0.816497, -0.471405, 0.333333, 0);
        var d = glMatrix.vec4.fromValues(0.816497, -0.471405, 0.333333, 0);
        
        // Subdivide each triangle the specified number of times.
        this.numTriangles += this.subdivideTriangle(a, b, c, numSubDivisions);
        this.numTriangles += this.subdivideTriangle(d, c, b, numSubDivisions);
        this.numTriangles += this.subdivideTriangle(a, d, b, numSubDivisions);
        this.numTriangles += this.subdivideTriangle(a, c, d, numSubDivisions);
    }

    /**
     * Subdivides a triangle into smaller triangles and adds them to the vertex
     * arrays for the sphere mesh.
     * @param {[4]} a The first point of the triangle.
     * @param {[4]} b The second point of the triangle.
     * @param {[4]} c The third point of the triangle.
     * @param {number} numSubDivs The number of times to subdivide this triangle.
     * @returns The number of triangles created.
     */
    subdivideTriangle(a, b, c, numSubDivisions)
    {
        if (numSubDivisions > 0) {
            var numT = 0;
            
            // Create three new points to subdivide the triangle.
            var ab = glMatrix.vec4.create();
            glMatrix.vec4.lerp(ab, a, b, 0.5);
            glMatrix.vec4.normalize(ab, ab);

            var ac = glMatrix.vec4.create();
            glMatrix.vec4.lerp(ac, a, c, 0.5);
            glMatrix.vec4.normalize(ac, ac);

            var bc = glMatrix.vec4.create();
            glMatrix.vec4.lerp(bc, b, c, 0.5);
            glMatrix.vec4.normalize(bc, bc);
            
            // Recursively subdivide each sub-triangle again.
            numT += this.subdivideTriangle(a, ab, ac, numSubDivisions - 1);
            numT += this.subdivideTriangle(ab, b, bc, numSubDivisions - 1);
            numT += this.subdivideTriangle(bc, c, ac, numSubDivisions - 1);
            numT += this.subdivideTriangle(ab, bc, ac, numSubDivisions - 1);

            return numT;
        }
        else {
            // Base case of the recursion: if we have 0 subdivisions, stop
            // recursing and add the given triangle to the vertex buffers.
            // Add the three vertices to the positions array.
            this.pushVertex(a, this.vertexArray);
            this.pushVertex(b, this.vertexArray);
            this.pushVertex(c, this.vertexArray);
            
            // Normals are the same as the vertices for a (unit) sphere.
            this.pushVertex(a, this.normalArray);
            this.pushVertex(b, this.normalArray);
            this.pushVertex(c, this.normalArray);
            
            // We have added 1 triangle to the arrays.
            return 1;
        }   
    }

    /**
     * Adds a vertex to the array of vertices
     * @param {} v The vertex to add.
     * @param {} array The array to add the vertex to.
     */
    pushVertex(v, array)
    {
        for(var i = 0; i < 3; i++) {
            array.push(v[i]);
        }
    }


    /**
     * Sets up WebGL vertex position and normal buffers to link to the given
     * shader program.
     */
    setupBuffers(shaderProgram) {
        this.vertexArrayObject = gl.createVertexArray();
        this.bindVAO();

        this.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexArray),
                      gl.STATIC_DRAW);
        gl.vertexAttribPointer(shaderProgram.locations.vertexPosition,
                               3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexPosition);
    
        this.vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalArray),
                      gl.STATIC_DRAW);
        gl.vertexAttribPointer(shaderProgram.locations.vertexNormal,
                               3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexNormal);

        this.unbindVAO();
    }


    drawTriangles() {
        this.bindVAO();
        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
        this.unbindVAO();
    }


    bindVAO() {
        gl.bindVertexArray(this.vertexArrayObject);
    }


    unbindVAO() {
        gl.bindVertexArray(null);
    }

}   // class Sphere;
