#version 100
#define GLSLIFY 1
attribute vec3 a_position;
attribute vec3 a_hsv;
uniform mat4 u_mTrans,
			u_mWorld;
uniform mat4 u_mColor;
uniform vec3 u_eyePos;
uniform float u_hue;
varying float v_dist;
varying vec3 v_hsv;

void main() {
	v_hsv = a_hsv;
	v_hsv.x += u_hue;
	vec4 pos = vec4(a_position, 1);
	vec3 posw = (u_mWorld * pos).xyz;
	v_dist = distance(posw, u_eyePos);
	gl_PointSize = 20.0/v_dist;
	gl_Position = u_mTrans * pos;
}
