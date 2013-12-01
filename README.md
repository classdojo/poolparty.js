### Object Pooling & Recycling [![Alt ci](https://travis-ci.org/classdojo/poolparty.js.png)](https://travis-ci.org/classdojo/poolparty.js)


Pool Party was created to reduce the overhead of creating items that are expensive to create, such as DOM elements from a compiled template, views, etc. It's used in [paperclip.js](/classdojo/paperclip.js), and [mojo.js](/classdojo/mojo.js).

First create an object that you want to add to the pool party:

```javascript

var poolParty = require("poolparty");

function SomeView (options) {
  this.reset(options);
}


SomeView.prototype.render = function () {
  // do something
}

SomeView.prototype.reset = function (options) {
  // reset options on the view
}

SomeView.prototype.dispose = function () {
  
}


SomeView.pool = poolParty({
  create: function (options) {
    return new SomeView(options);
  },
  recycle: function (someView, options) {
    someView.reset(options);
  }
});

module.exports = SomeView;
```

Next, use it:

```javascript
var SomeView = require("./someView");

var view = SomeView.create({});
view.render();
view.dispose();
console.log(SomeView.create({}) === view); // true
```


### API

#### pool poolparty(options)

- `max` - the max number of objects allowed in a pool
- `min` - minimum number of items to use in the pool
- `keepAliveTimeout` - the number of MS before destroying a stale object
- `factory` - the function which creates a pool object
- `recycle` - called whenever an object is recycled


### pool.size()

returns the size of the pool

### pool.drip()

removes one item from the pool

### pool.drain()

removes all items from the pool except the min

### object pool.add(item)

Adds an object to the pool

### object pool.create(options)

creates, or uses a recycled object


### object.dispose()

disposes the object, and adds it back to the object pool



