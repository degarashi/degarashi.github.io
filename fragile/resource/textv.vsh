#version 100
precision mediump float;
#define GLSLIFY 1

varying vec4 v_uv;
varying float v_time;

attribute vec2 a_position;
attribute vec4 a_uv;
attribute float a_time;
uniform vec2 u_offset;
uniform vec2 u_screenSize;

void main() {
	v_uv = a_uv;
	v_time = a_time;
	vec2 sh = u_screenSize * vec2(0.5);
	vec2 pos = a_position + u_offset;
	pos.y = u_screenSize.y - pos.y;
	pos /= sh;
	pos -= vec2(1);
	gl_Position = vec4(pos, 0,1);
}
