describe("Properties", function() {
  /*globals _:false*/

  var object;
  var TestType;

  beforeEach(function() {
    TestType = function() {};
    TestType._properties = {};
    object = new TestType();
    object.toString = function() {
      return "TestType";
    };
    _.extend(object, tabris.Properties);
  });

  it ("set returns self", function() {
    expect(object.set("foo", "bar")).toBe(object);
  });

  it ("set calls _checkDisposed", function() {
    object._checkDisposed = jasmine.createSpy();

    object.set("foo", "bar");

    expect(object._checkDisposed).toHaveBeenCalled();
  });

  it ("set stores single property", function() {
    object.set("foo", "bar");
    expect(object.get("foo")).toBe("bar");
  });

  it ("set stores multiple properties", function() {
    object.set({foo: "bar", foo2: "bar2"});
    expect(object.get("foo")).toBe("bar");
    expect(object.get("foo2")).toBe("bar2");
  });

  it ("get returns undefined for unset property", function() {
    expect(object.get("foo")).toBeUndefined();
  });

  it ("get returns default value if nothing was set", function() {
    TestType._properties.foo = {default: "bar"};

    expect(object.get("foo")).toBe("bar");
  });

  it ("get does not return default value if something was set", function() {
    TestType._properties.foo = {default: "bar"};

    object.set("foo", "something else");

    expect(object.get("foo")).toBe("something else");
  });

  it("calls encoding function if present", function() {
    TestType._properties.knownProperty = {type: {
      encode: jasmine.createSpy().and.returnValue(true)
    }};
    spyOn(console, "warn");

    object.set("knownProperty", true);

    expect(TestType._properties.knownProperty.type.encode).toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("raises a warning if encoding function throws", function() {
    TestType._properties.knownProperty = {type: {
      encode: jasmine.createSpy().and.throwError("My Error")
    }};
    spyOn(console, "warn");

    object.set("knownProperty", true);

    var message = "TestType: Ignored unsupported value for property \"knownProperty\": My Error";
    expect(console.warn).toHaveBeenCalledWith(message);
  });

  it ("get returns value from decoding function if present", function() {
    TestType._properties.foo = {type: {
      decode: jasmine.createSpy().and.returnValue("bar2")
    }};

    object.set("foo", "bar");

    var value = object.get("foo");

    expect(TestType._properties.foo.type.decode).toHaveBeenCalledWith("bar");
    expect(value).toBe("bar2");
  });

  describe("get", function() {

    it ("calls custom getter with property name", function() {
      var getter = jasmine.createSpy();
      object.set("foo", "bar");
      TestType._properties.foo = {get: getter};

      object.get("foo");

      expect(getter).toHaveBeenCalledWith("foo");
    });

    it ("returns value from custom getter", function() {
      TestType._properties.foo = {get: jasmine.createSpy().and.returnValue("bar")};

      expect(object.get("foo")).toBe("bar");
    });

  });

  describe("set", function() {

    it ("calls custom setter", function() {
      var setter = jasmine.createSpy();
      TestType._properties.foo = {set: setter};
      object.set("foo", "bar");

      expect(setter).toHaveBeenCalledWith("foo", "bar", {});
    });

    it ("stores nothing if custom setter exists", function() {
      TestType._properties.foo = {set: function() {}};
      object.set("foo", "bar");

      expect(object.get("foo")).toBe(undefined);
    });

    it ("calls custom setter with options", function() {
      var setter = jasmine.createSpy().and.returnValue(true);
      TestType._properties.foo = {set: setter};
      object.set("foo", "bar", {foo2: "bar2"});

      expect(setter).toHaveBeenCalledWith("foo", "bar", {foo2: "bar2"});
    });

  });

  describe("with Events:", function() {

    var listener;

    beforeEach(function() {
      _.extend(object, tabris.Events);
      listener = jasmine.createSpy();
    });

    it ("set triggers change event", function() {
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(object);
      expect(listener.calls.argsFor(0)[1]).toBe("bar");
      expect(listener.calls.argsFor(0)[2]).toEqual({});
    });

    it ("set triggers change event with decoded value", function() {
      TestType._properties.foo = {type: tabris.PropertyTypes.boolean};
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(object);
      expect(listener.calls.argsFor(0)[1]).toBe(true);
      expect(listener.calls.argsFor(0)[2]).toEqual({});
    });

    it ("set (two parameters) triggers change event with options", function() {
      object.on("change:foo", listener);

      object.set({foo: "bar"}, {foo2: "bar2"});

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(object);
      expect(listener.calls.argsFor(0)[1]).toBe("bar");
      expect(listener.calls.argsFor(0)[2]).toEqual({foo2: "bar2"});
    });

    it ("set (three parameters) triggers change event with options", function() {
      object.on("change:foo", listener);

      object.set("foo", "bar", {foo2: "bar2"});

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(object);
      expect(listener.calls.argsFor(0)[1]).toBe("bar");
      expect(listener.calls.argsFor(0)[2]).toEqual({foo2: "bar2"});
    });

    it ("set triggers no change event if value is unchanged", function() {
      object.set("foo", "bar");
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).not.toHaveBeenCalled();
    });

    it ("set triggers no change event if encoded value is unchanged", function() {
      TestType._properties.foo = {type: tabris.PropertyTypes.boolean};
      object.set("foo", true);
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).not.toHaveBeenCalled();
    });

  });

});
