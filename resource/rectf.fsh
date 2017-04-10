precision mediump float;

uniform sampler2D u_texture;
uniform float u_alpha;
varying vec2 v_uv;

void main() {
	vec4 c = texture2D(u_texture, v_uv);
	gl_FragColor = vec4(c.rgb, u_alpha);
}
