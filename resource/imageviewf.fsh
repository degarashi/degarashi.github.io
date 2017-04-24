#version 100
precision mediump float;
#define GLSLIFY 1

uniform sampler2D u_texture;
varying vec2 v_uv;

void main() {
	vec4 c = texture2D(u_texture, v_uv);
	c.w = 1.0;
	gl_FragColor = c;
}
