precision mediump float;
#define GLSLIFY 1
uniform float u_alpha;
uniform sampler2D u_texture;
varying float v_dist;
varying vec3 v_hsv;
vec3 Hue(const float hue) {
	vec3 rgb = fract(hue + vec3(0.0, 2.0/3.0, 1.0/3.0));
	rgb = abs(rgb * 2.0 - 1.0);
	return clamp(rgb * 3.0 - 1.0, 0.0, 1.0);
}
vec3 HSVtoRGB(in vec3 hsv) {
	return ((Hue(hsv.x) - 1.0) * hsv.y + 1.0) * hsv.z;
}

void main() {
	vec4 c = texture2D(u_texture, gl_PointCoord);
	if(c.w < 0.1)
		discard;
	vec3 r = HSVtoRGB(v_hsv);
	c.xyz *= r;
	c.xyz *= 1.0 - min(1.0, v_dist/2.0);
	c.w = u_alpha;
	gl_FragColor = c;
}
