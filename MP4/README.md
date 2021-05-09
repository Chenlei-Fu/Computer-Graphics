# MP4: Texturing Mapping
Due: April. 18, 2021 @ 11:59 PM

### Parsing an OBJ File
You only need to implement a reader that parses a subset of the full OBJ format. You just need to handle the tags f, v and #.

Use the above linked teapot model, which consists only of vertices and triangular faces. Load the vertices into a vertex position array, and the triangle faces into a face array whose elements are triples of vertex indices. **Note that the indices of the vertices in the OBJ start at 1**. This means you will need to adjust them assuming your arrays start indexing at 0. You will need to create per-vertex normals for the mesh as well, which you should compute as the average normal of the the triangles incident on the vertex.

##### Implementation
You should complete the function `loadFromOBJ(fileText)` in the file `TriMesh.js`. You will likely find the JS string method split useful. A robust way to split handling white space is to use the separator.

04/13
`loadFromOBJ` finished
`canoicalTransform()` finished


### Texture Mapping
Now we will load an image to use as a texture and send it to the fragment shader as a uniform. You can use the file brick.jpg or a different image if you wish.

### Generating Texture Coordinates
