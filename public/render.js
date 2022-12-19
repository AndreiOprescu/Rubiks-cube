"use strict";

import { setSquares } from "/startingValues.js";
import { squares } from "/startingValues.js"
import { turns } from "/startingValues.js";
import { translation, rotation, scale } from "/startingValues.js";

export function render(images) {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    const vertexShaderGLSL = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    attribute vec2 a_texCoord;
   
    uniform mat4 u_matrix;
  
    varying vec4 v_color;
    varying vec2 v_texCoord;
   
    void main() {
      // Multiply the position by the matrix.
      gl_Position = u_matrix * a_position;
  
      // Pass the color to the fragment shader.
      v_color = a_color;
      v_texCoord = a_texCoord;
    }`

    const fragmentShaderGLSL = `
    precision mediump float;
  
    uniform sampler2D u_image;
   
    // Passed in from the vertex shader.
    varying vec4 v_color;
    varying vec2 v_texCoord;
   
    void main() {
      // I commenting out the texture loader so I can analyse the problem better
      gl_FragColor = v_color; // * texture2D(u_image, v_texCoord)
    }`

    // setup GLSL program
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderGLSL);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader))
    };

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderGLSL);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(fragmentShader))
    };

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    setSquares(gl, images, program);

    setButtons();

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
    webglLessonsUI.setupSlider("#z", { value: translation[2], slide: updatePosition(2), max: gl.canvas.height });
    webglLessonsUI.setupSlider("#angleX", { value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360 });
    webglLessonsUI.setupSlider("#angleY", { value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360 });
    webglLessonsUI.setupSlider("#angleZ", { value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360 });
    webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#scaleZ", { value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2 });

    drawScene();

    function updatePosition(index) {
        return function (event, ui) {
            translation[index] = ui.value;
            drawScene();
        };
    }

    function updateRotation(index) {
        return function (event, ui) {
            var angleInDegrees = ui.value;
            var angleInRadians = angleInDegrees * Math.PI / 180;
            rotation[index] = angleInRadians;
            drawScene();
        };
    }

    function updateScale(index) {
        return function (event, ui) {
            scale[index] = ui.value;
            drawScene();
        };
    } 

    // Draw the scene.
    function drawScene() {
        // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.clearColor(0.5, 0.7, 1.0, 1.0);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);


        for (var i = 0; i < squares.length; i++) {
            var s = squares[i]
            s.setPosition(translation, rotation, scale);
            s.draw();
        }
    }

    function setButtons() {
        document.getElementById('F').onclick = f => { turns.F(render, images)};
        document.getElementById('R').onclick = f => { turns.R(render, images)};
        document.getElementById('U').onclick = f => { turns.U(render, images)};
        document.getElementById('B').onclick = f => { turns.B(render, images)};
        document.getElementById('L').onclick = f => { turns.L(render, images)};
        document.getElementById('D').onclick = f => { turns.D(render, images)};
        document.getElementById('F`').onclick = f => { turns.F_p(render, images)};
        document.getElementById('R`').onclick = f => { turns.R_p(render, images)};
        document.getElementById('U`').onclick = f => { turns.U_p(render, images)};
        document.getElementById('B`').onclick = f => { turns.B_p(render, images)};
        document.getElementById('L`').onclick = f => { turns.L_p(render, images)};
        document.getElementById('D`').onclick = f => { turns.D_p(render, images)};
        document.getElementById('M').onclick = f => { turns.M(render, images)};
        document.getElementById('E').onclick = f => { turns.E(render, images)};
        document.getElementById('S').onclick = f => { turns.S(render, images)};
        document.getElementById('M`').onclick = f => { turns.M_p(render, images)};
        document.getElementById('E`').onclick = f => { turns.E_p(render, images)};
        document.getElementById('S`').onclick = f => { turns.S_p(render, images)};
        document.getElementById('x_turn').onclick = f => { turns.x(render, images)};
        document.getElementById('y_turn').onclick = f => { turns.y(render, images)};
        document.getElementById('z_turn').onclick = f => { turns.z(render, images)};

    }
}
