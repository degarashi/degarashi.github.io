precision mediump float;
#define GLSLIFY 1

void main() {
	vec2 c = gl_PointCoord;
	gl_FragColor = vec4(c.x,c.y,1,1);
}
