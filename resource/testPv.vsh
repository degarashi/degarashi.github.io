attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_mTrans,
			u_mWorld;
uniform mat4 u_mColor;
uniform vec3 u_eyePos;
varying vec3 v_color;
varying float v_dist;

void main() {
	v_color = a_color;
	vec4 pos = vec4(a_position, 1);
	vec3 posw = (u_mWorld * pos).xyz;
	v_dist = distance(posw, u_eyePos);
	gl_PointSize = 20.0/v_dist;
	gl_Position = u_mTrans * pos;
}
