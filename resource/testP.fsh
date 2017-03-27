precision mediump float;
uniform float u_alpha;
uniform sampler2D u_texture;
varying float v_dist;

void main() {
	vec4 c = texture2D(u_texture, gl_PointCoord);
	if(c.w < 0.1)
		discard;
	c.xyz *= 1.0 - min(1.0, v_dist/2.0);
	c.w = u_alpha;
	gl_FragColor = c;
}
