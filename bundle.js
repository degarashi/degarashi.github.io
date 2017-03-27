(function () {
'use strict';

//! 一行分を切り出す
function GetLine(fp, from) {
	var len = fp.length;
	for(var i=from ; i<len ; i++) {
		var f = fp[i];
		if(!f.chara) {
			if(f.char === "\n")
				{ return i; }
		}
	}
	return i;
}

function PaddingString(n, c) {
	var str = "";
	while(n-- > 0)
		{ str += c; }
	return str;
}
function FixedInteger(nAll, num, pad) {
	if ( pad === void 0 ) pad=" ";

	var str = String(num);
	var remain = nAll - str.length;
	if(remain > 0) {
		str = PaddingString(remain, pad) + str;
	}
	return str;
}
function AddLineNumber(src, lineOffset, viewNum, prevLR, postLR) {
	var res = "";
	if(prevLR)
		{ res += "\n"; }
	var padding = PaddingString(5, " ") + "  ";
	var srcA = src.split("\n");
	var srcLen = srcA.length;
	for(var lnum=0 ; lnum<srcLen ; ++lnum) {
		if(lnum >= viewNum)
			{ res += FixedInteger(5, lnum+lineOffset-viewNum) + ": "; }
		else
			{ res += padding; }
		res += (srcA[lnum]) + "\n";
	}
	if(postLR)
		{ res += "\n"; }
	return res;
}

function Assert$1(cond, msg) {
	if(!cond)
		{ throw Error(msg || "assertion failed"); }
}
function ExtractExtension(fname) {
	var r = /([a-zA-Z0-9_\-]+\.)+([a-zA-Z0-9_\-]+)/;
	var r2 = r.exec(fname);
	if(r2) {
		return r2[2];
	}
	return null;
}
function Saturation(val, min, max) {
	if(val <= min)
		{ return min; }
	if(val >= max)
		{ return max; }
	return val;
}


function VectorToArray() {
	var va = [], len = arguments.length;
	while ( len-- ) va[ len ] = arguments[ len ];

	var n = va.length;
	if(n === 0)
		{ return Float32Array(); }
	if(n === 1)
		{ return va[0].value; }

	var dim = va[0].dim;
	Assert$1(dim);
	var ret = new Float32Array(dim*n);
	for(var i=0 ; i<n ; i++) {
		var v = va[i].value;
		for(var j=0 ; j<dim ; j++) {
			ret[i*dim+j] = v[j];
		}
	}
	return ret;
}
function MatrixToArray() {
	var ma = [], len = arguments.length;
	while ( len-- ) ma[ len ] = arguments[ len ];

	var n = ma.length;
	if(n === 0)
		{ return Float32Array(); }
	if(n === 1)
		{ return ma[0].value; }

	var dim_m = ma[0].dim_m,
		dim_n = ma[0].dim_n;
	var ret = new Float32Array(dim_m*dim_n*n);
	for(var i=0 ; i<n ; i++) {
		var m = ma[i].value;
		for(var j=0 ; j<dim_m*dim_n ; j++) {
			ret[i*dim_m*dim_n+j] = m[j];
		}
	}
	return ret;
}
function VMToArray(vm) {
	if(IsMatrix(vm))
		{ return MatrixToArray(vm); }
	return VectorToArray(vm);
}
function IsVector(v) {
	return v.dim !== undefined;
}
function IsMatrix(m) {
	return m.dim_m !== undefined;
}

var RequestAnimationFrame =
	window.requestAnimationFrame
	|| (function(){
		return window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					function(cb) {
						window.setTimeout(cb, 1000/60);
					};
	})();

/* global gl engine */
function DrawWithGeom(geom, flag) {
	var vbg = geom.vb;
	var count = 0;
	for(var name in vbg) {
		var vb = vbg[name];
		count = vb.length;
		engine.program.setVStream(name, vb);
	}
	var ib = geom.ib;
	if(ib) {
		ib.bind();
		gl.drawElements(flag, ib.length, ib.type, 0);
		ib.unbind();
	} else {
		gl.drawArrays(flag, 0, count);
	}
}

var GObject = function GObject(p) {
	if ( p === void 0 ) p=0;

	Assert$1(typeof p === "number");
	this._priority = p;
	this._bAlive = true;
};

var prototypeAccessors = { alive: {},priority: {} };
GObject.prototype.onUpdate = function onUpdate (/*dt*/) {
	return this.alive;
};
GObject.prototype.onDown = function onDown () {};
GObject.prototype.onUp = function onUp () {};
GObject.prototype.onConnected = function onConnected () {};

GObject.prototype.destroy = function destroy () {
	var prev = this._bAlive;
	this._bAlive = false;
	return prev;
};
prototypeAccessors.alive.get = function () {
	return this._bAlive;
};
prototypeAccessors.priority.get = function () {
	return this._priority;
};
prototypeAccessors.priority.set = function (p) {
	this._priority = p;
};

Object.defineProperties( GObject.prototype, prototypeAccessors );

//! 数学関連のクラス
var TM = {
	EQUAL_THRESHOLD: 1e-5,
	IsEqualNum: function(f0, f1) {
		return Math.abs(f0-f1) <= TM.EQUAL_THRESHOLD;
	},
	Deg2rad: function(deg) {
		return (deg/180) * Math.PI;
	},
	Rad2deg: function(rad) {
		return rad/Math.PI * 180;
	},
	Square: function(v) {
		return v*v;
	},
	GCD: function(a, b) {
		if(a===0 || b===0)
			{ return 0; }
		while(a !== b) {
			if(a > b)	{ a -= b; }
			else		{ b -= a; }
		}
		return a;
	},
	LCM: function(a, b) {
		var div = TM.GCD(a,b);
		if(div === 0)
			{ return 0; }
		return (a / div) * b;
	}
};

var Vec = function Vec(n) {
	var this$1 = this;
	var elem = [], len = arguments.length - 1;
	while ( len-- > 0 ) elem[ len ] = arguments[ len + 1 ];

	this._value = new Float32Array(n);
	for(var i=0 ; i<n ; i++)
		{ this$1._value[i] = elem[i] || 0; }
};

var prototypeAccessors$1 = { dim: {},x: {},y: {},z: {},w: {},value: {},len_sq: {},length: {},clone: {} };
prototypeAccessors$1.dim.get = function () { return this._value.length; };
prototypeAccessors$1.x.get = function () { return this._value[0]; };
prototypeAccessors$1.x.set = function (v) { this._value[0] = v; };
prototypeAccessors$1.y.get = function () { return this._value[1]; };
prototypeAccessors$1.y.set = function (v) { this._value[1] = v; };
prototypeAccessors$1.z.get = function () { return this._value[2]; };
prototypeAccessors$1.z.set = function (v) { this._value[2] = v; };
prototypeAccessors$1.w.get = function () { return this._value[3]; };
prototypeAccessors$1.w.set = function (v) { this._value[3] = v; };
prototypeAccessors$1.value.get = function () { return this._value; };
Vec.prototype.saturate = function saturate (vmin, vmax) {
		var this$1 = this;

	var n = this.dim;
	for(var i=0 ; i<n; i++) {
		var val = this$1._value[i];
		if(val >= vmax)
			{ this$1._value[i] = vmax; }
		else if(val <= vmin)
			{ this$1._value[i] = vmin; }
	}
};
Vec.prototype.equal = function equal (v) {
		var this$1 = this;

	var n = this.dim;
	for(var i=0 ; i<n ; i++) {
		if(!TM.IsEqualNum(this$1._value[i], v._value[i]))
			{ return false; }
	}
	return true;
};
Vec.prototype.lerp = function lerp (v, t) {
		var this$1 = this;

	var n = this.dim;
	for(var i=0 ; i<n ; i++)
		{ this$1._value[i] = (v._value[i]-this$1._value[i])*t + this$1._value[i]; }
};
Vec.prototype.set = function set (v) {
		var this$1 = this;

	var n = this.dim;
	for(var i=0 ; i<n ; i++)
		{ this$1._value[i] = v._value[i]; }
};
Vec.prototype.add = function add (v) {
		var this$1 = this;

	var n = this.dim;
	var ret = this.clone;
	for(var i=0 ; i<n ; i++)
		{ ret._value[i] = this$1._value[i] + v._value[i]; }
	return ret;
};
Vec.prototype.addSelf = function addSelf (v) {
	this.set(this.add(v));
	return this;
};
Vec.prototype.sub = function sub (v) {
		var this$1 = this;

	var n = this.dim;
	var ret = this.clone;
	for(var i=0 ; i<n ; i++)
		{ ret._value[i] = this$1._value[i] - v._value[i]; }
	return ret;
};
Vec.prototype.subSelf = function subSelf (v) {
	this.set(this.sub(v));
	return this;
};
Vec.prototype.mul = function mul (s) {
		var this$1 = this;

	var n = this.dim;
	var ret = this.clone;
	for(var i=0 ; i<n ; i++)
		{ ret._value[i] = this$1._value[i] * s; }
	return ret;
};
Vec.prototype.mulSelf = function mulSelf (s) {
	this.set(this.mul(s));
	return this;
};
Vec.prototype.div = function div (s) {
	return this.mul(1/s);
};
Vec.prototype.divSelf = function divSelf (s) {
	this.set(this.div(s));
	return this;
};
prototypeAccessors$1.len_sq.get = function () {
	return this.dot(this);
};
prototypeAccessors$1.length.get = function () {
	return Math.sqrt(this.len_sq);
};
Vec.prototype.normalize = function normalize () {
	return this.div(this.length);
};
Vec.prototype.normalizeSelf = function normalizeSelf () {
	this.set(this.normalize());
	return this;
};
prototypeAccessors$1.clone.get = function () {
	var ret = new this.constructor();
	ret.set(this);
	return ret;
};
Vec.prototype.dot = function dot (v) {
		var this$1 = this;

	var d = 0;
	var n = this.dim;
	for(var i=0 ; i<n ; i++)
		{ d += this$1._value[i] * v._value[i]; }
	return d;
};
Vec.prototype.minus = function minus () {
	return this.mul(-1);
};
Vec.prototype.toString = function toString () {
		var this$1 = this;

	var n = this.dim;
	var ret = "Vector" + n + ":[";
	var bFirst = true;
	for(var i=0 ; i<n ; i++) {
		if(!bFirst)
			{ ret += ", "; }
		ret += this$1._value[i];
		bFirst = false;
	}
	return ret + "]";
};

Object.defineProperties( Vec.prototype, prototypeAccessors$1 );

var Vec3 = (function (Vec$$1) {
	function Vec3(x,y,z) {
		Vec$$1.call(this, 3, x,y,z);
	}

	if ( Vec$$1 ) Vec3.__proto__ = Vec$$1;
	Vec3.prototype = Object.create( Vec$$1 && Vec$$1.prototype );
	Vec3.prototype.constructor = Vec3;

	Vec3.One = function One (n) {
		return new Vec3(n,n,n);
	};

	Vec3.prototype.cross = function cross (v) {
		var x=this.x,
			y=this.y,
			z=this.z;
		var vx = v.x,
			vy = v.y,
			vz = v.z;
		return new Vec3(
			y*vz - z*vy,
			z*vx - x*vz,
			x*vy - y*vx
		);
	};

	return Vec3;
}(Vec));

/* global gl */
var Clear = (function (GObject$$1) {
	function Clear(p, c, d, s) {
		GObject$$1.call(this, p);
		this.color = c;
		this.depth = d;
		this.stencil = s;
	}

	if ( GObject$$1 ) Clear.__proto__ = GObject$$1;
	Clear.prototype = Object.create( GObject$$1 && GObject$$1.prototype );
	Clear.prototype.constructor = Clear;

	var prototypeAccessors = { stencil: {},depth: {},color: {} };
	prototypeAccessors.stencil.set = function (s) {
		this._stencil = s;
	};
	prototypeAccessors.depth.set = function (d) {
		this._depth = d;
	};
	prototypeAccessors.color.set = function (c) {
		this._color = (c && c.clone) || new Vec3(0,0,0);
	};
	Clear.prototype.onUpdate = function onUpdate (dt) {
		var flag = 0;
		if(this._color) {
			var c = this._color;
			gl.clearColor(c[0], c[1], c[2], 1);
			flag |= gl.COLOR_BUFFER_BIT;
		}
		if(this._depth) {
			gl.clearDepth(this._depth);
			flag |= gl.DEPTH_BUFFER_BIT;
		}
		if(this._stencil) {
			gl.clearStencil(this._stencil);
			flag |= gl.STENCIL_BUFFER_BIT;
		}
		gl.clear(flag);
		return GObject$$1.prototype.onUpdate.call(this, dt);
	};

	Object.defineProperties( Clear.prototype, prototypeAccessors );

	return Clear;
}(GObject));

var Mat = function Mat(m,n) {
	var this$1 = this;
	var arg = [], len = arguments.length - 2;
	while ( len-- > 0 ) arg[ len ] = arguments[ len + 2 ];

	this._value = new Float32Array(m*n);
	Assert$1(arg.length === m*n);
	for(var i=0 ; i<m*n ; i++)
		{ this$1._value[i] = arg[i]; }
};

var prototypeAccessors$5 = { value: {} };
prototypeAccessors$5.value.get = function () { return this._value; };

Object.defineProperties( Mat.prototype, prototypeAccessors$5 );

var Vec4 = (function (Vec$$1) {
	function Vec4(x,y,z,w) {
		Vec$$1.call(this, 4, x,y,z,w);
	}

	if ( Vec$$1 ) Vec4.__proto__ = Vec$$1;
	Vec4.prototype = Object.create( Vec$$1 && Vec$$1.prototype );
	Vec4.prototype.constructor = Vec4;

	Vec4.One = function One (n) {
		return new Vec4(n,n,n,n);
	};

	return Vec4;
}(Vec));

//! ------------------- 行列関連クラス定義 ------------------- 
//! 列優先4x4行列
var Mat44 = (function (Mat$$1) {
	function Mat44() {
		var arg = [], len = arguments.length;
		while ( len-- ) arg[ len ] = arguments[ len ];

		Mat$$1.apply(this, [ 4,4 ].concat( arg ));
	}

	if ( Mat$$1 ) Mat44.__proto__ = Mat$$1;
	Mat44.prototype = Object.create( Mat$$1 && Mat$$1.prototype );
	Mat44.prototype.constructor = Mat44;

	var prototypeAccessors = { dim_m: {},dim_n: {},_m00: {},_m01: {},_m02: {},_m03: {},_m10: {},_m11: {},_m12: {},_m13: {},_m20: {},_m21: {},_m22: {},_m23: {},_m30: {},_m31: {},_m32: {},_m33: {},determinant: {},invert: {},clone: {} };
	prototypeAccessors.dim_m.get = function () {
		return 4;
	};
	prototypeAccessors.dim_n.get = function () {
		return 4;
	};
	//! 行優先
	Mat44.FromRow = function FromRow (
		m00, m01, m02, m03,
		m10, m11, m12, m13,
		m20, m21, m22, m23,
		m30, m31, m32, m33
	) {
		return new Mat44(
			m00, m10, m20, m30,
			m01, m11, m21, m31,
			m02, m12, m22, m32,
			m03, m13, m23, m33
		);
	};
	Mat44.FromVec3s = function FromVec3s (x, y, z) {
		return new Mat44(
			x.x, y.x, z.x, 0,
			x.y, y.y, z.y, 0,
			x.z, y.z, z.z, 0,
			0, 0, 0, 1
		);
	};
	Mat44.FromVec4s = function FromVec4s (x, y, z, w) {
		return new Mat44(
			x.x, y.x, z.x, w.x,
			x.y, y.y, z.y, w.y,
			x.z, y.z, z.z, w.z,
			x.w, y.w, z.w, w.w
		);
	};
	Mat44.LookDir = function LookDir (pos, dir, up) {
		var rdir = up.cross(dir);
		rdir.normalizeSelf();
		up = dir.cross(rdir);
		up.normalizeSelf();
		return new Mat44(
			rdir.x, up.x, dir.x, 0,
			rdir.y, up.y, dir.y, 0,
			rdir.z, up.z, dir.z, 0,
			-rdir.dot(pos), -up.dot(pos), -dir.dot(pos), 1
		);
	};
	Mat44.LookAt = function LookAt (pos, at, up) {
		return Mat44.LookDir(pos, at.sub(pos).normalizeSelf(), up);
	};
	Mat44.Scaling = function Scaling (x,y,z) {
		return new Mat44(
			x,0,0,0,
			0,y,0,0,
			0,0,z,0,
			0,0,0,1
		);
	};
	Mat44.PerspectiveFov = function PerspectiveFov (fov, aspect, znear, zfar) {
		var h = 1 / Math.tan(fov/2);
		var w = h / aspect;
		var f0 = zfar / (zfar - znear),
			f1 = -znear * zfar/(zfar - znear);
		return new Mat44(
			w, 0, 0, 0,
			0, h, 0, 0,
			0, 0, f0, 1,
			0, 0, f1, 0
		);
	};
	Mat44.Translation = function Translation (x,y,z) {
		return new Mat44(
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			x,y,z,1
		);
	};
	Mat44.Rotation = function Rotation (axis, angle) {
		var C = Math.cos(angle),
			S = Math.sin(angle),
			RC = 1-C;
		var axis0 = axis.x,
			axis1 = axis.y,
			axis2 = axis.z;
		return Mat44.FromRow(
			C+TM.Square(axis0)*RC,		axis0*axis1*RC-axis2*S,		axis0*axis2*RC+axis1*S,		0,
			axis0*axis1*RC+axis2*S,			C+TM.Square(axis1)*RC,	axis1*axis2*RC-axis0*S,		0,
			axis0*axis2*RC-axis1*S,			axis1*axis2*RC+axis0*S,		C+TM.Square(axis2)*RC,	0,
			0, 0, 0, 1
		);
	};
	Mat44.RotationX = function RotationX (angle) {
		return Mat44.Rotation(new Vec3(1,0,0), angle);
	};
	Mat44.RotationY = function RotationY (angle) {
		return Mat44.Rotation(new Vec3(0,1,0), angle);
	};
	Mat44.RotationZ = function RotationZ (angle) {
		return Mat44.Rotation(new Vec3(0,0,1), angle);
	};

	Mat44.Zero = function Zero () {
		return new Mat44(0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0);
	};
	Mat44.Identity = function Identity () {
		return new Mat44(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
	};
	Mat44.Iterate = function Iterate (f) {
		for(var i=0 ; i<4 ; i++) {
			for(var j=0 ; j<4 ; j++)
				{ f(j,i); }
		}
	};
	Mat44.prototype.get = function get (n,m) {
		return this._value[n*4 + m];
	};
	Mat44.prototype.set = function set (n,m, val) {
		return this._value[n*4 + m] = val;
	};
	Mat44.prototype.setMat = function setMat (m) {
		var this$1 = this;

		for(var i=0 ; i<16 ; i++)
			{ this$1._value[i] = m._value[i]; }
		return this;
	};
	prototypeAccessors._m00.get = function () { return this._value[0]; };
	prototypeAccessors._m01.get = function () { return this._value[4]; };
	prototypeAccessors._m02.get = function () { return this._value[8]; };
	prototypeAccessors._m03.get = function () { return this._value[12]; };
	prototypeAccessors._m10.get = function () { return this._value[0+1]; };
	prototypeAccessors._m11.get = function () { return this._value[4+1]; };
	prototypeAccessors._m12.get = function () { return this._value[8+1]; };
	prototypeAccessors._m13.get = function () { return this._value[12+1]; };
	prototypeAccessors._m20.get = function () { return this._value[0+2]; };
	prototypeAccessors._m21.get = function () { return this._value[4+2]; };
	prototypeAccessors._m22.get = function () { return this._value[8+2]; };
	prototypeAccessors._m23.get = function () { return this._value[12+2]; };
	prototypeAccessors._m30.get = function () { return this._value[0+3]; };
	prototypeAccessors._m31.get = function () { return this._value[4+3]; };
	prototypeAccessors._m32.get = function () { return this._value[8+3]; };
	prototypeAccessors._m33.get = function () { return this._value[12+3]; };

	prototypeAccessors.determinant.get = function () {
		return this._m00 * this._m11 * this._m22 * this._m33 + this._m00 * this._m12 * this._m23 * this._m31 + this._m00 * this._m13 * this._m21 * this._m32
			+ this._m01 * this._m10 * this._m23 * this._m32 + this._m01 * this._m12 * this._m20 * this._m33 + this._m01 * this._m13 * this._m22 * this._m30
			+ this._m02 * this._m10 * this._m21 * this._m33 + this._m02 * this._m11 * this._m23 * this._m30 + this._m02 * this._m13 * this._m20 * this._m31
			+ this._m03 * this._m10 * this._m22 * this._m31 + this._m03 * this._m11 * this._m20 * this._m32 + this._m03 * this._m12 * this._m21 * this._m30
			- this._m00 * this._m11 * this._m23 * this._m32 - this._m00 * this._m12 * this._m21 * this._m33 - this._m00 * this._m13 * this._m22 * this._m31
			- this._m01 * this._m10 * this._m22 * this._m33 - this._m01 * this._m12 * this._m23 * this._m30 - this._m01 * this._m13 * this._m20 * this._m32
			- this._m02 * this._m10 * this._m23 * this._m31 - this._m02 * this._m11 * this._m20 * this._m33 - this._m02 * this._m13 * this._m21 * this._m30
			- this._m03 * this._m10 * this._m21 * this._m32 - this._m03 * this._m11 * this._m22 * this._m30 - this._m03 * this._m12 * this._m20 * this._m31;
	};
	prototypeAccessors.invert.get = function () {
		var det = this.determinant;
		if(Math.abs(det) > 1e-5) {
			var b = [
				this._m11 * this._m22 * this._m33 + this._m12 * this._m23 * this._m31 + this._m13 * this._m21 * this._m32 - this._m11 * this._m23 * this._m32 - this._m12 * this._m21 * this._m33 - this._m13 * this._m22 * this._m31,
				this._m01 * this._m23 * this._m32 + this._m02 * this._m21 * this._m33 + this._m03 * this._m22 * this._m31 - this._m01 * this._m22 * this._m33 - this._m02 * this._m23 * this._m31 - this._m03 * this._m21 * this._m32,
				this._m01 * this._m12 * this._m33 + this._m02 * this._m13 * this._m31 + this._m03 * this._m11 * this._m32 - this._m01 * this._m13 * this._m32 - this._m02 * this._m11 * this._m33 - this._m03 * this._m12 * this._m31,
				this._m01 * this._m13 * this._m22 + this._m02 * this._m11 * this._m23 + this._m03 * this._m12 * this._m21 - this._m01 * this._m12 * this._m23 - this._m02 * this._m13 * this._m21 - this._m03 * this._m11 * this._m22,

				this._m10 * this._m23 * this._m32 + this._m12 * this._m20 * this._m33 + this._m13 * this._m22 * this._m30 - this._m10 * this._m22 * this._m33 - this._m12 * this._m23 * this._m30 - this._m13 * this._m20 * this._m32,
				this._m00 * this._m22 * this._m33 + this._m02 * this._m23 * this._m30 + this._m03 * this._m20 * this._m32 - this._m00 * this._m23 * this._m32 - this._m02 * this._m20 * this._m33 - this._m03 * this._m22 * this._m30,
				this._m00 * this._m13 * this._m32 + this._m02 * this._m10 * this._m33 + this._m03 * this._m12 * this._m30 - this._m00 * this._m12 * this._m33 - this._m02 * this._m13 * this._m30 - this._m03 * this._m10 * this._m32,
				this._m00 * this._m12 * this._m23 + this._m02 * this._m13 * this._m20 + this._m03 * this._m10 * this._m22 - this._m00 * this._m13 * this._m22 - this._m02 * this._m10 * this._m23 - this._m03 * this._m12 * this._m20,

				this._m10 * this._m21 * this._m33 + this._m11 * this._m23 * this._m30 + this._m13 * this._m20 * this._m31 - this._m10 * this._m23 * this._m31 - this._m11 * this._m20 * this._m33 - this._m13 * this._m21 * this._m30,
				this._m00 * this._m23 * this._m31 + this._m01 * this._m20 * this._m33 + this._m03 * this._m21 * this._m30 - this._m00 * this._m21 * this._m33 - this._m01 * this._m23 * this._m30 - this._m03 * this._m20 * this._m31,
				this._m00 * this._m11 * this._m33 + this._m01 * this._m13 * this._m30 + this._m03 * this._m10 * this._m31 - this._m00 * this._m13 * this._m31 - this._m01 * this._m10 * this._m33 - this._m03 * this._m11 * this._m30,
				this._m00 * this._m13 * this._m21 + this._m01 * this._m10 * this._m23 + this._m03 * this._m11 * this._m20 - this._m00 * this._m11 * this._m23 - this._m01 * this._m13 * this._m20 - this._m03 * this._m10 * this._m21,

				this._m10 * this._m22 * this._m31 + this._m11 * this._m20 * this._m32 + this._m12 * this._m21 * this._m30 - this._m10 * this._m21 * this._m32 - this._m11 * this._m22 * this._m30 - this._m12 * this._m20 * this._m31,
				this._m00 * this._m21 * this._m32 + this._m01 * this._m22 * this._m30 + this._m02 * this._m20 * this._m31 - this._m00 * this._m22 * this._m31 - this._m01 * this._m20 * this._m32 - this._m02 * this._m21 * this._m30,
				this._m00 * this._m12 * this._m31 + this._m01 * this._m10 * this._m32 + this._m02 * this._m11 * this._m30 - this._m00 * this._m11 * this._m32 - this._m01 * this._m12 * this._m30 - this._m02 * this._m10 * this._m31,
				this._m00 * this._m11 * this._m22 + this._m01 * this._m12 * this._m20 + this._m02 * this._m10 * this._m21 - this._m00 * this._m12 * this._m21 - this._m01 * this._m10 * this._m22 - this._m02 * this._m11 * this._m20
			];
			det = 1 / det;
			for(var i=0 ; i<b.length ; i++)
				{ b[i] *= det; }
			return Mat44.FromRow.apply(Mat44, b);
		}
		return null;
	};
	Mat44.prototype.transposeSelf = function transposeSelf () {
		var this$1 = this;

		for(var i=0 ; i<4 ; i++) {
			for(var j=i ; j<4 ; j++) {
				var tmp = this$1.get(i,j);
				this$1.set(i,j, this$1.get(j,i));
				this$1.set(j,i, tmp);
			}
		}
		return this;
	};
	Mat44.prototype.transform3 = function transform3 (v) {
		var this$1 = this;

		var ret = new Vec3(this.get(0,3), this.get(1,3), this.get(2,3));
		for(var i=0 ; i<3 ; i++) {
			for(var j=0 ; j<3 ; j++)
				{ ret._value[i] += this$1.get(i,j) * v._value[j]; }
		}
		return ret;
	};
	prototypeAccessors.clone.get = function () {
		return new (Function.prototype.bind.apply( Mat44, [ null ].concat( this._value) ));
	};
	Mat44.prototype.mul = function mul (m) {
		var this$1 = this;

		if(m instanceof Mat44) {
			var ret = Mat44.Zero();
			Mat44.Iterate(function (i,j) {
				var sum = 0;
				for(var k=0 ; k<4 ; k++)
					{ sum += this$1.get(k,j) * m.get(i,k); }
				ret.set(i,j, sum);
			});
			return ret;
		} else if(m instanceof Vec4) {
			return this._mulVector(m);
		} else {
			Assert$1(false);
		}
		return Mat$$1.prototype.mul.call(this, m);
	};
	Mat44.prototype.mulSelf = function mulSelf (m) {
		return this.setMat(this.mul(m));
	};
	Mat44.prototype._mulVector = function _mulVector (v) {
		var this$1 = this;

		var ret = Vec4.One(0);
		for(var i=0 ; i<4 ; i++) {
			for(var k=0 ; k<4 ; k++) {
				ret._value[i] += this$1.get(k,i) * v._value[k];
			}
		}
		return ret;
	};
	Mat44.prototype.toString = function toString () {
		var this$1 = this;

		var str = "Mat44:\n";
		for(var i=0 ; i<4 ; i++) {
			for(var j=0 ; j<4 ; j++) {
				str += this$1.get(i,j);
				if(j != 3)
					{ str += ", "; }
			}
			if(i != 3)
				{ str += "\n"; }
		}
		return str;
	};

	Object.defineProperties( Mat44.prototype, prototypeAccessors );

	return Mat44;
}(Mat));

//! クォータニオンクラス
var Quat = (function (Vec4$$1) {
	function Quat(x,y,z,w) {
		Vec4$$1.call(this, x,y,z,w);
	}

	if ( Vec4$$1 ) Quat.__proto__ = Vec4$$1;
	Quat.prototype = Object.create( Vec4$$1 && Vec4$$1.prototype );
	Quat.prototype.constructor = Quat;

	var prototypeAccessors = { conjugate: {},elem00: {},elem01: {},elem02: {},elem10: {},elem11: {},elem12: {},elem20: {},elem21: {},elem22: {},xaxis: {},xaxisinv: {},yaxis: {},yaxisinv: {},zaxis: {},zaxisinv: {},right: {},up: {},dir: {},matrix44: {},angle: {},axis: {},vector: {},invert: {},clone: {} };
	Quat.Identity = function Identity () {
		return new Quat(0,0,0,1);
	};

	Quat.RotationYPR = function RotationYPR (yaw, pitch, roll) {
		var q = Quat.Identity();
		// roll
		q.rotateSelfZ(roll);
		// pitch
		q.rotateSelfX(-pitch);
		// yaw
		q.rotateSelfY(yaw);
		return q;
	};
	prototypeAccessors.conjugate.get = function () {
		return new Quat(
			-this._value[0],
			-this._value[1],
			-this._value[2],
			this._value[3]
		);
	};
	prototypeAccessors.elem00.get = function () { return (1-2*this.y*this.y-2*this.z*this.z); };
	prototypeAccessors.elem01.get = function () { return (2*this.x*this.y+2*this.w*this.z); };
	prototypeAccessors.elem02.get = function () { return (2*this.x*this.z-2*this.w*this.y); };
	prototypeAccessors.elem10.get = function () { return (2*this.x*this.y-2*this.w*this.z); };
	prototypeAccessors.elem11.get = function () { return (1-2*this.x*this.x-2*this.z*this.z); };
	prototypeAccessors.elem12.get = function () { return (2*this.y*this.z+2*this.w*this.x); };
	prototypeAccessors.elem20.get = function () { return (2*this.x*this.z+2*this.w*this.y); };
	prototypeAccessors.elem21.get = function () { return (2*this.y*this.z-2*this.w*this.x); };
	prototypeAccessors.elem22.get = function () { return (1-2*this.x*this.x-2*this.y*this.y); };
	//! 回転を行列表現した時のX軸
	prototypeAccessors.xaxis.get = function () {
		return new Vec3(this.elem00, this.elem10, this.elem20);
	};
	//! 正規直行座標に回転を掛けた後のX軸
	prototypeAccessors.xaxisinv.get = function () {
		return new Vec3(this.elem00, this.elem01, this.elem02);
	};
	//!< 回転を行列表現した時のY軸
	prototypeAccessors.yaxis.get = function () {
		return new Vec3(this.elem01, this.elem11, this.elem21);
	};
	//!< 正規直行座標に回転を掛けた後のY軸
	prototypeAccessors.yaxisinv.get = function () {
		return new Vec3(this.elem10, this.elem11, this.elem12);
	};
	//!< 回転を行列表現した時のZ軸
	prototypeAccessors.zaxis.get = function () {
		return new Vec3(this.elem02, this.elem12, this.elem22);
	};
	//!< 正規直行座標に回転を掛けた後のZ軸
	prototypeAccessors.zaxisinv.get = function () {
		return new Vec3(this.elem20, this.elem21, this.elem22);
	};
	//!< X軸に回転を適用したベクトル
	prototypeAccessors.right.get = function () {
		return new Vec3(this.elem00, this.elem01, this.elem02);
	};
	//!< Y軸に回転を適用したベクトル
	prototypeAccessors.up.get = function () {
		return new Vec3(this.elem10, this.elem11, this.elem12);
	};
	//!< Z軸に回転を適用したベクトル
	prototypeAccessors.dir.get = function () {
		return new Vec3(this.elem20, this.elem21, this.elem22);
	};
	//! 行列変換(4x4)
	prototypeAccessors.matrix44.get = function () {
		return new Mat44(
			this.elem00, this.elem01, this.elem02, 0,
			this.elem10, this.elem11, this.elem12, 0,
			this.elem20, this.elem21, this.elem22, 0,
			0,0,0,1
		);
	};
	Quat.prototype.conjugateSelf = function conjugateSelf () {
		return this.set(this.conjugate);
	};
	Quat.prototype.rotateX = function rotateX (a) {
		return this.rotate(new Vec3(1,0,0), a);
	};
	Quat.prototype.rotateY = function rotateY (a) {
		return this.rotate(new Vec3(0,1,0), a);
	};
	Quat.prototype.rotateZ = function rotateZ (a) {
		return this.rotate(new Vec3(0,0,1), a);
	};
	Quat.prototype.rotateSelfX = function rotateSelfX (a) {
		return this.set(this.rotateX(a));
	};
	Quat.prototype.rotateSelfY = function rotateSelfY (a) {
		return this.set(this.rotateY(a));
	};
	Quat.prototype.rotateSelfZ = function rotateSelfZ (a) {
		return this.set(this.rotateZ(a));
	};
	Quat.prototype.rotateSelf = function rotateSelf (axis, a) {
		return this.set(this.rotate(axis, a));
	};
	Quat.RotateX = function RotateX (a) {
		return Quat.Rotate(new Vec3(1,0,0), a);
	};
	Quat.RotateY = function RotateY (a) {
		return Quat.Rotate(new Vec3(0,1,0), a);
	};
	Quat.RotateZ = function RotateZ (a) {
		return Quat.Rotate(new Vec3(0,0,1), a);
	};
	Quat.Rotate = function Rotate (axis, a) {
		var C = Math.cos(a/2),
			S = Math.sin(a/2);
		axis = axis.mul(S);
		return new Quat(axis.x, axis.y, axis.z, C);
	};
	Quat.prototype.rotate = function rotate (axis, a) {
		return Quat.Rotate(axis, a).mul(this);
	};
	prototypeAccessors.angle.get = function () {
		return Math.acos(Saturation(this.w, -1, 1))*2;
	};
	prototypeAccessors.axis.get = function () {
		var s_theta = Math.sqrt(1 - this.w*this.w);
		if(s_theta < 0.0001)
			{ throw new Error("no valid axis"); }
		s_theta = 1 / s_theta;
		return new Vec3(this.x*s_theta, this.y*s_theta, this.z*s_theta);
	};
	Quat.prototype.mul = function mul (q) {
		if(q instanceof Quat) {
			return new Quat(
				this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y,
				this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x,
				this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w,
				this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z
			);
		} else if(typeof q === "number") {
			return Vec4$$1.prototype.mul.call(this, q);
		} else if(q instanceof Vec3) {
			var q0 = new Quat(q.x, q.y, q.z);
			q0.w = 0;
			// return this.invert.mul(q0).mul(this).vector;
			return (this.mul(q0).mul(this.invert)).vector;
		}
		Assert$1(false);
	};
	prototypeAccessors.vector.get = function () {
		return new Vec3(this.x, this.y, this.z);
	};
	prototypeAccessors.invert.get = function () {
		return this.conjugate.divSelf(this.len_sq);
	};
	Quat.prototype.invertSelf = function invertSelf () {
		return this.set(this.invert);
	};
	//! 球面線形補間
	Quat.prototype.slerp = function slerp (q, t) {
		var ac = Saturation(this.dot(q), 0, 1);
		var theta = Math.acos(ac),
			S = Math.sin(theta);
		if(Math.abs(S) < 0.001)
			{ return this.clone; }
		var rq = this.mul(Math.sin(theta * (1-t)) / S);
		rq.addSelf(q.mul(Math.sin(theta * t) / S));
		return rq;
	};
	prototypeAccessors.clone.get = function () {
		return new Quat(this.x, this.y, this.z, this.w);
	};

	Object.defineProperties( Quat.prototype, prototypeAccessors );

	return Quat;
}(Vec4));

//! 3D姿勢
var Pose3D = function Pose3D(pos, rot, scale) {
	this.pos = pos || Vec3.One(0);
	this.rot = rot || Quat.Identity();
	this.scale = scale || Vec3.One(1);
};

var prototypeAccessors$4 = { clone: {} };
Pose3D.prototype.asMatrix = function asMatrix () {
	// Scaling, Rotation, Position の順
	return Mat44.Translation(this.pos.x, this.pos.y, this.pos.z).mul(
		this.rot.matrix44.mul(
			Mat44.Scaling(this.scale.x, this.scale.y, this.scale.z)
		)
	);
};
prototypeAccessors$4.clone.get = function () {
	return new Pose3D(this.pos, this.rot, this.scale);
};

Object.defineProperties( Pose3D.prototype, prototypeAccessors$4 );

var Camera3D = (function (Pose3D$$1) {
	function Camera3D() {
		var args = [], len = arguments.length;
		while ( len-- ) args[ len ] = arguments[ len ];

		Pose3D$$1.apply(this, args);
		this.fov = 90;
		this.aspect = 1;
		this.nearZ = 1e-2;
		this.farZ = 10;
	}

	if ( Pose3D$$1 ) Camera3D.__proto__ = Pose3D$$1;
	Camera3D.prototype = Object.create( Pose3D$$1 && Pose3D$$1.prototype );
	Camera3D.prototype.constructor = Camera3D;
	Camera3D.prototype.getView = function getView () {
		return Mat44.LookDir(this.pos, this.rot.dir, new Vec3(0,1,0));
	};
	Camera3D.prototype.getProjection = function getProjection () {
		return Mat44.PerspectiveFov(
			this.fov,
			this.aspect,
			this.nearZ,
			this.farZ
		);
	};
	Camera3D.prototype.getViewProjection = function getViewProjection () {
		return this.getProjection().mul(this.getView());
	};
	/*! \param[in] pt	スクリーン座標(Vec2) */
	Camera3D.prototype.unproject = function unproject (pt) {
		var vp = this.getViewProjection();
		vp = vp.invert();
		var v0 = new Vec4(pt.x, pt.y, 0, 1),
			v1 = new Vec4(pt.x, pt.y, 1, 1);
		v0 = vp.mul(v0);
		v1 = vp.mul(v1);
		v0.divSelf(v0.w);
		v1.divSelf(v1.w);
		return v1.subSelf(v0).normalizeSelf();
	};

	return Camera3D;
}(Pose3D));

var SysUnif3D = function SysUnif3D() {
	this.camera = new Camera3D();
	this.worldMatrix = Mat44.Identity();
};

var prototypeAccessors$3 = { camera: {},worldMatrix: {} };
prototypeAccessors$3.camera.set = function (c) {
	this._camera = c;
};
prototypeAccessors$3.camera.get = function () {
	return this._camera;
};
prototypeAccessors$3.worldMatrix.set = function (m) {
	this._mWorld = m;
};
prototypeAccessors$3.worldMatrix.get = function () {
	return this._mWorld;
};
SysUnif3D.prototype.apply = function apply (prog) {
	if(prog.hasUniform("u_mWorld")) {
		prog.setUniform("u_mWorld", this.worldMatrix);
	}
	if(prog.hasUniform("u_mTrans")) {
		var m = this.camera.getViewProjection().mulSelf(this.worldMatrix);
		prog.setUniform("u_mTrans", m);
	}
	if(prog.hasUniform("u_eyePos")) {
		prog.setUniform("u_eyePos", this.camera.pos);
	}
};

Object.defineProperties( SysUnif3D.prototype, prototypeAccessors$3 );

var Resource = function Resource () {};

/* global gl */
var GLTexture = (function (Resource$$1) {
	function GLTexture() {
		Resource$$1.call(this);
		Assert$1(this.typeId);
		this._clean();
		this._id = gl.createTexture();
	}

	if ( Resource$$1 ) GLTexture.__proto__ = Resource$$1;
	GLTexture.prototype = Object.create( Resource$$1 && Resource$$1.prototype );
	GLTexture.prototype.constructor = GLTexture;

	var prototypeAccessors = { id: {},width: {},height: {} };
	GLTexture.prototype._clean = function _clean () {
		this._id = null;
		this._bind = 0;
		this._width = null;
		this._height = null;
	};
	prototypeAccessors.id.get = function () { return this._id; };
	prototypeAccessors.width.get = function () { return this._width; };
	prototypeAccessors.height.get = function () { return this._height; };

	GLTexture.prototype.setLinear = function setLinear (bLMin, bLMag, iMip) {
		// [iMip][bL]
		var flags = [
			gl.NEAREST,
			gl.LINEAR,
			gl.NEAREST_MIPMAP_NEAREST,
			gl.NEAREST_MIPMAP_LINEAR,
			gl.LINEAR_MIPMAP_NEAREST,
			gl.LINEAR_MIPMAP_LINEAR
		];
		this.bind();
		gl.texParameteri(this.typeId, gl.TEXTURE_MIN_FILTER, flags[(iMip<<1) | Number(bLMin)]);
		gl.texParameteri(this.typeId, gl.TEXTURE_MAG_FILTER, flags[Number(bLMag)]);
		this.unbind();
	};
	GLTexture.prototype.setWrap = function setWrap (s, t) {
		if(!t)
			{ t = s; }
		this.bind();
		gl.texParameteri(this.typeId, gl.TEXTURE_WRAP_S, s);
		gl.texParameteri(this.typeId, gl.TEXTURE_WRAP_T, t);
		this.unbind();
	};
	GLTexture.prototype.bind = function bind () {
		Assert$1(this.id, "already discarded");
		Assert$1(this._bind === 0, "already binded");
		gl.bindTexture(this.typeId, this.id);
		++this._bind;
	};
	GLTexture.prototype.bind_loose = function bind_loose () {
		Assert$1(this.id, "already discarded");
		gl.bindTexture(this.typeId, this.id);
		++this._bind;
	};
	GLTexture.prototype.unbind = function unbind () {
		Assert$1(this._bind > 0, "not binded yet");
		gl.bindTexture(this.typeId, null);
		--this._bind;
	};
	GLTexture.prototype.setData = function setData (level, fmt, width, height, srcFmt, srcFmtType, pixels) {
		this.bind();
		gl.texImage2D(this.typeId, level, fmt, width, height, 0, srcFmt, srcFmtType, pixels);
		this.unbind();
		this._width = width;
		this._height = height;
	};
	GLTexture.prototype.setSubData = function setSubData (level, rect, srcFmt, srcFmtType, pixels) {
		this.bind();
		gl.texSubImage2D(this.typeId, level, rect.left, rect.top, rect.width, rect.height, srcFmt, srcFmtType, pixels);
		this.unbind();
	};
	GLTexture.prototype.setImage = function setImage (level, fmt, srcFmt, srcFmtType, obj) {
		this.bind();
		gl.texImage2D(this.typeId, level, fmt, srcFmt, srcFmtType, obj);
		this.unbind();
		this._width = obj.width;
		this._height = obj.height;
	};
	GLTexture.prototype.setSubImage = function setSubImage (level, x, y, srcFmt, srcFmtType, obj) {
		this.bind();
		gl.texSubImage2D(this.typeId, level, x, y, srcFmt, srcFmtType, obj);
		this.unbind();
	};
	GLTexture.prototype.genMipmap = function genMipmap () {
		this.bind();
		gl.generateMipmap(this.typeId);
		this.unbind();
	};
	GLTexture.prototype.discard = function discard () {
		Assert$1(!this._bind, "still binding somewhere");
		Assert$1(this.id, "already discarded");
		gl.deleteTexture(this.id);
		this._clean();
	};

	Object.defineProperties( GLTexture.prototype, prototypeAccessors );

	return GLTexture;
}(Resource));

/* global gl */
var glc = {};
function InitGLConst() {
	glc.E_Drawtype = {
		Static: gl.STATIC_DRAW,
		Stream: gl.STREAM_DRAW,
		Dynamic: gl.DYNAMIC_DRAW,
	};
	glc.E_Attachment = {
		Color0: gl.COLOR_ATTACHMENT0,
		Color1: gl.COLOR_ATTACHMENT1,
		Color2: gl.COLOR_ATTACHMENT2,
		Color3: gl.COLOR_ATTACHMENT3,
		Depth: gl.DEPTH_ATTACHMENT,
		Stencil: gl.STENCIL_ATTACHMENT,
		DepthStencil: gl.DEPTH_STENCIL_ATTACHMENT,
	};
	glc.E_RBFormat = {
		Depth16: gl.DEPTH_COMPONENT16,
		Stencil8: gl.STENCIL_INDEX8,
		RGBA4: gl.RGBA4,
		RGB5_A1: gl.RGB5_A1,
		RGB565: gl.RGB565,
	};
	glc.E_InterFormat = {
		Alpha: gl.ALPHA,
		RGB: gl.RGB,
		RGBA: gl.RGBA,
		Luminance: gl.LUMINANCE,
		LuminanceAlpha: gl.LUMINANCE_ALPHA,
	};
	glc.E_TexDataFormat = {
		UB: gl.UNSIGNED_BYTE,
		US565: gl.UNSIGNED_SHORT_5_6_5,
		US4444: gl.UNSIGNED_SHORT_4_4_4_4,
		US5551: gl.UNSIGNED_SHORT_5_5_5_1,
	};
	glc.GLSLTypeInfo = ( obj = {}, obj[gl.INT] = {
			name: "Int",
			size: 1,
			uniformF: gl.uniform1i
		}, obj[gl.INT_VEC2] = {
			name: "IntVec2",
			size: 2,
			uniformF: gl.uniform2iv
		}, obj[gl.INT_VEC3] = {
			name: "IntVec3",
			size: 3,
			uniformF: gl.uniform3iv
		}, obj[gl.INT_VEC4] = {
			name: "IntVec4",
			size: 4,
			uniformF: gl.uniform4iv
		}, obj[gl.FLOAT] = {
			name: "Float",
			size: 1,
			uniformF: gl.uniform1f,
			vertexF: gl.vertexAttrib1f
		}, obj[gl.FLOAT_VEC2] = {
			name: "FloatVec2",
			size: 2,
			uniformF: gl.uniform2fv,
			vertexF: gl.vertexAttrib2fv
		}, obj[gl.FLOAT_VEC3] = {
			name: "FloatVec3",
			size: 3,
			uniformF: gl.uniform3fv,
			vertexF: gl.vertexAttrib3fv
		}, obj[gl.FLOAT_VEC4] = {
			name: "FloatVec4",
			size: 4,
			uniformF: gl.uniform4fv,
			vertexF: gl.vertexAttrib4fv
		}, obj[gl.FLOAT_MAT2] = {
			name: "FloatMat2",
			size: 2,
			uniformF: gl.uniformMatrix2fv,
		}, obj[gl.FLOAT_MAT3] = {
			name: "FloatMat3",
			size: 3,
			uniformF: gl.uniformMatrix3fv,
		}, obj[gl.FLOAT_MAT4] = {
			name: "FloatMat4",
			size: 4,
			uniformF: gl.uniformMatrix4fv,
		}, obj[gl.SAMPLER_2D] = {
			name: "Sampler2D",
			size: 1,
			uniformF: gl.uniform1i,
		}, obj );
	var obj;
	glc.GLTypeInfo = ( obj$1 = {}, obj$1[gl.BYTE] = {
			bytesize: 1,
		}, obj$1[gl.SHORT] = {
			bytesize: 2,
		}, obj$1[gl.UNSIGNED_BYTE] = {
			bytesize: 1,
		}, obj$1[gl.UNSIGNED_SHORT] = {
			bytesize: 2,
		}, obj$1[gl.FLOAT] = {
			bytesize: 4,
		}, obj$1 );
	var obj$1;
	// gl.enable/disable
	glc.GLBoolSetting = {
		blend: gl.BLEND,
		cullface: gl.CULL_FACE,
		depthtest: gl.DEPTH_TEST,
		dither: gl.DITHER,
		polygonoffsetfill: gl.POLYGON_OFFSET_FILL,
		samplealphatocoverage: gl.SAMPLE_ALPHA_TO_COVERAGE,
		samplecoverage: gl.SAMPLE_COVERAGE,
		scissortest: gl.SCISSOR_TEST,
		stenciltest: gl.STENCIL_TEST,
	};
	glc.E_BlendEquation = {
		add: gl.FUNC_ADD,
		sub: gl.FUNC_SUBTRACT,
		reversesub: gl.FUNC_REVERSE_SUBTRACT,
	};
	glc.E_BlendFunc = {
		zero: gl.ZERO,
		one: gl.ONE,
		srccolor: gl.SRC_COLOR,
		dstcolor: gl.DST_COLOR,
		oneminussrccolor: gl.ONE_MINUS_SRC_COLOR,
		oneminusdstcolor: gl.ONE_MINUS_DST_COLOR,
		srcalpha: gl.SRC_ALPHA,
		dstalpha: gl.DST_ALPHA,
		oneminussrcalpha: gl.ONE_MINUS_SRC_ALPHA,
		oneminusdstalpha: gl.ONE_MINUS_DST_ALPHA,
		constantcolor: gl.CONSTANT_COLOR,
		oneminusconstantcolor: gl.ONE_MINUS_CONSTANT_COLOR,
		oneminusconstantalpha: gl.ONE_MINUS_CONSTANT_ALPHA,
		srcalphasaturate: gl.SRC_ALPHA_SATURATE,
	};
	glc.E_DepthFunc = {
		never: gl.NEVER,
		always: gl.ALWAYS,
		less: gl.LESS,
		lessequal: gl.LEQUAL,
		equal: gl.EQUAL,
		notequal: gl.NOTEQUAL,
		greater: gl.GREATER,
		greaterequal: gl.GEQUAL,
	};
	glc.E_StencilFunc = glc.E_DepthFunc;
	glc.E_StencilOp = {
		keep: gl.KEEP,
		zero: gl.ZERO,
		replace: gl.REPLACE,
		increment: gl.INCR,
		decrement: gl.DECR,
		invert: gl.INVERT,
		incrementwrap: gl.INCR_WRAP,
		decrementwrap: gl.DECR_WRAP,
	};
	glc.E_Face = {
		front: gl.FRONT,
		back: gl.BACK,
		frontandback: gl.FRONT_AND_BACK,
	};
	glc.E_CW = {
		cw: gl.CW,
		ccw: gl.CCW,
	};
	glc.GLValueSetting = {
		blendcolor: gl.blendColor,
		blendequation: function(mode0, mode1) {
			if(!mode1)
				{ mode1 = mode0; }
			gl.blendEquationSeparate(glc.E_BlendFunc[mode0], glc.E_BlendFunc[mode1]);
		},
		blendfunc: function(sf0, df0, sf1, df1) {
			if(!sf1) {
				sf1 = sf0;
				df1 = df0;
			}
			gl.blendFuncSeparate(
				glc.E_BlendFunc[sf0],
				glc.E_BlendFunc[df0],
				glc.E_BlendFunc[sf1],
				glc.E_BlendFunc[df1]
			);
		},
		depthfunc: function(func) {
			gl.depthFunc(glc.E_DepthFunc[func]);
		},
		samplecoverage: gl.sampleCoverage,
		_stencilfunc: function(dir, func, ref, mask) {
			gl.stencilFuncSeparate(dir, glc.E_StencilFunc[func], ref, mask);
		},
		stencilfuncfront: function(func, ref, mask) {
			glc._stencilfunc(gl.FRONT, func, ref, mask);
		},
		stencilfuncback: function(func, ref, mask) {
			glc._stencilfunc(gl.BACK, func, ref, mask);
		},
		stencilfunc: function(func, ref, mask) {
			glc._stencilfunc(gl.FRONT_AND_BACK, func, ref, mask);
		},
		_stencilop: function(dir, func, ref, mask) {
			gl.stencilOpSeparate(dir, glc.E_StencilOp[func], ref, mask);
		},
		stencilop: function(func, ref, mask) {
			glc._stencilop(gl.FRONT_AND_BACK, func, ref, mask);
		},
		stencilopfront: function(func, ref, mask) {
			glc._stencilop(gl.FRONT, func, ref, mask);
		},
		stencilopback: function(func, ref, mask) {
			glc._stencilop(gl.BACK, func, ref, mask);
		},
		colormask: gl.colorMask,
		depthmask: gl.depthMask,
		stencilmask: gl.stencilMask,
		stencilmaskfront: function(mask) {
			gl.stencilMaskSeparate(gl.FRONT, mask);
		},
		stencilmaskback: function(mask) {
			gl.stencilMaskSeparate(gl.BACK, mask);
		},
		cullface: function(dir) {
			gl.cullFace(glc.E_Face[dir]);
		},
		frontface: function(cw) {
			gl.frontFace(glc.E_CW[cw]);
		},
		linewidth: gl.lineWidth,
		polygonoffset: gl.polygonOffset,
	};
	glc.Cnv_Type2GLType = {
		Int8Array: gl.BYTE,
		Uint8Array: gl.UNSIGNED_BYTE,
		Uint8ClampedArray: gl.BYTE,
		Int16Array: gl.SHORT,
		Uint16Array: gl.UNSIGNED_SHORT,
		Int32Array: gl.INT,
		Uint32Array: gl.UNSIGNED_INT,
		Float32Array: gl.FLOAT
	};
	glc.E_UVWrap = {
		Repeat: gl.REPEAT,
		Mirror: gl.MIRRORED_REPEAT,
		Clamp: gl.CLAMP_TO_EDGE
	};
}

/* global resource */
var ResourceGenSrc = {};
var ResourceGen = (function(){
	return {
		// rp = ResourceParam
		get: function(rp) {
			var key = rp.key;
			var ret = resource.getResource(key);
			if(ret)
				{ return ret; }
			var buff = ResourceGenSrc[rp.name](rp);
			resource.addResource(key, buff);
			return buff;
		}
	};
})();

var ResourceParam = (function () {
	function anonymous () {}

	var prototypeAccessors = { name: {},key: {} };

	prototypeAccessors.name.get = function () { return null; };
	prototypeAccessors.key.get = function () { return null; };

	Object.defineProperties( anonymous.prototype, prototypeAccessors );

	return anonymous;
}());

function MakeCanvas(id) {
	var canvas = document.createElement("canvas");
	canvas.id = id;
	canvas.textContent = "Canvas not supported.";
	return canvas;
}
function MakeCanvasToBody(id) {
	var c = MakeCanvas(id);
	document.body.appendChild(c);
	return c;
}
ResourceGenSrc.Canvas = function(rp) {
	return MakeCanvasToBody(rp.id);
};

var RP_Canvas = (function (ResourceParam$$1) {
	function anonymous(id) {
		ResourceParam$$1.call(this);
		this._id = id;
	}

	if ( ResourceParam$$1 ) anonymous.__proto__ = ResourceParam$$1;
	anonymous.prototype = Object.create( ResourceParam$$1 && ResourceParam$$1.prototype );
	anonymous.prototype.constructor = anonymous;

	var prototypeAccessors = { id: {},name: {},key: {} };
	prototypeAccessors.id.get = function () { return this._id; };
	prototypeAccessors.name.get = function () { return "Canvas"; };
	prototypeAccessors.key.get = function () { return ("Canvas_" + (this._id)); };

	Object.defineProperties( anonymous.prototype, prototypeAccessors );

	return anonymous;
}(ResourceParam));

ResourceGenSrc.WebGL = function(rp) {
	var canvas = ResourceGen.get(new RP_Canvas(rp.canvasId));
	var param = {
		preserveDrawingBuffer: false
	};
	var webgl_text = [
		"webgl",
		"experimental-webgl",
		"webkit-3d",
		"moz-webgl",
		"3d"
	];
	var gl;
	for(var i=0 ; i<webgl_text.length ; i++) {
		gl = canvas.getContext(webgl_text[i], param);
		if(gl)
			{ break; }
	}
	return gl;	
};

var RP_WebGLCtx = (function (ResourceParam$$1) {
	function anonymous(canvasId) {
		ResourceParam$$1.call(this);
		this._canvasId = canvasId;
	}

	if ( ResourceParam$$1 ) anonymous.__proto__ = ResourceParam$$1;
	anonymous.prototype = Object.create( ResourceParam$$1 && ResourceParam$$1.prototype );
	anonymous.prototype.constructor = anonymous;

	var prototypeAccessors = { canvasId: {},name: {},key: {} };
	prototypeAccessors.canvasId.get = function () { return this._canvasId; };
	prototypeAccessors.name.get = function () { return "WebGL"; };
	prototypeAccessors.key.get = function () { return ("WebGL_" + (this._canvasId)); };

	Object.defineProperties( anonymous.prototype, prototypeAccessors );

	return anonymous;
}(ResourceParam));

window._=RP_WebGLCtx;

/* global gl */
var Engine = function Engine() {
	this._doubling = 1;
	this._initGL();
	this._sys3d = new SysUnif3D();
	this._tech = {};

	gl.depthFunc(gl.LEQUAL);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.FRONT);
	gl.blendFunc(glc.E_BlendFunc.srcalpha, glc.E_BlendFunc.oneminussrcalpha);
};

var prototypeAccessors$2 = { sys3d: {},width: {},height: {},technique: {},program: {} };
Engine.prototype._onResized = function _onResized () {
	var canvas = ResourceGen.get(new RP_Canvas("maincanvas"));
	var w = window.innerWidth,
		h = window.innerHeight;
	var assign;
		(assign = [w, h], this._width = assign[0], this._height = assign[1]);
	var dbl = this._doubling;
	var assign$1;
		(assign$1 = [w/dbl, h/dbl], canvas.width = assign$1[0], canvas.height = assign$1[1]);
	gl.viewport(0, 0, w/dbl, h/dbl);
	canvas.style.cssText = "width:100%;height:100%";
};
prototypeAccessors$2.sys3d.get = function () {
	return this._sys3d;
};
prototypeAccessors$2.width.get = function () {
	return this._width;
};
prototypeAccessors$2.height.get = function () {
	return this._height;
};
Engine.prototype._initGL = function _initGL () {
		var this$1 = this;

	Assert$1(!window.gl, "already initialized");
	window.gl = ResourceGen.get(new RP_WebGLCtx("maincanvas"));
	if(!gl)
		{ throw new Error("WebGL not supported."); }
	// const canvas = ResourceGen.get(new RP_Canvas("maincanvas"));
	// canvas.addEventListener("webglcontextlost", function(e){
	// });
	// canvas.addEventListener("webglcontextrestored", function(e){
	// });

	window.onresize = function () {
		this$1._onResized();
	};
	this._onResized();
	InitGLConst();
};

Engine.prototype.draw = function draw (cb) {
		var this$1 = this;

	var prog = this.technique.program;
	this.sys3d.apply(prog);
	var tc = 0;
	var tex = [];
	Object.keys(this._unif).forEach(function (k){
		var v = this$1._unif[k];
		if(v instanceof GLTexture) {
			gl.activeTexture(gl.TEXTURE0 + tc);
			v.bind_loose();
			prog.setUniform(k, tc++);
			tex.push(v);
		} else {
			prog.setUniform(k, v);
		}
	});
	cb();
	for(var i=0 ; i<tex.length ; i++)
		{ tex[i].unbind(); }
};
Engine.prototype.setUniform = function setUniform (name, value) {
	this._unif[name] = value;
};
Engine.prototype.addTechnique = function addTechnique (sh) {
		var this$1 = this;

	var techL = sh.technique;
	Object.keys(techL).forEach(function (k){
		var v = techL[k];
		this$1._tech[k] = v;
	});
};
prototypeAccessors$2.technique.set = function (name) {
	if(this._active)
		{ this._active.program.unuse(); }

	this._active = this._tech[name];
	this._active.valueset.apply();
	this._active.program.use();
	this._unif = {};
};
prototypeAccessors$2.technique.get = function () {
	return this._active;
};
prototypeAccessors$2.program.get = function () {
	return this.technique.program;
};
Engine.prototype.getScreenCoord = function getScreenCoord (pos) {
	pos = pos.clone;
	var w2 = this.width/2,
		h2 = this.height/2;
	pos.x = pos.x/w2 - 1;
	pos.y = -pos.y/h2 + 1;
	return pos;
};

Object.defineProperties( Engine.prototype, prototypeAccessors$2 );

var Vec2 = (function (Vec$$1) {
	function Vec2(x,y) {
		Vec$$1.call(this, 2, x,y);
	}

	if ( Vec$$1 ) Vec2.__proto__ = Vec$$1;
	Vec2.prototype = Object.create( Vec$$1 && Vec$$1.prototype );
	Vec2.prototype.constructor = Vec2;

	Vec2.One = function One (n) {
		return new Vec2(n,n);
	};

	return Vec2;
}(Vec));

var InputBuff = function InputBuff() {
	this._clean();
};
InputBuff.prototype._clean = function _clean () {
	this._key = {};
	this._mkey = {};
	this._wheelDelta = Vec2.One(0);
	this._pos = null;
	this._dblClick = null;
};

// Idle: (Nothing)
// Pressed: 1
// Pressing: 2++
// Released: -1
var InputFlag = function InputFlag() {
	this._clean();
};

var prototypeAccessors$6 = { position: {},doubleClicked: {},wheelDelta: {},positionDelta: {} };
InputFlag.prototype._clean = function _clean () {
	this._key = {};
	this._mkey = {};
	this._wheelDelta = Vec2.One(0);
	this._pos = Vec3.One(0);
	this._dblClick = false;
	this._positionDelta = Vec2.One(0);
};
InputFlag.prototype.update = function update (ns) {
	var Proc = function(m0, m1) {
		for(var k in m0) {
			if(m0[k] === -1)
				{ delete m0[k]; }
			else
				{ ++m0[k]; }
		}
		for(var k$1 in m1) {
			if(m1[k$1] === true) {
				if(!m0[k$1] >= 1)
					{ m0[k$1] = 1; }
			} else {
				m0[k$1] = -1;
			}
		}
	};
	// Keyboard
	Proc(this._key, ns._key);
	// Mouse
	Proc(this._mkey, ns._mkey);
	// Wheel
	this._wheelDelta = ns._wheelDelta;
	// DoubleClick
	this._dblClick = (ns._dblClick) ? true : false;
	// PositionDelta
	if(ns._pos)
		{ this._positionDelta = ns._pos.sub(this._pos); }
	else
		{ this._positionDelta = Vec2.One(0); }
	// Pos
	if(ns._pos)
		{ this._pos = ns._pos.clone; }
};
InputFlag.prototype.isMKeyPressed = function isMKeyPressed (code) { return this._mkey[code] === 1; };
InputFlag.prototype.isMKeyPressing = function isMKeyPressing (code) { return this._mkey[code] >= 1; };
InputFlag.prototype.isMKeyClicked = function isMKeyClicked (code) { return this._mkey[code] === -1; };
InputFlag.prototype.isKeyPressed = function isKeyPressed (code) { return this._key[code] === 1; };
InputFlag.prototype.isKeyPressing = function isKeyPressing (code) { return this._key[code] >= 1; };
InputFlag.prototype.isKeyClicked = function isKeyClicked (code) { return this._key[code] === -1; };
prototypeAccessors$6.position.get = function () {
	return this._pos;
};
prototypeAccessors$6.doubleClicked.get = function () {
	return this._dblClick;
};
prototypeAccessors$6.wheelDelta.get = function () {
	return this._wheelDelta;
};
prototypeAccessors$6.positionDelta.get = function () {
	return this._positionDelta;
};

Object.defineProperties( InputFlag.prototype, prototypeAccessors$6 );

var InputMgr = (function (Resource$$1) {
	function InputMgr() {
		var this$1 = this;

		Resource$$1.call(this);
		this._cur = new InputBuff();
		this._switchBuff();
		this._flag = new InputFlag();

		this._events = {
			mousedown: function (e){
				this$1._cur._mkey[e.button] = true;
			},
			mouseup: function (e){
				this$1._cur._mkey[e.button] = false;
			},
			mousemove: function (e){
				this$1._cur._pos = new Vec2(e.pageX, e.pageY);
			},
			keydown: function (e){
				this$1._cur._key[e.keyCode] = true;
			},
			keyup: function (e){
				this$1._cur._key[e.keyCode] = false;
			},
			wheel: function (e){
				this$1._cur._wheelDelta.addSelf(new Vec3(e.deltaX, e.deltaY, e.deltaZ));
			},
			dblclick: function (){
				this$1._cur._dblClick = true;
			},
			touchstart: function (e){
				e.preventDefault();
				e.stopPropagation();
				e = e.changedTouches[0];
				var p = new Vec2(e.pageX, e.pageY);
				this$1._prev._pos = this$1._cur._pos = p;
				this$1._cur._mkey[0] = true;
				return false;
			},
			touchmove: function (e){
				e.preventDefault();
				e.stopPropagation();
				e = e.changedTouches[0];
				this$1._cur._pos = new Vec2(e.pageX, e.pageY);
				return false;
			},
			touchend: function (e){
				e.preventDefault();
				e.stopPropagation();
				this$1._cur._mkey[0] = false;
				return false;
			},
			touchcancel: function (e){
				e.preventDefault();
				e.stopPropagation();
				this$1._cur._mkey[0] = false;
				return false;
			}
		};
		this._registerEvent();
	}

	if ( Resource$$1 ) InputMgr.__proto__ = Resource$$1;
	InputMgr.prototype = Object.create( Resource$$1 && Resource$$1.prototype );
	InputMgr.prototype.constructor = InputMgr;

	var prototypeAccessors = { positionDelta: {},position: {},doubleClicked: {},wheelDelta: {} };
	InputMgr.prototype.lockPointer = function lockPointer (elem) {
		var api = [
			"requestPointerLock",
			"webkitRequestPointerLock",
			"mozRequestPointerLock"
		];
		var len = api.length;
		for(var i=0 ; i<len ; i++) {
			if(elem[api[i]]) {
				elem[api[i]]();
				return;
			}
		}
		Assert(false, "pointer lock API not found");
	};
	InputMgr.prototype.unlockPointer = function unlockPointer () {
		var api = [
			"exitPointerLock",
			"webkitExitPointerLock",
			"mozExitPointerLock"
		];
		var len = api.length;
		for(var i=0 ; i<len ; i++) {
			if(document[api[i]]) {
				document[api[i]]();
				return;
			}
		}
		Assert(false, "pointer lock API not found");
	};
	InputMgr.prototype._registerEvent = function _registerEvent () {
		var this$1 = this;

		for(var k in this$1._events) {
			document.addEventListener(k, this$1._events[k], {capture: true, passive: false});
		}
	};
	InputMgr.prototype._unregisterEvent = function _unregisterEvent () {
		var this$1 = this;

		for(var k in this$1._events) {
			document.removeEventListener(k, this$1._events[k]);
		}
	};
	InputMgr.prototype.discard = function discard () {
		this._unregisterEvent();
	};
	InputMgr.prototype._switchBuff = function _switchBuff () {
		this._prev = this._cur;
		this._cur = new InputBuff();
	};
	InputMgr.prototype.update = function update () {
		this._flag.update(this._cur);
		this._switchBuff();
	};
	InputMgr.prototype.isMKeyPressed = function isMKeyPressed (code) { return this._flag.isMKeyPressed(code); };
	InputMgr.prototype.isMKeyPressing = function isMKeyPressing (code) { return this._flag.isMKeyPressing(code); };
	InputMgr.prototype.isMKeyClicked = function isMKeyClicked (code) { return this._flag.isMKeyClicked(code); };
	InputMgr.prototype.isKeyPressed = function isKeyPressed (code) { return this._flag.isKeyPressed(code); };
	InputMgr.prototype.isKeyPressing = function isKeyPressing (code) { return this._flag.isKeyPressing(code); };
	InputMgr.prototype.isKeyClicked = function isKeyClicked (code) { return this._flag.isKeyClicked(code); };
	prototypeAccessors.positionDelta.get = function () {
		return this._flag.positionDelta;
	};
	prototypeAccessors.position.get = function () {
		return this._flag.position;
	};
	prototypeAccessors.doubleClicked.get = function () {
		return this._flag.doubleClicked;
	};
	prototypeAccessors.wheelDelta.get = function () {
		return this._flag.wheelDelta;
	};

	Object.defineProperties( InputMgr.prototype, prototypeAccessors );

	return InputMgr;
}(Resource));

var State = function State () {};

State.prototype.onEnter = function onEnter (self, prev) {};
State.prototype.onExit = function onExit (self, next) {};
State.prototype.onUpdate = function onUpdate (self, dt) {};
State.prototype.onDown = function onDown (self) {};
State.prototype.onUp = function onUp (self) {};

var NullState = new State();
var FSMachine = (function (GObject$$1) {
	function FSMachine(p, state) {
		GObject$$1.call(this, p);
		Assert$1(state instanceof State);
		this._state = state;
		this._nextState = null;
		state.onEnter(this);
	}

	if ( GObject$$1 ) FSMachine.__proto__ = GObject$$1;
	FSMachine.prototype = Object.create( GObject$$1 && GObject$$1.prototype );
	FSMachine.prototype.constructor = FSMachine;
	FSMachine.prototype._doSwitchState = function _doSwitchState () {
		var this$1 = this;

		for(;;) {
			var ns = this$1._nextState;
			if(!ns)
				{ break; }

			this$1._nextState = null;
			var old = this$1._state;
			old.onExit(this$1, ns);
			this$1._state = ns;
			ns.onEnter(this$1, old);
		}
	};
	FSMachine.prototype.setState = function setState (st) {
		Assert$1(!this._nextState);
		this._nextState = st;
	};
	FSMachine.prototype.onUpdate = function onUpdate (dt) {
		if(this.alive) {
			this._state.onUpdate(this, dt);
			this._doSwitchState();
		}
		return this.alive;
	};
	FSMachine.prototype.onDown = function onDown () {
		this._state.onDown(this);
	};
	FSMachine.prototype.onUp = function onUp () {
		this._state.onUp(this);
	};
	FSMachine.prototype.destroy = function destroy () {
		if(this.alive) {
			GObject$$1.prototype.destroy.call(this);
			this.setState(NullState);
			this._doSwitchState();
		}
	};

	return FSMachine;
}(GObject));

var UpdGroup = (function (GObject$$1) {
	function UpdGroup(p) {
		GObject$$1.call(this, p);
		this._group = [];
		this._add = null;
		this._remove = null;
	}

	if ( GObject$$1 ) UpdGroup.__proto__ = GObject$$1;
	UpdGroup.prototype = Object.create( GObject$$1 && GObject$$1.prototype );
	UpdGroup.prototype.constructor = UpdGroup;
	UpdGroup.prototype._doAdd = function _doAdd () {
		var this$1 = this;

		var addL = this._add;
		if(addL) {
			addL.forEach(function (obj){
				obj.onConnected(this$1);
				this$1._group.push(obj);
			});
			this._add = null;
			return true;
		}
		return false;
	};
	UpdGroup.prototype._removeSingle = function _removeSingle (obj) {
		// 線形探索
		var g = this._group;
		var len = g.length;
		for(var i=0 ; i<len ; i++) {
			if(g[i] === obj)
				{ g.splice(i, 1); }
		}
	};
	UpdGroup.prototype._doRemove = function _doRemove () {
		var this$1 = this;

		var remL = this._remove;
		if(remL) {
			var len = remL.length;
			for(var i=0 ; i<len ; i++)
				{ this$1._removeSingle(remL[i]); }
			this._remove = null;
			return true;
		}
		return false;
	};
	UpdGroup.prototype._sort = function _sort () {
		this._group.sort(function (a,b){
			return a.priority > b.priority;
		});
	};
	UpdGroup.prototype._doAddRemove = function _doAddRemove () {
		if(this._doAdd() | this._doRemove()) {
			this._sort();
		}
	};
	UpdGroup.prototype.onUpdate = function onUpdate (dt) {
		var this$1 = this;

		this._doAddRemove();
		var g = this._group;
		for(var i=0 ; i<g.length ; i++) {
			if(!g[i].onUpdate(dt))
				{ this$1.remove(g[i]); }
		}
		this._doAddRemove();
	};
	UpdGroup.prototype.add = function add (obj) {
		Assert$1(obj instanceof GObject$$1);
		if(!this._add)
			{ this._add = []; }
		this._add.push(obj);
	};
	UpdGroup.prototype.remove = function remove (obj) {
		Assert$1(obj instanceof GObject$$1);
		if(!this._remove)
			{ this._remove = []; }
		this._remove.push(obj);
	};

	return UpdGroup;
}(GObject));

var Scene = (function (FSMachine$$1) {
	function Scene(p, state) {
		FSMachine$$1.call(this, p, state);
		this._update = new UpdGroup();
		this._draw = new UpdGroup();
	}

	if ( FSMachine$$1 ) Scene.__proto__ = FSMachine$$1;
	Scene.prototype = Object.create( FSMachine$$1 && FSMachine$$1.prototype );
	Scene.prototype.constructor = Scene;

	var prototypeAccessors = { updateGroup: {},drawGroup: {} };
	prototypeAccessors.updateGroup.get = function () {
		return this._update;
	};
	prototypeAccessors.drawGroup.get = function () {
		return this._draw;
	};
	Scene.prototype.onUpdate = function onUpdate (dt) {
		FSMachine$$1.prototype.onUpdate.call(this, dt);
		this._update.onUpdate(dt);
	};
	Scene.prototype.onDraw = function onDraw () {
		this._draw.onUpdate(0);
	};

	Object.defineProperties( Scene.prototype, prototypeAccessors );

	return Scene;
}(FSMachine));

function OutputError(where, msg) {
	console.log(("Error in " + where + ": " + msg));
}

var ESceneMgrState = {
	Idle: Symbol(),
	Draw: Symbol(),
	Proc: Symbol()
};
var SceneMgr = (function (GObject$$1) {
	function SceneMgr(firstScene) {
		GObject$$1.call(this);
		this._scene = [];
		this._nextScene = null;
		this._nPop = 0;
		this._state = ESceneMgrState.Idle;

		this.push(firstScene);
		firstScene.onUp();
		this._proceed();
	}

	if ( GObject$$1 ) SceneMgr.__proto__ = GObject$$1;
	SceneMgr.prototype = Object.create( GObject$$1 && GObject$$1.prototype );
	SceneMgr.prototype.constructor = SceneMgr;

	var prototypeAccessors = { top: {},length: {},_empty: {} };
	SceneMgr.prototype.push = function push (scene, bPop) {
		Assert$1(scene instanceof Scene);
		// 描画メソッドでのシーン変更は禁止
		Assert$1(this._state !== ESceneMgrState.Draw);
		// 一度に2つ以上のシーンを積むのは禁止
		Assert$1(!this._nextScene);
		// popした後に積むのも禁止
		Assert$1(this._nPop === 0);

		this._nextScene = scene;
		this._nPop = bPop ? 1 : 0;
	};
	SceneMgr.prototype.pop = function pop (n) {
		if ( n === void 0 ) n = 1;

		// 描画メソッドでのシーン変更は禁止
		Assert$1(this._state !== ESceneMgrState.Draw);
		// pushした後にpopはNG
		Assert$1(!this._nextScene);
		Assert$1(this._nPop === 0);
		this._nPop = n;
	};
	SceneMgr.prototype._proceed = function _proceed () {
		var this$1 = this;

		Assert$1(this._state === ESceneMgrState.Idle);
		this._state = ESceneMgrState.Proc;

		var b = false;
		while(this._nPop > 0) {
			--this$1._nPop;
			b = true;

			var t = this$1._scene.pop();
			t.destroy();
			if(this$1._scene.length === 0) {
				this$1._nPop = 0;
				break;
			}
			this$1.top.onDown();
		}
		var ns = this._nextScene;
		if(ns) {
			this._nextScene = null;
			this._scene.push(ns);
			ns.onUp();
			b = true;
		}

		this._state = ESceneMgrState.Idle;
		return b;
	};
	prototypeAccessors.top.get = function () {
		return this._scene[this._scene.length-1];
	};
	prototypeAccessors.length.get = function () {
		return this._scene.length;
	};
	prototypeAccessors._empty.get = function () {
		return this.length === 0;
	};
	SceneMgr.prototype.onUpdate = function onUpdate (dt) {
		var this$1 = this;

		for(;;) {
			if(this$1._empty)
				{ return false; }
			try {
				this$1.top.onUpdate(dt);
			} catch(e) {
				OutputError("scenemgr::onupdate()", e.message);
			}
			if(!this$1._proceed())
				{ break; }
		}
		return !this._empty;
	};
	SceneMgr.prototype.onDraw = function onDraw () {
		Assert$1(this._state === ESceneMgrState.Idle);
		this._state = ESceneMgrState.Draw;
		try {
			this.top.onDraw();
		} catch(e) {
			OutputError("scenemgr::ondraw()", e.message);
		}
		this._state = ESceneMgrState.Idle;
	};

	Object.defineProperties( SceneMgr.prototype, prototypeAccessors );

	return SceneMgr;
}(GObject));

var Loop = function Loop() {
	this._invalidate();
};

var prototypeAccessors$7 = { running: {},targetFps: {},accum: {},currentFps: {} };
Loop.prototype._invalidate = function _invalidate () {
	this._timerId = null;
	this._callback = null;
	this._targetFps = null;
	this._prevTime = null;		// 前回フレーム更新した時間
	this._prevFpsTime = null;	// 前回FPSカウンタを更新した時間
	this._accumFps = 0;
	this._currentFps = 0;
	this._beginTime = null;
	this._accum = 0;			// 累積フレーム数
};
prototypeAccessors$7.running.get = function () {
	return !(this._timerId === null);
};
prototypeAccessors$7.targetFps.get = function () {
	return this._targetFps;
};
prototypeAccessors$7.accum.get = function () {
	return this._accum;
};
prototypeAccessors$7.currentFps.get = function () {
	return this._currentFps;
};
Loop._CalcFPSArray = function _CalcFPSArray (fps) {
	var gcd = TM.GCD(1000, fps);
	var div0 = 1000 / gcd,
		div1 = fps / gcd;
	var df = Math.floor(div0 / div1);
	var tmp = [];
	for(var i=0 ; i<div1 ; i++) {
		tmp.push(df);
	}
	var dc = df * div1;
	for(var i$1=0 ; i$1<(div0-dc) ; i$1++)
		{ ++tmp[i$1]; }
	return tmp;
};
Loop.prototype.start = function start (targetFps, cb) {
	this.stop();
	this._targetFps = targetFps;
	this._callback = cb;
	var now = new Date().getTime();
	this._prevTime = now;
	this._beginTime = now;
	this._prevFpsTime = now;
	var self = this;

	var fps_array = Loop._CalcFPSArray(targetFps);
	var fps_ptr = 0;
	this._timerId = (function Tmp(){
		self._timerId = setTimeout(Tmp, fps_array[fps_ptr]);
		fps_ptr = (++fps_ptr)%fps_array.length;

		var now = new Date().getTime();
		if(now - self._prevFpsTime >= 1000) {
			self._currentFps = self._accumFps;
			self._accumFps = 0;
			self._prevFpsTime = now;
			// while(self._prevFpsTime <= now-1000)
			// self._prevFpsTime += 1000;
		}
		++self._accum;
		++self._accumFps;

		self._callback((now - self._prevTime)/1000);
		self._prevTime = now;
	})();
};
Loop.prototype.stop = function stop () {
	if(this._timerId) {
		clearTimeout(this._timerId);
		this._invalidate();
	}
};

Object.defineProperties( Loop.prototype, prototypeAccessors$7 );

/* global gl */
var ShaderError = (function (Error) {
	function ShaderError(id) {
		Error.call(
			this, "\n"
			+ PaddingString(32, "-")
			+ AddLineNumber(gl.getShaderSource(id), 1, 0, true, false)
			+ PaddingString(32, "-")
			+ "\n"
			+ gl.getShaderInfoLog(id)
			+ "\n"
		);
	}

	if ( Error ) ShaderError.__proto__ = Error;
	ShaderError.prototype = Object.create( Error && Error.prototype );
	ShaderError.prototype.constructor = ShaderError;

	var prototypeAccessors = { name: {} };
	prototypeAccessors.name.get = function () {
		return "ShaderError";
	};

	Object.defineProperties( ShaderError.prototype, prototypeAccessors );

	return ShaderError;
}(Error));
var GLShader = function GLShader(type, src) {
	var id = gl.createShader(type);
	gl.shaderSource(id, src);
	gl.compileShader(id);
	if(gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
		this._id = id;
	} else {
		throw new ShaderError(id);
	}
};

var prototypeAccessors$1$2 = { id: {} };
prototypeAccessors$1$2.id.get = function () {
	return this._id;
};
GLShader.prototype.discard = function discard () {
	Assert$1(this._id, "already discarded");
	this._id = null;
};

Object.defineProperties( GLShader.prototype, prototypeAccessors$1$2 );

/* global gl */
var GLVShader = (function (GLShader$$1) {
	function GLVShader(src) {
		GLShader$$1.call(this, gl.VERTEX_SHADER, src);
	}

	if ( GLShader$$1 ) GLVShader.__proto__ = GLShader$$1;
	GLVShader.prototype = Object.create( GLShader$$1 && GLShader$$1.prototype );
	GLVShader.prototype.constructor = GLVShader;

	return GLVShader;
}(GLShader));

/* global gl */
var GLFShader = (function (GLShader$$1) {
	function GLFShader(src) {
		GLShader$$1.call(this, gl.FRAGMENT_SHADER, src);
	}

	if ( GLShader$$1 ) GLFShader.__proto__ = GLShader$$1;
	GLFShader.prototype = Object.create( GLShader$$1 && GLShader$$1.prototype );
	GLFShader.prototype.constructor = GLFShader;

	return GLFShader;
}(GLShader));

/* global gl */
var GLTexture2D = (function (GLTexture$$1) {
	function GLTexture2D () {
		GLTexture$$1.apply(this, arguments);
	}

	if ( GLTexture$$1 ) GLTexture2D.__proto__ = GLTexture$$1;
	GLTexture2D.prototype = Object.create( GLTexture$$1 && GLTexture$$1.prototype );
	GLTexture2D.prototype.constructor = GLTexture2D;

	var prototypeAccessors = { typeId: {} };

	prototypeAccessors.typeId.get = function () {
		return gl.TEXTURE_2D;
	};

	Object.defineProperties( GLTexture2D.prototype, prototypeAccessors );

	return GLTexture2D;
}(GLTexture));

var ProgramError = (function (Error) {
	function ProgramError(id) {
		Error.call(this, gl.getProgramInfoLog(id));
	}

	if ( Error ) ProgramError.__proto__ = Error;
	ProgramError.prototype = Object.create( Error && Error.prototype );
	ProgramError.prototype.constructor = ProgramError;

	var prototypeAccessors = { name: {} };
	prototypeAccessors.name.get = function () {
		return "ProgramError";
	};

	Object.defineProperties( ProgramError.prototype, prototypeAccessors );

	return ProgramError;
}(Error));
/* global gl */
var GLProgram = (function (Resource$$1) {
	function GLProgram(vs, fs) {
		Resource$$1.call(this);
		var prog = gl.createProgram();
		gl.attachShader(prog, vs.id);
		gl.attachShader(prog, fs.id);
		gl.linkProgram(prog);
		if(gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			this._id = prog;
		} else
			{ throw new ProgramError(prog); }
		{
			var attr = {};
			var nAtt = gl.getProgramParameter(prog, gl.ACTIVE_ATTRIBUTES);
			for(var i=0 ; i<nAtt ; i++) {
				var a = gl.getActiveAttrib(prog, i);
				attr[a.name] = {
					index: gl.getAttribLocation(prog, a.name),
					size: a.size,
					type: a.type,
					info: glc.GLSLTypeInfo[a.type]
				};
				Assert$1(attr[a.name].info);
			}
			this._attribute = attr;
		}
		{
			var unif = {};
			var nUnif = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
			for(var i$1=0 ; i$1<nUnif ; i$1++) {
				var u = gl.getActiveUniform(prog, i$1);
				unif[u.name] = {
					index: gl.getUniformLocation(prog, u.name),
					size: u.size,
					type: u.type,
					info: glc.GLSLTypeInfo[u.type]
				};
				Assert$1(unif[u.name].info);
			}
			this._uniform = unif;
		}

		this._bBind = false;
	}

	if ( Resource$$1 ) GLProgram.__proto__ = Resource$$1;
	GLProgram.prototype = Object.create( Resource$$1 && Resource$$1.prototype );
	GLProgram.prototype.constructor = GLProgram;

	var prototypeAccessors$1 = { id: {} };
	prototypeAccessors$1.id.get = function () {
		return this._id;
	};
	GLProgram.prototype.use = function use () {
		Assert$1(this.id, "already discarded");
		Assert$1(!this._bBind, "already binded");
		gl.useProgram(this.id);
		this._bBind = true;
	};
	GLProgram.prototype.unuse = function unuse () {
		Assert$1(this._bBind, "not binding anywhere");
		gl.useProgram(null);
		this._bBind = false;
	};
	GLProgram.prototype.discard = function discard () {
		Assert$1(!this._bBind);
		Assert$1(this.id, "already discarded");
		gl.deleteProgram(this.id);
		this._id = null;
	};
	GLProgram.prototype.hasUniform = function hasUniform (name) {
		return this._uniform[name] !== undefined;
	};
	/*!
		\param[in] value	[matrix...] or [vector...] or matrix or vector or float or int
	*/
	GLProgram.prototype.setUniform = function setUniform (name, value) {
		var u = this._uniform[name];
		if(u) {
			Assert$1(u.info);
			var f = u.info.uniformF;
			if(value instanceof Array) {
				// [matrix...] or [vector...]
				f.call(gl, u.index, VMToArray.apply(void 0, value));
			} else {
				// matrix or vector or float or int
				if(IsMatrix(value))
					{ f.call(gl, u.index, false, value.value); }
				else if(IsVector(value))
					{ f.call(gl, u.index, value.value); }
				else
					{ f.call(gl, u.index, value); }
			}
		}
	};
	/*!
		\param[in] data	[vector...] or GLVBuffer
	*/
	GLProgram.prototype.setVStream = function setVStream (name, data) {
		var a = this._attribute[name];
		if(a) {
			if(data instanceof Array) {
				// [vector...]
				a.info.vertexF(a.index, VectorToArray(data));
			} else {
				// GLVBuffer
				data.bind();
				gl.enableVertexAttribArray(a.index);
				gl.vertexAttribPointer(a.index, data.dim, data.type, false, data.typesize*data.dim, 0);
				data.unbind();
			}
		}
	};

	Object.defineProperties( GLProgram.prototype, prototypeAccessors$1 );

	return GLProgram;
}(Resource));

function ToLowercaseKeys(ar) {
	var ret = {};
	Object.keys(ar).forEach(
		function(k) {
			var val = ar[k];
			if(typeof val === "string")
				{ val = val.toLowerCase(); }
			else if(val instanceof Array) {
				for(var i=0 ; i<val.length ; i++) {
					if(typeof val[i] === "string")
						{ val[i] = val[i].toLowerCase(); }
				}
			}
			ret[k.toLowerCase()] = val;
		}
	);
	return ret;
}
/* global gl */
var GLValueSet = function GLValueSet() {
	this.boolset = [];
	this.valueset = {};
};
GLValueSet.FromJSON = function FromJSON (js) {
	var ret = new GLValueSet();
	var bs = js.boolset;
	var bsf = {};
	for(var i=0 ; i<bs.length ; i++) {
		bsf[bs[i]] = true;
	}
	ret.boolset = ToLowercaseKeys(bsf);
	ret.valueset = ToLowercaseKeys(js.valueset);
	return ret;
};
GLValueSet.prototype.enable = function enable (name) {
	this.boolset[name] = true;
};
GLValueSet.prototype.disable = function disable (name) {
	delete this.boolset[name];
};
GLValueSet.prototype.apply = function apply () {
		var this$1 = this;

	// boolset
	for(var k in glc.GLBoolSetting) {
		var func = (this$1.boolset[k] === true) ? gl.enable : gl.disable;
		func.call(gl, glc.GLBoolSetting[k]);
	}
	// valueset
	for(var k$1 in this$1.valueset) {
		var args = this$1.valueset[k$1];
		var func$1 = glc.GLValueSetting[k$1];
		if(args instanceof Array)
			{ func$1.call(gl, args[0], args[1], args[2], args[3]); }
		else
			{ func$1.call(gl, args); }
	}
};

/* global resource */
var Technique = function Technique(src) {
	var tech = {};
	Object.keys(src.technique).forEach(function (k){
		var v = src.technique[k];
		tech[k] = {
			valueset: GLValueSet.FromJSON(resource.getResource(v.valueset)),
			program: new GLProgram(
				resource.getResource(v.vshader),
				resource.getResource(v.fshader)
			)
		};
	});
	this._tech = tech;
};

var prototypeAccessors$10 = { technique: {} };
prototypeAccessors$10.technique.get = function () {
	return this._tech;
};

Object.defineProperties( Technique.prototype, prototypeAccessors$10 );

var EResource = {
	VertexShader: Symbol(),
	FragmentShader: Symbol(),
	Image: Symbol(),
	JSON: Symbol(),
	Technique: Symbol()
};

var ResourceExtToType = {};
ResourceExtToType.vsh = EResource.VertexShader;
ResourceExtToType.fsh = EResource.FragmentShader;
ResourceExtToType.png = EResource.Image;
ResourceExtToType.jpg = EResource.Image;
ResourceExtToType.def = EResource.JSON;
ResourceExtToType.prog = EResource.Technique;

var ResourceInfo = {};
ResourceInfo[EResource.VertexShader] = {
	makeLoader: function(url) {
		return new XHR_Loader(url, "text");
	},
	makeResource: function(src) {
		return new GLVShader(src);
	}
};
ResourceInfo[EResource.FragmentShader] = {
	makeLoader: function(url) {
		return new XHR_Loader(url, "text");
	},
	makeResource: function(src) {
		return new GLFShader(src);
	}
};
ResourceInfo[EResource.Image] = {
	makeLoader: function(url) {
		return new Image_Loader(url);
	},
	makeResource: function(src) {
		var tex = new GLTexture2D();
		tex.setImage(0, glc.E_InterFormat.RGBA, glc.E_InterFormat.RGBA, glc.E_TexDataFormat.UB, src);
		tex.genMipmap();
		return tex;
	}
};
ResourceInfo[EResource.JSON] = {
	makeLoader: function(url) {
		return new XHR_Loader(url, "json");
	},
	makeResource: function(src) {
		return src;
	}
};
/* global resource */
ResourceInfo[EResource.Technique] = {
	makeLoader: function(url) {
		return new XHR_Loader(url, "json");
	},
	makeResource: function(src) {
		// 必要なリソースがまだ足りてなければ関数を引数にしてコール
		if(!resource.checkResource(src.dependancy)) {
			return new MoreResource(src.dependancy);
		} else
			{ return new Technique(src); }
	}
};

function GetResourceInfo(fpath) {
	// 拡張子でリソースタイプを判断
	var ext = ExtractExtension(fpath);
	if(!ext)
		{ throw new Error("no extension found"); }
	ext = ResourceExtToType[ext];
	if(!ext)
		{ throw new Error("unknown extension"); }
	var info = ResourceInfo[ext];
	if(!info)
		{ throw new Error("loader not found"); }
	return info;
}

var MoreResource = function MoreResource() {
	var arg = [], len = arguments.length;
	while ( len-- ) arg[ len ] = arguments[ len ];

	this._array = [].concat( arg );
};

var prototypeAccessors$9 = { array: {} };
prototypeAccessors$9.array.get = function () {
	return this._array;
};

Object.defineProperties( MoreResource.prototype, prototypeAccessors$9 );

var XHR_Loader = function XHR_Loader(url, type) {
	var this$1 = this;

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.responseType = type;
	xhr.onload = function (){
		var xhr = this$1._xhr;
		if(xhr.readyState === 4) {
			if(xhr.status === 200) {
				this$1._status = "complete";
				this$1._cbCompleted();
			} else {
				this$1._status = "error";
				this$1._errormsg = xhr.statusText;
				this$1._cbError();
			}
		}
	};
	xhr.onerror = function (){
		this$1._errormsg = "unknown error";
		this$1._cbError();
	};
	this._status = "idle";
	this._xhr = xhr;
};

var prototypeAccessors$1$1 = { errormsg: {},status: {},result: {} };
XHR_Loader.prototype.begin = function begin (cbCompleted, cbError) {
	this._cbCompleted = cbCompleted;
	this._cbError = cbError;
	this._status = "loading";
	this._xhr.send(null);
};
XHR_Loader.prototype.abort = function abort () {
	this._status = "abort";
	this._xhr.abort();
};
prototypeAccessors$1$1.errormsg.get = function () {
	return this._errormsg;
};
prototypeAccessors$1$1.status.get = function () {
	return this._status;
};
prototypeAccessors$1$1.result.get = function () {
	return this._xhr.response;
};

Object.defineProperties( XHR_Loader.prototype, prototypeAccessors$1$1 );
var Image_Loader = function Image_Loader(url) {
	var this$1 = this;

	var img = new Image();
	img.onload = function (){
		this$1._timerId = null;
		this$1._status = "complete";
		this$1._cbCompleted();
	};
	this._url = url;
	this._img = img;
	this._status = "idle";
};

var prototypeAccessors$2$1 = { errormsg: {},status: {},result: {} };
Image_Loader.prototype.begin = function begin (cbCompleted, cbError) {
		var this$1 = this;

	this._timerId = setTimeout(function (){
		if(this$1._timerId) {
			// timeout
			this$1._status = "error";
			this$1._errormsg = "connection timedout";
			this$1._cbError();
		}
	}, 5000);
	this._cbCompleted = cbCompleted;
	this._cbError = cbError;
	this._img.src = this._url;
	this._status = "loading";
};
Image_Loader.prototype.abort = function abort () {
	// 非対応
	this._status = "abort";
};
prototypeAccessors$2$1.errormsg.get = function () {
	return this._errormsg;
};
prototypeAccessors$2$1.status.get = function () {
	return this._status;
};
prototypeAccessors$2$1.result.get = function () {
	return this._img;
};

Object.defineProperties( Image_Loader.prototype, prototypeAccessors$2$1 );
function ASyncGet(loaders, maxConnection, cbComplete, cbError) {
	var lastCur = 0;
	var nComp = 0;
	var task = [];
	function Request(taskIndex) {
		var cur = lastCur++;
		Assert$1(cur < loaders.length);
		Assert$1(task[taskIndex] === null);
		task[taskIndex] = cur;
		loaders[cur].begin(
			function(){
				OnComplete(taskIndex);
			},
			function(){
				OnError(taskIndex);
			}
		);
	}
	function OnError(taskIndex) {
		// 他のタスクを全て中断
		for(var i=0 ; i<task.length ; i++) {
			var li = task[i];
			if(li !== null && li !== taskIndex) {
				loaders[li].abort();
			}
		}
		cbError();
	}
	function OnComplete(taskIndex) {
		Assert$1(typeof task[taskIndex] === "number");
		task[taskIndex] = null;
		++nComp;
		if(lastCur < loaders.length) {
			// 残りのタスクを開始
			Request(taskIndex);
		} else {
			if(nComp === loaders.length)
				{ cbComplete(); }
		}
	}
	for(var i=0 ; i<Math.min(loaders.length, maxConnection) ; i++) {
		task[i] = null;
		Request(i);
	}
}

var ResStack = function ResStack(base) {
	this._resource = [];
	this._base = base;
	this._alias = {};
	this.pushFrame();
};

var prototypeAccessors$8 = { resourceLength: {} };
ResStack.prototype.addAlias = function addAlias (alias) {
	var a = this._alias;
	Object.keys(alias).forEach(function (k){
		a[k] = alias[k];
	});
};
ResStack.prototype._makeFPath = function _makeFPath (name) {
	return ((this._base) + "/" + (this._alias[name]));
};
ResStack.prototype.pushFrame = function pushFrame () {
	var dst = {};
	this._resource.push(dst);
	return dst;
};
//! フレーム単位でリソースロード
/*!
	\param[in] res ["AliasName", ...]
*/
ResStack.prototype.loadFrame = function loadFrame (res, cbComplete, cbError, bSame) {
		var this$1 = this;
		if ( bSame === void 0 ) bSame=false;

	Assert$1(
		res instanceof Array
		&& cbComplete instanceof Function
		&& cbError instanceof Function
	);
	Assert$1(!this._onLoading);
	this._onLoading = true;

	// 重複してるリソースはロード対象に入れない
	{
		var res2 = [];
		for(var i=0 ; i<res.length ; i++) {
			if(!this$1.getResource(res[i])) {
				res2.push(res[i]);
			}
		}
		res = res2;
	}
	var dst;
	if(bSame) {
		dst = this._resource.back();
	} else {
		dst = this.pushFrame();
	}

	var loaderL = [];
	var infoL = [];
	for(var i$1=0 ; i$1<res.length ; i$1++) {
		var url = this$1._makeFPath(res[i$1]);
		if(!url)
			{ throw new Error(("unknown resource name \"" + (res[i$1]) + "\"")); }
		var info = GetResourceInfo(url);
		loaderL.push(info.makeLoader(url));
		infoL.push(info);
	}
	var fb = function (){
		Assert$1(this$1._onLoading);
		this$1._onLoading = false;
		var later = [];
		var laterId = [];
		for(var i=0 ; i<infoL.length ; i++) {
			var r = infoL[i].makeResource(loaderL[i].result);
			// MoreResourceが来たらまだ読み込みが終わってない
			if(r instanceof MoreResource) {
				later = later.concat.apply(later, r.array);
				laterId.push(i);
			} else
				{ dst[res[i]] = r; }
		}
		if(!later.empty()) {
			// 再度リソース読み込みをかける
			this$1.loadFrame(later, function (){
				for(var i=0 ; i<laterId.length ; i++) {
					var id = laterId[i];
					var r = infoL[id].makeResource(loaderL[id].result);
					Assert$1(!(r instanceof MoreResource));
					dst[res[id]] = r;
				}
				// すべてのリソース読み込み完了
				cbComplete();
			}, cbError, true);
		} else {
			// すべてのリソース読み込み完了
			cbComplete();
		}
	};
	ASyncGet(loaderL, 2,
		fb,
		function (){
			this$1._onLoading = false;
			cbError();
		}
	);
};
prototypeAccessors$8.resourceLength.get = function () {
	var diff = 0;
	if(this._onLoading)
		{ diff = -1; }
	return this._resource.length + diff;
};
ResStack.prototype.checkResource = function checkResource (name) {
		var this$1 = this;

	if(name instanceof Array) {
		for(var i=0 ; i<name.length ; i++) {
			if(!this$1.getResource(name[i]))
				{ return false; }
		}
		return true;
	}
	return Boolean(this.getResource(name));
};
ResStack.prototype.getResource = function getResource (name) {
	Assert$1(name);
	var resA = this._resource;
	for(var i=resA.length-1 ; i>=0 ; --i) {
		var res = resA[i];
		var r = res[name];
		if(r)
			{ return r; }
	}
	return null;
};
ResStack.prototype.addResource = function addResource (key, val) {
	// リソース名の重複は許容
	if(this.getResource(key))
		{ return; }
	this._resource[this._resource.length-1][key] = val;
};
ResStack.prototype.popFrame = function popFrame (n) {
		if ( n === void 0 ) n = 1;

	Assert$1(!this._onLoading);
	var resA = this._resource;
	Assert$1(resA.length >= n);
	// 明示的な開放処理
	var loop = function () {
		var res = resA.pop();
		Object.keys(res).forEach(function (k){
			res[k].discard();
		});
		--n;
	};

		while(n > 0) loop();
};

Object.defineProperties( ResStack.prototype, prototypeAccessors$8 );

var St = (function (State$$1) {
	function St () {
		State$$1.apply(this, arguments);
	}if ( State$$1 ) St.__proto__ = State$$1;
	St.prototype = Object.create( State$$1 && State$$1.prototype );
	St.prototype.constructor = St;

	

	return St;
}(State));
var LoadingScene = (function (Scene$$1) {
	function LoadingScene(res, nextScene) {
		Scene$$1.call(this, 0, new St());
		window.resource.loadFrame(
			res,
			function (){
				try {
					window.scene.push(nextScene, true);
				} catch (e) {
					alert(e);
				}
			},
			function (){
				alert("ERROR");
			}
		);
	}

	if ( Scene$$1 ) LoadingScene.__proto__ = Scene$$1;
	LoadingScene.prototype = Object.create( Scene$$1 && Scene$$1.prototype );
	LoadingScene.prototype.constructor = LoadingScene;

	return LoadingScene;
}(Scene));
function _MainLoop(alias, base, cbMakeScene) {
	window.resource = new ResStack(base);
	window.resource.addAlias(alias);
	window.engine = new Engine();
	window.input = new InputMgr();
	window.scene = new SceneMgr(cbMakeScene());
}

function MainLoop_RF(alias, base, cbMakeScene) {
	_MainLoop(alias, base, cbMakeScene);

	RequestAnimationFrame(function Loop$$1() {
		RequestAnimationFrame(Loop$$1);
		window.input.update();
		window.scene.onUpdate(1/60);
		window.scene.onDraw();
	});
}

var St_Idle = (function (State$$1) {
	function St_Idle () {
		State$$1.apply(this, arguments);
	}

	if ( State$$1 ) St_Idle.__proto__ = State$$1;
	St_Idle.prototype = Object.create( State$$1 && State$$1.prototype );
	St_Idle.prototype.constructor = St_Idle;

	St_Idle.prototype.onUpdate = function onUpdate (self, dt) {
		if(input.isMKeyPressed(0)) {
			self.setState(new St_Look());
		} else {
			var c = self._camera;
			if(input.isKeyPressing(65)) {
				c.pos.x -= dt*5;
			}
			if(input.isKeyPressing(68)) {
				c.pos.x += dt*5;
			}
			if(input.isKeyPressing(87)) {
				c.pos.y += dt*5;
			}
			if(input.isKeyPressing(83)) {
				c.pos.y -= dt*5;
			}
		}
	};

	return St_Idle;
}(State));
var St_Look = (function (State$$1) {
	function St_Look () {
		State$$1.apply(this, arguments);
	}

	if ( State$$1 ) St_Look.__proto__ = State$$1;
	St_Look.prototype = Object.create( State$$1 && State$$1.prototype );
	St_Look.prototype.constructor = St_Look;

	St_Look.prototype.onUpdate = function onUpdate (self/*, dt*/) {
		if(!input.isMKeyPressing(0)) {
			self.setState(new St_Idle());
		} else {
			var d = input.positionDelta;
			self._yaw += d.x*0.005;
			self._pitch -= d.y*0.005;

			var pi = Math.PI;
			self._pitch = Saturation(self._pitch, -(pi/2-0.01), (pi/2-0.01));

			var c = self._camera;
			c.rot = Quat.RotationYPR(self._yaw, self._pitch, 0);
			c.rot.normalizeSelf();
		}
	};

	return St_Look;
}(State));

/* global engine input */
var FPSCamera = (function (FSMachine$$1) {
	function FPSCamera() {
		FSMachine$$1.call(this, 0, new St_Idle());
		this._yaw = this._pitch = 0;

		var c = new Camera3D();
		c.fov = TM.Deg2rad(90);
		c.aspect = engine.width / engine.height;
		c.nearZ = 0.01;
		c.farZ = 200;
		c.pos = new Vec3(0,0,-1);
		c.rot = Quat.Identity();

		this._camera = c;
		engine.sys3d.camera = c;
	}

	if ( FSMachine$$1 ) FPSCamera.__proto__ = FSMachine$$1;
	FPSCamera.prototype = Object.create( FSMachine$$1 && FSMachine$$1.prototype );
	FPSCamera.prototype.constructor = FPSCamera;

	return FPSCamera;
}(FSMachine));

/* global gl */
var GLBuffer = (function (Resource$$1) {
	function GLBuffer() {
		Resource$$1.call(this);
		this._clean();
		this._id = gl.createBuffer();
	}

	if ( Resource$$1 ) GLBuffer.__proto__ = Resource$$1;
	GLBuffer.prototype = Object.create( Resource$$1 && Resource$$1.prototype );
	GLBuffer.prototype.constructor = GLBuffer;

	var prototypeAccessors = { id: {},usage: {},type: {},typesize: {},length: {},dim: {} };
	GLBuffer.prototype._clean = function _clean () {
		this._id = null;
		this._bBind = false;
		this._usage = null;
		this._type = null;
		this._typesize = null;
		this._length = null;
	};
	prototypeAccessors.id.get = function () { return this._id; };
	prototypeAccessors.usage.get = function () { return this._usage; };
	prototypeAccessors.type.get = function () { return this._type; };
	prototypeAccessors.typesize.get = function () { return this._typesize; };
	//! 頂点の個数
	prototypeAccessors.length.get = function () { return this._length; };
	//! 要素何個分で頂点一つ分か
	prototypeAccessors.dim.get = function () { return this._dim; };
	GLBuffer.prototype.bind = function bind () {
		Assert$1(this.id, "already discarded");
		Assert$1(!this._bBind, "already binded");
		gl.bindBuffer(this.typeId, this.id);
		this._bBind = true;
	};
	GLBuffer.prototype.unbind = function unbind () {
		Assert$1(this._bBind, "not binded yet");
		gl.bindBuffer(this.typeId, null);
		this._bBind = false;
	};
	GLBuffer.prototype.setDataRaw = function setDataRaw (data, dim, usage) {
		this._usage = usage;
		this._type = glc.Cnv_Type2GLType[data.constructor.name];
		this._typesize = glc.GLTypeInfo[this._type].bytesize;
		this._dim = dim;
		this._length = data.length / dim;

		this.bind();
		gl.bufferData(this.typeId, data, usage);
		this.unbind();
	};
	GLBuffer.prototype.setData = function setData (data, usage) {
		var ar = VectorToArray.apply(void 0, data);
		if(ar)
			{ this.setDataRaw(ar, data[0].dim, usage); }
	};
	GLBuffer.prototype.setSubData = function setSubData (offset_elem, data) {
		this.bind();
		gl.bufferSubData(this.typeId, this._typesize*offset_elem, data);
		this.unbind();
	};
	GLBuffer.prototype.discard = function discard () {
		Assert$1(!this._bBind, "still binding somewhere");
		Assert$1(this.id, "already discarded");
		gl.deleteBuffer(this.id);
		this._clean();
	};

	Object.defineProperties( GLBuffer.prototype, prototypeAccessors );

	return GLBuffer;
}(Resource));

/* global gl */
var GLVBuffer = (function (GLBuffer$$1) {
	function GLVBuffer () {
		GLBuffer$$1.apply(this, arguments);
	}

	if ( GLBuffer$$1 ) GLVBuffer.__proto__ = GLBuffer$$1;
	GLVBuffer.prototype = Object.create( GLBuffer$$1 && GLBuffer$$1.prototype );
	GLVBuffer.prototype.constructor = GLVBuffer;

	var prototypeAccessors = { typeId: {} };

	prototypeAccessors.typeId.get = function () {
		return gl.ARRAY_BUFFER;
	};

	Object.defineProperties( GLVBuffer.prototype, prototypeAccessors );

	return GLVBuffer;
}(GLBuffer));

var Drawable = (function (GObject$$1) {
	function Drawable () {
		GObject$$1.apply(this, arguments);
	}

	if ( GObject$$1 ) Drawable.__proto__ = GObject$$1;
	Drawable.prototype = Object.create( GObject$$1 && GObject$$1.prototype );
	Drawable.prototype.constructor = Drawable;

	var prototypeAccessors = { drawtag: {} };

	prototypeAccessors.drawtag.get = function () {
		return null;
	};

	Object.defineProperties( Drawable.prototype, prototypeAccessors );

	return Drawable;
}(GObject));

function Rand01() {
	return (Math.random()-0.5) * 2;
}
var Alg = function Alg(n) {
	this._n = n;
};
Alg.prototype.initialize = function initialize () {
	var vpos = [];
	var veloc = [];
	for(var i=0 ; i<this._n ; i++) {
		vpos[i] = new Vec3(Rand01(), -1, Rand01());
		veloc[i] = new Vec3(Rand01(), 0.1, Rand01()).normalizeSelf();
	}
	this._veloc = veloc;
	return vpos;
};
Alg.prototype.advance = function advance (vpos, dt) {
	var veloc = this._veloc;
	var len = this._n;
	for(var i=0 ; i<len ; i++) {
		vpos[i].addSelf(veloc[i].mul(dt));
		var dir = vpos[i].minus();
		dir.mulSelf(dt);
		veloc[i] = veloc[i].add(dir).normalize();
	}
};
/* global gl engine */
/*!
	[shader requirements]
	attribute {
		vec3		a_position;
	}
	uniform {
		float		u_alpha;
		mat4		u_mTrans,
					u_mWorld;
		vec3		u_eyePos;
		sampler2D	u_texture;
	}
*/
var PSprite = function PSprite(alg) {
	this._alg = alg;
	this._vpos = alg.initialize();
	var vb = new GLVBuffer();
	vb.setData(this._vpos, glc.E_Drawtype.Dynamic);
	this._geom = {
		vb: {
			a_position: vb
		}
	};
};
PSprite.prototype.advance = function advance (dt) {
	this._alg.advance(this._vpos, dt);
	this._geom.vb.a_position.setData(this._vpos, glc.E_Drawtype.Dynamic);
};
PSprite.prototype.draw = function draw (alpha) {
		var this$1 = this;

	engine.technique = "psprite";
	if(this.texture)
		{ engine.setUniform("u_texture", this.texture); }
	engine.sys3d.worldMatrix = Mat44.Identity();
	engine.setUniform("u_alpha", alpha);
	engine.draw(function (){
		DrawWithGeom(this$1._geom, gl.POINTS);
	});
};
/* global resource */
var PSpriteDraw = (function (Drawable$$1) {
	function PSpriteDraw() {
		Drawable$$1.call(this);
		this._psprite = new PSprite(new Alg(2000));
		this._psprite.texture = resource.getResource("sphere");
		this.alpha = 1;
	}

	if ( Drawable$$1 ) PSpriteDraw.__proto__ = Drawable$$1;
	PSpriteDraw.prototype = Object.create( Drawable$$1 && Drawable$$1.prototype );
	PSpriteDraw.prototype.constructor = PSpriteDraw;
	PSpriteDraw.prototype.advance = function advance (dt) {
		this._psprite.advance(dt/2);
	};
	PSpriteDraw.prototype.onUpdate = function onUpdate () {
		if(Drawable$$1.prototype.onUpdate.call(this)) {
			this._psprite.draw(this.alpha);
			return true;
		}
		return false;
	};

	return PSpriteDraw;
}(Drawable));

var Font = (function () {
	function anonymous(family, size, weight, italic) {
		var assign;
	(assign = [family, size, weight, italic], this.family = assign[0], this.size = assign[1], this.weight = assign[2], this.italic = assign[3]);
	}

	var prototypeAccessors = { fontstr: {} };
	prototypeAccessors.fontstr.get = function () {
		var italic = this.italic ? "italic" : "";
		return (italic + " " + (this.weight) + " " + (this.size) + " " + (this.family));
	};

	Object.defineProperties( anonymous.prototype, prototypeAccessors );

	return anonymous;
}());

ResourceGenSrc.FontCtx = function(rp) {
	var c = ResourceGen.get(new RP_Canvas(rp.canvasId));
	// 後で変える
	c.width = c.height = 512;
	var ctx = c.getContext("2d");
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	return ctx;
};
var RP_FontCtx = (function (RP_WebGLCtx$$1) {
	function anonymous () {
		RP_WebGLCtx$$1.apply(this, arguments);
	}

	if ( RP_WebGLCtx$$1 ) anonymous.__proto__ = RP_WebGLCtx$$1;
	anonymous.prototype = Object.create( RP_WebGLCtx$$1 && RP_WebGLCtx$$1.prototype );
	anonymous.prototype.constructor = anonymous;

	var prototypeAccessors = { name: {},key: {} };

	prototypeAccessors.name.get = function () { return "FontCtx"; };
	prototypeAccessors.key.get = function () { return ("FontCtx_" + (this._canvasId)); };

	Object.defineProperties( anonymous.prototype, prototypeAccessors );

	return anonymous;
}(RP_WebGLCtx));

var Range = function Range(from, to) {
	this.from = from;
	this.to = to;
};

var prototypeAccessors$11 = { width: {} };
prototypeAccessors$11.width.get = function () {
	return this.to - this.from;
};
Range.prototype.move = function move (ofs) {
	this.from += ofs;
	this.to += ofs;
};

Object.defineProperties( Range.prototype, prototypeAccessors$11 );

ResourceGenSrc.FontHeight = function(rp) {
	var c = ResourceGen.get(new RP_FontCtx("fontcanvas"));
	c.font = rp.font.fontstr;

	var canvas = c.canvas;
	var cw = canvas.width,
		ch = canvas.height;
	c.fillStyle = "black";
	c.fillRect(0,0, cw, ch);
	c.fillStyle = "white";
	c.fillText("あいうえおAEglq", 0, 0);
	var fw = c.measureText("Eg").width;
	var pixels = c.getImageData(0, 0, fw, ch);

	var top, bottom;
	// Find top border
	Top: for(var i=0 ; i<ch ; i++) {
		var idx = pixels.width*i * 4;
		for(var j=0 ; j<pixels.width ; j++) {
			if(pixels.data[idx+j*4] !== 0) {
				// found top border
				top = i;
				break Top;
			}
		}
	}
	// Find bottom border
	Bottom: for(var i$1=ch-1 ; i$1>=0 ; i$1--) {
		var idx$1 = pixels.width*i$1 * 4;
		for(var j$1=0 ; j$1<pixels.width ; j$1++) {
			if(pixels.data[idx$1+j$1*4] !== 0) {
				// found bottom border
				bottom = i$1;
				break Bottom;
			}
		}
	}
	return new Range(top, bottom+1);
};
var RP_FontHeight = (function (ResourceParam$$1) {
	function anonymous(font) {
		ResourceParam$$1.call(this);
		this.font = font;
	}

	if ( ResourceParam$$1 ) anonymous.__proto__ = ResourceParam$$1;
	anonymous.prototype = Object.create( ResourceParam$$1 && ResourceParam$$1.prototype );
	anonymous.prototype.constructor = anonymous;

	var prototypeAccessors = { name: {},key: {} };
	prototypeAccessors.name.get = function () { return "FontHeight"; };
	prototypeAccessors.key.get = function () {
		return ("FontHeight_" + (this.font.fontstr));
	};

	Object.defineProperties( anonymous.prototype, prototypeAccessors );

	return anonymous;
}(ResourceParam));

var Rect = function Rect(l,t,r,b) {
	this.left = l;
	this.top = t;
	this.right = r;
	this.bottom = b;
};

var prototypeAccessors$13 = { lt: {},rb: {},width: {},height: {} };
prototypeAccessors$13.lt.get = function () {
	return new Vec2(this.left, this.top);
};
prototypeAccessors$13.rb.get = function () {
	return new Vec2(this.right, this.bottom);
};
prototypeAccessors$13.width.get = function () {
	return this.right - this.left;
};
prototypeAccessors$13.height.get = function () {
	return this.bottom- this.top;
};
Rect.prototype.move = function move (ofs) {
	this.left += ofs.x;
	this.right += ofs.x;
	this.top += ofs.y;
	this.bottom += ofs.y;
};

Object.defineProperties( Rect.prototype, prototypeAccessors$13 );

/* global gl */ //! フォントテクスチャのうちの一行分
var FontLane = function FontLane(w) {
	this._width = w;
	this._cur = 0;
	// CharCode -> Range(X)
	this._map = {};
};
FontLane.prototype.get = function get (code, str, ctx, fw, fh, baseY, tex) {
	// 既に計算してあればそれを返す
	{
		var ret = this._map[code];
		if(ret)
			{ return ret; }
	}
	// これ以上スペースが無ければnull
	if(this._cur + fw > this._width)
		{ return null; }

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, fw, fh.to);
	ctx.fillStyle = "white";
	ctx.fillText(str, 0, 0);

	var dat = ctx.getImageData(0, fh.from, fw, fh.width);
	var data = dat.data;
	var u8data = new Uint8Array(fw * fh.width);
	for(var i=0 ; i<u8data.length ; i++) {
		u8data[i] = data[i*4];
	}
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	tex.setSubData(
		0,
		new Rect(
			this._cur,
			baseY,
			this._cur+fw,
			baseY+fh.width
		),
		glc.E_InterFormat.Alpha,
		glc.E_TexDataFormat.UB,
		u8data
	);
	// キャッシュに格納
	var range = new Range(this._cur, this._cur+fw);
	this._map[code] = range;
	this._cur += fw;
	return range;
};
//! フォントテクスチャ一枚分(Lane複数)
var FontPlane = function FontPlane(w, h, laneH) {
	var this$1 = this;

	Assert$1(h >= laneH);
	this._laneH = laneH;
	// ビットマップを保持するテクスチャ
	var tex = new GLTexture2D();
	tex.setData(0, glc.E_InterFormat.Alpha, w, h,
		glc.E_InterFormat.Alpha, glc.E_TexDataFormat.UB, null);
	tex.setLinear(true, true, 0);
	this._tex = tex;
	// hをlaneHの高さで埋められるだけのサイズ(FontLane)配列
	this._lane = [];
	var nLane = Math.floor(h/laneH);
	for(var i=0 ; i<nLane ; i++) {
		this$1._lane.push(new FontLane(w));
	}
	// CharCode -> {UVRect, width, heightR}
	this._map = {};
};

var prototypeAccessors$12 = { texture: {} };
prototypeAccessors$12.texture.get = function () { return this._tex; };
FontPlane.prototype.get = function get (code, str, ctx, fw, fh) {
		var this$1 = this;

	// 既に計算してあればそれを返す
	{
		var ret = this._map[code];
		if(ret)
			{ return ret; }
	}
	var tw = this.texture.width,
		th = this.texture.height;
	var len = this._lane.length;
	for(var i=0 ; i<len ; i++) {
		var lane = this$1._lane[i];
		var ret$1 = lane.get(code, str, ctx, fw, fh, i*fh.width, this$1.texture);
		if(ret$1) {
			var rect = new Rect(ret$1.from, i*this$1._laneH, ret$1.to, (i+1)*this$1._laneH);
			rect.left /= tw;
			rect.top /= th;
			rect.right /= tw;
			rect.bottom /= th;

			var ret2 = {
				uvrect: rect,
				height: fh,
				width: fw
			};
			return this$1._map[code] = ret2;
		}
	}
	// もう入り切るスペースが無ければnullを返す
	return null;
};

Object.defineProperties( FontPlane.prototype, prototypeAccessors$12 );
//! フォントファミリと一体一で対応
var FontCache = function FontCache(w, h, laneH) {
	var assign;
	(assign = [w, h, laneH], this._width = assign[0], this._height = assign[1], this._laneH = assign[2]);
	// FontPlane配列
	this._plane = [];
	this._addNewPlane();
	// CharCode -> [Texture, UVRect, Size]
	this._map = {};
};
FontCache.prototype._addNewPlane = function _addNewPlane () {
	this._plane.push(new FontPlane(this._width, this._height, this._laneH));
};
/*! \param[in] str 対象の文字列(そのうちの一文字分を処理) */
FontCache.prototype.get = function get (str, idx, ctx, fh) {
		var this$1 = this;

	var code = str.charCodeAt(idx);
	// 既に計算してあればそれを返す
	{
		var ret$1 = this._map[code];
		if(ret$1)
			{ return ret$1; }
	}
	var sstr = str.substr(idx, 1);
	var fw = ctx.measureText(sstr).width+2;
	var ret;
	for(;;) {
		ret = this$1._plane.back().get(code, sstr, ctx, fw, fh);
		if(ret)
			{ break; }
		this$1._addNewPlane();
	}
	// キャッシュに登録
	ret = {
		texture: this._plane.back().texture,
		uvrect: ret.uvrect,
		height: ret.height,
		width: ret.width,
		chara: true,
		char: str.charAt(idx),
		code: code
	};
	this._map[code] = ret;
	return ret;
};
var FontGen = function FontGen(w, h, laneH) {
	this._cache = new FontCache(w, h, laneH);
};
// \return [{texture,uvrect,height,width}, ...]
FontGen.prototype.get = function get (str, ctx, fh) {
		var this$1 = this;

	var ret = [];
	for(var i=0 ; i<str.length ; i++) {
		var ch = str.charAt(i);
		switch(ch) {
		case "\n":
			ret.push({
				chara: false,
				char: ch,
				code: str.charAt(i),
			});
			break;
		default:
			ret.push(this$1._cache.get(str, i, ctx, fh));
		}
	}
	return ret;
};

/* global gl */
var GLIBuffer = (function (GLBuffer$$1) {
	function GLIBuffer () {
		GLBuffer$$1.apply(this, arguments);
	}

	if ( GLBuffer$$1 ) GLIBuffer.__proto__ = GLBuffer$$1;
	GLIBuffer.prototype = Object.create( GLBuffer$$1 && GLBuffer$$1.prototype );
	GLIBuffer.prototype.constructor = GLIBuffer;

	var prototypeAccessors = { typeId: {} };

	prototypeAccessors.typeId.get = function () {
		return gl.ELEMENT_ARRAY_BUFFER;
	};

	Object.defineProperties( GLIBuffer.prototype, prototypeAccessors );

	return GLIBuffer;
}(GLBuffer));

var Size = function Size(w, h) {
	this.width = w;
	this.height = h;
};

/* global gl engine */
var PlaneSingleDraw = function PlaneSingleDraw(src) {
	var vbP = new GLVBuffer();
	vbP.setData(src._position, glc.E_Drawtype.Static);
	var vbU = new GLVBuffer();
	vbU.setData(src._uv, glc.E_Drawtype.Static);
	var ib = new GLIBuffer();
	ib.setDataRaw(new Uint16Array(src._index), 1, glc.E_Drawtype.Static);
	var vbT = new GLVBuffer();
	vbT.setDataRaw(new Float32Array(src._time), 1, glc.E_Drawtype.Static);

	this.texture = src._texture;
	this.vb = {
		a_position: vbP,
		a_uv: vbU,
		a_time: vbT,
	};
	this.ib = ib;
};
PlaneSingleDraw.prototype.draw = function draw (offset, time, alpha) {
		var this$1 = this;

	engine.setUniform("u_texture", this.texture);
	engine.setUniform("u_screenSize", new Vec2(engine.width, engine.height));
	engine.setUniform("u_offset", offset);
	engine.setUniform("u_time", time);
	engine.setUniform("u_alpha", alpha);
	engine.draw(function (){ DrawWithGeom(this$1, gl.TRIANGLES); });
};
var PlaneSingle = function PlaneSingle(tex) {
	this._texture = tex;
	this._position = [];
	this._uv = [];
	this._time = [];
	this._index = [];
	this._accumTime = 0;	// 総時間
	this._tpix = new Vec2(0.5/tex.width, 0.5/tex.height);
};
PlaneSingle.prototype.add = function add (ofs, fc, t) {
	var idxBase = this._position.length;
	{
		var pos = this._position;
		pos.push(new Vec2(ofs.x+0.5,	ofs.y+fc.height.from+0.5));
		pos.push(new Vec2(ofs.x+fc.width-0.5,ofs.y+fc.height.from+0.5));
		pos.push(new Vec2(ofs.x+0.5,		ofs.y+fc.height.to-0.5));
		pos.push(new Vec2(ofs.x+fc.width-0.5,ofs.y+fc.height.to-0.5));
	}
	{
		// [xy=テクスチャuv, yz=ローカルUV]
		var uv = this._uv;
		var r = fc.uvrect;
		var tp = this._tpix;
		uv.push(new Vec4(r.left+tp.x,r.top+tp.y,	0,	0));
		uv.push(new Vec4(r.right-tp.x,r.top+tp.y,	1,	0));
		uv.push(new Vec4(r.left+tp.x,r.bottom-tp.y,0,	1));
		uv.push(new Vec4(r.right-tp.x,r.bottom-tp.y,1,	1));
	}
	{
		var time = this._time;
		for(var i=0 ; i<4; i++)
			{ time.push(t); }
	}
	this._index = this._index.concat([
		idxBase+0,
		idxBase+1,
		idxBase+3,
		idxBase+0,
		idxBase+3,
		idxBase+2
	]);
};
PlaneSingle.prototype.makeBuffer = function makeBuffer () {
	return new PlaneSingleDraw(this);
};
//! 行毎に文字列を配置
function CharPlaceLines(fp, lineH, width) {
	var ret = [];
	var cur = 0;
	for(;;) {
		var to = GetLine(fp, cur);
		if(cur === to) {
			break;
		}
		var fpL = CharPlace(fp, lineH, new Size(width, 512), cur, to);
		ret.push(fpL);
		cur = to+1;
	}
	return ret;
}
//! 指定された矩形に文字列を配置
function CharPlace(fp, lineH, size, from, to) {
	if ( from === void 0 ) from=0;
	if ( to === void 0 ) to=fp.length;

	// {[texture]: PlaneSingle}
	var vi = new Map();
	var cur = new Vec2(0,0);
	var nl = function (){
		cur.x = 0;
		cur.y += lineH;
		if(cur.y+lineH > size.height) {
			return false;
		}
		return true;
	};
	var time = 0;
	// 実際に配置された矩形サイズ
	var resultSize = new Size(0,0);
	// 引数の矩形に収まったかのフラグ
	var inPlace = true;
	Place: for(var i=from ; i<to ; i++) {
		var f = fp[i];
		if(f.chara) {
			// 通常の文字コード
			// 枠を越えるなら改行
			if(cur.x+f.width > size.width) {
				if(!nl()) {
					inPlace = false;
					break Place;
				}
			}
			var ps = (void 0);
			if(vi.has(f.texture))
				{ ps = vi.get(f.texture); }
			else {
				ps = new PlaneSingle(f.texture);
				vi.set(f.texture, ps);
			}
			ps.add(cur, f, time++);
			cur.x += f.width;
		} else {
			// 制御文字
			switch(f.char) {
			case "\n":
				// 改行
				if(!nl()) {
					inPlace = false;
					break Place;
				}
				break;
			}
		}
	}
	// 配列に詰め直し
	var plane = [];
	var itr = vi.entries();
	for(;;) {
		var ent = itr.next();
		if(ent.done)
			{ break; }
		plane.push(ent.value[1].makeBuffer());
	}
	return {
		length: time,
		plane: plane,
		inplace: inPlace,
		resultSize: resultSize,
	};
}

var Refresh = function Refresh(def) {
	var this$1 = this;

	var flagCur = 0x01;
	this._entry = {};
	var keys = Object.keys(def);
	keys.forEach(function (k){
		this$1._entry[k] = {
			depend: def[k],	//!< 依存パラメータリスト(string)
			flag: flagCur,	//!< 該当フラグ値
			upperFlag: 0,	//!< パラメータを更新した場合にセットするフラグ値(後で計算)
			lowerFlag: 0,	//!< パラメータを更新した場合にクリアするフラグ値(後で計算)
			value: null
		};
		Assert$1(flagCur <= 0x80000000);
		flagCur <<= 1;
	});
	// Depフラグ計算
	keys.forEach(function (k){
		var ent = this$1._entry[k];
		ent.lowerFlag = this$1._calcLower(k, 0);
		Assert$1((ent.upperFlag & ent.lowerFlag) === 0);
		Assert$1((ent.flag & ent.lowerFlag) === ent.flag);
	});
	this.reset();
};
Refresh.prototype._calcLower = function _calcLower (k, upper) {
		var this$1 = this;

	var ent = this._entry[k];
	ent.upperFlag |= upper;
	var flag = ent.flag;
	if(ent.depend) {
		for(var i=0 ; i<ent.depend.length ; i++) {
			flag |= this$1._calcLower(ent.depend[i], upper|ent.flag);
		}
	}
	return flag;
};
Refresh.prototype.reset = function reset () {
	this._reflag = ~0;
};
Refresh.prototype.set = function set (key, value) {
	var ent = this._entry[key];
	ent.value = value;
	this._reflag &= ~ent.lowerFlag;
	this._reflag |= ent.upperFlag;
};
Refresh.prototype.get = function get (key) {
	var ent = this._entry[key];
	if(this._reflag & ent.flag) {
		ent.value = this[("_refresh_" + key)]();
		this._reflag &= ~ent.flag;
	}
	return ent.value;
};

ResourceGen.TextRect = function() {
	var buff = {
		vb: {
			a_position: new GLVBuffer(),
			a_uv: new GLVBuffer()
		},
		ib: new GLIBuffer()
	};
	buff.vb.a_position.setData([
		new Vec2(0,0),
		new Vec2(0,1),
		new Vec2(1,1),
		new Vec2(1,0)
	], glc.E_Drawtype.Static);
	buff.vb.a_uv.setData([
		new Vec2(0,0),
		new Vec2(0,1),
		new Vec2(1,1),
		new Vec2(1,0)
	], glc.E_Drawtype.Static);
	buff.ib.setDataRaw(
		new Uint16Array([0,1,2, 2,3,0]),
		1,
		glc.E_Drawtype.Static
	);
	return buff;
};
var _ = ResourceGen.TextRect;

window._ = _;

/* global engine */
//! スクリーン上に配置するテキスト
/*!
	[shader requirements]
	attribute {
		vec2 a_position;
		vec4 a_uv;
		float a_time;
	}
	uniform {
		float u_time;
		float u_alpha;
		vec2 u_offset;
		vec2 u_screenSize;
		sampler2D u_texture;
	}
*/
var Text = (function (Refresh$$1) {
	function Text() {
		Refresh$$1.call(this, {
			font: null,
			text: null,
			size: null,
			fontheight: ["font"],
			fontgen: ["fontheight"],
			fontplane: ["fontheight", "fontgen", "text", "size"],
			length: ["fontplane"],
		});
		this.font = new Font("arial", "30pt", 100, false);
		this.text = "DefaultText";
		this.size = new Size(512,512);
	}

	if ( Refresh$$1 ) Text.__proto__ = Refresh$$1;
	Text.prototype = Object.create( Refresh$$1 && Refresh$$1.prototype );
	Text.prototype.constructor = Text;

	var prototypeAccessors = { font: {},text: {},size: {},length: {} };
	prototypeAccessors.font.set = function (f) { this.set("font", f); };
	prototypeAccessors.text.set = function (t) { this.set("text", t); };
	prototypeAccessors.size.set = function (r) { this.set("size", r); };
	prototypeAccessors.font.get = function () { return this.get("font"); };
	prototypeAccessors.text.get = function () { return this.get("text"); };
	prototypeAccessors.size.get = function () { return this.get("size"); };
	prototypeAccessors.length.get = function () { return this.get("fontplane").length; };

	Text.prototype._refresh_fontheight = function _refresh_fontheight () {
		return ResourceGen.get(new RP_FontHeight(this.font));
	};
	Text.prototype._refresh_fontgen = function _refresh_fontgen () {
		var fh = this.get("fontheight");
		return new FontGen(512, 512, fh.width);
	};
	Text.prototype._makeFontA = function _makeFontA () {
		var fh = this.get("fontheight");
		var gen = this.get("fontgen");
		var ctx = ResourceGen.get(new RP_FontCtx("fontcanvas"));
		ctx.font = this.font.fontstr;
		return {
			fontA: gen.get(this.text, ctx, fh),
			fh: fh
		};
	};
	Text.prototype._refresh_fontplane = function _refresh_fontplane () {
		var fa = this._makeFontA();
		return CharPlace(fa.fontA, fa.fh.to, this.size);
	};
	Text.prototype.draw = function draw (offset, time, alpha) {
		engine.technique = "text";
		var plane = this.get("fontplane").plane;
		for(var i=0 ; i<plane.length ; i++) {
			plane[i].draw(offset, time, alpha);
		}
	};

	Object.defineProperties( Text.prototype, prototypeAccessors );

	return Text;
}(Refresh));
var TextLines = (function (Text) {
	function TextLines() {
		Text.call(this);
		// 行ディレイ(1行毎に何秒遅らせるか)
		this.lineDelay = 0;
	}

	if ( Text ) TextLines.__proto__ = Text;
	TextLines.prototype = Object.create( Text && Text.prototype );
	TextLines.prototype.constructor = TextLines;

	var prototypeAccessors$1 = { length: {} };
	TextLines.prototype._refresh_fontplane = function _refresh_fontplane () {
		var fa = Text.prototype._makeFontA.call(this);
		return CharPlaceLines(fa.fontA, fa.fh.to, this.size);
	};
	prototypeAccessors$1.length.get = function () {
		var this$1 = this;

		var fps = this.get("fontplane");
		if(fps.length === 0)
			{ return 0; }
		var len = 0;
		for(var i=0 ; i<fps.length ; i++) {
			len = Math.max(len, fps[i].length + this$1.lineDelay*i);
		}
		return len;
	};
	TextLines.prototype.draw = function draw (offset, time, alpha) {
		var this$1 = this;

		engine.technique = "text";
		var fh = this.get("fontheight");
		var ps = this.get("fontplane");
		offset = offset.clone;
		for(var k=0 ; k<ps.length ; k++) {
			var plane = ps[k].plane;
			for(var i=0 ; i<plane.length ; i++) {
				plane[i].draw(offset, time, alpha);
				offset.y += fh.to;
				time -= this$1.lineDelay;
			}
		}
	};

	Object.defineProperties( TextLines.prototype, prototypeAccessors$1 );

	return TextLines;
}(Text));

var TextDraw = (function (Drawable$$1) {
	function TextDraw(text) {
		Drawable$$1.call(this);
		this.text = text;
		this.time = 0;
		this.offset = new Vec2(0,0);
		this.alpha = 1;
	}

	if ( Drawable$$1 ) TextDraw.__proto__ = Drawable$$1;
	TextDraw.prototype = Object.create( Drawable$$1 && Drawable$$1.prototype );
	TextDraw.prototype.constructor = TextDraw;
	TextDraw.prototype.advance = function advance (dt) {
		if(this.time >= this.text.length+8) {
			return true;
		}
		this.time += dt;
		return false;
	};
	TextDraw.prototype.onUpdate = function onUpdate () {
		if(Drawable$$1.prototype.onUpdate.call(this)) {
			engine.technique = "text";
			this.text.draw(this.offset, this.time, this.alpha);
			return true;
		}
		return false;
	};

	return TextDraw;
}(Drawable));

/* global engine resource */
// particle dance
var St_Particle = (function (State$$1) {
	function St_Particle () {
		State$$1.apply(this, arguments);
	}

	if ( State$$1 ) St_Particle.__proto__ = State$$1;
	St_Particle.prototype = Object.create( State$$1 && State$$1.prototype );
	St_Particle.prototype.constructor = St_Particle;

	St_Particle.prototype.onEnter = function onEnter (self/*, prev*/) {
		var psp = new PSpriteDraw();
		psp.alpha = 0;
		self.drawGroup.add(psp);
		this._alpha = 0;
		this._psp = psp;
	};
	St_Particle.prototype.onUpdate = function onUpdate (self, dt) {
		this._alpha += dt/2;
		this._psp.advance(dt);
		this._psp.alpha = Math.min(1, this._alpha);
		return true;
	};

	return St_Particle;
}(State));
var St_Fadeout = (function (State$$1) {
	function St_Fadeout () {
		State$$1.apply(this, arguments);
	}

	if ( State$$1 ) St_Fadeout.__proto__ = State$$1;
	St_Fadeout.prototype = Object.create( State$$1 && State$$1.prototype );
	St_Fadeout.prototype.constructor = St_Fadeout;

	St_Fadeout.prototype.onEnter = function onEnter () {
		this._alpha = 1;
	};
	St_Fadeout.prototype.onUpdate = function onUpdate (self, dt) {
		this._alpha -= dt;
		self._text.alpha = this._alpha;
		if(this._alpha < 0)
			{ self.setState(new St_Particle()); }
	};

	return St_Fadeout;
}(State));
// show "HELLO WORLD"
var St_Text = (function (State$$1) {
	function St_Text () {
		State$$1.apply(this, arguments);
	}

	if ( State$$1 ) St_Text.__proto__ = State$$1;
	St_Text.prototype = Object.create( State$$1 && State$$1.prototype );
	St_Text.prototype.constructor = St_Text;

	St_Text.prototype.onUp = function onUp (self) {
		var t = new TextDraw(new Text());
		t.priority = 10;
		var w = engine.width,
			h = engine.height;
		var str = "HELLO WORLD";
		t.text.text = str;
		t.text.size = new Size(1024, 512);
		t.offset = new Vec2(200, 300);
		self.drawGroup.add(t);
		self._text = t;

		self.updateGroup.add(new FPSCamera());
		engine.addTechnique(resource.getResource("prog"));
		self.drawGroup.add(new Clear(0));
	};
	St_Text.prototype.onUpdate = function onUpdate (self, dt) {
		if(self._text.advance(dt*15)) {
			self.setState(new St_Fadeout());
		}
		return true;
	};

	return St_Text;
}(State));
window.onload = function() {
	var alias = {
		prog: "prog.prog",
		vtest: "test.vsh",
		ftest: "test.fsh",
		valueset: "valueset.def",
		valuesetP: "valuesetP.def",
		vtestP: "testP.vsh",
		ftestP: "testP.fsh",
		textvsh: "text.vsh",
		textfsh: "text.fsh",
		sphere: "sphere.png",
		textvalueset: "textvalueset.def",
	};
	var base = "resource";
	var res = ["sphere", "prog"];
	var sc = new Scene(0, new St_Text());
	MainLoop_RF(alias, base, function (){
		return new LoadingScene(res, sc);
	});
};

}());
