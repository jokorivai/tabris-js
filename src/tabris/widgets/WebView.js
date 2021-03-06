tabris.registerWidget("WebView", {

  _type: "rwt.widgets.Browser",

  _events: {
    navigate: {
      trigger: function(event, name) {
        var intercepted = false;
        event.preventDefault = function() {
          intercepted = true;
        };
        this.trigger(name, this, event);
        return intercepted;
      }
    },
    load: {
      name: "Progress",
      trigger: function(event) {
        this.trigger("load", this, event);
      }
    },
    message: {
      trigger: function(event) {
        this.trigger("message", this, event);
      }
    }
  },

  _properties: {
    url: {type: "string", nocache: true},
    html: {type: "string", nocache: true},
    headers: {type: "any", default: {}},
    initScript: {type: "string"}
  },

  postMessage: function(data, targetOrigin) {
    this._nativeCall("postMessage", {
      data: data,
      origin: targetOrigin
    });
    return this;
  }

});
