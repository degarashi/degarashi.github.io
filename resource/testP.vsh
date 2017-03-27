attribute vec3 a_position;
uniform mat4 u_mTrans,
			u_mWorld;
uniform vec3 u_eyePos;
varying float v_dist;

void main() {
	vec4 pos = vec4(a_position, 1);
	vec3 posw = (u_mWorld * pos).xyz;
	v_dist = distance(posw, u_eyePos);
	gl_PointSize = 20.0/v_dist;
	gl_Position = u_mTrans * pos;
}
