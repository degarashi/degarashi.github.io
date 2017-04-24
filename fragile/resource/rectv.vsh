#version 100
#define GLSLIFY 1
attribute vec2 a_position;
attribute vec2 a_uv;
uniform vec2 u_uvratio;
uniform vec2 u_uvcenter;
varying vec2 v_uv;

void main() {
	v_uv = a_uv * u_uvratio + u_uvcenter;
	gl_Position = vec4(a_position, 0, 1);
}
