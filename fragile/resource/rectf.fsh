#version 100
precision mediump float;
#define GLSLIFY 1

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_alpha;
uniform vec3 u_color;

void main() {
	vec4 c = texture2D(u_texture, v_uv);
	gl_FragColor = vec4(c.rgb * u_color, u_alpha);
}
