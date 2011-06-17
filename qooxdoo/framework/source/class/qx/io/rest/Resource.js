/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.io.rest.Resource",
{
  extend : qx.core.Object,

  construct: function()
  {
    this.base(arguments);

    this.__createRequest();
    this.__routes = {};
  },

  events:
  {
    "error": "qx.event.type.Rest"
  },

  members:
  {
    __routes: null,
    __request: null,
    __invoked: null,
    __configureRequestCallback: null,

    //
    // Request
    //

    configureRequest: function(callback) {
      this.__configureRequestCallback = callback;
    },

    _getRequest: function() {
      return new qx.io.request.Xhr();
    },

    __createRequest: function() {
      if (this.__request) {
        this.__request.dispose();
      }

      this.__request = this._getRequest();
      return this.__request;
    },

    //
    // Routes and actions
    //

    map: function(method, url, action) {
      this.__routes[action] = [method, url];

      if (typeof this[action] !== "undefined") {
        throw new Error("Method with name of action (" +
          action + ") already exists. Choose another action name.");
      }

      this.__declareEvent(action + "Success");
      this.__declareEvent(action + "Error");

      this[action] = qx.lang.Function.bind(function() {
        this._invoke(action);
        return this;
      }, this);
    },

    _invoke: function(action) {
      var req = this.__request,
          params = this._getRequestParams(action);

      // Create new request when invoked before
      if (this.__invoked) {
        req = this.__createRequest();
      }

      // Configure request
      if (this.__configureRequestCallback) {
        this.__configureRequestCallback.call(this, req, action);
      }

      // Set method and URL
      req.set({
        method: params[0],
        url: params[1]
      });

      // Handle successful request
      req.addListener("success", function() {
        var props = [req.getResponse(), null, false, req, action, req.getPhase()];
        this.fireEvent(action + "Success", qx.event.type.Rest, props);
      }, this);

      // Handle erroneous request
      req.addListener("fail", function() {
        var props = [req.getResponse(), null, false, req, action, req.getPhase()];
        this.fireEvent(action + "Error", qx.event.type.Rest, props);
        this.fireEvent("error", qx.event.type.Rest, props);
      }, this);

      req.send();
      this.__invoked = true;
    },

    /**
     * @internal
     */
    _getRequestParams: function(action) {
      return this.__routes[action];
    },

    __declareEvent: function(type) {
      if (!this.constructor.$$events) {
        this.constructor.$$events = {};
      }

      if (!this.constructor.$$events[type]) {
        this.constructor.$$events[type] = "qx.event.type.Rest";
      }
    }
  },

  destruct: function() {
    this.__request && this.__request.dispose();
  }
});