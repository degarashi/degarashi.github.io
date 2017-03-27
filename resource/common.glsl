struct Eye {
	vec3 dir,
		 right,
		 up;
};
struct Sys3D {
	Eye eye;
};
uniform Sys3D sys3d;
