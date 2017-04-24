Array.prototype.front = function () {
    return this[0];
};
Array.prototype.back = function () {
    return this[this.length - 1];
};
Array.prototype.empty = function () {
    return this.length === 0;
};
