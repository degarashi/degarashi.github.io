(function () {
'use strict';

var State = function State () {};

State.prototype.onEnter = function onEnter (self, prev) { };
State.prototype.onExit = function onExit (self, next) { };
State.prototype.onUpdate = function onUpdate (self, dt) { };
State.prototype.onDown = function onDown (self, ret) { };
State.prototype.onUp = function onUp (self) { };

var BeginState = new State();
var EndState = new State();

var BaseObject = function BaseObject() {
    this._bAlive = true;
};
BaseObject.prototype.alive = function alive () {
    return this._bAlive;
};
// ------------- from Discardable -------------
BaseObject.prototype.discard = function discard () {
    var prev = this._bAlive;
    this._bAlive = false;
    return prev;
};
BaseObject.prototype.isDiscarded = function isDiscarded () {
    return !this._bAlive;
};

// 描画ソートをする為の優先度値など
// 描画ソートをする為の優先度値など
var DrawTag = function DrawTag() {
    this.priority = 0;
    this.technique = null;
};

var DObject = (function (BaseObject$$1) {
    function DObject(tech, priority) {
        if ( priority === void 0 ) priority = 0;

        BaseObject$$1.call(this);
        this.drawtag = new DrawTag();
        this.drawtag.technique = tech;
        this.drawtag.priority = priority;
    }

    if ( BaseObject$$1 ) DObject.__proto__ = BaseObject$$1;
    DObject.prototype = Object.create( BaseObject$$1 && BaseObject$$1.prototype );
    DObject.prototype.constructor = DObject;

    return DObject;
}(BaseObject));

var gl;
function SetGL(g) { gl = g; }
var engine;
function SetEngine(e) { engine = e; }
var resource;
function SetResource(r) { resource = r; }
var input;
function SetInput(i) { input = i; }
var scene;
function SetScene(s) { scene = s; }
var glres;
function SetGLRes(r) { glres = r; }

var Clear = (function (DObject$$1) {
    function Clear(color, depth, stencil) {
        DObject$$1.call(this, null);
        this.color = color;
        this.depth = depth;
        this.stencil = stencil;
    }

    if ( DObject$$1 ) Clear.__proto__ = DObject$$1;
    Clear.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    Clear.prototype.constructor = Clear;
    Clear.prototype.onDraw = function onDraw () {
        var flag = 0;
        if (this.color) {
            var c = this.color;
            gl.clearColor(c.x, c.y, c.z, c.w);
            flag |= gl.COLOR_BUFFER_BIT;
        }
        if (this.depth) {
            gl.clearDepth(this.depth);
            flag |= gl.DEPTH_BUFFER_BIT;
        }
        if (this.stencil) {
            gl.clearStencil(this.stencil);
            flag |= gl.STENCIL_BUFFER_BIT;
        }
        gl.clear(flag);
    };

    return Clear;
}(DObject));

// 数学関連のクラス
var TM;
(function (TM) {
    TM.EQUAL_THRESHOLD = 1e-5;
    function IsEqual(f0, f1) {
        return Math.abs(f0 - f1) <= TM.EQUAL_THRESHOLD;
    }
    TM.IsEqual = IsEqual;
    function Deg2rad(deg) {
        return (deg / 180) * Math.PI;
    }
    TM.Deg2rad = Deg2rad;
    function Rad2deg(rad) {
        return rad / Math.PI * 180;
    }
    TM.Rad2deg = Rad2deg;
    function Square(v) {
        return v * v;
    }
    TM.Square = Square;
    function GCD(a, b) {
        if (a === 0 || b === 0)
            { return 0; }
        while (a !== b) {
            if (a > b)
                { a -= b; }
            else
                { b -= a; }
        }
        return a;
    }
    TM.GCD = GCD;
    function LCM(a, b) {
        var div = TM.GCD(a, b);
        if (div === 0)
            { return 0; }
        return (a / div) * b;
    }
    TM.LCM = LCM;
})(TM || (TM = {}));
var TM$1 = TM;

var VectorImpl = function VectorImpl(n) {
    var this$1 = this;
    var elem = [], len = arguments.length - 1;
    while ( len-- > 0 ) elem[ len ] = arguments[ len + 1 ];

    this.value = new Float32Array(n);
    for (var i = 0; i < n; i++)
        { this$1.value[i] = elem[i] || 0; }
};

var prototypeAccessors = { x: {},y: {},z: {},w: {} };
VectorImpl.prototype.dim = function dim () {
    return this.value.length;
};
prototypeAccessors.x.get = function () { return this.value[0]; };
prototypeAccessors.x.set = function (v) { this.value[0] = v; };
prototypeAccessors.y.get = function () { return this.value[1]; };
prototypeAccessors.y.set = function (v) { this.value[1] = v; };
prototypeAccessors.z.get = function () { return this.value[2]; };
prototypeAccessors.z.set = function (v) { this.value[2] = v; };
prototypeAccessors.w.get = function () { return this.value[3]; };
prototypeAccessors.w.set = function (v) { this.value[3] = v; };
VectorImpl.prototype.clone = function clone () {
    var ret = new VectorImpl(this.dim());
    ret.set(this);
    return ret._asT();
};
VectorImpl.prototype._asT = function _asT () {
    var tmp = this;
    return tmp;
};
VectorImpl.prototype.saturate = function saturate (vmin, vmax) {
        var this$1 = this;

    var ret = this.clone();
    var n = this.dim();
    for (var i = 0; i < n; i++) {
        var val = this$1.value[i];
        if (val >= vmax)
            { this$1.value[i] = vmax; }
        else if (val <= vmin)
            { this$1.value[i] = vmin; }
    }
    return ret;
};
VectorImpl.prototype.equal = function equal (v) {
        var this$1 = this;

    var n = this.dim();
    for (var i = 0; i < n; i++) {
        if (!TM$1.IsEqual(this$1.value[i], v.value[i]))
            { return false; }
    }
    return true;
};
VectorImpl.prototype.lerp = function lerp (v, t) {
        var this$1 = this;

    var n = this.dim();
    var ret = this.clone();
    for (var i = 0; i < n; i++)
        { ret.value[i] = (v.value[i] - this$1.value[i]) * t + this$1.value[i]; }
    return ret;
};
VectorImpl.prototype._unionDuplicate = function _unionDuplicate () {
    var ret = this.constructor(0);
    return ret;
};
VectorImpl.prototype.set = function set (v) {
        var this$1 = this;

    var n = this.dim();
    for (var i = 0; i < n; i++)
        { this$1.value[i] = v.value[i]; }
    return this._asT();
};
VectorImpl.prototype.add = function add (v) {
        var this$1 = this;

    var n = this.dim();
    var ret = this.clone();
    for (var i = 0; i < n; i++)
        { ret.value[i] = this$1.value[i] + v.value[i]; }
    return ret;
};
VectorImpl.prototype.addSelf = function addSelf (v) {
    return this.set(this.add(v));
};
VectorImpl.prototype.sub = function sub (v) {
        var this$1 = this;

    var n = this.dim();
    var ret = this.clone();
    for (var i = 0; i < n; i++)
        { ret.value[i] = this$1.value[i] - v.value[i]; }
    return ret;
};
VectorImpl.prototype.subSelf = function subSelf (v) {
    return this.set(this.sub(v));
};
VectorImpl.prototype.mul = function mul (s) {
        var this$1 = this;

    var n = this.dim();
    var ret = this.clone();
    for (var i = 0; i < n; i++)
        { ret.value[i] = this$1.value[i] * s; }
    return ret;
};
VectorImpl.prototype.mulSelf = function mulSelf (s) {
    return this.set(this.mul(s));
};
VectorImpl.prototype.div = function div (s) {
    return this.mul(1 / s);
};
VectorImpl.prototype.divSelf = function divSelf (s) {
    return this.set(this.div(s));
};
VectorImpl.prototype.len_sq = function len_sq () {
    return this.dot(this);
};
VectorImpl.prototype.length = function length () {
    return Math.sqrt(this.len_sq());
};
VectorImpl.prototype.normalize = function normalize () {
    return this.div(this.length());
};
VectorImpl.prototype.normalizeSelf = function normalizeSelf () {
    return this.set(this.normalize());
};
VectorImpl.prototype.dot = function dot (v) {
        var this$1 = this;

    var d = 0;
    var n = this.dim();
    for (var i = 0; i < n; i++)
        { d += this$1.value[i] * v.value[i]; }
    return d;
};
VectorImpl.prototype.minus = function minus () {
    return this.mul(-1);
};
VectorImpl.prototype.toString = function toString () {
        var this$1 = this;

    var n = this.dim();
    var ret = "Vector" + n + ":[";
    var bFirst = true;
    for (var i = 0; i < n; i++) {
        if (!bFirst)
            { ret += ", "; }
        ret += this$1.value[i];
        bFirst = false;
    }
    return ret + "]";
};

Object.defineProperties( VectorImpl.prototype, prototypeAccessors );

var Vec2 = (function (VectorImpl$$1) {
    function Vec2(x, y) {
        if ( y === void 0 ) y = x;

        VectorImpl$$1.call(this, 2, x, y);
    }

    if ( VectorImpl$$1 ) Vec2.__proto__ = VectorImpl$$1;
    Vec2.prototype = Object.create( VectorImpl$$1 && VectorImpl$$1.prototype );
    Vec2.prototype.constructor = Vec2;
    Vec2.prototype.clone = function clone () {
        return new Vec2(this.x, this.y);
    };

    return Vec2;
}(VectorImpl));

// リストの合成
function JoinEntries(dst, src) {
    var k = Object.keys(src);
    for (var i = 0; i < k.length; i++) {
        var key = k[i];
        dst[key] = src[key];
    }
    return dst;
}
// リストの合成 (重複時にコールバックを呼ぶ)
function JoinEntriesND(dst, src, cbDup) {
    var k = Object.keys(src);
    for (var i = 0; i < k.length; i++) {
        var key = k[i];
        if (typeof dst[key] !== "undefined") {
            if (!cbDup(key))
                { return dst; }
        }
        dst[key] = src[key];
    }
    return dst;
}
function PlaceCenter(dstSize, srcSize) {
    return new Vec2(Math.floor(dstSize.width / 2 - srcSize.width / 2), Math.floor(dstSize.height / 2 - srcSize.height / 2));
}

function BlockPlace(dst, dstWidth, dim, px, py, src, srcWidth) {
    var srcHeight = src.length / srcWidth;
    for (var i = 0; i < srcHeight; i++) {
        var db = (i + py) * dstWidth * dim + px * dim;
        var sb = i * srcWidth * dim;
        for (var j = 0; j < srcWidth; j++) {
            for (var k = 0; k < dim; k++)
                { dst[db + j * dim + k] = src[sb + j * dim + k]; }
        }
    }
}
// 一行分を切り出す
function GetLine(fp, from) {
    var len = fp.length;
    var i = from;
    for (; i < len; i++) {
        var f = fp[i];
        if (!f.chara) {
            if (f.char === "\n")
                { return i; }
        }
    }
    return i;
}

function PaddingString(n, c) {
    var str = "";
    while (n-- > 0)
        { str += c; }
    return str;
}
function FixedInteger(nAll, num, pad) {
    if ( pad === void 0 ) pad = " ";

    var str = String(num);
    var remain = nAll - str.length;
    if (remain > 0) {
        str = PaddingString(remain, pad) + str;
    }
    return str;
}
function AddLineNumber(src, lineOffset, viewNum, prevLR, postLR) {
    var res = "";
    if (src === null)
        { return res; }
    if (prevLR)
        { res += "\n"; }
    var padding = PaddingString(5, " ") + "  ";
    var srcA = src.split("\n");
    var srcLen = srcA.length;
    for (var lnum = 0; lnum < srcLen; ++lnum) {
        if (lnum >= viewNum)
            { res += FixedInteger(5, lnum + lineOffset - viewNum) + ": "; }
        else
            { res += padding; }
        res += (srcA[lnum]) + "\n";
    }
    if (postLR)
        { res += "\n"; }
    return res;
}

function AssertF(msg) {
    throw Error(msg || "assertion failed");
}
function Assert(cond, msg) {
    if (!cond)
        { throw Error(msg || "assertion failed"); }
}
function ExtractExtension(fname) {
    var r = /([a-zA-Z0-9_\-]+\.)+([a-zA-Z0-9_\-]+)/;
    var r2 = r.exec(fname);
    if (r2) {
        return r2[2];
    }
    return null;
}
function Saturation(val, min, max) {
    if (val <= min)
        { return min; }
    if (val >= max)
        { return max; }
    return val;
}


function VectorToArray() {
    var va = [], len = arguments.length;
    while ( len-- ) va[ len ] = arguments[ len ];

    var n = va.length;
    if (n === 0)
        { return new Float32Array(0); }
    if (n === 1)
        { return va[0].value; }
    var dim = va[0].dim();
    var ret = new Float32Array(dim * n);
    for (var i = 0; i < n; i++) {
        var v = va[i].value;
        for (var j = 0; j < dim; j++) {
            ret[i * dim + j] = v[j];
        }
    }
    return ret;
}
function MatrixToArray() {
    var ma = [], len = arguments.length;
    while ( len-- ) ma[ len ] = arguments[ len ];

    var n = ma.length;
    if (n === 0)
        { return new Float32Array(0); }
    if (n === 1)
        { return ma[0].value; }
    var dim_m = ma[0].dim_m(), dim_n = ma[0].dim_n();
    var ret = new Float32Array(dim_m * dim_n * n);
    for (var i = 0; i < n; i++) {
        var m = ma[i].value;
        for (var j = 0; j < dim_m * dim_n; j++) {
            ret[i * dim_m * dim_n + j] = m[j];
        }
    }
    return ret;
}
function VMToArray(vm) {
    if (IsMatrix(vm))
        { return MatrixToArray(vm); }
    return VectorToArray(vm);
}
function IsVector(v) {
    return v.dim !== undefined;
}
function IsMatrix(m) {
    return m.dim_m !== undefined;
}
function IsVM(vm) {
    return IsVector(vm) || IsMatrix(vm);
}
var RequestAnimationFrame = window.requestAnimationFrame
    || (function () {
        return window.webkitRequestAnimationFrame ||
            function (cb) {
                window.setTimeout(cb, 1000 / 60);
            };
    })();



function LowBits32(b) {
    b |= b >>> 1;
    b |= b >>> 2;
    b |= b >>> 4;
    b |= b >>> 8;
    b |= b >>> 16;
    return b;
}
function GetPowValue(v) {
    if (v <= 1)
        { return 1; }
    --v;
    return (v & ~LowBits32(v >>> 1)) << 1;
}

var Vec3 = (function (VectorImpl$$1) {
    function Vec3(x, y, z) {
        if ( y === void 0 ) y = x;
        if ( z === void 0 ) z = y;

        VectorImpl$$1.call(this, 3, x, y, z);
    }

    if ( VectorImpl$$1 ) Vec3.__proto__ = VectorImpl$$1;
    Vec3.prototype = Object.create( VectorImpl$$1 && VectorImpl$$1.prototype );
    Vec3.prototype.constructor = Vec3;
    Vec3.prototype.cross = function cross (v) {
        var x = this.x, y = this.y, z = this.z;
        var vx = v.x, vy = v.y, vz = v.z;
        return new Vec3(y * vz - z * vy, z * vx - x * vz, x * vy - y * vx);
    };
    Vec3.prototype.clone = function clone () {
        return new Vec3(this.x, this.y, this.z);
    };

    return Vec3;
}(VectorImpl));

var Vec4Impl = (function (VectorImpl$$1) {
    function Vec4Impl(x, y, z, w) {
        if ( y === void 0 ) y = x;
        if ( z === void 0 ) z = y;
        if ( w === void 0 ) w = z;

        VectorImpl$$1.call(this, 4, x, y, z, w);
    }

    if ( VectorImpl$$1 ) Vec4Impl.__proto__ = VectorImpl$$1;
    Vec4Impl.prototype = Object.create( VectorImpl$$1 && VectorImpl$$1.prototype );
    Vec4Impl.prototype.constructor = Vec4Impl;

    return Vec4Impl;
}(VectorImpl));
var Vec4 = (function (Vec4Impl) {
    function Vec4 () {
        Vec4Impl.apply(this, arguments);
    }

    if ( Vec4Impl ) Vec4.__proto__ = Vec4Impl;
    Vec4.prototype = Object.create( Vec4Impl && Vec4Impl.prototype );
    Vec4.prototype.constructor = Vec4;

    Vec4.prototype.clone = function clone () {
        return new Vec4(this.x, this.y, this.z, this.w);
    };

    return Vec4;
}(Vec4Impl));

function MakeVector(n) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    switch (n) {
        case 2:
            return new Vec2(args[0], args[1]);
        case 3:
            return new Vec3(args[0], args[1], args[2]);
        case 4:
            return new Vec4(args[0], args[1], args[2], args[3]);
    }
    throw new Error("invalid dimension");
}

var MatrixImpl = function MatrixImpl(m, n) {
    var this$1 = this;
    var arg = [], len = arguments.length - 2;
    while ( len-- > 0 ) arg[ len ] = arguments[ len + 2 ];

    this._m = m;
    this._n = n;
    this.value = new Float32Array(m * n);
    for (var i = 0; i < m * n; i++)
        { this$1.value[i] = arg[i] || 0; }
};
MatrixImpl.prototype.dim_m = function dim_m () {
    return this._m;
};
MatrixImpl.prototype.dim_n = function dim_n () {
    return this._n;
};
MatrixImpl.prototype.set = function set (m) {
        var this$1 = this;

    var n = this.dim_m() * this.dim_n();
    for (var i = 0; i < n; i++) {
        this$1.value[i] = m.value[i];
    }
    return this._asT();
};
MatrixImpl.prototype.getAt = function getAt (x, y) {
    return this.value[x * 4 + y];
};
MatrixImpl.prototype.setAt = function setAt (x, y, val) {
    return this.value[x * 4 + y] = val;
};
MatrixImpl.prototype.clone = function clone () {
    var ret = new MatrixImpl(this.dim_m(), this.dim_n());
    ret.set(this);
    return ret._asT();
};
MatrixImpl.prototype._asT = function _asT () {
    var tmp = this;
    return tmp;
};
MatrixImpl.prototype._mulMatrix = function _mulMatrix (m) {
        var this$1 = this;

    var ret = this.clone();
    var ref = [this.dim_n(), this.dim_m()];
        var w = ref[0];
        var h = ref[1];
    for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
            var sum = 0;
            for (var k = 0; k < w; k++) {
                sum += this$1.getAt(k, i) * m.getAt(j, k);
            }
            ret.setAt(j, i, sum);
        }
    }
    return ret;
};
MatrixImpl.prototype._mulVector = function _mulVector (v) {
        var this$1 = this;

    var w = this.dim_n(), h = this.dim_m();
    var ret = MakeVector(w, 0);
    for (var i = 0; i < h; i++) {
        for (var k = 0; k < w; k++) {
            ret.value[i] += this$1.getAt(k, i) * v.value[k];
        }
    }
    return ret;
};
MatrixImpl.prototype._mulFloat = function _mulFloat (f) {
        var this$1 = this;

    var ret = this.clone();
    var n = this.dim_m() * this.dim_n();
    for (var i = 0; i < n; i++)
        { ret.value[i] = this$1.value[i] * f; }
    return ret;
};
MatrixImpl.prototype.mul = function mul (m) {
    if (IsMatrix(m))
        { return this._mulMatrix(m); }
    if (IsVector(m))
        { return this._mulVector(m); }
    Assert(typeof m === "number");
    return this._mulFloat(m);
};
MatrixImpl.prototype.mulSelf = function mulSelf (m) {
    return this.set(this.mul(m));
};
MatrixImpl.prototype.toString = function toString () {
        var this$1 = this;

    var str = "Matrix:\n";
    var w = this.dim_n(), h = this.dim_m();
    for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
            str += this$1.getAt(j, i);
            if (j !== w)
                { str += ", "; }
        }
        if (i !== h)
            { str += "\n"; }
    }
    return str;
};

var NoInvertedMatrix = (function (Error) {
    function NoInvertedMatrix () {
        Error.apply(this, arguments);
    }if ( Error ) NoInvertedMatrix.__proto__ = Error;
    NoInvertedMatrix.prototype = Object.create( Error && Error.prototype );
    NoInvertedMatrix.prototype.constructor = NoInvertedMatrix;

    

    return NoInvertedMatrix;
}(Error));
var Mat44 = (function (MatrixImpl$$1) {
    function Mat44() {
        var arg = [], len = arguments.length;
        while ( len-- ) arg[ len ] = arguments[ len ];

        MatrixImpl$$1.apply(this, [ 4, 4 ].concat( arg ));
    }

    if ( MatrixImpl$$1 ) Mat44.__proto__ = MatrixImpl$$1;
    Mat44.prototype = Object.create( MatrixImpl$$1 && MatrixImpl$$1.prototype );
    Mat44.prototype.constructor = Mat44;

    var prototypeAccessors = { _m00: {},_m01: {},_m02: {},_m03: {},_m10: {},_m11: {},_m12: {},_m13: {},_m20: {},_m21: {},_m22: {},_m23: {},_m30: {},_m31: {},_m32: {},_m33: {} };
    // 行優先
    Mat44.FromRow = function FromRow (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        return new Mat44(m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33);
    };
    Mat44.FromVec3s = function FromVec3s (x, y, z) {
        return new Mat44(x.x, y.x, z.x, 0, x.y, y.y, z.y, 0, x.z, y.z, z.z, 0, 0, 0, 0, 1);
    };
    Mat44.FromVec4s = function FromVec4s (x, y, z, w) {
        return new Mat44(x.x, y.x, z.x, w.x, x.y, y.y, z.y, w.y, x.z, y.z, z.z, w.z, x.w, y.w, z.w, w.w);
    };
    Mat44.LookDir = function LookDir (pos, dir, up) {
        var rdir = up.cross(dir);
        rdir.normalizeSelf();
        up = dir.cross(rdir);
        up.normalizeSelf();
        return new Mat44(rdir.x, up.x, dir.x, 0, rdir.y, up.y, dir.y, 0, rdir.z, up.z, dir.z, 0, -rdir.dot(pos), -up.dot(pos), -dir.dot(pos), 1);
    };
    Mat44.LookAt = function LookAt (pos, at, up) {
        return Mat44.LookDir(pos, at.sub(pos).normalizeSelf(), up);
    };
    Mat44.Scaling = function Scaling (x, y, z) {
        return new Mat44(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
    };
    Mat44.PerspectiveFov = function PerspectiveFov (fov, aspect, znear, zfar) {
        var h = 1 / Math.tan(fov / 2);
        var w = h / aspect;
        var f0 = zfar / (zfar - znear), f1 = -znear * zfar / (zfar - znear);
        return new Mat44(w, 0, 0, 0, 0, h, 0, 0, 0, 0, f0, 1, 0, 0, f1, 0);
    };
    Mat44.Translation = function Translation (x, y, z) {
        return new Mat44(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1);
    };
    Mat44.Rotation = function Rotation (axis, angle) {
        var C = Math.cos(angle), S = Math.sin(angle), RC = 1 - C;
        var axis0 = axis.x, axis1 = axis.y, axis2 = axis.z;
        return Mat44.FromRow(C + TM$1.Square(axis0) * RC, axis0 * axis1 * RC - axis2 * S, axis0 * axis2 * RC + axis1 * S, 0, axis0 * axis1 * RC + axis2 * S, C + TM$1.Square(axis1) * RC, axis1 * axis2 * RC - axis0 * S, 0, axis0 * axis2 * RC - axis1 * S, axis1 * axis2 * RC + axis0 * S, C + TM$1.Square(axis2) * RC, 0, 0, 0, 0, 1);
    };
    Mat44.RotationX = function RotationX (angle) {
        return Mat44.Rotation(new Vec3(1, 0, 0), angle);
    };
    Mat44.RotationY = function RotationY (angle) {
        return Mat44.Rotation(new Vec3(0, 1, 0), angle);
    };
    Mat44.RotationZ = function RotationZ (angle) {
        return Mat44.Rotation(new Vec3(0, 0, 1), angle);
    };
    Mat44.Zero = function Zero () {
        return new Mat44(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    };
    Mat44.Identity = function Identity () {
        return new Mat44(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    };
    Mat44.Iterate = function Iterate (f) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++)
                { f(j, i); }
        }
    };
    prototypeAccessors._m00.get = function () { return this.value[0]; };
    prototypeAccessors._m01.get = function () { return this.value[4]; };
    prototypeAccessors._m02.get = function () { return this.value[8]; };
    prototypeAccessors._m03.get = function () { return this.value[12]; };
    prototypeAccessors._m10.get = function () { return this.value[0 + 1]; };
    prototypeAccessors._m11.get = function () { return this.value[4 + 1]; };
    prototypeAccessors._m12.get = function () { return this.value[8 + 1]; };
    prototypeAccessors._m13.get = function () { return this.value[12 + 1]; };
    prototypeAccessors._m20.get = function () { return this.value[0 + 2]; };
    prototypeAccessors._m21.get = function () { return this.value[4 + 2]; };
    prototypeAccessors._m22.get = function () { return this.value[8 + 2]; };
    prototypeAccessors._m23.get = function () { return this.value[12 + 2]; };
    prototypeAccessors._m30.get = function () { return this.value[0 + 3]; };
    prototypeAccessors._m31.get = function () { return this.value[4 + 3]; };
    prototypeAccessors._m32.get = function () { return this.value[8 + 3]; };
    prototypeAccessors._m33.get = function () { return this.value[12 + 3]; };
    Mat44.prototype.determinant = function determinant () {
        return this._m00 * this._m11 * this._m22 * this._m33 + this._m00 * this._m12 * this._m23 * this._m31 + this._m00 * this._m13 * this._m21 * this._m32
            + this._m01 * this._m10 * this._m23 * this._m32 + this._m01 * this._m12 * this._m20 * this._m33 + this._m01 * this._m13 * this._m22 * this._m30
            + this._m02 * this._m10 * this._m21 * this._m33 + this._m02 * this._m11 * this._m23 * this._m30 + this._m02 * this._m13 * this._m20 * this._m31
            + this._m03 * this._m10 * this._m22 * this._m31 + this._m03 * this._m11 * this._m20 * this._m32 + this._m03 * this._m12 * this._m21 * this._m30
            - this._m00 * this._m11 * this._m23 * this._m32 - this._m00 * this._m12 * this._m21 * this._m33 - this._m00 * this._m13 * this._m22 * this._m31
            - this._m01 * this._m10 * this._m22 * this._m33 - this._m01 * this._m12 * this._m23 * this._m30 - this._m01 * this._m13 * this._m20 * this._m32
            - this._m02 * this._m10 * this._m23 * this._m31 - this._m02 * this._m11 * this._m20 * this._m33 - this._m02 * this._m13 * this._m21 * this._m30
            - this._m03 * this._m10 * this._m21 * this._m32 - this._m03 * this._m11 * this._m22 * this._m30 - this._m03 * this._m12 * this._m20 * this._m31;
    };
    Mat44.prototype.invert = function invert () {
        var det = this.determinant();
        if (Math.abs(det) > 1e-5) {
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
            for (var i = 0; i < b.length; i++)
                { b[i] *= det; }
            return Mat44.FromRow(b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15]);
        }
        throw new NoInvertedMatrix();
    };
    Mat44.prototype.transposeSelf = function transposeSelf () {
        var this$1 = this;

        for (var i = 0; i < 4; i++) {
            for (var j = i; j < 4; j++) {
                var tmp = this$1.getAt(i, j);
                this$1.setAt(i, j, this$1.getAt(j, i));
                this$1.setAt(j, i, tmp);
            }
        }
        return this;
    };
    Mat44.prototype.transform3 = function transform3 (v) {
        var this$1 = this;

        var ret = new Vec3(this.getAt(0, 3), this.getAt(1, 3), this.getAt(2, 3));
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++)
                { ret.value[i] += this$1.getAt(i, j) * v.value[j]; }
        }
        return ret;
    };

    Object.defineProperties( Mat44.prototype, prototypeAccessors );

    return Mat44;
}(MatrixImpl));

// クォータニオンクラス
var Quat = (function (Vec4Impl$$1) {
    function Quat(x, y, z, w) {
        Vec4Impl$$1.call(this, x, y, z, w);
    }

    if ( Vec4Impl$$1 ) Quat.__proto__ = Vec4Impl$$1;
    Quat.prototype = Object.create( Vec4Impl$$1 && Vec4Impl$$1.prototype );
    Quat.prototype.constructor = Quat;

    var prototypeAccessors = { elem00: {},elem01: {},elem02: {},elem10: {},elem11: {},elem12: {},elem20: {},elem21: {},elem22: {} };
    Quat.Identity = function Identity () {
        return new Quat(0, 0, 0, 1);
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
    Quat.prototype.set = function set (q) {
        var assign;
        (assign = [q.x, q.y, q.z, q.w], this.x = assign[0], this.y = assign[1], this.z = assign[2], this.w = assign[3]);
        return this;
    };
    Quat.prototype.conjugate = function conjugate () {
        return new Quat(-this.value[0], -this.value[1], -this.value[2], this.value[3]);
    };
    prototypeAccessors.elem00.get = function () { return (1 - 2 * this.y * this.y - 2 * this.z * this.z); };
    prototypeAccessors.elem01.get = function () { return (2 * this.x * this.y + 2 * this.w * this.z); };
    prototypeAccessors.elem02.get = function () { return (2 * this.x * this.z - 2 * this.w * this.y); };
    prototypeAccessors.elem10.get = function () { return (2 * this.x * this.y - 2 * this.w * this.z); };
    prototypeAccessors.elem11.get = function () { return (1 - 2 * this.x * this.x - 2 * this.z * this.z); };
    prototypeAccessors.elem12.get = function () { return (2 * this.y * this.z + 2 * this.w * this.x); };
    prototypeAccessors.elem20.get = function () { return (2 * this.x * this.z + 2 * this.w * this.y); };
    prototypeAccessors.elem21.get = function () { return (2 * this.y * this.z - 2 * this.w * this.x); };
    prototypeAccessors.elem22.get = function () { return (1 - 2 * this.x * this.x - 2 * this.y * this.y); };
    // 回転を行列表現した時のX軸
    Quat.prototype.xaxis = function xaxis () {
        return new Vec3(this.elem00, this.elem10, this.elem20);
    };
    // 正規直行座標に回転を掛けた後のX軸
    Quat.prototype.xaxisinv = function xaxisinv () {
        return new Vec3(this.elem00, this.elem01, this.elem02);
    };
    // 回転を行列表現した時のY軸
    Quat.prototype.yaxis = function yaxis () {
        return new Vec3(this.elem01, this.elem11, this.elem21);
    };
    // 正規直行座標に回転を掛けた後のY軸
    Quat.prototype.yaxisinv = function yaxisinv () {
        return new Vec3(this.elem10, this.elem11, this.elem12);
    };
    // 回転を行列表現した時のZ軸
    Quat.prototype.zaxis = function zaxis () {
        return new Vec3(this.elem02, this.elem12, this.elem22);
    };
    // 正規直行座標に回転を掛けた後のZ軸
    Quat.prototype.zaxisinv = function zaxisinv () {
        return new Vec3(this.elem20, this.elem21, this.elem22);
    };
    // X軸に回転を適用したベクトル
    Quat.prototype.right = function right () {
        return new Vec3(this.elem00, this.elem01, this.elem02);
    };
    // Y軸に回転を適用したベクトル
    Quat.prototype.up = function up () {
        return new Vec3(this.elem10, this.elem11, this.elem12);
    };
    // Z軸に回転を適用したベクトル
    Quat.prototype.dir = function dir () {
        return new Vec3(this.elem20, this.elem21, this.elem22);
    };
    // 行列変換(4x4)
    Quat.prototype.matrix44 = function matrix44 () {
        return new Mat44(this.elem00, this.elem01, this.elem02, 0, this.elem10, this.elem11, this.elem12, 0, this.elem20, this.elem21, this.elem22, 0, 0, 0, 0, 1);
    };
    Quat.prototype.conjugateSelf = function conjugateSelf () {
        return this.set(this.conjugate());
    };
    Quat.prototype.rotateX = function rotateX (a) {
        return this.rotate(new Vec3(1, 0, 0), a);
    };
    Quat.prototype.rotateY = function rotateY (a) {
        return this.rotate(new Vec3(0, 1, 0), a);
    };
    Quat.prototype.rotateZ = function rotateZ (a) {
        return this.rotate(new Vec3(0, 0, 1), a);
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
        return Quat.Rotate(new Vec3(1, 0, 0), a);
    };
    Quat.RotateY = function RotateY (a) {
        return Quat.Rotate(new Vec3(0, 1, 0), a);
    };
    Quat.RotateZ = function RotateZ (a) {
        return Quat.Rotate(new Vec3(0, 0, 1), a);
    };
    Quat.Rotate = function Rotate (axis, a) {
        var C = Math.cos(a / 2), S = Math.sin(a / 2);
        axis = axis.mul(S);
        return new Quat(axis.x, axis.y, axis.z, C);
    };
    Quat.prototype.rotate = function rotate (axis, a) {
        return Quat.Rotate(axis, a).mul(this);
    };
    Quat.prototype.angle = function angle () {
        return Math.acos(Saturation(this.w, -1, 1)) * 2;
    };
    Quat.prototype.axis = function axis () {
        var s_theta = Math.sqrt(1 - this.w * this.w);
        if (s_theta < 0.0001)
            { throw new Error("no valid axis"); }
        s_theta = 1 / s_theta;
        return new Vec3(this.x * s_theta, this.y * s_theta, this.z * s_theta);
    };
    Quat.prototype.mul = function mul (q) {
        if (q instanceof Quat) {
            return new Quat(this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y, this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x, this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w, this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z);
        }
        else if (typeof q === "number") {
            return Vec4Impl$$1.prototype.mul.call(this, q);
        }
        else if (q instanceof Vec3) {
            var q0 = new Quat(q.x, q.y, q.z, 0);
            return (this.mul(q0).mul(this.invert())).vector;
        }
        throw new Error("invalid argument");
    };
    Quat.prototype.mulSelf = function mulSelf (q) {
        return this.set(this.mul(q));
    };
    Quat.prototype.divSelf = function divSelf (q) {
        return this.set(this.div(q));
    };
    Quat.prototype.add = function add (q) {
        return Vec4Impl$$1.prototype.add.call(this, q);
    };
    Quat.prototype.sub = function sub (q) {
        return Vec4Impl$$1.prototype.sub.call(this, q);
    };
    Quat.prototype.vector = function vector () {
        this.divSelf(new Quat(0, 0, 0, 0));
        return new Vec3(this.x, this.y, this.z);
    };
    Quat.prototype.invert = function invert () {
        return this.conjugate().divSelf(this.len_sq());
    };
    Quat.prototype.invertSelf = function invertSelf () {
        return this.set(this.invert());
    };
    // 球面線形補間
    Quat.prototype.slerp = function slerp (q, t) {
        var ac = Saturation(this.dot(q), 0, 1);
        var theta = Math.acos(ac), S = Math.sin(theta);
        if (Math.abs(S) < 0.001)
            { return this.clone; }
        var rq = this.mul(Math.sin(theta * (1 - t)) / S);
        rq.addSelf(q.mul(Math.sin(theta * t) / S));
        return rq;
    };
    Quat.prototype.clone = function clone () {
        return new Quat(this.x, this.y, this.z, this.w);
    };

    Object.defineProperties( Quat.prototype, prototypeAccessors );

    return Quat;
}(Vec4Impl));

// 3D姿勢
var Pose3D = function Pose3D(pos, rot, scale) {
    if ( pos === void 0 ) pos = new Vec3(0);
    if ( rot === void 0 ) rot = Quat.Identity();
    if ( scale === void 0 ) scale = new Vec3(1);

    this.pos = pos;
    this.rot = rot;
    this.scale = scale;
};
Pose3D.prototype.asMatrix = function asMatrix () {
    // Scaling, Rotation, Position の順
    return Mat44.Translation(this.pos.x, this.pos.y, this.pos.z).mul(this.rot.matrix44().mul(Mat44.Scaling(this.scale.x, this.scale.y, this.scale.z)));
};
Pose3D.prototype.clone = function clone () {
    return new Pose3D(this.pos, this.rot, this.scale);
};

var Camera3D = (function (Pose3D$$1) {
    function Camera3D() {
        Pose3D$$1.apply(this, arguments);
        this.fov = TM$1.Deg2rad(90);
        this.aspect = 1;
        this.nearZ = 1e-2;
        this.farZ = 10;
    }

    if ( Pose3D$$1 ) Camera3D.__proto__ = Pose3D$$1;
    Camera3D.prototype = Object.create( Pose3D$$1 && Pose3D$$1.prototype );
    Camera3D.prototype.constructor = Camera3D;
    Camera3D.prototype.getView = function getView () {
        return Mat44.LookDir(this.pos, this.rot.dir(), new Vec3(0, 1, 0));
    };
    Camera3D.prototype.getProjection = function getProjection () {
        return Mat44.PerspectiveFov(this.fov, this.aspect, this.nearZ, this.farZ);
    };
    Camera3D.prototype.getViewProjection = function getViewProjection () {
        return this.getProjection().mul(this.getView());
    };
    /*! \param[in] pt	スクリーン座標(Vec2) */
    Camera3D.prototype.unproject = function unproject (pt) {
        var vp = this.getViewProjection();
        vp = vp.invert();
        var v0 = new Vec4(pt.x, pt.y, 0, 1), v1 = new Vec4(pt.x, pt.y, 1, 1);
        v0 = vp.mul(v0);
        v1 = vp.mul(v1);
        v0.divSelf(v0.w);
        v1.divSelf(v1.w);
        var ret4 = v1.subSelf(v0).normalizeSelf();
        return new Vec2(ret4.x, ret4.y);
    };
    Camera3D.prototype.clone = function clone () {
        return new Camera3D(this.pos, this.rot, this.scale);
    };

    return Camera3D;
}(Pose3D));

var SysUnif3D = function SysUnif3D() {
    this.camera = new Camera3D();
    this.worldMatrix = Mat44.Identity();
};
SysUnif3D.prototype.apply = function apply (prog) {
    if (prog.hasUniform("u_mWorld")) {
        prog.setUniform("u_mWorld", this.worldMatrix);
    }
    if (prog.hasUniform("u_mTrans")) {
        var m = this.camera.getViewProjection().mulSelf(this.worldMatrix);
        prog.setUniform("u_mTrans", m);
    }
    if (prog.hasUniform("u_eyePos")) {
        prog.setUniform("u_eyePos", this.camera.pos);
    }
};

var GLResourceFlag = function GLResourceFlag() {
    this._bDiscard = false;
    this._bLost = true;
};
// -------------- from Discardable --------------
GLResourceFlag.prototype.discard = function discard () {
    Assert(!this.isDiscarded());
    this._bDiscard = true;
};
GLResourceFlag.prototype.isDiscarded = function isDiscarded () {
    return this._bDiscard;
};
// -------------- from GLContext --------------
GLResourceFlag.prototype.onContextLost = function onContextLost (cb) {
    Assert(!this.isDiscarded());
    if (this._bLost)
        { return; }
    this._bLost = true;
    cb();
};
GLResourceFlag.prototype.onContextRestored = function onContextRestored (cb) {
    Assert(!this.isDiscarded());
    if (!this._bLost)
        { return; }
    this._bLost = false;
    cb();
};
GLResourceFlag.prototype.contextLost = function contextLost () {
    Assert(!this.isDiscarded());
    return this._bLost;
};

var EnumBase;
(function (EnumBase) {
    EnumBase[EnumBase["Num"] = 34359738368] = "Num";
})(EnumBase || (EnumBase = {}));
var Primitive;
(function (Primitive) {
    Primitive[Primitive["Points"] = 34359738368] = "Points";
    Primitive[Primitive["LineStrip"] = 34359738369] = "LineStrip";
    Primitive[Primitive["LineLoop"] = 34359738370] = "LineLoop";
    Primitive[Primitive["Lines"] = 34359738371] = "Lines";
    Primitive[Primitive["TriangleStrip"] = 34359738372] = "TriangleStrip";
    Primitive[Primitive["TriangleFan"] = 34359738373] = "TriangleFan";
    Primitive[Primitive["Triangles"] = 34359738374] = "Triangles";
})(Primitive || (Primitive = {}));
var TextureType;
(function (TextureType) {
    TextureType[TextureType["Texture2D"] = 34359738368] = "Texture2D";
})(TextureType || (TextureType = {}));
var TextureQuery;
(function (TextureQuery) {
    TextureQuery[TextureQuery["Texture2D"] = 34359738368] = "Texture2D";
})(TextureQuery || (TextureQuery = {}));
var BufferType;
(function (BufferType) {
    BufferType[BufferType["Vertex"] = 34359738368] = "Vertex";
    BufferType[BufferType["Index"] = 34359738369] = "Index";
})(BufferType || (BufferType = {}));
var BufferQuery;
(function (BufferQuery) {
    BufferQuery[BufferQuery["Vertex"] = 34359738368] = "Vertex";
    BufferQuery[BufferQuery["Index"] = 34359738369] = "Index";
})(BufferQuery || (BufferQuery = {}));
var ShaderType;
(function (ShaderType) {
    ShaderType[ShaderType["Vertex"] = 34359738368] = "Vertex";
    ShaderType[ShaderType["Fragment"] = 34359738369] = "Fragment";
})(ShaderType || (ShaderType = {}));
var DrawType;
(function (DrawType) {
    DrawType[DrawType["Static"] = 34359738368] = "Static";
    DrawType[DrawType["Stream"] = 34359738369] = "Stream";
    DrawType[DrawType["Dynamic"] = 34359738370] = "Dynamic";
})(DrawType || (DrawType = {}));
var Attachment;
(function (Attachment) {
    Attachment[Attachment["Color0"] = 34359738368] = "Color0";
    Attachment[Attachment["Color1"] = 34359738369] = "Color1";
    Attachment[Attachment["Color2"] = 34359738370] = "Color2";
    Attachment[Attachment["Color3"] = 34359738371] = "Color3";
    Attachment[Attachment["Depth"] = 34359738372] = "Depth";
    Attachment[Attachment["Stencil"] = 34359738373] = "Stencil";
    Attachment[Attachment["DepthStencil"] = 34359738374] = "DepthStencil";
})(Attachment || (Attachment = {}));
var RBFormat;
(function (RBFormat) {
    RBFormat[RBFormat["Depth16"] = 34359738368] = "Depth16";
    RBFormat[RBFormat["Stencil8"] = 34359738369] = "Stencil8";
    RBFormat[RBFormat["RGBA4"] = 34359738370] = "RGBA4";
    RBFormat[RBFormat["RGB5_A1"] = 34359738371] = "RGB5_A1";
    RBFormat[RBFormat["RGB565"] = 34359738372] = "RGB565";
})(RBFormat || (RBFormat = {}));
var InterFormat;
(function (InterFormat) {
    InterFormat[InterFormat["Alpha"] = 34359738368] = "Alpha";
    InterFormat[InterFormat["RGB"] = 34359738369] = "RGB";
    InterFormat[InterFormat["RGBA"] = 34359738370] = "RGBA";
    InterFormat[InterFormat["Luminance"] = 34359738371] = "Luminance";
    InterFormat[InterFormat["LuminanceAlpha"] = 34359738372] = "LuminanceAlpha";
})(InterFormat || (InterFormat = {}));
var TexDataFormat;
(function (TexDataFormat) {
    TexDataFormat[TexDataFormat["UB"] = 34359738368] = "UB";
    TexDataFormat[TexDataFormat["US565"] = 34359738369] = "US565";
    TexDataFormat[TexDataFormat["US4444"] = 34359738370] = "US4444";
    TexDataFormat[TexDataFormat["US5551"] = 34359738371] = "US5551";
})(TexDataFormat || (TexDataFormat = {}));
var GLSLTypeInfoItem = function GLSLTypeInfoItem(id, name, size, uniformF, uniformAF, vertexF) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.uniformF = uniformF;
    this.uniformAF = uniformAF;
    this.vertexF = vertexF;
};
var GLTypeInfoItem = function GLTypeInfoItem(id, bytesize) {
    this.id = id;
    this.bytesize = bytesize;
};
// gl.enable/disable
var BoolSetting;
(function (BoolSetting) {
    BoolSetting[BoolSetting["Blend"] = 34359738368] = "Blend";
    BoolSetting[BoolSetting["Cullface"] = 34359738369] = "Cullface";
    BoolSetting[BoolSetting["Depthtest"] = 34359738370] = "Depthtest";
    BoolSetting[BoolSetting["Dither"] = 34359738371] = "Dither";
    BoolSetting[BoolSetting["Polygonoffsetfill"] = 34359738372] = "Polygonoffsetfill";
    BoolSetting[BoolSetting["Samplealphatocoverage"] = 34359738373] = "Samplealphatocoverage";
    BoolSetting[BoolSetting["Samplecoverage"] = 34359738374] = "Samplecoverage";
    BoolSetting[BoolSetting["Scissortest"] = 34359738375] = "Scissortest";
    BoolSetting[BoolSetting["Stenciltest"] = 34359738376] = "Stenciltest";
})(BoolSetting || (BoolSetting = {}));
var BoolString = [
    "blend",
    "cullface",
    "depthtest",
    "dither",
    "polygonoffsetfill",
    "samplealphatocoverage",
    "samplecoverage",
    "scissortest",
    "stenciltest"
];
var BlendEquation;
(function (BlendEquation) {
    BlendEquation[BlendEquation["Add"] = 34359738368] = "Add";
    BlendEquation[BlendEquation["Sub"] = 34359738369] = "Sub";
    BlendEquation[BlendEquation["Reversesub"] = 34359738370] = "Reversesub";
})(BlendEquation || (BlendEquation = {}));
var BlendFunc;
(function (BlendFunc) {
    BlendFunc[BlendFunc["Zero"] = 34359738368] = "Zero";
    BlendFunc[BlendFunc["One"] = 34359738369] = "One";
    BlendFunc[BlendFunc["SrcColor"] = 34359738370] = "SrcColor";
    BlendFunc[BlendFunc["DstColor"] = 34359738371] = "DstColor";
    BlendFunc[BlendFunc["OneMinusSrcColor"] = 34359738372] = "OneMinusSrcColor";
    BlendFunc[BlendFunc["OneMinusDstColor"] = 34359738373] = "OneMinusDstColor";
    BlendFunc[BlendFunc["SrcAlpha"] = 34359738374] = "SrcAlpha";
    BlendFunc[BlendFunc["DstAlpha"] = 34359738375] = "DstAlpha";
    BlendFunc[BlendFunc["OneMinusSrcAlpha"] = 34359738376] = "OneMinusSrcAlpha";
    BlendFunc[BlendFunc["OneMinusDstAlpha"] = 34359738377] = "OneMinusDstAlpha";
    BlendFunc[BlendFunc["ConstantColor"] = 34359738378] = "ConstantColor";
    BlendFunc[BlendFunc["OneMinusConstantColor"] = 34359738379] = "OneMinusConstantColor";
    BlendFunc[BlendFunc["OneMinusConstantAlpha"] = 34359738380] = "OneMinusConstantAlpha";
    BlendFunc[BlendFunc["SrcAlphaSaturate"] = 34359738381] = "SrcAlphaSaturate";
})(BlendFunc || (BlendFunc = {}));
var DepthStencilFunc;
(function (DepthStencilFunc) {
    DepthStencilFunc[DepthStencilFunc["Never"] = 34359738368] = "Never";
    DepthStencilFunc[DepthStencilFunc["Always"] = 34359738369] = "Always";
    DepthStencilFunc[DepthStencilFunc["Less"] = 34359738370] = "Less";
    DepthStencilFunc[DepthStencilFunc["LessEqual"] = 34359738371] = "LessEqual";
    DepthStencilFunc[DepthStencilFunc["Equal"] = 34359738372] = "Equal";
    DepthStencilFunc[DepthStencilFunc["NotEqual"] = 34359738373] = "NotEqual";
    DepthStencilFunc[DepthStencilFunc["Greater"] = 34359738374] = "Greater";
    DepthStencilFunc[DepthStencilFunc["GreaterEqual"] = 34359738375] = "GreaterEqual";
})(DepthStencilFunc || (DepthStencilFunc = {}));
var StencilOp;
(function (StencilOp) {
    StencilOp[StencilOp["Keep"] = 34359738368] = "Keep";
    StencilOp[StencilOp["Zero"] = 34359738369] = "Zero";
    StencilOp[StencilOp["Replace"] = 34359738370] = "Replace";
    StencilOp[StencilOp["Increment"] = 34359738371] = "Increment";
    StencilOp[StencilOp["Decrement"] = 34359738372] = "Decrement";
    StencilOp[StencilOp["Invert"] = 34359738373] = "Invert";
    StencilOp[StencilOp["IncrementWrap"] = 34359738374] = "IncrementWrap";
    StencilOp[StencilOp["DecrementWrap"] = 34359738375] = "DecrementWrap";
})(StencilOp || (StencilOp = {}));
var Face;
(function (Face) {
    Face[Face["Front"] = 34359738368] = "Front";
    Face[Face["Back"] = 34359738369] = "Back";
    Face[Face["FrontAndBack"] = 34359738370] = "FrontAndBack";
})(Face || (Face = {}));
var CW;
(function (CW) {
    CW[CW["Cw"] = 34359738368] = "Cw";
    CW[CW["Ccw"] = 34359738369] = "Ccw";
})(CW || (CW = {}));
var DataFormat;
(function (DataFormat) {
    DataFormat[DataFormat["Byte"] = 34359738368] = "Byte";
    DataFormat[DataFormat["UByte"] = 34359738369] = "UByte";
    DataFormat[DataFormat["Short"] = 34359738370] = "Short";
    DataFormat[DataFormat["UShort"] = 34359738371] = "UShort";
    DataFormat[DataFormat["Int"] = 34359738372] = "Int";
    DataFormat[DataFormat["UInt"] = 34359738373] = "UInt";
    DataFormat[DataFormat["Float"] = 34359738374] = "Float";
})(DataFormat || (DataFormat = {}));
var UVWrap;
(function (UVWrap) {
    UVWrap[UVWrap["Repeat"] = 34359738368] = "Repeat";
    UVWrap[UVWrap["Mirror"] = 34359738369] = "Mirror";
    UVWrap[UVWrap["Clamp"] = 34359738370] = "Clamp";
})(UVWrap || (UVWrap = {}));
var Conv = function Conv() {
    var this$1 = this;
    var arg = [], len = arguments.length;
    while ( len-- ) arg[ len ] = arguments[ len ];

    this._i2gl = [];
    this._gl2i = {};
    this._str2i = {};
    for (var i = 0; i < arg.length; i++) {
        var ref = [arg[i][0], arg[i][1]];
        var name = ref[0];
        var num = ref[1];
        var id = 34359738368 /* Num */ + i;
        this$1._i2gl[id] = num;
        this$1._gl2i[num] = id;
        this$1._str2i[name] = id;
        this$1._str2i[name.toLowerCase()] = id;
    }
    this._length = arg.length;
};
Conv.prototype.convert = function convert (id) {
    if (id < 34359738368 /* Num */)
        { return this._gl2i[id]; }
    return this._i2gl[id];
};
Conv.prototype.toString = function toString (id) {
    if (id < 34359738368 /* Num */)
        { return this._gl2i[id].toString(); }
    return id.toString();
};
Conv.prototype.fromString = function fromString (name) {
    return this._str2i[name];
};
Conv.prototype.fromStringToGL = function fromStringToGL (name) {
    return this.convert(this.fromString(name));
};
Conv.prototype.length = function length () {
    return this._length;
};
Conv.prototype.indexToEnum = function indexToEnum (idx) {
    return (idx + 34359738368 /* Num */);
};
var GLConst = function GLConst(gl) {
    var ItrBegin = 34359738368;
    {
        var i = ItrBegin;
        GLConst.TextureC = new Conv([TextureType[i++], gl.TEXTURE_2D]);
    }
    {
        var i$1 = ItrBegin;
        GLConst.TextureQueryC = new Conv([TextureQuery[i$1++], gl.TEXTURE_BINDING_2D]);
    }
    {
        var i$2 = ItrBegin;
        GLConst.ShaderTypeC = new Conv([ShaderType[i$2++], gl.VERTEX_SHADER], [ShaderType[i$2++], gl.FRAGMENT_SHADER]);
    }
    {
        var i$3 = ItrBegin;
        GLConst.BufferTypeC = new Conv([BufferType[i$3++], gl.ARRAY_BUFFER], [BufferType[i$3++], gl.ELEMENT_ARRAY_BUFFER]);
    }
    {
        var i$4 = ItrBegin;
        GLConst.BufferQueryC = new Conv([BufferQuery[i$4++], gl.ARRAY_BUFFER_BINDING], [BufferQuery[i$4++], gl.ELEMENT_ARRAY_BUFFER_BINDING]);
    }
    {
        var i$5 = ItrBegin;
        GLConst.DrawTypeC = new Conv([DrawType[i$5++], gl.STATIC_DRAW], [DrawType[i$5++], gl.STREAM_DRAW], [DrawType[i$5++], gl.DYNAMIC_DRAW]);
    }
    {
        var i$6 = ItrBegin;
        GLConst.AttachmentC = new Conv([Attachment[i$6++], gl.COLOR_ATTACHMENT0], [Attachment[i$6++], gl.COLOR_ATTACHMENT0 + 1], [Attachment[i$6++], gl.COLOR_ATTACHMENT0 + 2], [Attachment[i$6++], gl.COLOR_ATTACHMENT0 + 3], [Attachment[i$6++], gl.DEPTH_ATTACHMENT], [Attachment[i$6++], gl.STENCIL_ATTACHMENT], [Attachment[i$6++], gl.DEPTH_STENCIL_ATTACHMENT]);
    }
    {
        var i$7 = ItrBegin;
        GLConst.RBFormatC = new Conv([RBFormat[i$7++], gl.DEPTH_COMPONENT16], [RBFormat[i$7++], gl.STENCIL_INDEX8], [RBFormat[i$7++], gl.RGBA4], [RBFormat[i$7++], gl.RGB5_A1], [RBFormat[i$7++], gl.RGB565]);
    }
    {
        var i$8 = ItrBegin;
        GLConst.InterFormatC = new Conv([InterFormat[i$8++], gl.ALPHA], [InterFormat[i$8++], gl.RGB], [InterFormat[i$8++], gl.RGBA], [InterFormat[i$8++], gl.LUMINANCE], [InterFormat[i$8++], gl.LUMINANCE_ALPHA]);
    }
    {
        var i$9 = ItrBegin;
        GLConst.TexDataFormatC = new Conv([TexDataFormat[i$9++], gl.UNSIGNED_BYTE], [TexDataFormat[i$9++], gl.UNSIGNED_SHORT_5_6_5], [TexDataFormat[i$9++], gl.UNSIGNED_SHORT_4_4_4_4], [TexDataFormat[i$9++], gl.UNSIGNED_SHORT_5_5_5_1]);
    }
    {
        var i$10 = ItrBegin;
        // gl.enable/disable
        GLConst.BoolSettingC = new Conv([BoolSetting[i$10++], gl.BLEND], [BoolSetting[i$10++], gl.CULL_FACE], [BoolSetting[i$10++], gl.DEPTH_TEST], [BoolSetting[i$10++], gl.DITHER], [BoolSetting[i$10++], gl.POLYGON_OFFSET_FILL], [BoolSetting[i$10++], gl.SAMPLE_ALPHA_TO_COVERAGE], [BoolSetting[i$10++], gl.SAMPLE_COVERAGE], [BoolSetting[i$10++], gl.SCISSOR_TEST], [BoolSetting[i$10++], gl.STENCIL_TEST]);
    }
    {
        var i$11 = ItrBegin;
        GLConst.BlendEquationC = new Conv([BlendEquation[i$11++], gl.FUNC_ADD], [BlendEquation[i$11++], gl.FUNC_SUBTRACT], [BlendEquation[i$11++], gl.FUNC_REVERSE_SUBTRACT]);
    }
    {
        var i$12 = ItrBegin;
        GLConst.BlendFuncC = new Conv([BlendFunc[i$12++], gl.ZERO], [BlendFunc[i$12++], gl.ONE], [BlendFunc[i$12++], gl.SRC_COLOR], [BlendFunc[i$12++], gl.DST_COLOR], [BlendFunc[i$12++], gl.ONE_MINUS_SRC_COLOR], [BlendFunc[i$12++], gl.ONE_MINUS_DST_COLOR], [BlendFunc[i$12++], gl.SRC_ALPHA], [BlendFunc[i$12++], gl.DST_ALPHA], [BlendFunc[i$12++], gl.ONE_MINUS_SRC_ALPHA], [BlendFunc[i$12++], gl.ONE_MINUS_DST_ALPHA], [BlendFunc[i$12++], gl.CONSTANT_COLOR], [BlendFunc[i$12++], gl.ONE_MINUS_CONSTANT_COLOR], [BlendFunc[i$12++], gl.ONE_MINUS_CONSTANT_ALPHA], [BlendFunc[i$12++], gl.SRC_ALPHA_SATURATE]);
    }
    {
        var i$13 = ItrBegin;
        GLConst.DataFormatC = new Conv([DataFormat[i$13++], gl.BYTE], [DataFormat[i$13++], gl.UNSIGNED_BYTE], [DataFormat[i$13++], gl.SHORT], [DataFormat[i$13++], gl.UNSIGNED_SHORT], [DataFormat[i$13++], gl.INT], [DataFormat[i$13++], gl.UNSIGNED_INT], [DataFormat[i$13++], gl.FLOAT]);
    }
    {
        var i$14 = ItrBegin;
        GLConst.DepthStencilFuncC = new Conv([DepthStencilFunc[i$14++], gl.NEVER], [DepthStencilFunc[i$14++], gl.ALWAYS], [DepthStencilFunc[i$14++], gl.LESS], [DepthStencilFunc[i$14++], gl.LEQUAL], [DepthStencilFunc[i$14++], gl.EQUAL], [DepthStencilFunc[i$14++], gl.NOTEQUAL], [DepthStencilFunc[i$14++], gl.GREATER], [DepthStencilFunc[i$14++], gl.GEQUAL]);
    }
    {
        var i$15 = ItrBegin;
        GLConst.StencilOpC = new Conv([StencilOp[i$15++], gl.KEEP], [StencilOp[i$15++], gl.ZERO], [StencilOp[i$15++], gl.REPLACE], [StencilOp[i$15++], gl.INCR], [StencilOp[i$15++], gl.DECR], [StencilOp[i$15++], gl.INVERT], [StencilOp[i$15++], gl.INCR_WRAP], [StencilOp[i$15++], gl.DECR_WRAP]);
    }
    {
        var i$16 = ItrBegin;
        GLConst.FaceC = new Conv([Face[i$16++], gl.FRONT], [Face[i$16++], gl.BACK], [Face[i$16++], gl.FRONT_AND_BACK]);
    }
    {
        var i$17 = ItrBegin;
        GLConst.CWC = new Conv([CW[i$17++], gl.CW], [CW[i$17++], gl.CCW]);
    }
    {
        var i$18 = ItrBegin;
        GLConst.UVWrapC = new Conv([UVWrap[i$18++], gl.REPEAT], [UVWrap[i$18++], gl.MIRRORED_REPEAT], [UVWrap[i$18++], gl.CLAMP_TO_EDGE]);
    }
    {
        var i$19 = ItrBegin;
        GLConst.PrimitiveC = new Conv([Primitive[i$19++], gl.POINTS], [Primitive[i$19++], gl.LINE_STRIP], [Primitive[i$19++], gl.LINE_LOOP], [Primitive[i$19++], gl.LINES], [Primitive[i$19++], gl.TRIANGLE_STRIP], [Primitive[i$19++], gl.TRIANGLE_FAN], [Primitive[i$19++], gl.TRIANGLES]);
    }
    {
        var t = GLConst.GLSLTypeInfo;
        t[gl.INT] = new GLSLTypeInfoItem(gl.INT, "Int", 1, gl.uniform1i, gl.uniform1iv);
        t[gl.INT_VEC2] = new GLSLTypeInfoItem(gl.INT_VEC2, "IntVec2", 2, gl.uniform2i, gl.uniform2iv);
        t[gl.INT_VEC3] = new GLSLTypeInfoItem(gl.INT_VEC3, "IntVec3", 3, gl.uniform3i, gl.uniform3iv);
        t[gl.INT_VEC4] = new GLSLTypeInfoItem(gl.INT_VEC4, "IntVec4", 4, gl.uniform4i, gl.uniform4iv);
        t[gl.FLOAT] = new GLSLTypeInfoItem(gl.FLOAT, "Float", 1, gl.uniform1f, gl.uniform1fv, gl.vertexAttrib1f);
        t[gl.FLOAT_VEC2] = new GLSLTypeInfoItem(gl.FLOAT_VEC2, "FloatVec2", 2, gl.uniform2f, gl.uniform2fv, gl.vertexAttrib2fv);
        t[gl.FLOAT_VEC3] = new GLSLTypeInfoItem(gl.FLOAT_VEC3, "FloatVec3", 3, gl.uniform3f, gl.uniform3fv, gl.vertexAttrib3fv);
        t[gl.FLOAT_VEC4] = new GLSLTypeInfoItem(gl.FLOAT_VEC4, "FloatVec4", 4, gl.uniform4f, gl.uniform4fv, gl.vertexAttrib4fv);
        t[gl.FLOAT_MAT2] = new GLSLTypeInfoItem(gl.FLOAT_MAT2, "FloatMat2", 2, undefined, gl.uniformMatrix2fv, undefined);
        t[gl.FLOAT_MAT3] = new GLSLTypeInfoItem(gl.FLOAT_MAT3, "FloatMat3", 3, undefined, gl.uniformMatrix3fv);
        t[gl.FLOAT_MAT4] = new GLSLTypeInfoItem(gl.FLOAT_MAT4, "FloatMat4", 4, undefined, gl.uniformMatrix4fv);
        t[gl.SAMPLER_2D] = new GLSLTypeInfoItem(gl.SAMPLER_2D, "Sampler2D", 1, gl.uniform1i, undefined);
    }
    {
        var t$1 = GLConst.GLTypeInfo;
        t$1[gl.BYTE] = new GLTypeInfoItem(gl.BYTE, 1);
        t$1[gl.UNSIGNED_BYTE] = new GLTypeInfoItem(gl.UNSIGNED_BYTE, 1);
        t$1[gl.SHORT] = new GLTypeInfoItem(gl.SHORT, 2);
        t$1[gl.UNSIGNED_SHORT] = new GLTypeInfoItem(gl.UNSIGNED_SHORT, 2);
        t$1[gl.INT] = new GLTypeInfoItem(gl.INT, 4);
        t$1[gl.UNSIGNED_INT] = new GLTypeInfoItem(gl.UNSIGNED_INT, 4);
        t$1[gl.FLOAT] = new GLTypeInfoItem(gl.FLOAT, 4);
    }
    {
        var cnv = GLConst.DataFormatC;
        var s = GLConst.GLTypeInfo;
        var t$2 = GLConst.Type2GLType;
        t$2.Int8Array = s[cnv.convert(DataFormat.Byte)];
        t$2.Uint8Array = s[cnv.convert(DataFormat.UByte)];
        t$2.Uint8ClampedArray = s[cnv.convert(DataFormat.UByte)];
        t$2.Int16Array = s[cnv.convert(DataFormat.Short)];
        t$2.Uint16Array = s[cnv.convert(DataFormat.UShort)];
        t$2.Int32Array = s[cnv.convert(DataFormat.Int)];
        t$2.Uint32Array = s[cnv.convert(DataFormat.UInt)];
        t$2.Float32Array = s[cnv.convert(DataFormat.Float)];
    }
    {
        var t$3 = GLConst.ValueSetting;
        t$3.blendcolor = gl.blendColor;
        var beq = GLConst.BlendEquationC;
        t$3.blendequation = function (mode0, mode1) {
            if ( mode1 === void 0 ) mode1 = mode0;

            gl.blendEquationSeparate(beq.fromStringToGL(mode0), beq.fromStringToGL(mode1));
        };
        var bfc = GLConst.BlendFuncC;
        t$3.blendfunc = function (sf0, df0, sf1, df1) {
            if ( sf1 === void 0 ) sf1 = sf0;
            if ( df1 === void 0 ) df1 = df0;

            gl.blendFuncSeparate(bfc.fromStringToGL(sf0), bfc.fromStringToGL(df0), bfc.fromStringToGL(sf1), bfc.fromStringToGL(df1));
        };
        var dsfunc = GLConst.DepthStencilFuncC;
        t$3.depthfunc = function (func) {
            gl.depthFunc(dsfunc.fromStringToGL(func));
        };
        t$3.samplecoverage = gl.sampleCoverage;
        t$3._stencilfunc = function (dir, func, ref, mask) {
            gl.stencilFuncSeparate(dir, dsfunc.fromStringToGL(func), ref, mask);
        };
        t$3.stencilfuncfront = function (func, ref, mask) {
            t$3._stencilfunc(gl.FRONT, func, ref, mask);
        };
        t$3.stencilfuncback = function (func, ref, mask) {
            t$3._stencilfunc(gl.BACK, func, ref, mask);
        };
        t$3.stencilfunc = function (func, ref, mask) {
            t$3._stencilfunc(gl.FRONT_AND_BACK, func, ref, mask);
        };
        var sop = GLConst.StencilOpC;
        t$3._stencilop = function (dir, func, ref, mask) {
            gl.stencilOpSeparate(dir, sop.fromStringToGL(func), ref, mask);
        };
        t$3.stencilop = function (func, ref, mask) {
            t$3._stencilop(gl.FRONT_AND_BACK, func, ref, mask);
        };
        t$3.stencilopfront = function (func, ref, mask) {
            t$3._stencilop(gl.FRONT, func, ref, mask);
        };
        t$3.stencilopback = function (func, ref, mask) {
            t$3._stencilop(gl.BACK, func, ref, mask);
        };
        t$3.colormask = gl.colorMask;
        t$3.depthmask = gl.depthMask;
        t$3.stencilmask = gl.stencilMask;
        t$3.stencilmaskfront = function (mask) {
            gl.stencilMaskSeparate(gl.FRONT, mask);
        };
        t$3.stencilmaskback = function (mask) {
            gl.stencilMaskSeparate(gl.BACK, mask);
        };
        var facec = GLConst.FaceC;
        t$3.cullface = function (dir) {
            gl.cullFace(facec.fromStringToGL(dir));
        };
        var cwc = GLConst.CWC;
        t$3.frontface = function (cw) {
            gl.frontFace(cwc.fromStringToGL(cw));
        };
        t$3.linewidth = gl.lineWidth;
        t$3.polygonoffset = gl.polygonOffset;
    }
};

GLConst.GLSLTypeInfo = {};
GLConst.GLTypeInfo = {};
GLConst.Type2GLType = {};
GLConst.ValueSetting = {};

var Size = function Size(width, height) {
    this.width = width;
    this.height = height;
};
Size.prototype._calc = function _calc (proc, s) {
    if (s instanceof Size) {
        return new Size(proc(this.width, s.width), proc(this.height, s.height));
    }
    return new Size(proc(this.width, s), proc(this.height, s));
};
Size.prototype.set = function set (s) {
    this.width = s.width;
    this.height = s.height;
    return this;
};
Size.prototype.equal = function equal (s) {
    return this.width === s.width &&
        this.height === s.height;
};
Size.prototype.toVec2 = function toVec2 () {
    return new Vec2(this.width, this.height);
};
Size.prototype.toVec4 = function toVec4 () {
    return new Vec4(this.width, this.height, 1 / this.width, 1 / this.height);
};
Size.prototype.add = function add (s) {
    return this._calc(function (a, b) { return a + b; }, s);
};
Size.prototype.addSelf = function addSelf (s) {
    return this.set(this.add(s));
};
Size.prototype.sub = function sub (s) {
    return this._calc(function (a, b) { return a - b; }, s);
};
Size.prototype.subSelf = function subSelf (s) {
    return this.set(this.sub(s));
};
Size.prototype.mul = function mul (s) {
    return this._calc(function (a, b) { return a * b; }, s);
};
Size.prototype.mulSelf = function mulSelf (s) {
    return this.set(this.mul(s));
};
Size.prototype.div = function div (s) {
    return this._calc(function (a, b) { return a / b; }, s);
};
Size.prototype.divSelf = function divSelf (s) {
    return this.set(this.div(s));
};
Size.prototype.clone = function clone () {
    return new Size(this.width, this.height);
};

var Rect = function Rect(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
};
// 左下とサイズを指定して矩形を生成
Rect.FromPointSize = function FromPointSize (lb, s) {
    return Rect.FromPoints(lb, lb.add(s.toVec2()));
};
// 左下と右上の座標から矩形を生成
Rect.FromPoints = function FromPoints (lb, rt) {
    return new Rect(lb.x, rt.y, rt.x, lb.y);
};
Rect.prototype.shrinkAt = function shrinkAt (s, pos) {
    return new Rect((this.left - pos.x) * s + pos.x, (this.top - pos.y) * s + pos.y, (this.right - pos.x) * s + pos.x, (this.bottom - pos.y) * s + pos.y);
};
// 指定の倍率で拡縮
Rect.prototype.shrink = function shrink (s) {
    return this.shrinkAt(s, this.center());
};
// 左下の座標
Rect.prototype.lb = function lb () {
    return new Vec2(this.left, this.bottom);
};
// 右上の座標
Rect.prototype.rt = function rt () {
    return new Vec2(this.right, this.top);
};
Rect.prototype.width = function width () {
    return this.right - this.left;
};
Rect.prototype.height = function height () {
    return this.top - this.bottom;
};
Rect.prototype.add = function add (ofs) {
    return new Rect(this.left + ofs.x, this.top + ofs.y, this.right + ofs.x, this.bottom + ofs.y);
};
Rect.prototype.mul = function mul (sc) {
    return new Rect(this.left * sc.x, this.top * sc.y, this.right * sc.x, this.bottom * sc.y);
};
Rect.prototype.toSize = function toSize () {
    return new Size(this.width(), this.height());
};
Rect.prototype.toVec4 = function toVec4 () {
    return new Vec4(this.left, this.top, this.right, this.bottom);
};
// 中心座標をベクトルで取得
Rect.prototype.center = function center () {
    return new Vec2((this.left + this.right) / 2, (this.top + this.bottom) / 2);
};
Rect.prototype.clone = function clone () {
    return new Rect(this.left, this.top, this.right, this.bottom);
};

var Backup;
(function (Backup) {
    var Wrap = function Wrap(s, t) {
        this.s = s;
        this.t = t;
    };
    Wrap.prototype.apply = function apply (tex) {
        gl.texParameteri(tex._typeId(), gl.TEXTURE_WRAP_S, GLConst.UVWrapC.convert(this.s));
        gl.texParameteri(tex._typeId(), gl.TEXTURE_WRAP_T, GLConst.UVWrapC.convert(this.t));
        return true;
    };
    Backup.Wrap = Wrap;
    var Filter = function Filter(minLinear, magLinear, iMip) {
        this.minLinear = minLinear;
        this.magLinear = magLinear;
        this.iMip = iMip;
    };
    Filter.prototype.apply = function apply (tex) {
        // [iMip][bL]
        var flags = [
            gl.NEAREST,
            gl.LINEAR,
            gl.NEAREST_MIPMAP_NEAREST,
            gl.NEAREST_MIPMAP_LINEAR,
            gl.LINEAR_MIPMAP_NEAREST,
            gl.LINEAR_MIPMAP_LINEAR
        ];
        gl.texParameteri(tex._typeId(), gl.TEXTURE_MIN_FILTER, flags[(this.iMip << 1) | Number(this.minLinear)]);
        gl.texParameteri(tex._typeId(), gl.TEXTURE_MAG_FILTER, flags[Number(this.magLinear)]);
    };
    Backup.Filter = Filter;
    var ImageData = function ImageData(fmt, srcFmt, srcFmtType, obj) {
        this.fmt = fmt;
        this.srcFmt = srcFmt;
        this.srcFmtType = srcFmtType;
        this.obj = obj;
    };
    ImageData.prototype.apply = function apply (tex) {
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(tex._typeId(), 0, GLConst.InterFormatC.convert(this.fmt), GLConst.InterFormatC.convert(this.srcFmt), GLConst.TexDataFormatC.convert(this.srcFmtType), this.obj);
    };
    Backup.ImageData = ImageData;
    var PixelData = function PixelData(size, fmt, align, flip, pixels) {
        this._dstFmt = fmt;
        if (fmt === InterFormat.RGBA) {
            this._dim = 4;
        }
        else {
            this._dim = 1;
        }
        if (pixels)
            { this._pixels = pixels; }
        else
            { this._pixels = new Uint8Array(size.width * size.height * this._dim); }
        this._alignment = align;
        this._flip = flip;
    };
    PixelData.prototype.apply = function apply (tex) {
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, this._alignment);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this._flip);
        gl.texImage2D(tex._typeId(), 0, GLConst.InterFormatC.convert(this._dstFmt), tex.truesize().width, tex.truesize().height, 0, GLConst.InterFormatC.convert(this._dstFmt), GLConst.TexDataFormatC.convert(TexDataFormat.UB), this._pixels);
    };
    PixelData.prototype.writeSubData = function writeSubData (dstWidth, px, py, srcWidth, pixels) {
        BlockPlace(this._pixels, dstWidth, this._dim, px, py, pixels, srcWidth);
    };
    Backup.PixelData = PixelData;
    var Index;
    (function (Index) {
        Index[Index["Base"] = 0] = "Base";
        Index[Index["Filter"] = 1] = "Filter";
        Index[Index["Wrap"] = 2] = "Wrap";
    })(Index = Backup.Index || (Backup.Index = {}));
    var Flag;
    (function (Flag) {
        Flag[Flag["Base"] = 1] = "Base";
        Flag[Flag["Filter"] = 2] = "Filter";
        Flag[Flag["Wrap"] = 4] = "Wrap";
        Flag[Flag["_Num"] = 3] = "_Num";
        Flag[Flag["All"] = 255] = "All";
    })(Flag = Backup.Flag || (Backup.Flag = {}));
})(Backup || (Backup = {}));
var GLTexture = function GLTexture() {
    this._rf = new GLResourceFlag();
    this._id = null;
    this._bind = 0;
    this._size = new Size(0, 0);
    this._param = [
        null,
        new Backup.Filter(false, false, 0),
        new Backup.Wrap(UVWrap.Clamp, UVWrap.Clamp) ];
    glres.add(this);
};
GLTexture.prototype._typeId = function _typeId () {
    return GLConst.TextureC.convert(this.typeId());
};
GLTexture.prototype._typeQueryId = function _typeQueryId () {
    return GLConst.TextureQueryC.convert(this.typeQueryId());
};
GLTexture.prototype._applyParams = function _applyParams (flag) {
        var this$1 = this;

    var at = 0x01;
    for (var i = 0; i < Backup.Flag._Num; i++) {
        if (flag & at) {
            var p = this$1._param[i];
            if (p)
                { p.apply(this$1); }
        }
        at <<= 1;
    }
};
GLTexture.prototype.uvrect = function uvrect () {
    return GLTexture.UVRect01;
};
GLTexture.prototype.id = function id () {
    return this._id;
};
GLTexture.prototype.size = function size () {
    return this._size;
};
GLTexture.prototype.truesize = function truesize () {
    return this._size;
};
GLTexture.prototype.setLinear = function setLinear (bLMin, bLMag, iMip) {
        var this$1 = this;

    this._param[Backup.Index.Filter] = new Backup.Filter(bLMin, bLMag, iMip);
    this.proc(function () {
        this$1._applyParams(Backup.Flag.Filter);
    });
};
GLTexture.prototype.setWrap = function setWrap (s, t) {
        var this$1 = this;
        if ( t === void 0 ) t = s;

    this._param[Backup.Index.Wrap] = new Backup.Wrap(s, t);
    this.proc(function () {
        this$1._applyParams(Backup.Flag.Wrap);
    });
};
GLTexture.prototype.setData = function setData (fmt, width, height, srcFmt, srcFmtType, pixels) {
        var this$1 = this;

    Assert(srcFmtType === TexDataFormat.UB);
    var assign;
        (assign = [width, height], this._size.width = assign[0], this._size.height = assign[1]);
    if (typeof pixels !== "undefined")
        { pixels = pixels.slice(0); }
    this._param[Backup.Index.Base] = new Backup.PixelData(this.truesize(), fmt, 1, false, pixels);
    this.proc(function () {
        this$1._applyParams(Backup.Flag.All);
    });
};
GLTexture.prototype.setSubData = function setSubData (rect, srcFmt, srcFmtType, pixels) {
        var this$1 = this;

    Assert(srcFmtType === TexDataFormat.UB);
    var base = this._param[Backup.Index.Base];
    base.writeSubData(this.truesize().width, rect.left, rect.bottom, rect.width(), pixels);
    this.proc(function () {
        gl.texSubImage2D(this$1._typeId(), 0, rect.left, rect.bottom, rect.width(), rect.height(), GLConst.InterFormatC.convert(srcFmt), GLConst.TexDataFormatC.convert(srcFmtType), pixels);
    });
};
GLTexture.prototype.setImage = function setImage (fmt, srcFmt, srcFmtType, obj) {
        var this$1 = this;

    Assert(srcFmtType === TexDataFormat.UB);
    obj = obj.cloneNode(true);
    var assign;
        (assign = [obj.width, obj.height], this._size.width = assign[0], this._size.height = assign[1]);
    this._param[Backup.Index.Base] = new Backup.ImageData(fmt, srcFmt, srcFmtType, obj);
    this.proc(function () {
        this$1._applyParams(Backup.Flag.All);
    });
};
GLTexture.prototype.setSubImage = function setSubImage (x, y, srcFmt, srcFmtType, obj) {
        var this$1 = this;

    Assert(srcFmtType === TexDataFormat.UB);
    this.proc(function () {
        gl.texSubImage2D(this$1._typeId(), 0, x, y, GLConst.InterFormatC.convert(srcFmt), GLConst.TexDataFormatC.convert(srcFmtType), obj);
    });
};
GLTexture.prototype.genMipmap = function genMipmap () {
        var this$1 = this;

    this.proc(function () {
        gl.generateMipmap(this$1._typeId());
    });
};
GLTexture.prototype.bind_loose = function bind_loose () {
    Assert(!this.isDiscarded(), "already discarded");
    gl.bindTexture(this._typeId(), this.id());
    ++this._bind;
};
// ----------------- from GLContext -----------------
GLTexture.prototype.onContextLost = function onContextLost () {
        var this$1 = this;

    this._rf.onContextLost(function () {
        gl.deleteTexture(this$1._id);
        this$1._id = null;
    });
};
GLTexture.prototype.onContextRestored = function onContextRestored () {
        var this$1 = this;

    this._rf.onContextRestored(function () {
        this$1._id = gl.createTexture();
        this$1.proc(function () {
            this$1._applyParams(Backup.Flag.All);
        });
    });
};
GLTexture.prototype.contextLost = function contextLost () {
    return this._rf.contextLost();
};
// ----------------- from Bindable -----------------
GLTexture.prototype.bind = function bind () {
    Assert(!this.isDiscarded(), "already discarded");
    Assert(this._bind === 0, "already binded");
    gl.bindTexture(this._typeId(), this.id());
    ++this._bind;
};
GLTexture.prototype.unbind = function unbind (id) {
        if ( id === void 0 ) id = null;

    Assert(this._bind > 0, "not binded yet");
    gl.bindTexture(this._typeId(), id);
    --this._bind;
};
GLTexture.prototype.proc = function proc (cb) {
    if (this.contextLost())
        { return; }
    var prev = gl.getParameter(this._typeQueryId());
    this.bind();
    cb();
    this.unbind(prev);
};
// ----------------- from Discardable -----------------
GLTexture.prototype.discard = function discard () {
    Assert(!this._bind, "still binding somewhere");
    this.onContextLost();
    this._rf.discard();
};
GLTexture.prototype.isDiscarded = function isDiscarded () {
    return this._rf.isDiscarded();
};
GLTexture.UVRect01 = new Rect(0, 1, 1, 0);

/// <reference path="arrayfunc.ts" />
var ResourceExtToType = {};
var ResourceInfo = {};
function GetResourceInfo(fpath) {
    // 拡張子でリソースタイプを判断
    var ext = ExtractExtension(fpath);
    if (!ext)
        { throw new Error("no extension found"); }
    var rtype = ResourceExtToType[ext];
    if (typeof rtype === "undefined")
        { throw new Error("unknown extension"); }
    var info = ResourceInfo[rtype];
    if (!info)
        { throw new Error("loader not found"); }
    return info;
}
var MoreResource = function MoreResource() {
    var arg = [], len = arguments.length;
    while ( len-- ) arg[ len ] = arguments[ len ];

    this.depend = arg;
};
function ASyncGet(loaders, maxConnection, callback) {
    // ロードするリソースが空だった場合は直後にすぐonCompleteを呼ぶよう調整
    if (loaders.empty()) {
        setTimeout(function () {
            callback.progress(loaders.length, loaders.length);
            callback.completed();
        }, 0);
        return;
    }
    var lastCur = 0;
    var nComp = 0;
    var task = [];
    function Request(taskIndex) {
        var cur = lastCur++;
        Assert(cur < loaders.length);
        Assert(task[taskIndex] === null);
        task[taskIndex] = cur;
        loaders[cur].begin({
            completed: function () {
                OnComplete(taskIndex);
            },
            progress: function (loaded, total) {
                callback.taskprogress(taskIndex, loaded, total);
            },
            error: function () {
                OnError(taskIndex);
            }
        }, -1);
    }
    function OnError(taskIndex) {
        // 他のタスクを全て中断
        for (var i = 0; i < task.length; i++) {
            var li = task[i];
            if (li !== null && li !== taskIndex) {
                loaders[li].abort();
            }
        }
        callback.error(loaders[taskIndex].errormsg());
    }
    function OnComplete(taskIndex) {
        Assert(typeof task[taskIndex] === "number");
        task[taskIndex] = null;
        ++nComp;
        callback.progress(nComp, loaders.length);
        if (lastCur < loaders.length) {
            // 残りのタスクを開始
            Request(taskIndex);
        }
        else {
            if (nComp === loaders.length)
                { callback.completed(); }
        }
    }
    for (var i = 0; i < Math.min(loaders.length, maxConnection); i++) {
        task[i] = null;
        // 最初のタスクを開始
        Request(i);
    }
}

var ResourceWrap = function ResourceWrap(data) {
    this.data = data;
    this._bDiscard = false;
};
// ------------ from Discardable ------------
ResourceWrap.prototype.isDiscarded = function isDiscarded () {
    return this._bDiscard;
};
ResourceWrap.prototype.discard = function discard () {
    Assert(!this._bDiscard, "already discarded");
    this._bDiscard = true;
};

/// <reference path="arrayfunc.ts" />
var ResLayer = function ResLayer() {
    this.resource = {};
};
var NoSuchResource = (function (Error) {
    function NoSuchResource(name) {
        Error.call(this, ("no such resource \"" + name + "\""));
        this.name = name;
    }

    if ( Error ) NoSuchResource.__proto__ = Error;
    NoSuchResource.prototype = Object.create( Error && Error.prototype );
    NoSuchResource.prototype.constructor = NoSuchResource;

    return NoSuchResource;
}(Error));
var ResState;
(function (ResState) {
    ResState[ResState["Idle"] = 0] = "Idle";
    ResState[ResState["Loading"] = 1] = "Loading";
    ResState[ResState["Restoreing"] = 2] = "Restoreing";
})(ResState || (ResState = {}));
var RState;
(function (RState) {
    var State = function State () {};

    State.prototype.addAlias = function addAlias (self, alias) {
        AssertF("invalid function call");
    };
    State.prototype.loadFrame = function loadFrame (self, res, callback, bSame) {
        AssertF("invalid function call");
    };
    State.prototype.popFrame = function popFrame (self, n) {
        AssertF("invalid function call");
    };
    State.prototype.discard = function discard (self) {
        AssertF("invalid function call");
    };
    RState.State = State;
    var IdleState = (function (State) {
        function IdleState () {
            State.apply(this, arguments);
        }

        if ( State ) IdleState.__proto__ = State;
        IdleState.prototype = Object.create( State && State.prototype );
        IdleState.prototype.constructor = IdleState;

        IdleState.prototype.addAlias = function addAlias (self, alias) {
            var a = self._alias;
            Object.keys(alias).forEach(function (k) {
                a[k] = alias[k];
            });
        };
        IdleState.prototype.state = function state () {
            return ResState.Idle;
        };
        IdleState.prototype.loadFrame = function loadFrame (self, res, callback, bSame) {
            Assert(res instanceof Array);
            self._state = new RState.LoadingState();
            // 重複してるリソースはロード対象に入れない
            {
                var res2 = [];
                for (var i = 0; i < res.length; i++) {
                    if (!self.checkResource(res[i])) {
                        res2.push(res[i]);
                    }
                }
                res = res2;
            }
            var dst;
            if (bSame) {
                dst = self._resource.back();
            }
            else {
                dst = self._pushFrame();
            }
            // リソースに応じたローダーを作成
            var loaderL = [];
            var infoL = [];
            for (var i$1 = 0; i$1 < res.length; i$1++) {
                var url = self._makeFPath(res[i$1]);
                if (!url)
                    { throw new Error(("unknown resource name \"" + (res[i$1]) + "\"")); }
                var info = GetResourceInfo(url);
                loaderL.push(info.makeLoader(url));
                infoL.push(info);
            }
            ASyncGet(loaderL, 2, {
                completed: function () {
                    Assert(self.state() === ResState.Loading);
                    self._state = new RState.IdleState();
                    // 必要なリソースが足りなくて途中で終わってしまった物を再抽出して読み込み
                    var later = [];
                    var laterId = [];
                    for (var i = 0; i < infoL.length; i++) {
                        try {
                            var r = infoL[i].makeResource(loaderL[i].result());
                            dst.resource[res[i]] = r;
                        }
                        catch (e) {
                            if (!(e instanceof MoreResource)) {
                                throw e;
                            }
                            // 必要なリソースがまだ足りてなければMoreResourceが送出される
                            var m = e;
                            later = later.concat.apply(later, m.depend);
                            laterId.push(i);
                        }
                    }
                    if (!later.empty()) {
                        // 再度リソース読み込みをかける
                        self.loadFrame(later, {
                            completed: function () {
                                for (var i = 0; i < laterId.length; i++) {
                                    var id = laterId[i];
                                    var r = infoL[id].makeResource(loaderL[id].result());
                                    dst.resource[res[id]] = r;
                                }
                                // すべてのリソース読み込み完了
                                callback.completed();
                            },
                            error: callback.error,
                            progress: callback.progress,
                            taskprogress: callback.taskprogress
                        }, true);
                    }
                    else {
                        // すべてのリソース読み込み完了
                        callback.completed();
                    }
                },
                error: function (msg) {
                    Assert(self.state() === ResState.Loading);
                    self._state = new RState.IdleState();
                    callback.error(msg);
                },
                progress: callback.progress,
                taskprogress: callback.taskprogress
            });
        };
        IdleState.prototype.resourceLength = function resourceLength (self) {
            return self._resource.length;
        };
        IdleState.prototype.popFrame = function popFrame (self, n) {
            var resA = self._resource;
            Assert(resA.length >= n);
            // 明示的な開放処理
            var loop = function () {
                var res = resA.pop();
                Object.keys(res.resource).forEach(function (k) {
                    res.resource[k].discard();
                });
                --n;
            };

            while (n > 0) loop();
        };
        IdleState.prototype.discard = function discard (self) {
            self._df.discard();
        };

        return IdleState;
    }(State));
    RState.IdleState = IdleState;
    var LoadingState = (function (State) {
        function LoadingState () {
            State.apply(this, arguments);
        }

        if ( State ) LoadingState.__proto__ = State;
        LoadingState.prototype = Object.create( State && State.prototype );
        LoadingState.prototype.constructor = LoadingState;

        LoadingState.prototype.state = function state () {
            return ResState.Loading;
        };
        LoadingState.prototype.resourceLength = function resourceLength (self) {
            return self._resource.length - 1;
        };

        return LoadingState;
    }(State));
    RState.LoadingState = LoadingState;
    var RestoreingState = (function (State) {
        function RestoreingState () {
            State.apply(this, arguments);
        }

        if ( State ) RestoreingState.__proto__ = State;
        RestoreingState.prototype = Object.create( State && State.prototype );
        RestoreingState.prototype.constructor = RestoreingState;

        RestoreingState.prototype.state = function state () {
            return ResState.Restoreing;
        };
        RestoreingState.prototype.loadFrame = function loadFrame (self, res, callback, bSame) {
            new IdleState().loadFrame(self, res, callback, bSame);
        };
        RestoreingState.prototype.resourceLength = function resourceLength (self) {
            return self._resource.length - 1;
        };

        return RestoreingState;
    }(State));
    RState.RestoreingState = RestoreingState;
})(RState || (RState = {}));
// リソースをレイヤに分けて格納
var ResStack = function ResStack(base) {
    this._df = new ResourceWrap(null);
    this._resource = [];
    // リソース名 -> リソースパス
    this._alias = {};
    // 現在のステート
    this._state = new RState.IdleState();
    this._base = base;
    this._pushFrame();
};
ResStack.prototype.addAlias = function addAlias (alias) {
    this._state.addAlias(this, alias);
};
ResStack.prototype._makeFPath = function _makeFPath (name) {
    Assert(typeof this._alias[name] !== "undefined");
    return ((this._base) + "/" + (this._alias[name]));
};
ResStack.prototype._pushFrame = function _pushFrame () {
    var dst = new ResLayer();
    this._resource.push(dst);
    return dst;
};
ResStack.prototype.state = function state () {
    return this._state.state();
};
// フレーム単位でリソースロード
/*
    \param[in] res ["AliasName", ...]
*/
ResStack.prototype.loadFrame = function loadFrame (res, callback, bSame) {
        if ( bSame === void 0 ) bSame = false;

    this._state.loadFrame(this, res, callback, bSame);
};
// リソースレイヤの数
ResStack.prototype.resourceLength = function resourceLength () {
    return this._state.resourceLength(this);
};
ResStack.prototype._checkResourceSingle = function _checkResourceSingle (name) {
    try {
        this.getResource(name);
    }
    catch (e) {
        return false;
    }
    return true;
};
// あるリソースを持っているかの確認(リスト対応)
ResStack.prototype.checkResource = function checkResource (name) {
        var this$1 = this;

    if (name instanceof Array) {
        for (var i = 0; i < name.length; i++) {
            if (!this$1._checkResourceSingle(name[i]))
                { return false; }
        }
        return true;
    }
    return this._checkResourceSingle(name);
};
ResStack.prototype.getResource = function getResource (name) {
    var resA = this._resource;
    for (var i = resA.length - 1; i >= 0; --i) {
        var res = resA[i];
        var r = res.resource[name];
        if (r)
            { return r; }
    }
    throw new NoSuchResource(name);
};
// 外部で生成したリソースをレイヤーに格納
ResStack.prototype.addResource = function addResource (key, val) {
    // リソース名の重複は許容
    if (this.checkResource(key))
        { return; }
    this._resource[this._resource.length - 1].resource[key] = val;
};
ResStack.prototype.popFrame = function popFrame (n) {
        if ( n === void 0 ) n = 1;

    this._state.popFrame(this, n);
};
ResStack.prototype._forEach = function _forEach (n, cb) {
    var r = this._resource[n].resource;
    Object.keys(r).forEach(function (k) {
        cb(r[k]);
    });
};
// ------------ from Discardable ------------
ResStack.prototype.discard = function discard () {
    this._state.discard(this);
};
ResStack.prototype.isDiscarded = function isDiscarded () {
    return this._df.isDiscarded();
};

var ResourceGenSrc = {};
var ResourceGen = (function () {
    return {
        get: function (rp) {
            var key = rp.key;
            try {
                return resource.getResource(key);
            }
            catch (e) {
                if (!(e instanceof NoSuchResource))
                    { throw e; }
            }
            var buff = ResourceGenSrc[rp.name](rp);
            resource.addResource(key, buff);
            return buff;
        }
    };
})();

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
ResourceGenSrc.Canvas = function (rp) {
    return new ResourceWrap(MakeCanvasToBody(rp.id));
};
var RPCanvas = function RPCanvas(id) {
    this.id = id;
};

var prototypeAccessors$1 = { name: {},key: {} };
prototypeAccessors$1.name.get = function () { return "Canvas"; };
prototypeAccessors$1.key.get = function () { return ("Canvas_" + (this.id)); };

Object.defineProperties( RPCanvas.prototype, prototypeAccessors$1 );

var RPWebGLCtx = function RPWebGLCtx(canvasId) {
    this.canvasId = canvasId;
};

var prototypeAccessors$2 = { name: {},key: {} };
prototypeAccessors$2.name.get = function () { return "WebGL"; };
prototypeAccessors$2.key.get = function () { return ("WebGL_" + (this.canvasId)); };

Object.defineProperties( RPWebGLCtx.prototype, prototypeAccessors$2 );

ResourceGenSrc.WebGL = function (rp) {
    var canvas = ResourceGen.get(new RPCanvas(rp.canvasId));
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
    for (var i = 0; i < webgl_text.length; i++) {
        var gl = canvas.data.getContext(webgl_text[i], param);
        if (gl)
            { return new ResourceWrap(gl); }
    }
    throw Error("webgl not found");
};

var Engine = function Engine() {
    this._doubling = 1;
    this._sys3d = new SysUnif3D();
    this._tech = {};
    this._size = new Size(0, 0);
    this._initGL();
};
Engine.prototype._onResized = function _onResized () {
    var canvas = ResourceGen.get(new RPCanvas(Engine.CanvasName));
    var w = window.innerWidth, h = window.innerHeight;
    this._size = new Size(w, h);
    var dbl = this._doubling;
    var assign;
        (assign = [w / dbl, h / dbl], canvas.data.width = assign[0], canvas.data.height = assign[1]);
    gl.viewport(0, 0, w / dbl, h / dbl);
    canvas.data.style.cssText = "width:100%;height:100%";
};
Engine.prototype.sys3d = function sys3d () {
    return this._sys3d;
};
Engine.prototype.size = function size () {
    return this._size;
};
Engine.prototype._initGL = function _initGL () {
        var this$1 = this;

    Assert(!gl, "already initialized");
    SetGL(ResourceGen.get(new RPWebGLCtx(Engine.CanvasName)).data);
    if (!gl)
        { throw new Error("WebGL not supported."); }
    var canvas = ResourceGen.get(new RPCanvas(Engine.CanvasName));
    canvas.data.addEventListener("webglcontextlost", function (e) {
        glres.onContextLost();
    });
    canvas.data.addEventListener("webglcontextrestored", function (e) {
        glres.onContextRestored();
    });
    window.onresize = function () {
        this$1._onResized();
    };
    this._onResized();
    new GLConst(gl);
};
Engine.prototype.draw = function draw (cb) {
        var this$1 = this;

    var prog = this.technique().program;
    this.sys3d().apply(prog);
    var tc = 0;
    var tex = [];
    Object.keys(this._unif).forEach(function (k) {
        var v = this$1._unif[k];
        if (v instanceof GLTexture) {
            gl.activeTexture(gl.TEXTURE0 + tc);
            v.bind_loose();
            prog.setUniform(k, tc++);
            tex.push(v);
        }
        else {
            prog.setUniform(k, v);
        }
    });
    cb();
    for (var i = 0; i < tex.length; i++)
        { tex[i].unbind(); }
};
Engine.prototype.setUniforms = function setUniforms (tbl) {
    JoinEntries(this._unif, tbl);
};
Engine.prototype.setUniform = function setUniform (name, value) {
    this._unif[name] = value;
};
Engine.prototype.addTechnique = function addTechnique (sh) {
        var this$1 = this;

    var techL = sh.technique();
    Object.keys(techL).forEach(function (k) {
        var v = techL[k];
        this$1._tech[k] = v;
    });
};
Engine.prototype.setTechnique = function setTechnique (name) {
    if (this._active)
        { this._active.program.unbind(); }
    this._active = this._tech[name];
    this._activeName = name;
    if (!this._active)
        { throw new Error(("No such technique: " + name)); }
    this._active.valueset.apply();
    this._active.program.bind();
    this._unif = {};
};
Engine.prototype.techName = function techName () {
    return this._activeName;
};
Engine.prototype.technique = function technique () {
    return this._active;
};
Engine.prototype.program = function program () {
    return this.technique().program;
};
Engine.prototype.applyTag = function applyTag (tag) {
    if (tag.technique !== null) {
        var apl = true;
        var tech = this.techName();
        if (tech) {
            if (tech === tag.technique)
                { apl = false; }
        }
        if (apl)
            { this.setTechnique(tag.technique); }
    }
};
Engine.prototype.drawGeometry = function drawGeometry (geom) {
        var this$1 = this;

    this.draw(function () {
        var idxL = [];
        var vbg = geom.vbuffer;
        var count = 0;
        for (var name in vbg) {
            var vb = vbg[name];
            count = vb.nElem();
            idxL.push(this$1.program().setVStream(name, vb));
        }
        var ib = geom.ibuffer;
        var glflag = GLConst.PrimitiveC.convert(geom.type);
        if (ib) {
            ib.proc(function () {
                gl.drawElements(glflag, ib.nElem(), ib.typeinfo().id, 0);
            });
        }
        else {
            gl.drawArrays(glflag, 0, count);
        }
        for (var i = 0; i < idxL.length; i++)
            { gl.disableVertexAttribArray(idxL[i]); }
    });
};
Engine.prototype.getScreenCoord = function getScreenCoord (pos) {
    pos = pos.clone();
    var s = this.size();
    var w2 = s.width / 2, h2 = s.height / 2;
    pos.x = pos.x / w2 - 1;
    pos.y = -pos.y / h2 + 1;
    return pos;
};

Engine.CanvasName = "maincanvas";

var InputBuff = function InputBuff() {
    this.key = {};
    this.mkey = {};
    this.wheelDelta = new Vec2(0);
    this.pos = null;
    this.dblClick = 0;
};

var InputFlag = function InputFlag() {
    this._key = {};
    this._keyMask = {};
    this._mkey = {};
    this._mkeyMask = {};
    this._wheelDelta = new Vec2(0);
    this._pos = new Vec2(0);
    this._dblClick = false;
    this._positionDelta = new Vec2(0);
};
InputFlag.prototype.update = function update (ns) {
    var Proc = function (m0, m1) {
        for (var k in m0) {
            if (m0[k] === -1)
                { delete m0[k]; }
            else
                { ++m0[k]; }
        }
        for (var k$1 in m1) {
            if (m1[k$1] === true) {
                if (!(m0[k$1] >= 1))
                    { m0[k$1] = 1; }
            }
            else {
                m0[k$1] = -1;
            }
        }
    };
    // Keyboard
    Proc(this._key, ns.key);
    // Mouse
    Proc(this._mkey, ns.mkey);
    // Wheel
    this._wheelDelta = ns.wheelDelta;
    // DoubleClick
    this._dblClick = (ns.dblClick) ? true : false;
    // PositionDelta
    if (ns.pos)
        { this._positionDelta = ns.pos.sub(this._pos); }
    else
        { this._positionDelta = new Vec2(0); }
    // Pos
    if (ns.pos)
        { this._pos = ns.pos.clone(); }
    this._keyMask = {};
    this._mkeyMask = {};
};
InputFlag.prototype._getMMask = function _getMMask (code) {
    return !Boolean(this._mkeyMask[code]);
};
InputFlag.prototype._getMask = function _getMask (code) {
    return !Boolean(this._keyMask[code]);
};
InputFlag.prototype.hideMState = function hideMState (code) {
    this._mkeyMask[code] = true;
};
InputFlag.prototype.hideState = function hideState (code) {
    this._keyMask[code] = true;
};
InputFlag.prototype.isMKeyPressed = function isMKeyPressed (code) {
    return this._getMMask(code) && (this._mkey[code] === 1);
};
InputFlag.prototype.isMKeyPressing = function isMKeyPressing (code) {
    return this._getMMask(code) && (this._mkey[code] >= 1);
};
InputFlag.prototype.isMKeyClicked = function isMKeyClicked (code) {
    return this._getMMask(code) && (this._mkey[code] === -1);
};
InputFlag.prototype.isKeyPressed = function isKeyPressed (code) {
    return this._getMask(code) && (this._key[code] === 1);
};
InputFlag.prototype.isKeyPressing = function isKeyPressing (code) {
    return this._getMask(code) && (this._key[code] >= 1);
};
InputFlag.prototype.isKeyClicked = function isKeyClicked (code) {
    return this._getMask(code) && (this._key[code] === -1);
};
InputFlag.prototype.position = function position () {
    return this._pos;
};
InputFlag.prototype.doubleClicked = function doubleClicked () {
    return this._dblClick;
};
InputFlag.prototype.wheelDelta = function wheelDelta () {
    return this._wheelDelta;
};
InputFlag.prototype.positionDelta = function positionDelta () {
    return this._positionDelta;
};

var InputMgr = function InputMgr() {
    var this$1 = this;

    this._cur = new InputBuff();
    this._prev = new InputBuff();
    this._switchBuff();
    this._flag = new InputFlag();
    this._bDiscard = false;
    this._events = {
        mousedown: function (e) {
            this$1._cur.mkey[e.button] = true;
        },
        mouseup: function (e) {
            this$1._cur.mkey[e.button] = false;
        },
        mousemove: function (e) {
            this$1._cur.pos = new Vec2(e.pageX, e.pageY);
        },
        keydown: function (e) {
            this$1._cur.key[e.keyCode] = true;
        },
        keyup: function (e) {
            this$1._cur.key[e.keyCode] = false;
        },
        wheel: function (e) {
            this$1._cur.wheelDelta.addSelf(new Vec3(e.deltaX, e.deltaY, e.deltaZ));
        },
        dblclick: function (e) {
            this$1._cur.dblClick = 0x01;
        },
        touchstart: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var me = e.changedTouches[0];
            var p = new Vec2(me.pageX, me.pageY);
            this$1._prev.pos = this$1._cur.pos = p;
            this$1._cur.mkey[0] = true;
            return false;
        },
        touchmove: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var me = e.changedTouches[0];
            this$1._cur.pos = new Vec2(me.pageX, me.pageY);
            return false;
        },
        touchend: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this$1._cur.mkey[0] = false;
            return false;
        },
        touchcancel: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this$1._cur.mkey[0] = false;
            return false;
        }
    };
    this._registerEvent();
};
InputMgr.prototype.lockPointer = function lockPointer (elem) {
    var api = [
        "requestPointerLock",
        "webkitRequestPointerLock",
        "mozRequestPointerLock"
    ];
    var len = api.length;
    for (var i = 0; i < len; i++) {
        if (elem[api[i]]) {
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
    for (var i = 0; i < len; i++) {
        if (document[api[i]]) {
            document[api[i]]();
            return;
        }
    }
    Assert(false, "pointer lock API not found");
};
InputMgr.prototype._registerEvent = function _registerEvent () {
        var this$1 = this;

    var param = { capture: true, passive: false };
    for (var k in this$1._events) {
        document.addEventListener(k, this$1._events[k], param);
    }
};
InputMgr.prototype._unregisterEvent = function _unregisterEvent () {
        var this$1 = this;

    for (var k in this$1._events) {
        document.removeEventListener(k, this$1._events[k]);
    }
};
InputMgr.prototype._switchBuff = function _switchBuff () {
    this._prev = this._cur;
    this._cur = new InputBuff();
};
InputMgr.prototype.update = function update () {
    this._flag.update(this._cur);
    this._switchBuff();
};
InputMgr.prototype.isMKeyPressed = function isMKeyPressed (code) {
    return this._flag.isMKeyPressed(code);
};
InputMgr.prototype.isMKeyPressing = function isMKeyPressing (code) {
    return this._flag.isMKeyPressing(code);
};
InputMgr.prototype.isMKeyClicked = function isMKeyClicked (code) {
    return this._flag.isMKeyClicked(code);
};
InputMgr.prototype.hideMState = function hideMState (code) {
    this._flag.hideMState(code);
};
InputMgr.prototype.isKeyPressed = function isKeyPressed (code) {
    return this._flag.isKeyPressed(code);
};
InputMgr.prototype.isKeyPressing = function isKeyPressing (code) {
    return this._flag.isKeyPressing(code);
};
InputMgr.prototype.isKeyClicked = function isKeyClicked (code) {
    return this._flag.isKeyClicked(code);
};
InputMgr.prototype.hideState = function hideState (code) {
    this._flag.hideState(code);
};
InputMgr.prototype.positionDelta = function positionDelta () {
    return this._flag.positionDelta();
};
InputMgr.prototype.position = function position () {
    return this._flag.position();
};
InputMgr.prototype.doubleClicked = function doubleClicked () {
    return this._flag.doubleClicked();
};
InputMgr.prototype.wheelDelta = function wheelDelta () {
    return this._flag.wheelDelta();
};
// ---------------- from Discardable ----------------
InputMgr.prototype.isDiscarded = function isDiscarded () {
    return this._bDiscard;
};
InputMgr.prototype.discard = function discard () {
    this._unregisterEvent();
};

var GObject = (function (BaseObject$$1) {
    function GObject(priority) {
        if ( priority === void 0 ) priority = 0;

        BaseObject$$1.call(this);
        this.priority = priority;
    }

    if ( BaseObject$$1 ) GObject.__proto__ = BaseObject$$1;
    GObject.prototype = Object.create( BaseObject$$1 && BaseObject$$1.prototype );
    GObject.prototype.constructor = GObject;
    GObject.prototype.onUpdate = function onUpdate (dt) {
        return this.alive();
    };
    GObject.prototype.onDown = function onDown (ret) { };
    GObject.prototype.onUp = function onUp () { };
    GObject.prototype.onConnected = function onConnected (g) { };

    return GObject;
}(BaseObject));

var FSMachine = (function (GObject$$1) {
    function FSMachine(p, state) {
        GObject$$1.call(this, p);
        this._state = state;
        this._nextState = null;
        state.onEnter(this, BeginState);
    }

    if ( GObject$$1 ) FSMachine.__proto__ = GObject$$1;
    FSMachine.prototype = Object.create( GObject$$1 && GObject$$1.prototype );
    FSMachine.prototype.constructor = FSMachine;
    FSMachine.prototype._doSwitchState = function _doSwitchState () {
        var this$1 = this;

        for (;;) {
            var ns = this$1._nextState;
            if (!ns)
                { break; }
            this$1._nextState = null;
            var old = this$1._state;
            old.onExit(this$1, ns);
            this$1._state = ns;
            ns.onEnter(this$1, old);
        }
    };
    FSMachine.prototype.setState = function setState (st) {
        Assert(!this._nextState);
        this._nextState = st;
    };
    FSMachine.prototype.onUpdate = function onUpdate (dt) {
        if (this.alive()) {
            this._state.onUpdate(this, dt);
            this._doSwitchState();
        }
        return this.alive();
    };
    FSMachine.prototype.onDown = function onDown (ret) {
        this._state.onDown(this, ret);
    };
    FSMachine.prototype.onUp = function onUp () {
        this._state.onUp(this);
    };
    FSMachine.prototype.discard = function discard () {
        if (this.alive()) {
            GObject$$1.prototype.discard.call(this);
            this.setState(EndState);
            this._doSwitchState();
            return true;
        }
        return false;
    };

    return FSMachine;
}(GObject));

var Group = function Group() {
    this._group = [];
    this._add = null;
    this._remove = null;
};
Group.prototype.group = function group () { return this._group; };
Group.prototype._doAdd = function _doAdd (cbAdd) {
        var this$1 = this;

    var addL = this._add;
    if (addL) {
        addL.forEach(function (obj) {
            cbAdd(obj, this$1);
            this$1._group.push(obj);
        });
        this._add = null;
        return true;
    }
    return false;
};
Group.prototype._removeSingle = function _removeSingle (obj) {
    // 線形探索
    var g = this._group;
    var len = g.length;
    for (var i = 0; i < len; i++) {
        if (g[i] === obj)
            { g.splice(i, 1); }
    }
};
Group.prototype._doRemove = function _doRemove () {
        var this$1 = this;

    var remL = this._remove;
    if (remL) {
        var len = remL.length;
        for (var i = 0; i < len; i++)
            { this$1._removeSingle(remL[i]); }
        this._remove = null;
        return true;
    }
    return false;
};
Group.prototype._sort = function _sort (cbSort) {
    this._group.sort(cbSort);
};
Group.prototype.doAddRemove = function doAddRemove (cbAdd) {
    return this._doAdd(cbAdd) || this._doRemove();
};
Group.prototype.proc = function proc (cbAdd, cbSort, bRefr) {
    if (this.doAddRemove(cbAdd) || bRefr) {
        if (cbSort)
            { this._sort(cbSort); }
    }
};
Group.prototype.add = function add (obj) {
    if (!this._add)
        { this._add = []; }
    this._add.push(obj);
};
Group.prototype.remove = function remove (obj) {
    if (!this._remove)
        { this._remove = []; }
    this._remove.push(obj);
};

var UpdGroup = (function (GObject$$1) {
    function UpdGroup(p) {
        GObject$$1.call(this, p);
        this.group = new Group();
    }

    if ( GObject$$1 ) UpdGroup.__proto__ = GObject$$1;
    UpdGroup.prototype = Object.create( GObject$$1 && GObject$$1.prototype );
    UpdGroup.prototype.constructor = UpdGroup;
    UpdGroup.prototype._doAddRemove = function _doAddRemove () {
        var cbAdd = function (obj, g) {
            obj.onConnected(g);
        };
        var cbSort = function (a, b) {
            if (a.priority > b.priority)
                { return 1; }
            else if (a.priority === b.priority)
                { return 0; }
            return -1;
        };
        this.group.proc(cbAdd, cbSort);
    };
    UpdGroup.prototype.onUpdate = function onUpdate (dt) {
        var this$1 = this;

        this._doAddRemove();
        var g = this.group.group();
        for (var i = 0; i < g.length; i++) {
            if (!g[i].onUpdate(dt))
                { this$1.group.remove(g[i]); }
        }
        this._doAddRemove();
        return true;
    };

    return UpdGroup;
}(GObject));

var DrawGroup = (function (DObject$$1) {
    function DrawGroup() {
        DObject$$1.call(this, null);
        this.group = new Group();
        this._bRefr = true;
    }

    if ( DObject$$1 ) DrawGroup.__proto__ = DObject$$1;
    DrawGroup.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    DrawGroup.prototype.constructor = DrawGroup;
    DrawGroup.prototype.setSortAlgorithm = function setSortAlgorithm (a) {
        this._sortAlg = a;
        this._bRefr = true;
    };
    DrawGroup.prototype._proc = function _proc () {
        var this$1 = this;

        var cbAdd = function (obj, g) { };
        var cbSort;
        if (this._sortAlg) {
            cbSort = function (a, b) {
                return this$1._sortAlg(a.drawtag, b.drawtag);
            };
        }
        this.group.proc(cbAdd, cbSort, this._bRefr);
        this._bRefr = false;
    };
    DrawGroup.prototype.onDraw = function onDraw () {
        this._proc();
        var g = this.group.group();
        for (var i = 0; i < g.length; i++) {
            var obj = g[i];
            engine.applyTag(obj.drawtag);
            obj.onDraw();
        }
        this._proc();
    };

    return DrawGroup;
}(DObject));

var Scene = (function (FSMachine$$1) {
    function Scene() {
        FSMachine$$1.apply(this, arguments);
        this.updateTarget = new UpdGroup(0);
        this.drawTarget = new DrawGroup();
    }

    if ( FSMachine$$1 ) Scene.__proto__ = FSMachine$$1;
    Scene.prototype = Object.create( FSMachine$$1 && FSMachine$$1.prototype );
    Scene.prototype.constructor = Scene;
    Scene.prototype.asUpdateGroup = function asUpdateGroup () {
        Assert(this.updateTarget instanceof UpdGroup);
        return this.updateTarget;
    };
    Scene.prototype.asDrawGroup = function asDrawGroup () {
        Assert(this.drawTarget instanceof DrawGroup);
        return this.drawTarget;
    };
    Scene.prototype.onUpdate = function onUpdate (dt) {
        FSMachine$$1.prototype.onUpdate.call(this, dt);
        this.updateTarget.onUpdate(dt);
        return true;
    };
    Scene.prototype.onDraw = function onDraw () {
        this.drawTarget.onDraw();
    };

    return Scene;
}(FSMachine));

function OutputError(where, msg) {
    console.log(("Error in " + where + ": " + msg));
}

var SceneMgrState;
(function (SceneMgrState) {
    SceneMgrState[SceneMgrState["Idle"] = 0] = "Idle";
    SceneMgrState[SceneMgrState["Draw"] = 1] = "Draw";
    SceneMgrState[SceneMgrState["Proc"] = 2] = "Proc";
})(SceneMgrState || (SceneMgrState = {}));
var SceneMgr = (function (GObject$$1) {
    function SceneMgr(firstScene) {
        GObject$$1.call(this);
        this._scene = [];
        this._nextScene = null;
        this._nPop = 0;
        this._state = SceneMgrState.Idle;
        this._bSwitch = false;
        this.push(firstScene, false);
        firstScene.onUp();
        this._proceed();
    }

    if ( GObject$$1 ) SceneMgr.__proto__ = GObject$$1;
    SceneMgr.prototype = Object.create( GObject$$1 && GObject$$1.prototype );
    SceneMgr.prototype.constructor = SceneMgr;
    SceneMgr.prototype.push = function push (scene, bPop) {
        Assert(scene instanceof Scene);
        // 描画メソッドでのシーン変更は禁止
        Assert(this._state !== SceneMgrState.Draw);
        // 一度に2つ以上のシーンを積むのは禁止
        Assert(!this._nextScene);
        // popした後に積むのも禁止
        Assert(this._nPop === 0);
        this._nextScene = scene;
        this._bSwitch = bPop;
        this._nPop = bPop ? 1 : 0;
    };
    SceneMgr.prototype.pop = function pop (n, ret) {
        if ( n === void 0 ) n = 1;

        // 描画メソッドでのシーン変更は禁止
        Assert(this._state !== SceneMgrState.Draw);
        // pushした後にpopはNG
        Assert(!this._nextScene);
        Assert(this._nPop === 0);
        this._bSwitch = false;
        this._nPop = n;
        this._return = ret;
    };
    SceneMgr.prototype._proceed = function _proceed () {
        var this$1 = this;

        Assert(this._state === SceneMgrState.Idle);
        this._state = SceneMgrState.Proc;
        var b = false;
        while (this._nPop > 0) {
            --this$1._nPop;
            b = true;
            var t = this$1._scene.pop();
            t.discard();
            if (this$1._scene.length === 0) {
                this$1._nPop = 0;
                break;
            }
            if (!this$1._bSwitch)
                { this$1.top().onDown(this$1._return); }
            delete this$1._return;
        }
        var ns = this._nextScene;
        if (ns) {
            this._nextScene = null;
            this._scene.push(ns);
            ns.onUp();
            b = true;
        }
        this._state = SceneMgrState.Idle;
        return b;
    };
    SceneMgr.prototype.top = function top () {
        return this._scene[this._scene.length - 1];
    };
    SceneMgr.prototype.length = function length () {
        return this._scene.length;
    };
    SceneMgr.prototype.prev = function prev () {
        var s = this._scene;
        if (s.length < 2)
            { return null; }
        return s[s.length - 2];
    };
    SceneMgr.prototype._empty = function _empty () {
        return this.length() === 0;
    };
    SceneMgr.prototype.onUpdate = function onUpdate (dt) {
        var this$1 = this;

        for (;;) {
            if (this$1._empty())
                { return false; }
            try {
                this$1.top().onUpdate(dt);
            }
            catch (e) {
                OutputError("scenemgr::onupdate()", e.message);
            }
            if (!this$1._proceed())
                { break; }
        }
        return !this._empty();
    };
    SceneMgr.prototype.onDraw = function onDraw () {
        Assert(this._state === SceneMgrState.Idle);
        this._state = SceneMgrState.Draw;
        try {
            this.top().onDraw();
        }
        catch (e) {
            OutputError("scenemgr::ondraw()", e.message);
        }
        this._state = SceneMgrState.Idle;
    };

    return SceneMgr;
}(GObject));

var Loop = function Loop() {
    this._timerId = null;
    this._targetFps = 60;
    this._reset();
};
Loop.prototype._reset = function _reset (now) {
        if ( now === void 0 ) now = new Date().getTime();

    if (this._timerId) {
        clearTimeout(this._timerId);
        this._timerId = null;
    }
    this._beginTime = now;
    this._prevTime = now;
    this._accum = 0;
};
Loop.prototype.running = function running () {
    return this._timerId !== null;
};
Loop.prototype.targetFps = function targetFps () {
    return this._targetFps;
};
Loop.prototype.accum = function accum () {
    return this._accum;
};
Loop._CalcFPSArray = function _CalcFPSArray (fps) {
    var gcd = TM$1.GCD(1000, fps);
    var div0 = 1000 / gcd, div1 = fps / gcd;
    var df = Math.floor(div0 / div1);
    var tmp = [];
    for (var i = 0; i < div1; i++) {
        tmp.push(df);
    }
    var dc = df * div1;
    for (var i$1 = 0; i$1 < (div0 - dc); i$1++)
        { ++tmp[i$1]; }
    return tmp;
};
Loop.prototype.start = function start (targetFps, cb) {
    this.stop();
    this._targetFps = targetFps;
    this._reset();
    var fps_array = Loop._CalcFPSArray(targetFps);
    var fps_ptr = 0;
    var self = this;
    (function Tmp() {
        self._timerId = setTimeout(Tmp, fps_array[fps_ptr]);
        fps_ptr = (++fps_ptr) % fps_array.length;
        ++self._accum;
        var now = new Date().getTime();
        cb((now - self._prevTime) / 1000);
        self._prevTime = now;
    })();
};
Loop.prototype.stop = function stop () {
    this._reset();
};

var GLResourceSet = (function (GLResourceFlag$$1) {
    function GLResourceSet() {
        GLResourceFlag$$1.apply(this, arguments);
        this._set = new Set();
    }

    if ( GLResourceFlag$$1 ) GLResourceSet.__proto__ = GLResourceFlag$$1;
    GLResourceSet.prototype = Object.create( GLResourceFlag$$1 && GLResourceFlag$$1.prototype );
    GLResourceSet.prototype.constructor = GLResourceSet;
    GLResourceSet.prototype.onContextLost = function onContextLost () {
        var this$1 = this;

        GLResourceFlag$$1.prototype.onContextLost.call(this, function () {
            this$1._set.forEach(function (r) {
                r.onContextLost();
            });
        });
    };
    GLResourceSet.prototype.onContextRestored = function onContextRestored () {
        var this$1 = this;

        GLResourceFlag$$1.prototype.onContextRestored.call(this, function () {
            this$1._set.forEach(function (r) {
                r.onContextRestored();
            });
        });
    };
    GLResourceSet.prototype.add = function add (r) {
        this._set.add(r);
        if (!gl.isContextLost())
            { r.onContextRestored(); }
    };
    GLResourceSet.prototype.remove = function remove (r) {
        this._set.delete(r);
    };

    return GLResourceSet;
}(GLResourceFlag));

var Alias = { "common": "fragile/resource/common.glsl", "gauss": "fragile/resource/gauss.def", "gaussH_FS": "fragile/resource/gaussH_FS.fsh", "gaussV_FS": "fragile/resource/gaussV_FS.fsh", "gauss_mix9": "fragile/resource/gauss_mix9.glsl", "gaussh": "fragile/resource/gaussh.vsh", "gaussv": "fragile/resource/gaussv.vsh", "gaussvalue": "fragile/resource/gaussvalue.glsl", "prog": "fragile/resource/prog.prog", "rectf": "fragile/resource/rectf.fsh", "rectv": "fragile/resource/rectv.vsh", "rectvalue": "fragile/resource/rectvalue.glsl", "testf": "fragile/resource/testf.fsh", "testv": "fragile/resource/testv.vsh", "textf": "fragile/resource/textf.fsh", "textv": "fragile/resource/textv.vsh", "textvalue": "fragile/resource/textvalue.glsl", "uv9": "fragile/resource/uv9.glsl" };

function _MainLoop(base, cbAlias, cbMakeScene) {
    SetResource(new ResStack(base));
    cbAlias();
    SetEngine(new Engine());
    SetInput(new InputMgr());
    SetScene(new SceneMgr(cbMakeScene()));
    SetGLRes(new GLResourceSet());
    glres.onContextRestored();
}
function MainLoop(alias, base, cbMakeScene) {
    _MainLoop(base, function () {
        resource.addAlias(Alias);
        resource.addAlias(alias);
    }, cbMakeScene);
    RequestAnimationFrame(function Loop$$1() {
        RequestAnimationFrame(Loop$$1);
        if (gl.isContextLost())
            { return; }
        scene.onDraw();
    });
    var loop = new Loop();
    loop.start(60, function (tick) {
        // 最大50msまでの経過時間
        tick = Math.min(50, tick);
        input.update();
        if (!scene.onUpdate(tick)) {
            loop.stop();
        }
    });
}

var LoadFailed = (function (Error) {
    function LoadFailed(msg) {
        Error.call(this, msg);
    }

    if ( Error ) LoadFailed.__proto__ = Error;
    LoadFailed.prototype = Object.create( Error && Error.prototype );
    LoadFailed.prototype.constructor = LoadFailed;

    return LoadFailed;
}(Error));
var St = (function (State$$1) {
    function St () {
        State$$1.apply(this, arguments);
    }if ( State$$1 ) St.__proto__ = State$$1;
    St.prototype = Object.create( State$$1 && State$$1.prototype );
    St.prototype.constructor = St;

    

    return St;
}(State));
var LoadingScene = (function (Scene$$1) {
    function LoadingScene(res, nextScene, cbProgress, cbTaskProgress) {
        Scene$$1.call(this, 0, new St());
        resource.loadFrame(res, {
            completed: function () {
                scene.push(nextScene(), true);
            },
            error: function (msg) {
                scene.pop(1, new LoadFailed(msg));
            },
            progress: cbProgress || function () { },
            taskprogress: cbTaskProgress || function () { }
        });
    }

    if ( Scene$$1 ) LoadingScene.__proto__ = Scene$$1;
    LoadingScene.prototype = Object.create( Scene$$1 && Scene$$1.prototype );
    LoadingScene.prototype.constructor = LoadingScene;

    return LoadingScene;
}(Scene));

var StIdle = (function (State$$1) {
    function StIdle () {
        State$$1.apply(this, arguments);
    }

    if ( State$$1 ) StIdle.__proto__ = State$$1;
    StIdle.prototype = Object.create( State$$1 && State$$1.prototype );
    StIdle.prototype.constructor = StIdle;

    StIdle.prototype.onUpdate = function onUpdate (self, dt) {
        if (input.isMKeyPressed(0)) {
            self.setState(new StLook());
        }
        else {
            var c = self.camera;
            var dx = 0, dy = 0;
            // A = 65
            if (input.isKeyPressing(65)) {
                dx = -1;
                // D = 68
            }
            else if (input.isKeyPressing(68)) {
                dx = 1;
            }
            // W = 87
            if (input.isKeyPressing(87)) {
                dy = 1;
                // S = 83
            }
            else if (input.isKeyPressing(83)) {
                dy = -1;
            }
            var r = c.rot.right();
            c.pos.addSelf(r.mul(dx * dt * self._speed));
            var u = c.rot.dir();
            c.pos.addSelf(u.mul(dy * dt * self._speed));
        }
    };

    return StIdle;
}(State));
var StLook = (function (State$$1) {
    function StLook () {
        State$$1.apply(this, arguments);
    }

    if ( State$$1 ) StLook.__proto__ = State$$1;
    StLook.prototype = Object.create( State$$1 && State$$1.prototype );
    StLook.prototype.constructor = StLook;

    StLook.prototype.onUpdate = function onUpdate (self, dt) {
        if (!input.isMKeyPressing(0)) {
            self.setState(new StIdle());
        }
        else {
            var d = input.positionDelta();
            self._yaw += d.x * self._rotSpeed;
            self._pitch -= d.y * self._rotSpeed;
            var pi = Math.PI;
            self._pitch = Saturation(self._pitch, -(pi / 2 - 0.01), (pi / 2 - 0.01));
            var c = self.camera;
            c.rot = Quat.RotationYPR(self._yaw, self._pitch, 0);
            c.rot.normalizeSelf();
        }
    };

    return StLook;
}(State));
var FPSCamera = (function (FSMachine$$1) {
    function FPSCamera() {
        FSMachine$$1.call(this, 0, new StIdle());
        this._yaw = this._pitch = 0;
        this._speed = 3;
        this._rotSpeed = 0.003;
        var c = new Camera3D();
        c.fov = TM$1.Deg2rad(90);
        var s = engine.size();
        c.aspect = s.width / s.height;
        c.nearZ = 0.01;
        c.farZ = 200;
        c.pos = new Vec3(0, 0, -1);
        this.camera = c;
    }

    if ( FSMachine$$1 ) FPSCamera.__proto__ = FSMachine$$1;
    FPSCamera.prototype = Object.create( FSMachine$$1 && FSMachine$$1.prototype );
    FPSCamera.prototype.constructor = FPSCamera;

    return FPSCamera;
}(FSMachine));

var GLBufferInfo = function GLBufferInfo(usage, typeinfo, 
    // 頂点の個数
    nElem, 
    // 要素何個分で頂点一つ分か
    dim, 
    // バックアップ用のデータ
    backup) {
    this.usage = usage;
    this.typeinfo = typeinfo;
    this.nElem = nElem;
    this.dim = dim;
    this.backup = backup;
};
var GLBuffer = function GLBuffer() {
    this._rf = new GLResourceFlag();
    this._id = null;
    this._bBind = false;
    glres.add(this);
};
GLBuffer.prototype.id = function id () {
    return this._id;
};
GLBuffer.prototype.usage = function usage () {
    return this._info.usage;
};
GLBuffer.prototype.typeinfo = function typeinfo () {
    return this._info.typeinfo;
};
GLBuffer.prototype.nElem = function nElem () {
    return this._info.nElem;
};
GLBuffer.prototype.dim = function dim () {
    return this._info.dim;
};
GLBuffer.prototype._typeId = function _typeId () {
    return GLConst.BufferTypeC.convert(this.typeId());
};
GLBuffer.prototype._typeQueryId = function _typeQueryId () {
    return GLConst.BufferQueryC.convert(this.typeQueryId());
};
GLBuffer.prototype._usage = function _usage () {
    return GLConst.DrawTypeC.convert(this.usage());
};
GLBuffer.prototype.allocate = function allocate (fmt, nElem, dim, usage, bRestore) {
        var this$1 = this;

    var t = GLConst.GLTypeInfo[GLConst.DataFormatC.convert(fmt)];
    Assert(Boolean(t));
    var bytelen = nElem * dim * t.bytesize;
    this._info = new GLBufferInfo(usage, t, nElem, dim, bRestore ? new ArrayBuffer(bytelen) : undefined);
    this.proc(function () {
        gl.bufferData(this$1._typeId(), bytelen, this$1._usage());
    });
};
GLBuffer.prototype._setData = function _setData (data, info, nElem, dim, usage, bRestore) {
        var this$1 = this;

    var restoreData;
    if (bRestore) {
        restoreData = data.slice(0);
    }
    this._info = new GLBufferInfo(usage, info, nElem, dim, restoreData);
    this.proc(function () {
        gl.bufferData(this$1._typeId(), data, this$1._usage());
    });
};
GLBuffer.prototype.setData = function setData (data, dim, usage, bRestore) {
    var t = GLConst.Type2GLType[data.constructor.name];
    this._setData(data.buffer, t, data.length / dim, dim, usage, bRestore);
};
GLBuffer.prototype.setVectorData = function setVectorData (data, usage, bRestore) {
    this.setData(VectorToArray.apply(void 0, data), data[0].dim(), usage, bRestore);
};
GLBuffer.prototype.setSubData = function setSubData (offset_elem, data) {
        var this$1 = this;

    var info = this._info;
    var ofs = info.typeinfo.bytesize * offset_elem;
    if (info.backup) {
        var dst = new Uint8Array(info.backup);
        var src = new Uint8Array(data);
        for (var i = 0; i < data.byteLength; i++)
            { dst[ofs + i] = src[i]; }
    }
    this.proc(function () {
        gl.bufferSubData(this$1._typeId(), ofs, data);
    });
};
// --------- from Bindable ---------
GLBuffer.prototype.bind = function bind () {
    Assert(!this.isDiscarded(), "already discarded");
    Assert(!this._bBind, "already binded");
    gl.bindBuffer(this._typeId(), this.id());
    this._bBind = true;
};
GLBuffer.prototype.unbind = function unbind (id) {
        if ( id === void 0 ) id = null;

    Assert(this._bBind, "not binded yet");
    gl.bindBuffer(this._typeId(), id);
    this._bBind = false;
};
GLBuffer.prototype.proc = function proc (cb) {
    if (this.contextLost())
        { return; }
    var prev = gl.getParameter(this._typeQueryId());
    this.bind();
    cb();
    this.unbind(prev);
};
// --------- from Discardable ---------
GLBuffer.prototype.discard = function discard () {
    Assert(!this._bBind, "still binding somewhere");
    this.onContextLost();
    this._rf.discard();
};
GLBuffer.prototype.isDiscarded = function isDiscarded () {
    return this._rf.isDiscarded();
};
// --------- from GLContext ---------
GLBuffer.prototype.onContextLost = function onContextLost () {
        var this$1 = this;

    this._rf.onContextLost(function () {
        gl.deleteBuffer(this$1.id());
        this$1._id = null;
    });
};
GLBuffer.prototype.onContextRestored = function onContextRestored () {
        var this$1 = this;

    this._rf.onContextRestored(function () {
        this$1._id = gl.createBuffer();
        if (this$1._info) {
            // 必要ならデータを復元
            var bd = this$1._info.backup;
            if (bd) {
                this$1._setData(bd, this$1.typeinfo(), this$1.nElem(), this$1.dim(), this$1.usage(), true);
            }
        }
    });
};
GLBuffer.prototype.contextLost = function contextLost () {
    return this._rf.contextLost();
};

var GLVBuffer = (function (GLBuffer$$1) {
    function GLVBuffer () {
        GLBuffer$$1.apply(this, arguments);
    }

    if ( GLBuffer$$1 ) GLVBuffer.__proto__ = GLBuffer$$1;
    GLVBuffer.prototype = Object.create( GLBuffer$$1 && GLBuffer$$1.prototype );
    GLVBuffer.prototype.constructor = GLVBuffer;

    GLVBuffer.prototype.typeId = function typeId () {
        return BufferType.Vertex;
    };
    GLVBuffer.prototype.typeQueryId = function typeQueryId () {
        return BufferQuery.Vertex;
    };

    return GLVBuffer;
}(GLBuffer));

function Rand01() {
    return (Math.random() - 0.5) * 2;
}
var Points = function Points() {
    this.position = [];
    this.hsv = [];
};
var Alg = function Alg(n) {
    this._nP = n;
    this._veloc = [];
};
Alg.prototype.initialize = function initialize () {
    var ret = new Points();
    var vpos = ret.position;
    var vhsv = ret.hsv;
    var veloc = this._veloc;
    for (var i = 0; i < this._nP; i++) {
        vpos[i] = new Vec3(Rand01(), -1, Rand01());
        veloc[i] = new Vec3(Rand01(), 0.1, Rand01()).normalizeSelf();
        vhsv[i] = new Vec3(Math.random(), 0.8, 1);
    }
    return ret;
};
Alg.prototype.advance = function advance (points, dt) {
    var veloc = this._veloc;
    var len = veloc.length;
    for (var i = 0; i < len; i++) {
        points.position[i].addSelf(veloc[i].mul(dt));
        var dir = points.position[i].minus();
        dir.mulSelf(dt);
        veloc[i] = veloc[i].add(dir).normalize();
    }
};
var PSprite = function PSprite(alg) {
    this._alg = alg;
    this._points = alg.initialize();
    var vbc = new GLVBuffer();
    vbc.setVectorData(this._points.hsv, DrawType.Dynamic, true);
    var vb = new GLVBuffer();
    vb.setVectorData(this._points.position, DrawType.Dynamic, true);
    this._geom = {
        vbuffer: {
            a_position: vb,
            a_hsv: vbc
        },
        type: Primitive.Points
    };
    this.hueOffset = 0;
};
PSprite.prototype.advance = function advance (dt) {
    this._alg.advance(this._points, dt);
    var vr = VectorToArray.apply(void 0, this._points.position);
    this._geom.vbuffer.a_position.setSubData(0, vr.buffer);
    var vsv = VectorToArray.apply(void 0, this._points.hsv);
    this._geom.vbuffer.a_hsv.setSubData(0, vsv.buffer);
};
PSprite.prototype.draw = function draw (alpha) {
    if (this.texture)
        { engine.setUniform("u_texture", this.texture); }
    engine.sys3d().worldMatrix = Mat44.Identity();
    engine.setUniform("u_alpha", alpha);
    engine.setUniform("u_hue", this.hueOffset);
    engine.drawGeometry(this._geom);
};
var PSpriteDraw = (function (DObject$$1) {
    function PSpriteDraw(n) {
        DObject$$1.call(this, "psprite");
        this._psprite = new PSprite(new Alg(n));
        var tex = resource.getResource("sphere");
        tex.setLinear(true, true, 0);
        this._psprite.texture = tex;
        this.alpha = 1;
    }

    if ( DObject$$1 ) PSpriteDraw.__proto__ = DObject$$1;
    PSpriteDraw.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    PSpriteDraw.prototype.constructor = PSpriteDraw;
    PSpriteDraw.prototype.advance = function advance (dt) {
        this._psprite.hueOffset += dt * 0.1;
        this._psprite.advance(dt / 2);
    };
    PSpriteDraw.prototype.onDraw = function onDraw () {
        this._psprite.draw(this.alpha);
    };

    return PSpriteDraw;
}(DObject));

var Font = (function () {
    function anonymous(family, size, weight, italic) {
        this.family = family;
        this.size = size;
        this.weight = weight;
        this.italic = italic;
    }
    anonymous.prototype.fontstr = function fontstr () {
        var this$1 = this;

        var res = "";
        if (this.italic)
            { res += "italic"; }
        var add = function (ent) {
            var val = this$1[ent];
            if (val) {
                res += " ";
                res += String(val);
            }
        };
        add("weight");
        add("size");
        add("family");
        return res;
    };

    return anonymous;
}());

ResourceGenSrc.FontCtx = function (rp) {
    var c = ResourceGen.get(new RPCanvas(rp.canvasId));
    // 後で変える
    c.data.width = c.data.height = 512;
    var ctx = c.data.getContext("2d");
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";
    return new ResourceWrap(ctx);
};
var RP_FontCtx = (function (RPWebGLCtx$$1) {
    function anonymous () {
        RPWebGLCtx$$1.apply(this, arguments);
    }

    if ( RPWebGLCtx$$1 ) anonymous.__proto__ = RPWebGLCtx$$1;
    anonymous.prototype = Object.create( RPWebGLCtx$$1 && RPWebGLCtx$$1.prototype );
    anonymous.prototype.constructor = anonymous;

    var prototypeAccessors = { name: {},key: {} };

    prototypeAccessors.name.get = function () { return "FontCtx"; };
    prototypeAccessors.key.get = function () { return ("FontCtx_" + (this.canvasId)); };

    Object.defineProperties( anonymous.prototype, prototypeAccessors );

    return anonymous;
}(RPWebGLCtx));

var Range = function Range(from, to) {
    this.from = from;
    this.to = to;
};
Range.prototype.width = function width () {
    return this.to - this.from;
};
Range.prototype.move = function move (ofs) {
    this.from += ofs;
    this.to += ofs;
};

ResourceGenSrc.FontHeight = function (rp) {
    var c = ResourceGen.get(new RP_FontCtx("fontcanvas"));
    c.data.font = rp.font.fontstr();
    var canvas = c.data.canvas;
    var cw = canvas.width, ch = canvas.height;
    c.data.fillStyle = "black";
    c.data.fillRect(0, 0, cw, ch);
    c.data.fillStyle = "white";
    c.data.fillText("あいうえおAEglq", 0, 0);
    var fw = c.data.measureText("Eg").width;
    var pixels = c.data.getImageData(0, 0, fw, ch);
    var top = 0, bottom = ch;
    // Find top border
    Top: for (var i = 0; i < ch; i++) {
        var idx = pixels.width * i * 4;
        for (var j = 0; j < pixels.width; j++) {
            if (pixels.data[idx + j * 4] !== 0) {
                // found top border
                top = i;
                break Top;
            }
        }
    }
    // Find bottom border
    Bottom: for (var i$1 = ch - 1; i$1 >= 0; i$1--) {
        var idx$1 = pixels.width * i$1 * 4;
        for (var j$1 = 0; j$1 < pixels.width; j$1++) {
            if (pixels.data[idx$1 + j$1 * 4] !== 0) {
                // found bottom border
                bottom = i$1;
                break Bottom;
            }
        }
    }
    return new ResourceWrap(new Range(top, bottom + 1 + top));
};
var RPFontHeight = function RPFontHeight(font) {
    this.font = font;
};

var prototypeAccessors$3 = { name: {},key: {} };
prototypeAccessors$3.name.get = function () { return "FontHeight"; };
prototypeAccessors$3.key.get = function () {
    return ("FontHeight_" + (this.font.fontstr()));
};

Object.defineProperties( RPFontHeight.prototype, prototypeAccessors$3 );

var GLTexture2D = (function (GLTexture$$1) {
    function GLTexture2D () {
        GLTexture$$1.apply(this, arguments);
    }

    if ( GLTexture$$1 ) GLTexture2D.__proto__ = GLTexture$$1;
    GLTexture2D.prototype = Object.create( GLTexture$$1 && GLTexture$$1.prototype );
    GLTexture2D.prototype.constructor = GLTexture2D;

    GLTexture2D.prototype.typeId = function typeId () {
        return TextureType.Texture2D;
    };
    GLTexture2D.prototype.typeQueryId = function typeQueryId () {
        return TextureQuery.Texture2D;
    };

    return GLTexture2D;
}(GLTexture));

// フォントテクスチャのうちの一行分
var FontLane = function FontLane(w) {
    this._width = w;
    this._cur = 0;
    this._map = {};
};
FontLane.prototype.get = function get (code, str, ctx, fw, fh, baseY, tex) {
    // 既に計算してあればそれを返す
    {
        var ret = this._map[code];
        if (ret)
            { return ret; }
    }
    // これ以上スペースが無ければnull
    if (this._cur + fw > this._width)
        { return null; }
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, fw, fh.to);
    ctx.fillStyle = "white";
    ctx.fillText(str, 0, 0);
    var dat = ctx.getImageData(0, fh.from, fw, fh.width());
    var data = dat.data;
    var u8data = new Uint8Array(fw * fh.width());
    for (var i = 0; i < u8data.length; i++) {
        u8data[i] = data[i * 4];
    }
    tex.setSubData(new Rect(this._cur, baseY + fh.width(), this._cur + fw, baseY), InterFormat.Alpha, TexDataFormat.UB, u8data);
    // キャッシュに格納
    var range = new Range(this._cur, this._cur + fw);
    this._map[code] = range;
    this._cur += fw;
    return range;
};
var FontCacheItem = function FontCacheItem(uvrect, width, height) {
    this.uvrect = uvrect;
    this.width = width;
    this.height = height;
};
// フォントテクスチャ一枚分(Lane複数)
var FontPlane = function FontPlane(w, h, laneH) {
    var this$1 = this;

    Assert(h >= laneH);
    this._laneH = laneH;
    // ビットマップを保持するテクスチャ
    var tex = new GLTexture2D();
    tex.setData(InterFormat.Alpha, w, h, InterFormat.Alpha, TexDataFormat.UB, undefined);
    tex.setLinear(true, true, 0);
    this.texture = tex;
    // hをlaneHの高さで埋められるだけのサイズ(FontLane)配列
    this._lane = [];
    var nLane = Math.floor(h / laneH);
    for (var i = 0; i < nLane; i++) {
        this$1._lane.push(new FontLane(w));
    }
    this._map = {};
};
FontPlane.prototype.get = function get (code, str, ctx, fw, fh) {
        var this$1 = this;

    // 既に計算してあればそれを返す
    {
        var ret = this._map[code];
        if (ret)
            { return ret; }
    }
    var tw = this.texture.size().width, th = this.texture.size().height;
    var len = this._lane.length;
    for (var i = 0; i < len; i++) {
        var lane = this$1._lane[i];
        var ret$1 = lane.get(code, str, ctx, fw, fh, i * fh.width(), this$1.texture);
        if (ret$1) {
            var rect = new Rect(ret$1.from, (i + 1) * this$1._laneH, ret$1.to, i * this$1._laneH);
            rect.left /= tw;
            rect.top /= th;
            rect.right /= tw;
            rect.bottom /= th;
            var fc = new FontCacheItem(rect, fw, fh);
            return this$1._map[code] = fc;
        }
    }
    // もう入り切るスペースが無ければnullを返す
    return null;
};
// フォントファミリと一体一で対応
var FontCache = function FontCache(_width, _height, _laneH) {
    this._width = _width;
    this._height = _height;
    this._laneH = _laneH;
    this._plane = [];
    // CharCode -> FontChar
    this._map = {};
    this._addNewPlane();
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
        if (ret$1)
            { return ret$1; }
    }
    var sstr = str.substr(idx, 1);
    var fw = Math.ceil(ctx.measureText(sstr).width) + 2;
    var ret;
    for (;;) {
        ret = this$1._plane.back().get(code, sstr, ctx, fw, fh);
        if (ret)
            { break; }
        this$1._addNewPlane();
    }
    // キャッシュに登録
    ret = {
        texture: this._plane.back().texture,
        uvrect: ret.uvrect,
        width: ret.width,
        height: ret.height,
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
    for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        switch (ch) {
            case "\n":
                ret.push({
                    chara: false,
                    char: ch,
                    code: str.charCodeAt(i)
                });
                break;
            default:
                ret.push(this$1._cache.get(str, i, ctx, fh));
        }
    }
    return ret;
};

var GLIBuffer = (function (GLBuffer$$1) {
    function GLIBuffer () {
        GLBuffer$$1.apply(this, arguments);
    }

    if ( GLBuffer$$1 ) GLIBuffer.__proto__ = GLBuffer$$1;
    GLIBuffer.prototype = Object.create( GLBuffer$$1 && GLBuffer$$1.prototype );
    GLIBuffer.prototype.constructor = GLIBuffer;

    GLIBuffer.prototype.typeId = function typeId () {
        return BufferType.Index;
    };
    GLIBuffer.prototype.typeQueryId = function typeQueryId () {
        return BufferQuery.Index;
    };

    return GLIBuffer;
}(GLBuffer));

var PlaneSingleDraw = function PlaneSingleDraw(src) {
    var vbP = new GLVBuffer();
    vbP.setVectorData(src.position, DrawType.Static, true);
    var vbU = new GLVBuffer();
    vbU.setVectorData(src.uv, DrawType.Static, true);
    var ib = new GLIBuffer();
    ib.setData(new Uint16Array(src.index), 1, DrawType.Static, true);
    var vbT = new GLVBuffer();
    vbT.setData(new Float32Array(src.time), 1, DrawType.Static, true);
    this.texture = src.texture;
    this.vbuffer = {
        a_position: vbP,
        a_uv: vbU,
        a_time: vbT,
    };
    this.ibuffer = ib;
    this.type = Primitive.Triangles;
};
PlaneSingleDraw.prototype.draw = function draw (offset, time, timeDelay, alpha) {
    var s = engine.size();
    engine.setUniforms({
        u_texture: this.texture,
        u_screenSize: new Vec2(s.width, s.height),
        u_offset: offset,
        u_time: time,
        u_alpha: alpha,
        u_delay: timeDelay
    });
    engine.drawGeometry(this);
};
var PlaneSingle = function PlaneSingle(tex) {
    this.texture = tex;
    this.position = [];
    this.uv = [];
    this.time = [];
    this.index = [];
    this._accumTime = 0; // 総時間
    var s = tex.size();
    this._tpix = new Vec2(0.5 / s.width, 0.5 / s.height);
};
PlaneSingle.prototype.add = function add (ofs, fc, t) {
    var fw = fc.width;
    var fh = fc.height;
    var idxBase = this.position.length;
    {
        var pos = this.position;
        pos.push(new Vec2(ofs.x + 0.5, ofs.y + fh.from + 0.5));
        pos.push(new Vec2(ofs.x + fw - 0.5, ofs.y + fh.from + 0.5));
        pos.push(new Vec2(ofs.x + 0.5, ofs.y + fh.to - 0.5));
        pos.push(new Vec2(ofs.x + fw - 0.5, ofs.y + fh.to - 0.5));
    }
    {
        // [xy=テクスチャuv, zw=ローカルUV]
        var uv = this.uv;
        var r = fc.uvrect;
        var tp = this._tpix;
        uv.push(new Vec4(r.left + tp.x, r.bottom + tp.y, 0, 1));
        uv.push(new Vec4(r.right - tp.x, r.bottom + tp.y, 1, 1));
        uv.push(new Vec4(r.left + tp.x, r.top - tp.y, 0, 0));
        uv.push(new Vec4(r.right - tp.x, r.top - tp.y, 1, 0));
    }
    {
        var time = this.time;
        for (var i = 0; i < 4; i++)
            { time.push(t); }
    }
    this.index = this.index.concat([
        idxBase + 0,
        idxBase + 1,
        idxBase + 3,
        idxBase + 0,
        idxBase + 3,
        idxBase + 2
    ]);
};
PlaneSingle.prototype.makeBuffer = function makeBuffer () {
    return new PlaneSingleDraw(this);
};
// 行毎に文字列を配置
function CharPlaceLines(fp, lineH, width) {
    var ret = [];
    var cur = 0;
    while (cur < fp.length) {
        var to = GetLine(fp, cur);
        if (cur !== to) {
            var fpL = CharPlace(fp, lineH, new Size(width, 512), cur, to);
            ret.push(fpL);
        }
        else {
            var empty = {
                length: 0,
                plane: [],
                inplace: true,
                resultSize: new Size(0, 0),
            };
            ret.push(empty);
        }
        cur = to + 1;
    }
    return ret;
}
// 指定された矩形に文字列を配置
function CharPlace(fp, lineH, size, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = fp.length;

    // {[texture]: PlaneSingle}
    var vi = new Map();
    var cur = new Vec2(0, 0);
    var nl = function () {
        cur.x = 0;
        cur.y += lineH;
        if (cur.y + lineH > size.height) {
            return false;
        }
        resultSize.height += lineH;
        return true;
    };
    var time = 0;
    // 実際に配置された矩形サイズ
    var resultSize = new Size(0, 0);
    // 引数の矩形に収まったかのフラグ
    var inPlace = true;
    Place: for (var i = from; i < to; i++) {
        var f = fp[i];
        if (f.chara) {
            // 通常の文字コード
            // 枠を越えるなら改行
            if (cur.x + f.width > size.width) {
                if (!nl()) {
                    inPlace = false;
                    break Place;
                }
            }
            var ps = (void 0);
            if (vi.has(f.texture))
                { ps = vi.get(f.texture); }
            else {
                ps = new PlaneSingle(f.texture);
                vi.set(f.texture, ps);
            }
            ps.add(cur, f, time++);
            cur.x += f.width;
            resultSize.width = Math.max(resultSize.width, cur.x);
        }
        else {
            // 制御文字
            switch (f.char) {
                case "\n":
                    // 改行
                    if (!nl()) {
                        inPlace = false;
                        break Place;
                    }
                    break;
            }
        }
    }
    resultSize.height += lineH;
    // 配列に詰め直し
    var plane = [];
    var itr = vi.entries();
    for (;;) {
        var ent = itr.next();
        if (ent.done)
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

var RefreshDep = function RefreshDep(depend, // 依存パラメータリスト(string)
    func, // キャッシュを更新する為の関数
    flag, // 該当フラグ値
    upperFlag, // パラメータを更新した場合にセットするフラグ値(後で計算)
    lowerFlag, // パラメータを更新した場合にクリアするフラグ値(後で計算)
    value // キャッシュに対応する任意の値
) {
    this.depend = depend;
    this.func = func;
    this.flag = flag;
    this.upperFlag = upperFlag;
    this.lowerFlag = lowerFlag;
    this.value = value; // キャッシュに対応する任意の値
};
var Refresh = function Refresh(def) {
    var this$1 = this;

    var flagCur = 0x01;
    this._entry = {};
    var len = def.length;
    var keys = Object.keys(def);
    keys.forEach(function (k) {
        var ent = def[k];
        this$1._entry[k] = new RefreshDep(ent ? ent.depend : null, ent ? ent.func : null, flagCur, 0, 0, null);
        Assert(flagCur <= 0x80000000);
        flagCur <<= 1;
    });
    // Depフラグ計算
    keys.forEach(function (k) {
        var ent = this$1._entry[k];
        ent.lowerFlag = this$1._calcLower(k, 0);
        Assert((ent.upperFlag & ent.lowerFlag) === 0);
        Assert((ent.flag & ent.lowerFlag) === ent.flag);
    });
    this.reset();
};
Refresh.prototype._calcLower = function _calcLower (k, upper) {
        var this$1 = this;

    var ent = this._entry[k];
    ent.upperFlag |= upper;
    var flag = ent.flag;
    if (ent.depend) {
        for (var i = 0; i < ent.depend.length; i++) {
            flag |= this$1._calcLower(ent.depend[i], upper | ent.flag);
        }
    }
    return flag;
};
Refresh.prototype.reset = function reset () {
    this._reflag = ~0;
};
Refresh.prototype.setFuncs = function setFuncs (funcs) {
        var this$1 = this;

    var keys = Object.keys(funcs);
    keys.forEach(function (k) {
        this$1.setFunc(k, funcs[k]);
    });
};
// 更新関数の上書き
Refresh.prototype.setFunc = function setFunc (key, func) {
    var ent = this._entry[key];
    Assert(Boolean(ent));
    ent.func = func;
    this._reflag |= ent.upperFlag | ent.flag;
};
Refresh.prototype.set = function set (key, value) {
    var ent = this._entry[key];
    ent.value = value;
    // 該当フラグをクリア
    this._reflag &= ~ent.lowerFlag;
    this._reflag |= ent.upperFlag;
};
Refresh.prototype.ref = function ref (key) {
    var ent = this._entry[key];
    // 該当フラグをクリア
    this._reflag &= ~ent.lowerFlag;
    this._reflag |= ent.upperFlag;
    return ent.value;
};
Refresh.prototype.get = function get (key) {
    var ent = this._entry[key];
    if (this._reflag & ent.flag && ent.func) {
        // 更新関数を呼び出す
        ent.value = ent.func(ent.value);
        // 更新された変数のフラグはクリア
        this._reflag &= ~ent.flag;
    }
    return ent.value;
};

ResourceGenSrc.TextRect = function (rp) {
    var buff = {
        vbuffer: {
            a_position: new GLVBuffer(),
            a_uv: new GLVBuffer()
        },
        ibuffer: new GLIBuffer(),
        type: Primitive.Triangles
    };
    buff.vbuffer.a_position.setVectorData([
        new Vec2(0, 0),
        new Vec2(0, 1),
        new Vec2(1, 1),
        new Vec2(1, 0)
    ], DrawType.Static, true);
    buff.vbuffer.a_uv.setVectorData([
        new Vec2(0, 0),
        new Vec2(0, 1),
        new Vec2(1, 1),
        new Vec2(1, 0)
    ], DrawType.Static, true);
    buff.ibuffer.setData(new Uint16Array([0, 1, 2, 2, 3, 0]), 1, DrawType.Static, true);
    return new ResourceWrap(buff);
};

var Tag = function Tag () {};
Tag.Font = "font";
Tag.Text = "text";
Tag.Size = "size";
Tag.FontHeight = "fontheight";
Tag.FontGen = "fontgen";
Tag.FontPlane = "fontplane";
Tag.Length = "length";
Tag.ResultSize = "resultsize";
// スクリーン上に配置するテキスト
/*
    [shader requirements]
    attribute {
        vec2 a_position;
        vec4 a_uv;
        float a_time;
    }
    uniform {
        float u_time;
        float u_alpha;
        float u_delay;
        vec2 u_offset;
        vec2 u_screenSize;
        sampler2D u_texture;
    }
*/
var Text = function Text() {
    var this$1 = this;

    this._rf = new Refresh(( obj = {}, obj[Tag.Font] = null, obj[Tag.Text] = null, obj[Tag.Size] = null, obj[Tag.FontHeight] = {
            depend: [Tag.Font],
            func: function (prev) {
                return ResourceGen.get(new RPFontHeight(this$1.font())).data;
            }
        }, obj[Tag.FontGen] = {
            depend: [Tag.FontHeight],
            func: function (prev) {
                var fh = this$1.fontHeight();
                return new FontGen(512, 512, fh.width());
            }
        }, obj[Tag.FontPlane] = {
            depend: [Tag.FontHeight, Tag.FontGen, Tag.Text, Tag.Size],
            func: function (prev) {
                var fa = this$1._makeFontA();
                return CharPlace(fa.fontA, fa.fh.to, this$1.size());
            }
        }, obj[Tag.Length] = {
            depend: [Tag.FontPlane],
            func: function (prev) {
                return this$1.fontplane().length;
            }
        }, obj[Tag.ResultSize] = {
            depend: [Tag.FontPlane],
            func: function (prev) {
                return this$1.fontplane().resultSize;
            }
        }, obj ));
    var obj;
    this.setFont(new Font("arial", "30pt", "100", false));
    this.setText("DefaultText");
    this.setSize(new Size(512, 512));
};
Text.prototype.setFont = function setFont (f) { this._rf.set(Tag.Font, f); };
Text.prototype.setText = function setText (t) { this._rf.set(Tag.Text, t); };
Text.prototype.setSize = function setSize (r) { this._rf.set(Tag.Size, r); };
Text.prototype.font = function font () { return this._rf.get(Tag.Font); };
Text.prototype.text = function text () { return this._rf.get(Tag.Text); };
Text.prototype.size = function size () { return this._rf.get(Tag.Size); };
Text.prototype.fontplane = function fontplane () { return this._rf.get(Tag.FontPlane); };
Text.prototype.length = function length () { return this.fontplane().length; };
Text.prototype.resultSize = function resultSize () { return this._rf.get(Tag.ResultSize); };
Text.prototype.fontHeight = function fontHeight () { return this._rf.get(Tag.FontHeight); };
Text.prototype.fontGen = function fontGen () { return this._rf.get(Tag.FontGen); };
Text.prototype._makeFontA = function _makeFontA () {
    var fh = this.fontHeight();
    var gen = this.fontGen();
    var ctx = ResourceGen.get(new RP_FontCtx("fontcanvas"));
    ctx.data.font = this.font().fontstr();
    return {
        fontA: gen.get(this.text(), ctx.data, fh),
        fh: fh
    };
};
Text.prototype.draw = function draw (offset, time, timeDelay, alpha) {
    var plane = this.fontplane().plane;
    for (var i = 0; i < plane.length; i++) {
        plane[i].draw(offset, time, timeDelay, alpha);
    }
};

Text.Tag = Tag;

var XHRLoader = function XHRLoader(url, type) {
    var this$1 = this;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = type;
    xhr.onprogress = function (e) {
        if (e.lengthComputable) {
            this$1._cb.progress(e.loaded, e.total);
            this$1._loaded = e.loaded;
            this$1._total = e.total;
        }
    };
    xhr.onload = function () {
        var xhr = this$1._xhr;
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                this$1._status = "complete";
                this$1._cb.progress((this$1._loaded >= 0) ? this$1._total : 0, this$1._total);
                this$1._cb.completed();
            }
            else {
                this$1._status = "error";
                this$1._errormsg = xhr.statusText;
                this$1._cb.error();
            }
        }
    };
    xhr.ontimeout = function (e) {
        this$1._errormsg = "timeout";
        this$1._cb.error();
    };
    xhr.onerror = function () {
        this$1._errormsg = "unknown error";
        this$1._cb.error();
    };
    this._status = "idle";
    this._xhr = xhr;
};
XHRLoader.prototype.begin = function begin (callback, timeout) {
    this._cb = callback;
    this._status = "loading";
    this._xhr.timeout = timeout;
    this._loaded = 0;
    this._total = 0;
    callback.progress(this._loaded, this._total);
    this._xhr.send(null);
};
XHRLoader.prototype.abort = function abort () {
    this._status = "abort";
    this._xhr.abort();
};
XHRLoader.prototype.errormsg = function errormsg () {
    return this._errormsg;
};
XHRLoader.prototype.status = function status () {
    return this._status;
};
XHRLoader.prototype.result = function result () {
    return this._xhr.response;
};

ResourceExtToType.def = "JSON";
ResourceInfo.JSON = {
    makeLoader: function (url) {
        return new XHRLoader(url, "json");
    },
    makeResource: function (src) {
        return new ResourceWrap(src);
    }
};

var ShaderError = (function (Error) {
    function ShaderError(id) {
        Error.call(this, "\n"
            + PaddingString(32, "-")
            + AddLineNumber(gl.getShaderSource(id), 1, 0, true, false)
            + PaddingString(32, "-")
            + "\n"
            + gl.getShaderInfoLog(id)
            + "\n");
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
var GLShader = function GLShader(src) {
    this._rf = new GLResourceFlag();
    this._id = null;
    this._source = src;
    glres.add(this);
};
GLShader.prototype.id = function id () {
    return this._id;
};
// --------------- from GLContext ---------------
GLShader.prototype.onContextLost = function onContextLost () {
        var this$1 = this;

    this._rf.onContextLost(function () {
        gl.deleteShader(this$1._id);
        this$1._id = null;
    });
};
GLShader.prototype.onContextRestored = function onContextRestored () {
        var this$1 = this;

    this._rf.onContextRestored(function () {
        // シェーダーを読み込んでコンパイル
        var id = gl.createShader(GLConst.ShaderTypeC.convert(this$1.typeId()));
        gl.shaderSource(id, this$1._source);
        gl.compileShader(id);
        if (gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
            this$1._id = id;
        }
        else {
            throw new ShaderError(id);
        }
    });
};
GLShader.prototype.contextLost = function contextLost () {
    return this._rf.contextLost();
};
// --------------- from Discardable ---------------
GLShader.prototype.isDiscarded = function isDiscarded () {
    return this._rf.isDiscarded();
};
GLShader.prototype.discard = function discard () {
    this.onContextLost();
    this._rf.discard();
};

var GLVShader = (function (GLShader$$1) {
    function GLVShader () {
        GLShader$$1.apply(this, arguments);
    }

    if ( GLShader$$1 ) GLVShader.__proto__ = GLShader$$1;
    GLVShader.prototype = Object.create( GLShader$$1 && GLShader$$1.prototype );
    GLVShader.prototype.constructor = GLVShader;

    GLVShader.prototype.typeId = function typeId () {
        return ShaderType.Vertex;
    };

    return GLVShader;
}(GLShader));

var GLFShader = (function (GLShader$$1) {
    function GLFShader () {
        GLShader$$1.apply(this, arguments);
    }

    if ( GLShader$$1 ) GLFShader.__proto__ = GLShader$$1;
    GLFShader.prototype = Object.create( GLShader$$1 && GLShader$$1.prototype );
    GLFShader.prototype.constructor = GLFShader;

    GLFShader.prototype.typeId = function typeId () {
        return ShaderType.Fragment;
    };

    return GLFShader;
}(GLShader));

ResourceExtToType.vsh = "VertexShader";
ResourceExtToType.fsh = "FragmentShader";
ResourceInfo.VertexShader = {
    makeLoader: function (url) {
        return new XHRLoader(url, "text");
    },
    makeResource: function (src) {
        return new GLVShader(src);
    }
};
ResourceInfo.FragmentShader = {
    makeLoader: function (url) {
        return new XHRLoader(url, "text");
    },
    makeResource: function (src) {
        return new GLFShader(src);
    }
};

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
var GLProgram = function GLProgram(vs, fs) {
    this._rf = new GLResourceFlag();
    this._id = null;
    this._bBind = false;
    this._vs = vs;
    this._fs = fs;
    glres.add(this);
};
GLProgram.prototype.id = function id () {
    return this._id;
};
GLProgram.prototype.hasUniform = function hasUniform (name) {
    return this._uniform[name] !== undefined;
};
/*!
    \param[in] value	[matrix...] or [vector...] or matrix or vector or float or int
*/
GLProgram.prototype.setUniform = function setUniform (name, value) {
    var u = this._uniform[name];
    if (u) {
        Assert(!(value instanceof Array));
        var f = u.type.uniformF;
        var fa = u.type.uniformAF;
        // matrix or vector or float or int
        if (IsMatrix(value))
            { fa.call(gl, u.index, false, value.value); }
        else if (IsVector(value))
            { fa.call(gl, u.index, value.value); }
        else
            { f.call(gl, u.index, value); }
        return;
    }
    u = this._uniform[name + "[0]"];
    if (u) {
        Assert(value instanceof Array);
        var fa$1 = u.type.uniformAF;
        if (IsVM(value[0])) {
            // [matrix...] or [vector...]
            var ar = value;
            fa$1.call(gl, u.index, VMToArray(ar));
        }
        else {
            fa$1.call(gl, u.index, value);
        }
    }
};
/*!
    \param[in] data	[vector...] or GLVBuffer
*/
GLProgram.prototype.setVStream = function setVStream (name, data) {
    var a = this._attribute[name];
    if (a) {
        if (data instanceof Array) {
            // [vector...]
            a.type.vertexF(a.index, VectorToArray.apply(void 0, data));
        }
        else {
            var data2 = data;
            // GLVBuffer
            data2.proc(function () {
                gl.enableVertexAttribArray(a.index);
                var info = data2.typeinfo();
                gl.vertexAttribPointer(a.index, data2.dim(), info.id, false, info.bytesize * data2.dim(), 0);
            });
        }
        return a.index;
    }
};
// ------------- from Bindable -------------
GLProgram.prototype.bind = function bind () {
    Assert(!this.isDiscarded(), "already discarded");
    Assert(!this._bBind, "already binded");
    gl.useProgram(this.id());
    this._bBind = true;
};
GLProgram.prototype.unbind = function unbind (id) {
        if ( id === void 0 ) id = null;

    Assert(this._bBind, "not binding anywhere");
    gl.useProgram(id);
    this._bBind = false;
};
GLProgram.prototype.proc = function proc (cb) {
    if (this.contextLost())
        { return; }
    var prev = gl.getParameter(gl.CURRENT_PROGRAM);
    this.bind();
    cb();
    this.unbind(prev);
};
// ------------- from Discardable -------------
GLProgram.prototype.discard = function discard () {
    Assert(!this._bBind);
    this.onContextLost();
    this._rf.discard();
};
GLProgram.prototype.isDiscarded = function isDiscarded () {
    return this._rf.isDiscarded();
};
// ------------- from GLContext -------------
GLProgram.prototype.onContextLost = function onContextLost () {
        var this$1 = this;

    this._rf.onContextLost(function () {
        gl.deleteProgram(this$1.id());
        this$1._id = null;
    });
};
GLProgram.prototype.onContextRestored = function onContextRestored () {
        var this$1 = this;

    this._rf.onContextRestored(function () {
        if (this$1._vs.contextLost())
            { this$1._vs.onContextRestored(); }
        if (this$1._fs.contextLost())
            { this$1._fs.onContextRestored(); }
        var prog = gl.createProgram();
        gl.attachShader(prog, this$1._vs.id());
        gl.attachShader(prog, this$1._fs.id());
        gl.linkProgram(prog);
        if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            this$1._id = prog;
        }
        else
            { throw new ProgramError(prog); }
        {
            var attr = {};
            var nAtt = gl.getProgramParameter(prog, gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < nAtt; i++) {
                var a = gl.getActiveAttrib(prog, i);
                var typ = GLConst.GLSLTypeInfo[a.type];
                attr[a.name] = {
                    index: gl.getAttribLocation(prog, a.name),
                    size: a.size,
                    type: typ
                };
                Assert(attr[a.name].type !== undefined);
            }
            this$1._attribute = attr;
        }
        {
            var unif = {};
            var nUnif = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
            for (var i$1 = 0; i$1 < nUnif; i$1++) {
                var u = gl.getActiveUniform(prog, i$1);
                unif[u.name] = {
                    index: gl.getUniformLocation(prog, u.name),
                    size: u.size,
                    type: GLConst.GLSLTypeInfo[u.type]
                };
                Assert(unif[u.name].type !== undefined);
            }
            this$1._uniform = unif;
        }
    });
};
GLProgram.prototype.contextLost = function contextLost () {
    return this._rf.contextLost();
};

function ToLowercaseKeys(ar) {
    var ret = {};
    Object.keys(ar).forEach(function (k) {
        var val = ar[k];
        if (typeof val === "string")
            { val = val.toLowerCase(); }
        else if (val instanceof Array) {
            for (var i = 0; i < val.length; i++) {
                if (typeof val[i] === "string")
                    { val[i] = val[i].toLowerCase(); }
            }
        }
        ret[k.toLowerCase()] = val;
    });
    return ret;
}
var GLValueSet = function GLValueSet () {};

GLValueSet.FromJSON = function FromJSON (js) {
    var ret = new GLValueSet();
    var bs = js.boolset;
    var bsf = {};
    for (var i = 0; i < bs.length; i++) {
        bsf[bs[i]] = true;
    }
    ret._boolset = ToLowercaseKeys(bsf);
    ret._valueset = ToLowercaseKeys(js.valueset);
    return ret;
};
GLValueSet.prototype.enable = function enable (name) {
    this._boolset[name] = true;
};
GLValueSet.prototype.disable = function disable (name) {
    delete this._boolset[name];
};
GLValueSet.prototype.apply = function apply () {
        var this$1 = this;

    // boolset
    for (var i = 0; i < BoolString.length; i++) {
        var key = BoolString[i];
        var func = (this$1._boolset[key] === true) ? gl.enable : gl.disable;
        func.call(gl, GLConst.BoolSettingC.convert(i + 34359738368 /* Num */));
    }
    // valueset
    for (var k in this$1._valueset) {
        var args = this$1._valueset[k];
        var func$1 = GLConst.ValueSetting[k];
        if (args instanceof Array)
            { func$1.call(gl, args[0], args[1], args[2], args[3]); }
        else
            { func$1.call(gl, args); }
    }
};

/// <reference path="arrayfunc.ts" />
var Technique = (function (ResourceWrap$$1) {
    function Technique(src) {
        ResourceWrap$$1.call(this, null);
        // 必要なリソースが揃っているかのチェック
        var later = this._checkResource(src);
        if (!later.empty())
            { throw new (Function.prototype.bind.apply( MoreResource, [ null ].concat( later) )); }
        // 実際のローディング
        this._loadResource(src);
    }

    if ( ResourceWrap$$1 ) Technique.__proto__ = ResourceWrap$$1;
    Technique.prototype = Object.create( ResourceWrap$$1 && ResourceWrap$$1.prototype );
    Technique.prototype.constructor = Technique;
    Technique.prototype._checkResource = function _checkResource (src) {
        var later = [];
        Object.keys(src.technique).forEach(function (k) {
            var v = src.technique[k];
            var chk = function (key) {
                if (!resource.checkResource(key))
                    { later.push(key); }
            };
            if (v.valueset instanceof Object) {
                Assert(v.boolset instanceof Object);
            }
            else
                { chk(v.valueset); }
            chk(v.vshader);
            chk(v.fshader);
        });
        return later;
    };
    Technique.prototype._loadResource = function _loadResource (src) {
        var tech = {};
        Object.keys(src.technique).forEach(function (k) {
            var v = src.technique[k];
            var vs;
            if (v.valueset instanceof Object) {
                vs = GLValueSet.FromJSON({
                    boolset: v.boolset,
                    valueset: v.valueset
                });
            }
            else {
                vs = GLValueSet.FromJSON(resource.getResource(v.valueset).data);
            }
            tech[k] = {
                valueset: vs,
                program: new GLProgram(resource.getResource(v.vshader), resource.getResource(v.fshader))
            };
        });
        this._tech = tech;
    };

    Technique.prototype.technique = function technique () {
        return this._tech;
    };

    return Technique;
}(ResourceWrap));

ResourceExtToType.prog = "Technique";
ResourceInfo.Technique = {
    makeLoader: function (url) {
        return new XHRLoader(url, "json");
    },
    makeResource: function (src) {
        return new Technique(src);
    }
};

var ImageLoader = (function (XHRLoader$$1) {
    function ImageLoader(url) {
        XHRLoader$$1.call(this, url, "blob");
    }

    if ( XHRLoader$$1 ) ImageLoader.__proto__ = XHRLoader$$1;
    ImageLoader.prototype = Object.create( XHRLoader$$1 && XHRLoader$$1.prototype );
    ImageLoader.prototype.constructor = ImageLoader;
    ImageLoader.prototype.begin = function begin (callback, timeout) {
        var this$1 = this;

        XHRLoader$$1.prototype.begin.call(this, {
            completed: function () {
                var img = new Image();
                this$1._img = img;
                img.src = window.URL.createObjectURL(XHRLoader$$1.prototype.result.call(this$1));
                img.onload = function () {
                    callback.completed();
                };
            },
            error: callback.error,
            progress: callback.progress
        }, timeout);
    };
    ImageLoader.prototype.result = function result () {
        return this._img;
    };

    return ImageLoader;
}(XHRLoader));

ResourceExtToType.png = "Image";
ResourceExtToType.jpg = "Image";
ResourceInfo.Image = {
    makeLoader: function (url) {
        return new ImageLoader(url);
    },
    makeResource: function (src) {
        var tex = new GLTexture2D();
        tex.setImage(InterFormat.RGBA, InterFormat.RGBA, TexDataFormat.UB, src);
        return tex;
    }
};

var LinearTimer = function LinearTimer(init, end) {
    this.cur = 0;
    this.range = new Range(0, 0);
    this.range.from = init;
    this.range.to = end;
};
LinearTimer.prototype.reset = function reset () {
    this.cur = this.range.from;
};
LinearTimer.prototype.get = function get () {
    return this.cur;
};
LinearTimer.prototype.advance = function advance (dt) {
    if (this.cur >= this.range.to) {
        return true;
    }
    this.cur += dt;
    return false;
};

var TextDraw = (function (DObject$$1) {
    function TextDraw(text, delay) {
        DObject$$1.call(this, "text");
        this._text = text;
        this.timer = new LinearTimer(0, text.length() + delay);
        this.offset = new Vec2(0, 0);
        this.alpha = 1;
        this.delay = delay;
    }

    if ( DObject$$1 ) TextDraw.__proto__ = DObject$$1;
    TextDraw.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    TextDraw.prototype.constructor = TextDraw;
    TextDraw.prototype.advance = function advance (dt) {
        return this.timer.advance(dt);
    };
    TextDraw.prototype.onDraw = function onDraw () {
        this._text.draw(this.offset, this.timer.get(), this.delay, this.alpha);
    };

    return TextDraw;
}(DObject));

var TextLines = (function (Text$$1) {
    function TextLines(lineDelay) {
        var this$1 = this;

        Text$$1.call(this);
        // 行ディレイ(1行毎に何秒遅らせるか)
        this.lineDelay = 0;
        this._rf.setFuncs(( obj = {}, obj[Text$$1.Tag.ResultSize] = function (prev) {
                var fp = this$1._rf.get(Text$$1.Tag.FontPlane);
                var ret = new Size(0, 0);
                for (var i = 0; i < fp.length; i++) {
                    ret.width = Math.max(ret.width, fp[i].resultSize.width);
                    ret.height += this$1.fontHeight().to;
                }
                return ret;
            }, obj[Text$$1.Tag.FontPlane] = function (prev) {
                var fa = Text$$1.prototype._makeFontA.call(this$1);
                return CharPlaceLines(fa.fontA, fa.fh.to, this$1.size().width);
            }, obj ));
        var obj;
        this.lineDelay = lineDelay;
    }

    if ( Text$$1 ) TextLines.__proto__ = Text$$1;
    TextLines.prototype = Object.create( Text$$1 && Text$$1.prototype );
    TextLines.prototype.constructor = TextLines;
    TextLines.prototype.length = function length () {
        var this$1 = this;

        var fps = this._rf.get(Text$$1.Tag.FontPlane);
        if (fps.length === 0)
            { return 0; }
        var len = 0;
        for (var i = 0; i < fps.length; i++) {
            len = Math.max(len, fps[i].length + this$1.lineDelay * i);
        }
        return len;
    };
    TextLines.prototype.draw = function draw (offset, time, timeDelay, alpha) {
        var this$1 = this;

        var fh = this.fontHeight();
        var ps = this._rf.get(Text$$1.Tag.FontPlane);
        offset = offset.clone();
        for (var k = 0; k < ps.length; k++) {
            var plane = ps[k].plane;
            for (var i = 0; i < plane.length; i++) {
                plane[i].draw(offset, time, timeDelay, alpha);
                time -= this$1.lineDelay;
            }
            offset.y += fh.to;
        }
    };

    return TextLines;
}(Text));

// 常に2の乗数サイズで確保されるテクスチャ
var GLTexture2DP = (function (GLTexture2D$$1) {
    function GLTexture2DP() {
        GLTexture2D$$1.apply(this, arguments);
        this._psize = new Size(0, 0);
    }

    if ( GLTexture2D$$1 ) GLTexture2DP.__proto__ = GLTexture2D$$1;
    GLTexture2DP.prototype = Object.create( GLTexture2D$$1 && GLTexture2D$$1.prototype );
    GLTexture2DP.prototype.constructor = GLTexture2DP;
    GLTexture2DP.prototype.setData = function setData (fmt, width, height, srcFmt, srcFmtType, pixels) {
        var pw = GetPowValue(width), ph = GetPowValue(height);
        this._psize = new Size(width, height);
        GLTexture2D$$1.prototype.setData.call(this, fmt, pw, ph, srcFmt, srcFmtType, pixels);
    };
    GLTexture2DP.prototype.uvrect = function uvrect () {
        var ps = this.size();
        var ts = this.truesize();
        return new Rect(0, ps.height / ts.height, ps.width / ts.width, 0);
    };
    GLTexture2DP.prototype.size = function size () {
        return this._psize;
    };
    GLTexture2DP.prototype.truesize = function truesize () {
        return GLTexture2D$$1.prototype.size.call(this);
    };

    return GLTexture2DP;
}(GLTexture2D));

var GLRenderbuffer = function GLRenderbuffer() {
    this._rf = new GLResourceFlag();
    this._bBind = false;
    this._size = new Size(0, 0);
    glres.add(this);
};
GLRenderbuffer.prototype.size = function size () {
    return this._size;
};
GLRenderbuffer.prototype.format = function format () {
    return this._format;
};
GLRenderbuffer.prototype.id = function id () {
    return this._id;
};
GLRenderbuffer.prototype.allocate = function allocate (fmt, w, h) {
    var assign;
        (assign = [fmt, w, h], this._format = assign[0], this._size.width = assign[1], this._size.height = assign[2]);
    this.proc(function () {
        gl.renderbufferStorage(gl.RENDERBUFFER, GLConst.RBFormatC.convert(fmt), w, h);
    });
};
// ------------- from Discardable -------------
GLRenderbuffer.prototype.discard = function discard () {
    Assert(!this._bBind, "still binding somewhere");
    this.onContextLost();
    this._rf.discard();
};
GLRenderbuffer.prototype.isDiscarded = function isDiscarded () {
    return this._rf.isDiscarded();
};
// ------------- from Bindable -------------
GLRenderbuffer.prototype.bind = function bind () {
    Assert(!this.isDiscarded(), "already discarded");
    Assert(!this._bBind, "already binded");
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.id());
    this._bBind = true;
};
GLRenderbuffer.prototype.unbind = function unbind (id) {
        if ( id === void 0 ) id = null;

    Assert(this._bBind, "not binded yet");
    gl.bindRenderbuffer(gl.RENDERBUFFER, id);
    this._bBind = false;
};
GLRenderbuffer.prototype.proc = function proc (cb) {
    if (this.contextLost())
        { return; }
    var prev = gl.getParameter(gl.RENDERBUFFER_BINDING);
    this.bind();
    cb();
    this.unbind(prev);
};
// ------------- from GLContext -------------
GLRenderbuffer.prototype.onContextLost = function onContextLost () {
        var this$1 = this;

    this._rf.onContextLost(function () {
        gl.deleteRenderbuffer(this$1.id());
        this$1._id = null;
    });
};
GLRenderbuffer.prototype.onContextRestored = function onContextRestored () {
        var this$1 = this;

    this._rf.onContextRestored(function () {
        this$1._id = gl.createRenderbuffer();
        if (this$1._format)
            { this$1.allocate(this$1._format, this$1._size.width, this$1._size.height); }
    });
};
GLRenderbuffer.prototype.contextLost = function contextLost () {
    return this._rf.contextLost();
};

// 割合による矩形指定
var VPRatio = function VPRatio(rect) {
    this.rect = rect;
};
VPRatio.prototype.getPixelRect = function getPixelRect (s) {
    return this.rect.mul(new Vec2(s.width, s.height));
};
// ピクセルによる矩形指定
var VPPixel = function VPPixel(rect) {
    this.rect = rect;
};
VPPixel.prototype.getPixelRect = function getPixelRect (s) {
    return this.rect;
};
var GLFramebuffer = function GLFramebuffer() {
    var this$1 = this;

    this._rf = new GLResourceFlag();
    this._id = null;
    this._bBind = false;
    this._attachment = [];
    glres.add(this);
    for (var i = 0; i < GLConst.AttachmentC.length(); i++)
        { this$1._attachment[i] = null; }
    this.setVPByRatio(new Rect(0, 1, 1, 0));
};
GLFramebuffer.prototype._applyAttachment = function _applyAttachment (pos) {
    var buff = this._attachment[pos];
    var pos_gl = GLConst.AttachmentC.convert(pos);
    if (buff instanceof GLRenderbuffer) {
        buff.onContextRestored();
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, pos_gl, gl.RENDERBUFFER, buff.id());
    }
    else if (buff instanceof GLTexture2D) {
        buff.onContextRestored();
        gl.framebufferTexture2D(gl.FRAMEBUFFER, pos_gl, gl.TEXTURE_2D, buff.id(), 0);
    }
};
GLFramebuffer.prototype.setVPByPixel = function setVPByPixel (r) {
    this._vpset = new VPPixel(r);
};
GLFramebuffer.prototype.setVPByRatio = function setVPByRatio (r) {
    this._vpset = new VPRatio(r);
};
GLFramebuffer.prototype.id = function id () {
    return this._id;
};
GLFramebuffer.prototype.status = function status () {
    var statusStr = {};
        statusStr[gl.FRAMEBUFFER_COMPLETE] = "complete";
        statusStr[gl.FRAMEBUFFER_UNSUPPORTED] = "unsupported";
        statusStr[gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT] = "incomplete_attachment";
        statusStr[gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS] = "incomplete_dimensions";
        statusStr[gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT] = "incomplete_missing_attachment";
    var result = "";
    this.proc(function () {
        result = statusStr[gl.checkFramebufferStatus(gl.FRAMEBUFFER)];
    });
    return result;
};
GLFramebuffer.prototype.attach = function attach (pos, buff) {
        var this$1 = this;

    this._attachment[pos] = buff;
    this.proc(function () {
        this$1._applyAttachment(pos);
    });
};
GLFramebuffer.prototype.getAttachment = function getAttachment (pos) {
    return this._attachment[pos];
};
GLFramebuffer.prototype.clear = function clear (pos) {
        var this$1 = this;

    this._attachment[pos] = null;
    this.proc(function () {
        this$1._applyAttachment(pos);
    });
};
GLFramebuffer.prototype._setViewport = function _setViewport (r) {
    gl.viewport(r.left, r.bottom, r.width(), r.height());
};
GLFramebuffer.prototype._getViewport = function _getViewport () {
    var vpA = gl.getParameter(gl.VIEWPORT);
    return new Rect(vpA[0], vpA[1] + vpA[3], vpA[0] + vpA[2], vpA[1]);
};
GLFramebuffer.prototype.vp_proc = function vp_proc (cb) {
        var this$1 = this;

    this.proc(function () {
        // 前のビューポートを保存しておく
        var prev = this$1._getViewport();
        {
            var r = this$1.getAttachment(Attachment.Color0);
            var vp = this$1._vpset.getPixelRect(r.size());
            this$1._setViewport(vp);
            cb();
        }
        // 前のビューポートを復元
        this$1._setViewport(prev);
    });
};
// ---------------- from Binable ----------------
GLFramebuffer.prototype.bind = function bind () {
    Assert(!this.isDiscarded(), "already discarded");
    Assert(!this._bBind, "already binded");
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.id());
    this._bBind = true;
};
GLFramebuffer.prototype.unbind = function unbind (id) {
        if ( id === void 0 ) id = null;

    Assert(!this.isDiscarded(), "already discarded");
    Assert(this._bBind, "not binded yet");
    gl.bindFramebuffer(gl.FRAMEBUFFER, id);
    this._bBind = false;
};
GLFramebuffer.prototype.proc = function proc (cb) {
    if (this.contextLost())
        { return; }
    var prev = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    this.bind();
    cb();
    this.unbind(prev);
};
// ---------------- from Discardable ----------------
GLFramebuffer.prototype.isDiscarded = function isDiscarded () {
    return this._rf.isDiscarded();
};
GLFramebuffer.prototype.discard = function discard () {
    Assert(!this._bBind, "still binding somewhere");
    this.onContextLost();
    this._rf.discard();
};
// ---------------- from GLContext ----------------
GLFramebuffer.prototype.onContextLost = function onContextLost () {
        var this$1 = this;

    this._rf.onContextLost(function () {
        Assert(!this$1._bBind);
        gl.deleteFramebuffer(this$1._id);
        this$1._id = null;
    });
};
GLFramebuffer.prototype.onContextRestored = function onContextRestored () {
        var this$1 = this;

    this._rf.onContextRestored(function () {
        Assert(!this$1._bBind);
        this$1._id = gl.createFramebuffer();
        this$1.proc(function () {
            for (var i = 0; i < GLConst.AttachmentC.length(); i++) {
                this$1._applyAttachment(GLConst.AttachmentC.indexToEnum(i));
            }
        });
    });
};
GLFramebuffer.prototype.contextLost = function contextLost () {
    return this._rf.contextLost();
};

var FBSwitch = (function (DObject$$1) {
    function FBSwitch(buffer) {
        DObject$$1.call(this, null);
        this.buffer = buffer;
    }

    if ( DObject$$1 ) FBSwitch.__proto__ = DObject$$1;
    FBSwitch.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    FBSwitch.prototype.constructor = FBSwitch;
    FBSwitch.prototype.onDraw = function onDraw () {
        var this$1 = this;

        if (this.buffer.getAttachment(Attachment.Color0)) {
            this.buffer.vp_proc(function () {
                this$1.lower.onDraw();
            });
        }
    };

    return FBSwitch;
}(DObject));

var DataSwitch = function DataSwitch(data0, data1) {
    this._data = [];
    this._sw = 0;
    this._data[0] = data0;
    this._data[1] = data1;
};
DataSwitch.prototype.current = function current () {
    return this._data[this._sw];
};
DataSwitch.prototype.prev = function prev () {
    return this._data[this._sw ^ 1];
};
DataSwitch.prototype.swap = function swap () {
    this._sw ^= 1;
};

var RPString = function RPString(name) {
    this.name = name;
};

var prototypeAccessors$4 = { key: {} };
prototypeAccessors$4.key.get = function () { return this.name; };

Object.defineProperties( RPString.prototype, prototypeAccessors$4 );

function MakeRect(ofs, sc, uvnum) {
    return {
        vertex: [
            new Vec2(0, 0).addSelf(ofs),
            new Vec2(0, sc.y).addSelf(ofs),
            new Vec2(sc.x, sc.y).addSelf(ofs),
            new Vec2(sc.x, 0).addSelf(ofs)
        ],
        uv: [
            new Vec2(uvnum.x, uvnum.x),
            new Vec2(uvnum.x, uvnum.y),
            new Vec2(uvnum.y, uvnum.y),
            new Vec2(uvnum.y, uvnum.x)
        ],
        index: [
            0, 1, 2, 2, 3, 0
        ]
    };
}
function MakeRectVI(ofs, sc, uvnum) {
    var buff = {
        vbuffer: {
            a_position: new GLVBuffer(),
            a_uv: new GLVBuffer()
        },
        ibuffer: new GLIBuffer(),
        type: Primitive.Triangles
    };
    var rect = MakeRect(ofs, sc, uvnum);
    buff.vbuffer.a_position.setVectorData(rect.vertex, DrawType.Static, true);
    buff.vbuffer.a_uv.setVectorData(rect.uv, DrawType.Static, true);
    buff.ibuffer.setData(new Uint16Array(rect.index), 1, DrawType.Static, true);
    return buff;
}
ResourceGenSrc.Rect05 = function (rp) {
    return new ResourceWrap(MakeRectVI(new Vec2(-0.5, -0.5), new Vec2(1), new Vec2(0, 1)));
};
ResourceGenSrc.Rect01 = function (rp) {
    return new ResourceWrap(MakeRectVI(new Vec2(-1), new Vec2(2), new Vec2(0, 1)));
};
ResourceGenSrc.Rect01_01 = function (rp) {
    return new ResourceWrap(MakeRectVI(new Vec2(-1), new Vec2(2), new Vec2(-1, 1)));
};
ResourceGenSrc.Trihedron = function () {
    var buff = {
        vbuffer: {
            a_position: new GLVBuffer(),
            a_color: new GLVBuffer(),
            a_uv: new GLVBuffer()
        },
        ibuffer: new GLIBuffer(),
        type: Primitive.Triangles
    };
    buff.vbuffer.a_position.setVectorData([
        new Vec3(-1, -1, 1),
        new Vec3(0, -1, -1),
        new Vec3(1, -1, 1),
        new Vec3(0, 1, 0)
    ], DrawType.Static, true);
    buff.vbuffer.a_uv.setVectorData([
        new Vec4(1, 1, 1, 1),
        new Vec4(1, 0, 0, 1),
        new Vec4(0, 0, 1, 1),
        new Vec4(0, 1, 0, 1)
    ], DrawType.Static, true);
    buff.ibuffer.setData(new Uint16Array([
        2, 1, 0,
        1, 3, 0,
        2, 3, 1,
        0, 3, 2
    ]), 1, DrawType.Static, true);
    return new ResourceWrap(buff);
};
var RPGeometry = (function (RPString$$1) {
    function RPGeometry () {
        RPString$$1.apply(this, arguments);
    }if ( RPString$$1 ) RPGeometry.__proto__ = RPString$$1;
    RPGeometry.prototype = Object.create( RPString$$1 && RPString$$1.prototype );
    RPGeometry.prototype.constructor = RPGeometry;

    

    return RPGeometry;
}(RPString));

var STag = function STag () {};
STag.Source = "source";
STag.Dest = "dest";
STag.FB = "fb";
var GaussSub = (function (DObject$$1) {
    function GaussSub(tech) {
        var this$1 = this;

        DObject$$1.call(this, tech);
        this._rect = ResourceGen.get(new RPGeometry("Rect01")).data;
        this._rf = new Refresh(( obj = {}, obj[STag.Source] = null, obj[STag.Dest] = {
                depend: [STag.Source],
                func: function (prev) {
                    if (!prev)
                        { prev = new GLTexture2DP(); }
                    var ss = this$1.source().size();
                    var ds = prev.size();
                    if (ds.width < ss.width || ds.height < ss.height) {
                        prev.setLinear(true, true, 0);
                        prev.setWrap(UVWrap.Clamp, UVWrap.Clamp);
                        prev.setData(InterFormat.RGBA, ss.width, ss.height, InterFormat.RGBA, TexDataFormat.UB);
                    }
                    return prev;
                }
            }, obj[STag.FB] = {
                depend: [STag.Dest],
                func: function (prev) {
                    if (!prev)
                        { prev = new GLFramebuffer(); }
                    prev.attach(Attachment.Color0, this$1.dest());
                    return prev;
                }
            }, obj ));
        var obj;
    }

    if ( DObject$$1 ) GaussSub.__proto__ = DObject$$1;
    GaussSub.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    GaussSub.prototype.constructor = GaussSub;
    GaussSub.prototype.setSource = function setSource (src) {
        this._rf.set(STag.Source, src);
    };
    GaussSub.prototype.source = function source () {
        return this._rf.get(STag.Source);
    };
    GaussSub.prototype.dest = function dest () {
        return this._rf.get(STag.Dest);
    };
    GaussSub.prototype._fb = function _fb () {
        return this._rf.get(STag.FB);
    };
    GaussSub.prototype.onDraw = function onDraw () {
        var this$1 = this;

        var src = this.source();
        var coeff = this.coeff;
        engine.setUniforms({
            u_weight: coeff,
            u_mapSize: src.truesize().toVec4(),
            u_uvrect: src.uvrect().toVec4(),
            u_texDiffuse: src
        });
        this._fb().vp_proc(function () {
            engine.drawGeometry(this$1._rect);
        });
    };

    return GaussSub;
}(DObject));
var Tag$1 = function Tag () {};
Tag$1.Dispersion = "dispersion";
Tag$1.Coeff = "coeff";
var GaussFilter = (function (DObject$$1) {
    function GaussFilter() {
        var this$1 = this;

        DObject$$1.call(this, null);
        this._rf = new Refresh(( obj = {}, obj[Tag$1.Dispersion] = null, obj[Tag$1.Coeff] = {
                depend: [Tag$1.Dispersion],
                func: function (prev) {
                    var d = this$1._rf.get(Tag$1.Dispersion);
                    var nc = 9;
                    var ca = [];
                    var total = 0;
                    for (var i = 0; i < nc; i++) {
                        ca[i] = Math.exp(-0.5 * (i * i) / d);
                        if (i === 0)
                            { total += ca[i]; }
                        else
                            { total += ca[i] * 2; }
                    }
                    total = 1 / total;
                    for (var i$1 = 0; i$1 < nc; i$1++) {
                        ca[i$1] *= total;
                    }
                    return ca;
                }
            }, obj ));
        var obj;
        this._pass = new DrawGroup();
        this._sub = [new GaussSub("gaussh"), new GaussSub("gaussv")];
        for (var i = 0; i < 2; i++) {
            this$1._pass.group.add(this$1._sub[i]);
        }
    }

    if ( DObject$$1 ) GaussFilter.__proto__ = DObject$$1;
    GaussFilter.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    GaussFilter.prototype.constructor = GaussFilter;
    GaussFilter.prototype.setSource = function setSource (src) {
        this._sub[0].setSource(src);
        this._sub[1].setSource(this._sub[0].dest());
    };
    GaussFilter.prototype._coeff = function _coeff () {
        return this._rf.get(Tag$1.Coeff);
    };
    GaussFilter.prototype.result = function result () {
        return this._sub[1].dest();
    };
    GaussFilter.prototype.setDispersion = function setDispersion (d) {
        this._rf.set(Tag$1.Dispersion, d);
    };
    GaussFilter.prototype.onDraw = function onDraw () {
        var this$1 = this;

        if (this._sub[0].source()) {
            var coeff = this._coeff();
            for (var i = 0; i < 2; i++) {
                this$1._sub[i].coeff = coeff;
            }
            this._pass.onDraw();
        }
    };

    return GaussFilter;
}(DObject));

GaussFilter.Tag = Tag$1;

var RPBeta = function RPBeta(color) {
    this.color = color;
};

var prototypeAccessors$5 = { name: {},key: {} };
prototypeAccessors$5.name.get = function () { return "Beta"; };
prototypeAccessors$5.key.get = function () {
    var c = this.color;
    return ("Beta_" + (c.x) + "_" + (c.y) + "_" + (c.z));
};

Object.defineProperties( RPBeta.prototype, prototypeAccessors$5 );

ResourceGenSrc.Beta = function (rp) {
    var ret = new GLTexture2D();
    ret.setLinear(true, true, 0);
    ret.setWrap(UVWrap.Clamp, UVWrap.Clamp);
    var dim = rp.color.dim();
    var ub = new Uint8Array(dim);
    for (var i = 0; i < dim; i++) {
        ub[i] = rp.color.value[i] * 255;
    }
    ret.setData(InterFormat.RGB, 1, 1, InterFormat.RGB, TexDataFormat.UB, ub);
    return ret;
};

var WrapRectBase = (function (DObject$$1) {
    function WrapRectBase(tech) {
        DObject$$1.call(this, tech);
        this._rect = ResourceGen.get(new RPGeometry("Rect01_01"));
        this.zoom = 1;
        this.alpha = 1;
        this.vflip = false;
        this.color = new Vec3(1);
    }

    if ( DObject$$1 ) WrapRectBase.__proto__ = DObject$$1;
    WrapRectBase.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    WrapRectBase.prototype.constructor = WrapRectBase;
    WrapRectBase.prototype.onDraw = function onDraw () {
        if (!this.texture) {
            this.texture = ResourceGen.get(new RPBeta(new Vec3(1, 1, 1)));
        }
        engine.setUniform("u_texture", this.texture);
        engine.setUniform("u_alpha", this.alpha);
        engine.setUniform("u_color", this.color);
        var ts = this.texture.truesize();
        var s = this.texture.size();
        var uv = new Rect(0, s.height / ts.height, s.width / ts.width, 0);
        engine.setUniform("u_uvcenter", uv.center());
        var vf = this.vflip ? -1 : 1;
        var zi = 1 / this.zoom;
        engine.setUniform("u_uvratio", new Vec2(uv.width() / 2 * zi, uv.height() / 2 * vf * zi));
        engine.drawGeometry(this._rect.data);
    };

    return WrapRectBase;
}(DObject));

var WrapRect = (function (WrapRectBase$$1) {
    function WrapRect() {
        WrapRectBase$$1.call(this, "rect");
    }

    if ( WrapRectBase$$1 ) WrapRect.__proto__ = WrapRectBase$$1;
    WrapRect.prototype = Object.create( WrapRectBase$$1 && WrapRectBase$$1.prototype );
    WrapRect.prototype.constructor = WrapRect;

    return WrapRect;
}(WrapRectBase));

var WrapRectAdd = (function (WrapRectBase$$1) {
    function WrapRectAdd() {
        WrapRectBase$$1.call(this, "rectAdd");
    }

    if ( WrapRectBase$$1 ) WrapRectAdd.__proto__ = WrapRectBase$$1;
    WrapRectAdd.prototype = Object.create( WrapRectBase$$1 && WrapRectBase$$1.prototype );
    WrapRectAdd.prototype.constructor = WrapRectAdd;

    return WrapRectAdd;
}(WrapRectBase));

var Linear = function Linear(duration) {
    this._init = 0;
    this._cur = 0;
    this._end = duration;
};
Linear.prototype.advance = function advance (dt) {
    this._cur += dt;
    if (this._cur >= this._end) {
        this._cur = this._end;
        return true;
    }
    return false;
};
Linear.prototype.value = function value () {
    return this._cur / this._end;
};
Linear.prototype.reset = function reset () {
    this._cur = this._init;
};
var Ease = (function (Linear) {
    function Ease () {
        Linear.apply(this, arguments);
    }

    if ( Linear ) Ease.__proto__ = Linear;
    Ease.prototype = Object.create( Linear && Linear.prototype );
    Ease.prototype.constructor = Ease;

    Ease.prototype.value = function value () {
        var L = Linear.prototype.value.call(this);
        return Math.sin(L * Math.PI / 2);
    };

    return Ease;
}(Linear));
function Lerp(v0, v1, t) {
    return (v1 - v0) * t + v0;
}
var ImageView = (function (DObject$$1) {
    function ImageView() {
        DObject$$1.call(this, "imageview");
        this._geom = ResourceGen.get(new RPGeometry("Rect01")).data;
        this._ease = new Ease(0.3);
    }

    if ( DObject$$1 ) ImageView.__proto__ = DObject$$1;
    ImageView.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    ImageView.prototype.constructor = ImageView;
    ImageView.prototype.onDraw = function onDraw () {
        if (!this.texture)
            { return; }
        this._ease.advance(0.016);
        var s = this.texture.size();
        var es = engine.size();
        var r = s.width / s.height;
        var er = es.width / es.height;
        var sv = new Vec2(1);
        if (er > r) {
            sv.x = 1 / er * r;
        }
        else {
            sv.y = er * (1 / r);
        }
        sv.mulSelf(Lerp(0.7, 1.0, this._ease.value()));
        engine.setUniforms({
            u_texture: this.texture,
            u_scale: sv
        });
        engine.drawGeometry(this._geom);
    };

    return ImageView;
}(DObject));

var StView = (function (State$$1) {
    function StView () {
        State$$1.apply(this, arguments);
    }

    if ( State$$1 ) StView.__proto__ = State$$1;
    StView.prototype = Object.create( State$$1 && State$$1.prototype );
    StView.prototype.constructor = StView;

    StView.prototype.onEnter = function onEnter (self, prev) {
    };
    StView.prototype.onUp = function onUp (self) {
        var t = resource.getResource(self.name);
        t.setLinear(true, true, 0);
        var iv = new ImageView();
        iv.texture = t;
        iv.drawtag.priority = 20;
        self.asDrawGroup().group.add(iv);
    };
    StView.prototype.onUpdate = function onUpdate (self) {
        if (input.isMKeyClicked(0)) {
            input.hideMState(0);
            scene.pop(1);
        }
    };

    return StView;
}(State));
var View = (function (Scene$$1) {
    function View(name) {
        Scene$$1.call(this, 0, new StView());
        this.name = name;
    }

    if ( Scene$$1 ) View.__proto__ = Scene$$1;
    View.prototype = Object.create( Scene$$1 && Scene$$1.prototype );
    View.prototype.constructor = View;

    return View;
}(Scene));

var ColRect = (function (Rect$$1) {
    function ColRect () {
        Rect$$1.apply(this, arguments);
    }

    if ( Rect$$1 ) ColRect.__proto__ = Rect$$1;
    ColRect.prototype = Object.create( Rect$$1 && Rect$$1.prototype );
    ColRect.prototype.constructor = ColRect;

    ColRect.prototype.hit = function hit (p) {
        if (p.x < this.left ||
            p.x > this.right ||
            p.y < this.bottom ||
            p.y > this.top)
            { return false; }
        return true;
    };

    return ColRect;
}(Rect));

// サムネイル1つ分
var ThumbItem = function ThumbItem(s, ofs) {
    this._geom = ResourceGen.get(new RPGeometry("Rect01")).data;
    this._size = s;
    this._offset = ofs.clone();
    this.alpha = 0;
    this._crect = new ColRect(ofs.x - s.width / 2, ofs.y + s.height / 2, ofs.x + s.width / 2, ofs.y - s.height / 2);
};
ThumbItem.prototype.advance = function advance (dt) {
    this.alpha += dt / 8;
    this.alpha = Math.min(1, this.alpha);
};
ThumbItem.prototype.hit = function hit (pos) {
    return this._crect.hit(pos);
};
// スクロール値
ThumbItem.prototype.draw = function draw (sclY) {
    if (!this.texture)
        { return; }
    // テクスチャに合わせたアスペクト比調整
    var rect = new Rect(-1, 1, 1, -1);
    var s = this.texture.size();
    var r = s.width / s.height;
    if (r > 1) {
        // 横長
        var h = rect.height();
        var diff = h / r;
        rect.top -= (h - diff) / 2;
        rect.bottom = rect.top - diff;
    }
    else {
        // 縦長
        var w = rect.width();
        var diff$1 = w * r;
        rect.left += (w - diff$1) / 2;
        rect.right = rect.left + diff$1;
    }
    var m = Mat44.Translation(this._offset.x, this._offset.y + sclY, 0);
    m.mulSelf(Mat44.Scaling(this._size.width / 2, this._size.height / 2, 1));
    engine.setUniforms({
        u_texture: this.texture,
        u_rect: rect.toVec4(),
        u_matrix: m,
        u_alpha: this.alpha
    });
    engine.drawGeometry(this._geom);
};
var Tag$2 = function Tag () {};
// 上下左右の余白
Tag$2.Space = "space";
// 表示対象の領域(Size: Pixel)
Tag$2.ScreenSize = "scsize";
// 1マスあたりの平均サイズ(Size: Pixel)
Tag$2.TileSize = "tilesize";
// サムネイルテクスチャ配列
Tag$2.ThumbnailTex = "thumbtex";
Tag$2.Thumbnail = "thumbnail";
// タイル配置情報(PlaceInfo)
Tag$2.PlaceInfo = "placeinfo";
var PlaceInfo = function PlaceInfo(
    // 配置オフセット(Screen)
    offset, 
    // 1マス毎の移動値(Screen)
    diff, 
    // 横縦に並べる数
    ntile, 
    // タイルのサイズ(Screen)
    tilesize) {
    this.offset = offset;
    this.diff = diff;
    this.ntile = ntile;
    this.tilesize = tilesize;
};
// サムネイルを並べて表示
var ThumbView = (function (DObject$$1) {
    function ThumbView() {
        var this$1 = this;

        DObject$$1.call(this, "thumbview");
        this._rf = new Refresh(( obj = {}, obj[Tag$2.ScreenSize] = null, obj[Tag$2.TileSize] = null, obj[Tag$2.Space] = null, obj[Tag$2.ThumbnailTex] = null, obj[Tag$2.PlaceInfo] = {
                depend: [Tag$2.ScreenSize, Tag$2.TileSize, Tag$2.Space],
                func: function (prev) {
                    var ss = this$1._scsize();
                    var ssh = ss.clone();
                    ssh.width /= 2;
                    ssh.height /= 2;
                    var ts = this$1._tilesize();
                    var sp = this$1._space();
                    var ofs = sp.mul(0.5).toVec2();
                    ofs.x /= ssh.width;
                    ofs.y /= ssh.height;
                    var ts2 = ts.clone();
                    ts2.width /= ssh.width;
                    ts2.height /= ssh.height;
                    return new PlaceInfo(ofs, new Vec2(ts.width / ssh.width / 2, ts.height / ssh.height / 2), new Size(Math.max(Math.floor(ss.width / ts.width), 1), Math.max(Math.floor(ss.height / ts.height), 1)), ts2);
                }
            }, obj[Tag$2.Thumbnail] = {
                depend: [Tag$2.ThumbnailTex, Tag$2.PlaceInfo],
                func: function (prev) {
                    var tb = [];
                    var tex = this$1._thumbtex();
                    var pl = this$1._placeinfo();
                    var ofs = new Vec2(0, 1 - pl.offset.y - pl.tilesize.height / 2);
                    var cur = 0;
                    for (;;) {
                        ofs.x = -1 + pl.offset.x + pl.tilesize.width / 2;
                        for (var i = 0; i < pl.ntile.width; i++) {
                            var t = new ThumbItem(pl.tilesize, ofs);
                            t.alpha = -cur / tex.length;
                            t.texture = tex[cur];
                            tb[cur] = t;
                            if (++cur === tex.length)
                                { return tb; }
                            ofs.x += pl.tilesize.width;
                        }
                        ofs.y -= pl.tilesize.height;
                    }
                }
            }, obj ));
        var obj;
        this.setScreenSize(new Size(640, 480));
        this.setTileSize(new Size(120, 120));
        this.setSpace(64, 64);
        this.scale = 1;
        this.alpha = 1;
    }

    if ( DObject$$1 ) ThumbView.__proto__ = DObject$$1;
    ThumbView.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    ThumbView.prototype.constructor = ThumbView;
    ThumbView.prototype.setSpace = function setSpace (h, v) {
        this._rf.set(Tag$2.Space, new Size(h, v));
    };
    ThumbView.prototype.setTileSize = function setTileSize (size) {
        this._rf.set(Tag$2.TileSize, size);
    };
    ThumbView.prototype.setScreenSize = function setScreenSize (size) {
        var prev = this._rf.get(Tag$2.ScreenSize);
        if (!prev ||
            !prev.equal(size)) {
            this._rf.set(Tag$2.ScreenSize, size);
        }
    };
    ThumbView.prototype.setThumbnailTex = function setThumbnailTex (tex) {
        this._rf.set(Tag$2.ThumbnailTex, tex);
    };
    ThumbView.prototype._space = function _space () {
        return this._rf.get(Tag$2.Space);
    };
    ThumbView.prototype._scsize = function _scsize () {
        return this._rf.get(Tag$2.ScreenSize);
    };
    ThumbView.prototype._tilesize = function _tilesize () {
        return this._rf.get(Tag$2.TileSize);
    };
    ThumbView.prototype._placeinfo = function _placeinfo () {
        return this._rf.get(Tag$2.PlaceInfo);
    };
    ThumbView.prototype._thumbtex = function _thumbtex () {
        return this._rf.get(Tag$2.ThumbnailTex);
    };
    ThumbView.prototype._thumbnail = function _thumbnail () {
        return this._rf.get(Tag$2.Thumbnail);
    };
    ThumbView.prototype.click = function click (pos) {
        var tm = this._thumbnail();
        if (tm) {
            for (var i = 0; i < tm.length; i++) {
                if (tm[i].hit(pos)) {
                    return i;
                }
            }
        }
    };
    ThumbView.prototype.onDraw = function onDraw () {
        var tm = this._thumbnail();
        if (tm) {
            for (var i = 0; i < tm.length; i++) {
                tm[i].advance(0.16);
                tm[i].draw(0);
            }
        }
    };

    return ThumbView;
}(DObject));

var DrawSort;
(function (DrawSort) {
    DrawSort.Priority = function (t0, t1) {
        if (t0.priority < t1.priority)
            { return -1; }
        if (t0.priority > t1.priority)
            { return 1; }
        return 0;
    };
})(DrawSort || (DrawSort = {}));

var Alias$2 = { "hsv": "resource/hsv.glsl", "imageviewf": "resource/imageviewf.fsh", "imageviewv": "resource/imageviewv.vsh", "ps": "resource/ps.prog", "sphere": "resource/sphere.png", "testPf": "resource/testPf.fsh", "testPv": "resource/testPv.vsh", "thumbviewf": "resource/thumbviewf.fsh", "thumbviewv": "resource/thumbviewv.vsh" };

var Alias$4 = { "1day_00": "image_resource/1day_00.jpg", "47_small": "image_resource/47_small.jpg", "alien0_small": "image_resource/alien0_small.jpg", "alien_m_small": "image_resource/alien_m_small.jpg", "aro_keyboard_small": "image_resource/aro_keyboard_small.jpg", "cat_2_draft_small": "image_resource/cat_2_draft_small.jpg", "cat_2_small": "image_resource/cat_2_small.jpg", "chestburster_blood_small": "image_resource/chestburster_blood_small.jpg", "chestburster_white_small": "image_resource/chestburster_white_small.jpg", "creature_small": "image_resource/creature_small.jpg", "d_dogFinal_small": "image_resource/d_dogFinal_small.jpg", "displeased_dragon": "image_resource/displeased_dragon.jpg", "eng_zargo_small": "image_resource/eng_zargo_small.jpg", "facehugger_small": "image_resource/facehugger_small.jpg", "forest_fall_small": "image_resource/forest_fall_small.jpg", "gecko": "image_resource/gecko.jpg", "greenpython_small": "image_resource/greenpython_small.jpg", "husky0_small": "image_resource/husky0_small.jpg", "husky_paint_small": "image_resource/husky_paint_small.jpg", "jz_small": "image_resource/jz_small.jpg", "kakizome_small": "image_resource/kakizome_small.jpg", "kanzume": "image_resource/kanzume.jpg", "licker_small": "image_resource/licker_small.jpg", "lizard0_small": "image_resource/lizard0_small.jpg", "manzoku_ds": "image_resource/manzoku_ds.jpg", "mee_small": "image_resource/mee_small.jpg", "motivation_small": "image_resource/motivation_small.jpg", "muscle0_small": "image_resource/muscle0_small.jpg", "muscle1_small": "image_resource/muscle1_small.jpg", "muscle2_small": "image_resource/muscle2_small.jpg", "muscle_small": "image_resource/muscle_small.jpg", "numakuro_small": "image_resource/numakuro_small.jpg", "okami_ps": "image_resource/okami_ps.jpg", "pika_small": "image_resource/pika_small.jpg", "plates": "image_resource/plates.jpg", "prac2_small": "image_resource/prac2_small.jpg", "python0": "image_resource/python0.jpg", "saliva_final_small": "image_resource/saliva_final_small.jpg", "sand_small": "image_resource/sand_small.jpg", "shard_of_clear_sky_small": "image_resource/shard_of_clear_sky_small.jpg", "skull1_small": "image_resource/skull1_small.jpg", "skull2_small": "image_resource/skull2_small.jpg", "skull3_small": "image_resource/skull3_small.jpg", "skullNF_0_small": "image_resource/skullNF_0_small.jpg", "skullN_0_small": "image_resource/skullN_0_small.jpg", "skullN_1_0_small": "image_resource/skullN_1_0_small.jpg", "skullN_1_1_small": "image_resource/skullN_1_1_small.jpg", "skullN_2_0_small": "image_resource/skullN_2_0_small.jpg", "slime_small": "image_resource/slime_small.jpg", "small_morning_dragon": "image_resource/small_morning_dragon.jpg", "small_shadow_death": "image_resource/small_shadow_death.jpg", "small_simacchau": "image_resource/small_simacchau.jpg", "small_suddenly": "image_resource/small_suddenly.jpg", "small_suddenly_v1": "image_resource/small_suddenly_v1.jpg", "small_suddenly_v2": "image_resource/small_suddenly_v2.jpg", "sphereZ": "image_resource/sphereZ.jpg", "tank_day_small": "image_resource/tank_day_small.jpg", "twilight_creature_small": "image_resource/twilight_creature_small.jpg", "usb_tentacle_final_small": "image_resource/usb_tentacle_final_small.jpg", "wolf0": "image_resource/wolf0.jpg", "wolf1": "image_resource/wolf1.jpg", "wolfTF_C_small": "image_resource/wolfTF_C_small.jpg", "wolfTF_small": "image_resource/wolfTF_small.jpg", "wolf_in_ruins_small": "image_resource/wolf_in_ruins_small.jpg", "wolf_small": "image_resource/wolf_small.jpg", "y10_energy_small": "image_resource/y10_energy_small.jpg", "y10_izakaya_small": "image_resource/y10_izakaya_small.jpg", "y10_poster_small": "image_resource/y10_poster_small.jpg", "y10_rooftop_small": "image_resource/y10_rooftop_small.jpg", "y10_white_small": "image_resource/y10_white_small.jpg" };

var Alias$5 = { "thumbnail-1day_00": "thumbnail/thumbnail-1day_00.jpg", "thumbnail-47_small": "thumbnail/thumbnail-47_small.jpg", "thumbnail-alien0_small": "thumbnail/thumbnail-alien0_small.jpg", "thumbnail-alien_m_small": "thumbnail/thumbnail-alien_m_small.jpg", "thumbnail-aro_keyboard_small": "thumbnail/thumbnail-aro_keyboard_small.jpg", "thumbnail-cat_2_draft_small": "thumbnail/thumbnail-cat_2_draft_small.jpg", "thumbnail-cat_2_small": "thumbnail/thumbnail-cat_2_small.jpg", "thumbnail-chestburster_blood_small": "thumbnail/thumbnail-chestburster_blood_small.jpg", "thumbnail-chestburster_white_small": "thumbnail/thumbnail-chestburster_white_small.jpg", "thumbnail-creature_small": "thumbnail/thumbnail-creature_small.jpg", "thumbnail-d_dogFinal_small": "thumbnail/thumbnail-d_dogFinal_small.jpg", "thumbnail-displeased_dragon": "thumbnail/thumbnail-displeased_dragon.jpg", "thumbnail-eng_zargo_small": "thumbnail/thumbnail-eng_zargo_small.jpg", "thumbnail-facehugger_small": "thumbnail/thumbnail-facehugger_small.jpg", "thumbnail-forest_fall_small": "thumbnail/thumbnail-forest_fall_small.jpg", "thumbnail-gecko": "thumbnail/thumbnail-gecko.jpg", "thumbnail-greenpython_small": "thumbnail/thumbnail-greenpython_small.jpg", "thumbnail-husky0_small": "thumbnail/thumbnail-husky0_small.jpg", "thumbnail-husky_paint_small": "thumbnail/thumbnail-husky_paint_small.jpg", "thumbnail-jz_small": "thumbnail/thumbnail-jz_small.jpg", "thumbnail-kakizome_small": "thumbnail/thumbnail-kakizome_small.jpg", "thumbnail-kanzume": "thumbnail/thumbnail-kanzume.jpg", "thumbnail-licker_small": "thumbnail/thumbnail-licker_small.jpg", "thumbnail-lizard0_small": "thumbnail/thumbnail-lizard0_small.jpg", "thumbnail-manzoku_ds": "thumbnail/thumbnail-manzoku_ds.jpg", "thumbnail-mee_small": "thumbnail/thumbnail-mee_small.jpg", "thumbnail-motivation_small": "thumbnail/thumbnail-motivation_small.jpg", "thumbnail-muscle0_small": "thumbnail/thumbnail-muscle0_small.jpg", "thumbnail-muscle1_small": "thumbnail/thumbnail-muscle1_small.jpg", "thumbnail-muscle2_small": "thumbnail/thumbnail-muscle2_small.jpg", "thumbnail-muscle_small": "thumbnail/thumbnail-muscle_small.jpg", "thumbnail-numakuro_small": "thumbnail/thumbnail-numakuro_small.jpg", "thumbnail-okami_ps": "thumbnail/thumbnail-okami_ps.jpg", "thumbnail-pika_small": "thumbnail/thumbnail-pika_small.jpg", "thumbnail-plates": "thumbnail/thumbnail-plates.jpg", "thumbnail-prac2_small": "thumbnail/thumbnail-prac2_small.jpg", "thumbnail-python0": "thumbnail/thumbnail-python0.jpg", "thumbnail-saliva_final_small": "thumbnail/thumbnail-saliva_final_small.jpg", "thumbnail-sand_small": "thumbnail/thumbnail-sand_small.jpg", "thumbnail-shard_of_clear_sky_small": "thumbnail/thumbnail-shard_of_clear_sky_small.jpg", "thumbnail-skull1_small": "thumbnail/thumbnail-skull1_small.jpg", "thumbnail-skull2_small": "thumbnail/thumbnail-skull2_small.jpg", "thumbnail-skull3_small": "thumbnail/thumbnail-skull3_small.jpg", "thumbnail-skullNF_0_small": "thumbnail/thumbnail-skullNF_0_small.jpg", "thumbnail-skullN_0_small": "thumbnail/thumbnail-skullN_0_small.jpg", "thumbnail-skullN_1_0_small": "thumbnail/thumbnail-skullN_1_0_small.jpg", "thumbnail-skullN_1_1_small": "thumbnail/thumbnail-skullN_1_1_small.jpg", "thumbnail-skullN_2_0_small": "thumbnail/thumbnail-skullN_2_0_small.jpg", "thumbnail-slime_small": "thumbnail/thumbnail-slime_small.jpg", "thumbnail-small_morning_dragon": "thumbnail/thumbnail-small_morning_dragon.jpg", "thumbnail-small_shadow_death": "thumbnail/thumbnail-small_shadow_death.jpg", "thumbnail-small_simacchau": "thumbnail/thumbnail-small_simacchau.jpg", "thumbnail-small_suddenly": "thumbnail/thumbnail-small_suddenly.jpg", "thumbnail-small_suddenly_v1": "thumbnail/thumbnail-small_suddenly_v1.jpg", "thumbnail-small_suddenly_v2": "thumbnail/thumbnail-small_suddenly_v2.jpg", "thumbnail-sphereZ": "thumbnail/thumbnail-sphereZ.jpg", "thumbnail-tank_day_small": "thumbnail/thumbnail-tank_day_small.jpg", "thumbnail-twilight_creature_small": "thumbnail/thumbnail-twilight_creature_small.jpg", "thumbnail-usb_tentacle_final_small": "thumbnail/thumbnail-usb_tentacle_final_small.jpg", "thumbnail-wolf0": "thumbnail/thumbnail-wolf0.jpg", "thumbnail-wolf1": "thumbnail/thumbnail-wolf1.jpg", "thumbnail-wolfTF_C_small": "thumbnail/thumbnail-wolfTF_C_small.jpg", "thumbnail-wolfTF_small": "thumbnail/thumbnail-wolfTF_small.jpg", "thumbnail-wolf_in_ruins_small": "thumbnail/thumbnail-wolf_in_ruins_small.jpg", "thumbnail-wolf_small": "thumbnail/thumbnail-wolf_small.jpg", "thumbnail-y10_energy_small": "thumbnail/thumbnail-y10_energy_small.jpg", "thumbnail-y10_izakaya_small": "thumbnail/thumbnail-y10_izakaya_small.jpg", "thumbnail-y10_poster_small": "thumbnail/thumbnail-y10_poster_small.jpg", "thumbnail-y10_rooftop_small": "thumbnail/thumbnail-y10_rooftop_small.jpg", "thumbnail-y10_white_small": "thumbnail/thumbnail-y10_white_small.jpg" };

var WrapRectT = (function (WrapRectBase$$1) {
    function WrapRectT() {
        WrapRectBase$$1.call(this, "rectt");
    }

    if ( WrapRectBase$$1 ) WrapRectT.__proto__ = WrapRectBase$$1;
    WrapRectT.prototype = Object.create( WrapRectBase$$1 && WrapRectBase$$1.prototype );
    WrapRectT.prototype.constructor = WrapRectT;

    return WrapRectT;
}(WrapRectBase));
// particle dance
var StParticle = (function (State$$1) {
    function StParticle() {
        State$$1.apply(this, arguments);
        this._fb = new GLFramebuffer();
        this._cb = [new GLTexture2DP(), new GLTexture2DP()];
        this._rb = new GLRenderbuffer();
        this._tex = new DataSwitch(this._cb[0], this._cb[1]);
    }

    if ( State$$1 ) StParticle.__proto__ = State$$1;
    StParticle.prototype = Object.create( State$$1 && State$$1.prototype );
    StParticle.prototype.constructor = StParticle;
    StParticle.prototype._allocateBuffer = function _allocateBuffer (size) {
        var this$1 = this;

        this._size = size;
        for (var i = 0; i < 2; i++) {
            this$1._cb[i].setData(InterFormat.RGBA, size.width / 2, size.height / 2, InterFormat.RGBA, TexDataFormat.UB);
            this$1._cb[i].setLinear(true, true, 0);
        }
        // Depth16
        this._rb.allocate(RBFormat.Depth16, GetPowValue(size.width / 2), GetPowValue(size.height / 2));
    };
    StParticle.prototype.onEnter = function onEnter (self, prev) {
        this._bLoading = false;
        // 残像用のフレームバッファ
        this._allocateBuffer(engine.size());
        this._fb.attach(Attachment.Depth, this._rb);
        var dg_m = new DrawGroup();
        {
            var cls = new Clear(new Vec4(0, 0, 0, 1), 1.0);
            cls.drawtag.priority = 0;
            dg_m.group.add(cls);
        }
        // パーティクル初期化
        {
            var psp = new PSpriteDraw(100);
            psp.drawtag.priority = 10;
            psp.alpha = 0;
            dg_m.group.add(psp);
            this._alpha = 0;
            this._psp = psp;
        }
        // 残像上書き
        {
            var wr = new WrapRectAdd();
            wr.drawtag.priority = 20;
            wr.alpha = 0.85;
            dg_m.group.add(wr);
            this._fr_m = wr;
        }
        var dg = new DrawGroup();
        dg.setSortAlgorithm(DrawSort.Priority);
        {
            var fbw = new FBSwitch(this._fb);
            fbw.drawtag.priority = 0;
            fbw.lower = dg_m;
            dg.group.add(fbw);
        }
        {
            var gf = new GaussFilter();
            this._gauss = gf;
            gf.setDispersion(50.1);
            gf.drawtag.priority = 5;
            dg.group.add(gf);
        }
        // 結果表示
        {
            var wr$1 = new WrapRect();
            wr$1.drawtag.priority = 10;
            dg.group.add(wr$1);
            this._fr = wr$1;
        }
        {
            var ts = [];
            var TKey = Object.keys(Alias$5);
            for (var i = 0; i < TKey.length; i++) {
                ts[i] = resource.getResource(TKey[i]);
                ts[i].setLinear(true, true, 0);
            }
            var tv = new ThumbView();
            tv.setScreenSize(engine.size());
            tv.setThumbnailTex(ts);
            tv.drawtag.priority = 20;
            tv.alpha = 0;
            dg.group.add(tv);
            this._tv = tv;
            this._tvV = 0;
        }
        this._gauss.setSource(this._tex.current());
        this._fr.texture = this._gauss.result();
        self.drawTarget = dg;
        {
            var wt = new WrapRectT();
            this._loadingBg = wt;
            wt.alpha = 0.75;
            wt.color = new Vec3(0, 0, 0);
            wt.drawtag.priority = 40;
        }
        var ldt = new TextShow();
        ldt.alpha = 1;
        ldt.text.setText("Loading");
        ldt.drawtag.priority = 50;
        ldt.text.setSize(new Size(512, 512));
        ldt.text.setFont(new Font("arial", "2em", "normal", false));
        ldt.offset = PlaceCenter(engine.size(), ldt.text.resultSize());
        this._loadText = ldt;
    };
    StParticle.prototype.onDown = function onDown (self, ret) {
        if (ret instanceof Error)
            { console.log(ret.message); }
        else {
            var dg = self.asDrawGroup();
            dg.group.remove(this._loadingBg);
            dg.group.remove(this._loadText);
        }
    };
    StParticle.prototype.onUpdate = function onUpdate (self, dt) {
        var this$1 = this;

        var size = engine.size();
        if (!this._size.equal(size)) {
            this._allocateBuffer(size);
            this._tv.setScreenSize(size);
        }
        if (!this._bLoading && input.isMKeyClicked(0)) {
            var pos = input.position();
            pos = engine.getScreenCoord(pos);
            var ret = this._tv.click(pos);
            if (typeof ret === "number") {
                this._bLoading = true;
                var key = Object.keys(Alias$4);
                var res = key[ret];
                resource.loadFrame([res], {
                    completed: function () {
                        this$1._bLoading = false;
                        scene.push(new View(res), false);
                    },
                    taskprogress: function (taskIndex, loaded, total) {
                        var text = "Loading... " + (Math.floor(loaded / 1024)) + "kb / " + (Math.floor(total / 1024)) + "kb";
                        this$1._loadText.text.setText(text);
                        this$1._loadText.offset = PlaceCenter(engine.size(), this$1._loadText.text.resultSize());
                    },
                    progress: function (loaded, total) { },
                    error: function () {
                        console.log("Error");
                    }
                });
                self.asDrawGroup().group.add(this._loadingBg);
                self.asDrawGroup().group.add(this._loadText);
            }
        }
        this._tex.swap();
        this._fb.attach(Attachment.Color0, this._tex.current());
        this._fr_m.texture = this._tex.prev();
        this._gauss.setSource(this._tex.current());
        this._alpha += dt / 2;
        this._psp.advance(dt);
        this._psp.alpha = Math.min(1, this._alpha);
        this._tvV += dt / 4;
        this._tvV = Math.min(1, this._tvV);
        this._tv.scale = this._tvV + 0.8;
        this._tv.alpha = this._tvV + 0.8;
    };

    return StParticle;
}(State));
var StFadeout = (function (State$$1) {
    function StFadeout () {
        State$$1.apply(this, arguments);
    }

    if ( State$$1 ) StFadeout.__proto__ = State$$1;
    StFadeout.prototype = Object.create( State$$1 && State$$1.prototype );
    StFadeout.prototype.constructor = StFadeout;

    StFadeout.prototype.onEnter = function onEnter (self, prev) {
        this._alpha = 1;
    };
    StFadeout.prototype.onUpdate = function onUpdate (self, dt) {
        this._alpha -= dt;
        self._text.alpha = this._alpha;
        if (this._alpha < 0)
            { self.setState(new StParticle()); }
    };

    return StFadeout;
}(State));
// show "HELLO WORLD"
var StText = (function (State$$1) {
    function StText () {
        State$$1.apply(this, arguments);
    }

    if ( State$$1 ) StText.__proto__ = State$$1;
    StText.prototype = Object.create( State$$1 && State$$1.prototype );
    StText.prototype.constructor = StText;

    StText.prototype.onUp = function onUp (self) {
        var text = new TextLines(3);
        var str = "HELLO WORLD\n\nwith\nWebGL";
        text.setText(str);
        text.setSize(new Size(512, 512));
        var delay = 8;
        var t = new TextDraw(text, delay);
        t.drawtag.priority = 10;
        var rs = text.resultSize();
        t.offset = PlaceCenter(engine.size(), rs);
        self.asDrawGroup().group.add(t);
        self._text = t;
        var fpsc = new FPSCamera();
        engine.sys3d().camera = fpsc.camera;
        self.asUpdateGroup().group.add(fpsc);
        engine.addTechnique(resource.getResource("prog"));
        engine.addTechnique(resource.getResource("ps"));
        var cls = new Clear(new Vec4(0, 0, 0, 1));
        cls.drawtag.priority = 0;
        self.asDrawGroup().group.add(cls);
        self.asDrawGroup().setSortAlgorithm(DrawSort.Priority);
    };
    StText.prototype.onUpdate = function onUpdate (self, dt) {
        if (self._text.advance(dt * 15)) {
            self.setState(new StFadeout());
        }
    };

    return StText;
}(State));
var MyScene = (function (Scene$$1) {
    function MyScene() {
        Scene$$1.call(this, 0, new StText());
    }

    if ( Scene$$1 ) MyScene.__proto__ = Scene$$1;
    MyScene.prototype = Object.create( Scene$$1 && Scene$$1.prototype );
    MyScene.prototype.constructor = MyScene;

    return MyScene;
}(Scene));
var TextShow = (function (DObject$$1) {
    function TextShow() {
        DObject$$1.call(this, "text");
        this.text = new Text();
        this.offset = new Vec2(0, 0);
        this.alpha = 1;
    }

    if ( DObject$$1 ) TextShow.__proto__ = DObject$$1;
    TextShow.prototype = Object.create( DObject$$1 && DObject$$1.prototype );
    TextShow.prototype.constructor = TextShow;
    TextShow.prototype.onDraw = function onDraw () {
        this.text.draw(this.offset, 65536, 1, this.alpha);
    };

    return TextShow;
}(DObject));
var MyLoading = (function (LoadingScene$$1) {
    function MyLoading(res, cbNext) {
        var this$1 = this;

        LoadingScene$$1.call(this, res, cbNext, function (loaded, total) {
            this$1._loaded = loaded;
            this$1._total = total;
        }, function (id, loaded, total) {
            console.log(("task:" + id + " [" + loaded + " / " + total + "]"));
        });
        var t = new TextShow();
        var tx = t.text;
        tx.setText("loading... [000/000]");
        tx.setSize(new Size(512, 512));
        tx.setFont(new Font("arial", "2em", "normal", false));
        t.drawtag.priority = 10;
        t.offset = PlaceCenter(engine.size(), tx.resultSize());
        this.asDrawGroup().group.add(t);
        this._text = t;
        this._loaded = 0;
        this._total = 0;
    }

    if ( LoadingScene$$1 ) MyLoading.__proto__ = LoadingScene$$1;
    MyLoading.prototype = Object.create( LoadingScene$$1 && LoadingScene$$1.prototype );
    MyLoading.prototype.constructor = MyLoading;
    MyLoading.prototype.onUpdate = function onUpdate (dt) {
        this._text.text.setText(("loading... [" + (this._loaded) + "/" + (this._total) + "]"));
        return LoadingScene$$1.prototype.onUpdate.call(this, dt);
    };

    return MyLoading;
}(LoadingScene));
// 描画を継続しながら裏で読み込み
// ValueSetの重複をなんとかする
// DrawTag-Sortにより、不要なVB,IB,Uniform,Techの切り変えを抑制
// 事前にASyncで読み込んでおくのもメンドイ
// Uniformを毎回セット&チェックするのか
// DrawGroupの構成
// Arrayでの指定
// Groupからのdiscardを伴う削除
window.onload = function () {
    var onError = function (name) {
        throw Error(("duplicate resource \"" + name + "\""));
    };
    var alias = {};
    JoinEntriesND(alias, Alias$2, onError);
    JoinEntriesND(alias, Alias$4, onError);
    JoinEntriesND(alias, Alias$5, onError);
    MainLoop(alias, ".", function () {
        return new LoadingScene(["prog"], function () {
            engine.addTechnique(resource.getResource("prog"));
            var res = ["sphere", "ps"];
            var keys = Object.keys(Alias$5);
            res = res.concat(keys);
            return new MyLoading(res, function () {
                engine.addTechnique(resource.getResource("ps"));
                return new MyScene();
            });
        });
    });
};

}());
