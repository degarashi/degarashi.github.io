#version 100
#define GLSLIFY 1
attribute vec2 a_position;
attribute vec2 a_uv;
uniform vec2 u_scale;
varying vec2 v_uv;

void main() {
	v_uv = a_uv;
	vec2 pos = a_position * u_scale;
	gl_Position = vec4(pos, 0, 1);
}
