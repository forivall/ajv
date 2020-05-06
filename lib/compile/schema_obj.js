'use strict';

/* eslint-disable valid-jsdoc */

var util = require('./util');

module.exports = SchemaObject;

/** @class */
function SchemaObject(obj) {
  util.copy(obj, this);
}
