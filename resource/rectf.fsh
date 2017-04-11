precision mediump float;
#define GLSLIFY 1

uniform sampler2D u_texture;
uniform float u_alpha;
uniform float u_zoom;
varying vec2 v_uv;

void main() {
	vec2 uv = v_uv * u_zoom;
	uv = uv*0.5+0.5;
	vec4 c = texture2D(u_texture, uv);
	gl_FragColor = vec4(c.rgb, u_alpha);
}
