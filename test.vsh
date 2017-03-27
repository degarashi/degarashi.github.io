#define GLSLIFY 1
uniform mat4 u_mTrans;
attribute vec3 a_position;
attribute vec4 a_color;
attribute vec2 a_uv;
varying vec4 v_color;
varying vec2 v_uv;

void main() {
	v_color = a_color;
	v_uv = a_uv;
	gl_Position = u_mTrans * vec4(a_position, 1);
}
