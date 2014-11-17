/*!
 * plasma <https://github.com/jonschlinkert/plasma>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var typeOf = require('kind-of');
var Options = require('option-cache');
var debug = require('debug')('plasma');
var relative = require('relative');
var yaml = require('js-yaml');
var glob = require('globby');
var _ = require('lodash');

/**
 * Create an instance of `Plasma`, optionally passing
 * an object of `data` to initialize with.
 *
 * ```js
 * var Plasma = require('plasma');
 * var plasma = new Plasma();
 * ```
 *
 * @param {Object} `data`
 * @api public
 */

var Plasma = module.exports = function Plasma(data) {
  Options.call(this);
  this.data = {};
  this._initPlasma();
};

util.inherits(Plasma, Options);

/**
 * Initialize plasma defaults.
 *
 * @api private
 */

Plasma.prototype._initPlasma = function() {
  this.enable('namespace');
};

/**
 * Load data from the given `value`.
 *
 * @param {String|Array|Object} `value` String or array of glob patterns or file paths, or an object or array of objects.
 * @param {Object} `options`
 * @return {Object}
 * @api private
 */

Plasma.prototype.load = function(value, options) {
  debug('loading data: %s', value);
  var opts = _.extend({}, this.options, options);

  if (typeOf(value) === 'object') {
    return this.merge(value);
  }

  if (Array.isArray(value) || typeof value === 'string') {
    // If the first arg is not a string or array, it's not a glob
    if (typeOf(value[0]) === 'object') {
      return this.mergeArray(value);
    }
    return this.glob(value, opts);
  }
};

/**
 * Merge an array of objects onto the `cache` object. We
 * keep this method separate for performance reasons.
 *
 * @param  {String} `patterns` Glob patterns to pass to [globby]
 * @param  {Object} `opts` Options for globby, or pass a custom `parse` or `name`.
 * @return {Object}
 * @api public
 */

Plasma.prototype.merge = function(obj) {
  debug('merge: %s', obj);
  return _.merge(this.data, obj);
};

/**
 * Merge an array of objects onto the `cache` object. We
 * keep this method separate for performance reasons.
 *
 * @param  {String} `patterns` Glob patterns to pass to [globby]
 * @param  {Object} `opts` Options for globby, or pass a custom `parse` or `name`.
 * @return {Object}
 * @api public
 */

Plasma.prototype.mergeArray = function(arr) {
  debug('mergeArray: %s', arr);

  return arr.reduce(function (acc, val) {
    return _.merge(acc, val);
  }, this.data);
};

/**
 * Load an object from all files matching the given `patterns`
 * and `options`.
 *
 * @param  {String} `patterns` Glob patterns to pass to [globby]
 * @param  {Object} `opts` Options for globby, or pass a custom `parse` or `name`.
 * @return {Object}
 * @api public
 */

Plasma.prototype.glob = function(patterns, options) {
  debug('glob: %s', patterns);

  var opts = _.extend({cwd: process.cwd()}, this.options, options);
  var files = glob.sync(patterns, opts);

  if (!files || files.length === 0) {
    // if this happens, it's probably an array of non-filepath
    // strings, or invalid path/glob patterns
    return patterns;
  }

  return files.reduce(function (cache, fp) {
    fp = relative(path.resolve(opts.cwd, fp));
    var key = name(fp, opts);
    var obj = read(fp, opts);

    // if the filename is `data`, or if `namespace` is
    // turned off, merge data onto the root
    if (key === 'data' || opts.namespace === false) {
      this.merge(obj);
    } else {
      cache[key] = obj;
    }

    return cache;
  }.bind(this), this.data);
};

/**
 * Default `namespace` function. Pass a function on `options.namespace`
 * to customize.
 *
 * @param {String} `fp`
 * @param {Object} `opts`
 * @return {String}
 * @api private
 */

function name(fp, opts) {
  if (opts && opts.namespace) {
    return opts.namespace(fp, opts);
  }
  var ext = path.extname(fp);
  return path.basename(fp, ext);
}

/**
 * Default `read` function. Pass a function on `options.read`
 * to customize.
 *
 * @param {String} `fp`
 * @param {Object} `opts`
 * @return {String}
 * @api private
 */

function read(fp, opts) {
  if (opts && opts.read) {
    return opts.read(fp, opts);
  }
  return readData(fp, opts);
}

/**
 * Utility for reading data files.
 *
 * @param {String} `fp` Filepath to read.
 * @param {Object} `options` Options to pass to [js-yaml]
 * @api private
 */

function readData(fp, options) {
  var opts = _.extend({}, options);
  var ext = opts.lang || path.extname(fp);

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  try {
    switch (ext) {
    case '.json':
      return require(path.resolve(fp));
    case '.yml':
    case '.yaml':
      return yaml.load(fs.readFileSync(fp, 'utf8'), opts);
    }
  } catch(err) {}
  return {};
}
