#version 100
precision mediump float;
#define GLSLIFY 1

varying vec4 v_color;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform sampler2D u_light;
void main() {
	vec2 uv = v_uv;
	uv *= vec2(2);
	vec4 c = texture2D(u_texture, uv);
	c += texture2D(u_light, uv);
	c.w = 0.5;
	gl_FragColor = c;
}
