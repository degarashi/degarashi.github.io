vec3 Hue(const float hue) {
	vec3 rgb = fract(hue + vec3(0.0, 2.0/3.0, 1.0/3.0));
	rgb = abs(rgb * 2.0 - 1.0);
	return clamp(rgb * 3.0 - 1.0, 0.0, 1.0);
}
vec3 HSVtoRGB(in vec3 hsv) {
	return ((Hue(hsv.x) - 1.0) * hsv.y + 1.0) * hsv.z;
}
#pragma glslify: export(HSVtoRGB)
