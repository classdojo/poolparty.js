var poolparty = require("../"),
expect = require("expect.js"),
structr = require("structr");

describe("poolparty", function() {

  var objectPool, objects = {};

  var TestObject = structr({
    __construct: function(options) {
      this.reset(options);
    },
    reset: function(options) {
      this.options = options;
    },
    dispose: function() {
      this._wasDisposed = true;
    }
  })

  it("can create a pool party", function() {
    objectPool = poolparty({
      max: 50,
      staleTimeout: 10,
      factory: function(options) {
        return new TestObject(options);
      },
      reset: function(testObject, options) {
        testObject.reset(options);
      }
    })
  })

  it("can create an object", function() {
    expect(object.obj1 = objectPool.create({name:"craig"}).options.name).to.be("craig");
  });

  it("can dispose an object", function() {
    object.obj1.dispose();
    expect(objectPool._pool).to.contain(object.obj1);
  })


  it("can recycle an object", function() {
    expect(object.obj2 = objectPool.create({name:"jake"}).options.name).to.be("jake");
    expect(object.obj2).to.be(object.obj1);
  });

  it("can dispose an object using .add()", function() {
    objectPool.add(object.obj2);
    expect(objectPool._pool).to.contain(object.obj2);
  });

  it("cannot re-add the same object", function() {
    objectPool.add(object.obj1);
    expect(objectPool._pool.length).to.be(1);
  });

  it("cannot go past the limit of adding an object to a pool", function() {
    var objects = [];
    for(var i = 100; i--;) {
      objects.push(objectPool.create({name:"john"}));
    }

    for(i = objects.length; i--;) {
      objects[i].dispose();
      expect(objectPool.length()).to.be.less.than(objectPool.max);
    }
  });


  it("can remove a stale object", function() {
    var obj = objectPool.create({name:"john"});

    obj.dispose();

    setTimeout(function() {
      expect(objectPool._pool).not.to.contain(obj);
    }, 11);
  })

});