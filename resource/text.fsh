precision mediump float;

uniform sampler2D u_texture;
uniform float u_time;
varying vec4 v_uv;
varying float v_time;

void main() {
	float d = texture2D(u_texture, v_uv.xy).w;
	if(d < 0.1)
		discard;
	float y = v_uv.w*0.75 + 0.25;
	float lum = max(0.0, min(8.0, u_time-v_time))/8.0;
	gl_FragColor = vec4(lum*y,lum*y,lum*y,lum*d);
}
