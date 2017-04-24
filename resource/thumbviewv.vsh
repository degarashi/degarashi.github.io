#version 100
#define GLSLIFY 1

attribute vec2 a_position;
attribute vec2 a_uv;
uniform vec4 u_rect;
uniform mat4 u_matrix;
varying vec2 v_uv;

void main() {
	v_uv = a_uv;
	vec2 pos = (a_position / 2.0) + 0.5;
	vec2 size = u_rect.zy - u_rect.xw;
	pos = (pos * size) + u_rect.xw;
	pos = (u_matrix * vec4(pos,0,1)).xy;
	gl_Position = vec4(pos, 0, 1);
}
