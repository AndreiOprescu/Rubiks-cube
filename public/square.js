"use strict";

import { m4 } from "/matrix.js";

export class Square {
    constructor(gl, position, color, image, textureCoordinates, program) {
        this.gl = gl;
        this.position = position;
        this.color = color;
        this.image = image;
        this.textureCoordinates = textureCoordinates;

        this.setLocations(program);
    }

    setLocations(program) {
        // look up where the vertex data needs to go.
        this.positionLocation = this.gl.getAttribLocation(program, "a_position");
        this.colorLocation = this.gl.getAttribLocation(program, "a_color");
        this.texcoordLocation = this.gl.getAttribLocation(program, "a_texCoord");

        // lookup uniforms
        this.u_imageLocation = this.gl.getUniformLocation(program, "u_image");
        this.matrixLocation = this.gl.getUniformLocation(program, "u_matrix");
    }

    setPosition(translation, rotation, scale) {
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
    }

    draw() {
        console.log(this.color)
        this.positionBuffer = this.createPositionBuffer();
        this.colorBuffer = this.createColorBuffer();
        this.texBuffer = this.createTextureBuffers();

        this.readCoordinates();
        this.readColors();

        // Create a texture.
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        // Upload the image into the texture.
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);

        this.readTexCoordinates();

        // set which texture units to render with.
        this.gl.uniform1i(this.u_imageLocation, 0);  // texture unit 0

        // Set each texture unit to use a particular texture.
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);


        // Compute the matrices
        var matrix = m4.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, 400);
        matrix = m4.translate(matrix, this.translation[0], this.translation[1], this.translation[2]);
        matrix = m4.xRotate(matrix, this.rotation[0]);
        matrix = m4.yRotate(matrix, this.rotation[1]);
        matrix = m4.zRotate(matrix, this.rotation[2]);
        matrix = m4.scale(matrix, this.scale[0], this.scale[1], this.scale[2]);

        // Set the matrix.
        this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix);


        // Draw the geometry.
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        var count = 3 * 3 * 2;
        this.gl.drawArrays(primitiveType, offset, count);
    }

    readCoordinates() {
        // Turn on the position attribute
        this.gl.enableVertexAttribArray(this.positionLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 3;          // 3 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            this.positionLocation, size, type, normalize, stride, offset);
    }

    readColors() {
        // Turn on the color attribute
        this.gl.enableVertexAttribArray(this.colorLocation);

        // Bind the color buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);

        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        var size = 3;                 // 3 components per iteration
        var type = this.gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
        var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
        var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;               // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            this.colorLocation, size, type, normalize, stride, offset);

    }

    readTexCoordinates() {
        this.gl.enableVertexAttribArray(this.texcoordLocation);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuffer);

        // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            this.texcoordLocation, size, type, normalize, stride, offset);
    }

    createTextureBuffers() {
        var texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoordinates), this.gl.STATIC_DRAW);

        return texcoordBuffer;
    }

    createPositionBuffer() {
        // Create a buffer to put positions in
        var positionBuffer = this.gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        // Put geometry data into buffer
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.position),
            this.gl.STATIC_DRAW);

        return positionBuffer;
    }

    createColorBuffer() {
        // Create a buffer to put colors in
        var colorBuffer = this.gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        // Put color data into buffer
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.color),
            this.gl.STATIC_DRAW);

        return colorBuffer;
    }
}