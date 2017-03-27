#define GLSLIFY 1
uniform mat4 u_mTrans,
			u_mWorld;
uniform vec3 u_eyePos;
attribute vec3 a_position;

void main() {
	vec4 pos = vec4(a_position, 1);
	vec3 posw = (u_mWorld * pos).xyz;
	/* gl_PointSize = 1.0/distance(posw, u_eyePos); */
	gl_PointSize = 1.0;
	gl_Position = u_mTrans * pos;
}
