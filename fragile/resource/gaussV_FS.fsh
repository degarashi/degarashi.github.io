#version 100
precision mediump float;
#define GLSLIFY 1
#ifdef VShader
	attribute vec2 a_position;
	attribute vec2 a_uv;
#else
	uniform float u_weight[9];
	uniform sampler2D u_texDiffuse;
#endif
// [(0)x,y | (1)z,w]
varying vec4 v_tex[4];
varying vec2 v_texC;
// [x,y | z(xInv),w(yInv)]
uniform vec4 u_mapSize;
uniform vec4 u_uvrect;

vec4 GaussMix9(vec2 uvc, vec4 uv[4], float w[9], sampler2D tex, vec2 diff) {
	vec4 c;
	c = w[0] * texture2D(tex, uvc);
	c += w[1] * (texture2D(tex, uv[0].xy)
				+ texture2D(tex, uv[3].zw - diff));
	c += w[2] * (texture2D(tex, uv[0].zw)
				+ texture2D(tex, uv[3].xy - diff));
	c += w[3] * (texture2D(tex, uv[1].xy)
				+ texture2D(tex, uv[2].zw - diff));
	c += w[4] * (texture2D(tex, uv[1].zw)
				+ texture2D(tex, uv[2].xy - diff));
	c += w[5] * (texture2D(tex, uv[2].xy)
				+ texture2D(tex, uv[1].zw - diff));
	c += w[6] * (texture2D(tex, uv[2].zw)
				+ texture2D(tex, uv[1].xy - diff));
	c += w[7] * (texture2D(tex, uv[3].xy)
				+ texture2D(tex, uv[0].zw - diff));
	c += w[8] * (texture2D(tex, uv[3].zw)
				+ texture2D(tex, uv[0].xy - diff));
	c.w = 1.0;
	return c;
}

void main() {
	vec2 diff = vec2(0.0, 17.0 * u_mapSize.w);
	gl_FragColor = GaussMix9(v_texC, v_tex, u_weight, u_texDiffuse, diff);
}
