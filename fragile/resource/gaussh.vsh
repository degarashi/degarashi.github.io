#version 100
precision mediump float;
#define GLSLIFY 1
#define VShader
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

void UV9(
	out vec4 dst[4],			// [(0)x,y | (1)z,w]
	out vec2 dstC,
	const vec2 uv_0,				// 基準となるUV座標
	const vec2 mapWidthInv,		// テクスチャサイズ逆数
	const vec2 initDiff,		// 初回の1テクセルをずらす距離
	const vec2 diff				// 1テクセル毎にずらす距離
) {
	dstC = uv_0;
	vec2 cur = uv_0 + initDiff * mapWidthInv;
	vec2 td = diff * mapWidthInv;
	dst[0].xy = cur;
	cur += td;
	dst[0].zw = cur;
	cur += td;
	dst[1].xy = cur;
	cur += td;
	dst[1].zw = cur;
	cur += td;
	dst[2].xy = cur;
	cur += td;
	dst[2].zw = cur;
	cur += td;
	dst[3].xy = cur;
	cur += td;
	dst[3].zw = cur;
}

void main() {
	vec2 uv = a_uv * (u_uvrect.zy-u_uvrect.xw) + u_uvrect.xw;
	UV9(v_tex, v_texC, uv, u_mapSize.zw, vec2(1.5, 0), vec2(2, 0));
	gl_Position = vec4(a_position, 0, 1);
}
