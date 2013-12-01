var protoclass = require("protoclass");

/**
 */

function PoolParty (options) {

  if (!options) {
    options = {};
  }

  this.max          = options.max          || 50;
  this.min          = options.min          || 0;
  this.staleTimeout = options.staleTimeout || 1000;
  this.factory      = options.factory      || options.create;
  this.recycle      = options.recycle;

  this._pool = [];
  this._size = 0;
}

/**
 */

protoclass(PoolParty, {

  /**
   */

  size: function () {
    return this._size;
  },

  /**
   */

  drain: function () {
    for(var i = Math.max(this._size - this.min, 0); i--;) {
      this.drip();
    }
  },

  /**
   */

  drip: function () {
    this._dripping = false
    if (!this._size) return;

    this._size--;
    this._pool.shift();
    this._timeoutDrip();
  },

  /**
   */

  create: function (options) {

    var item;

    if (this._size) {
      this._size--;
      item = this._pool.shift();
      this.recycle(item, options);
      return item;
    }

    item = this.factory(options);
    item.__pool = this;
    return item;
  },

  /**
   */

  add: function (object) {

    // cannot add an object not of the same pool
    if (object.__pool !== this) {
      return this;
    }

    if (!~this._pool.indexOf(object) && this._size < this.max) {
      this._size++;
      this._pool.push(object);
      this._timeoutDrip();
    }

    return this;
  },

  /**
   */

  _timeoutDrip: function () {
    if (this._dripping) return;
    this._dripping = true;
    var self = this;

    setTimeout(function () {
      self.drip();
    }, this.staletimeout);
  }

});

module.exports = function (options) {
  return new PoolParty(options)
}
