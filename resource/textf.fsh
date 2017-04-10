precision mediump float;

uniform sampler2D u_texture;
uniform float u_time;
uniform float u_delay;
varying vec4 v_uv;
varying float v_time;
varying float v_alpha;

void main() {
	float d = texture2D(u_texture, v_uv.xy).w;
	if(d < 0.1)
		discard;
	float y = v_uv.w*0.75 + 0.25;
	float lum = max(0.0, min(u_delay, u_time-v_time))/u_delay;
	gl_FragColor = vec4(lum*y,lum*y,lum*y, d*v_alpha);
}
