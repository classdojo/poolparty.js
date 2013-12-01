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
   * returns the size of the object pool
   */

  size: function () {
    return this._size;
  },

  /**
   * removes ALL items in the object pool except
   * the minimum # of items.
   */

  drain: function () {
    for(var i = Math.max(this._size - this.min, 0); i--;) {
      this.drip();
    }
  },

  /**
   * removes one item immediately
   */

  drip: function () {

    // cannot drip if there are no items in the pool
    if (!this._size) return;

    // drop the size, and remove an item
    this._size--;
    this._pool.shift();

    // timeout the next time we need to remove an item
    this._timeoutDrip();
  },

  /**
   */

  create: function (options) {

    var item;

    // items in the pool? used a recycled one
    if (this._size) {

      // drain it
      this._size--;

      // pop the oldest one off
      item = this._pool.shift();

      // pass through the "recycle" function
      this.recycle(item, options);

      // return the recycled item
      return item;
    }

    // no items in the pool? create a new item
    item = this.factory(options);

    return item;
  },

  /**
   * adds an item to the object pool. Note that at this point, 
   * an object should have been disposed.
   */

  add: function (object) {

    // make sure that the object hasn't already been added to the pool, 
    // AND the pool hasn't hit the max # of items
    if (!~this._pool.indexOf(object) && this._size < this.max) {
      this._size++;
      this._pool.push(object);
      this._timeoutDrip();
    }

    return this;
  },

  /**
   * slowly removes an item from the object pool
   */

  _timeoutDrip: function () {
    if(this._dripTimeout) return;

    var self = this;

    this._dripTimeout = setTimeout(function () {
      self._dripTimeout = undefined;
      self.drip();
    }, this.staletimeout);
  }

});

module.exports = function (options) {
  return new PoolParty(options)
}
