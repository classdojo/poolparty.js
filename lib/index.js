var protoclass = require("protoclass");

/**
 */

function PoolParty (options) {

  if (!options) {
    options = {};
  }

  // max number of items
  this.max            = options.max              || 50;

  // minimum number of items - this triggers a "warm up"
  this.min            = options.min              || 0;

  // timeout when disposing objects in the pool
  this.staleInterval  = options.staleInterval    || 1000;

  // the factory for creating each object
  this.factory        = options.factory          || options.create;

  // interval for creating idle items
  this.warmUpInterval = options.warmUpInterval   || 0;

  // number of items to create each time
  this.warmUpBatch    = options.warmUpBatch      || 1;

  // the function for recycling objects
  this.recycle        = options.recycle;

  // the object pool
  this._pool = [];

  // the size of the pool
  this._size = 0;

  this._warmUp();
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
    if (!this._size || this._size <= this.min) return;

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

      this._warmUp();

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
    if(this._dripTimeout || this._size <= this.min) return;

    var self = this;

    this._dripTimeout = setTimeout(function () {
      self._dripTimeout = undefined;
      self.drip();
    }, this.staleInterval);
  },

  /**
   */

  _warmUp: function () {
    if (this._warmUpTimeout || this._size >= this.min) return;

    var self = this;

    this._warmUpTimeout = setTimeout(function () {

      self._warmUpTimeout = undefined;

      // make sure the batch number does't exceed 
      var n = Math.min(self.min - self._size, self.warmUpBatch);

      for (var i = 0; i < n; i++) {
        self.add(self.factory({ warm: true }));
      }

      self._warmUp();

    }, this.warmUpInterval);
  }

});

module.exports = function (options) {
  return new PoolParty(options)
}
