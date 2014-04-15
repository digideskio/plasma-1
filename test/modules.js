/**
 * plasma <https://github.com/jonschlinkert/plasma>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

const expect = require('chai').expect;
const _ = require('lodash');
const plasma = require('../');


describe('plasma.load()', function () {
  describe('when npm modules are defined as a string', function () {
    it('should require them and expose the module\'s properties on the modules object', function (done) {
      var fixture = 'node-foo';
      var actual = plasma.load(fixture).modules;

      expect(_.keys(actual.resolved).length).to.equal(3);
      expect(actual.resolved).to.include.keys('node_foo_aaa');
      expect(actual.resolved.node_foo_aaa).to.be.a('function');
      done();
    });
  });

  describe('when npm modules are defined as an array', function () {
    it('should require them and expose the module\'s properties on the modules object', function (done) {
      var fixture = ['node-bar', 'node-baz'];
      var actual = plasma.load(fixture).modules;

      expect(_.keys(actual.resolved).length).to.equal(6);
      expect(actual.resolved).to.include.keys('node_bar_aaa');
      expect(actual.resolved).to.include.keys('node_baz_aaa');
      expect(actual.resolved.node_baz_aaa).to.be.a('function');
      done();
    });
  });


  describe('when local modules are defined as a string', function () {
    it('should require them and expose the module\'s properties on the modules object', function (done) {
      var fixture = 'test/fixtures/fn/plugin.js';
      var actual = plasma.load(fixture).modules;

      expect(_.keys(actual.resolved).length).to.equal(1);
      expect(actual.resolved).to.include.keys('convert');
      expect(actual.resolved.convert).to.be.a('function');
      done();
    });

    it('should require them and expose the module\'s properties on the modules object:', function (done) {
      var fixture = 'test/fixtures/fn/lower.js';
      var actual = plasma.load(fixture).modules;

      expect(actual.resolved.lowercase('FOO')).to.equal('foo');
      done();
    });
  });


  describe('when local modules are defined as glob patterns:', function () {
    describe('and the pattern is a string', function () {
      it('should require them and expose the module\'s properties on the modules object', function (done) {
        var fixture = 'test/fixtures/fn/*.js';
        var actual = plasma.load(fixture).modules;

        expect(actual.resolved.lowercase('FOO')).to.equal('foo');
        expect(actual.resolved).to.include.keys('convert');
        expect(actual.resolved.convert).to.be.a('function');
        done();
      });
    });

    describe('and the patterns are an array', function () {
      it('should require them and expose the module\'s properties on the modules object', function (done) {
        var fixture = ['test/fixtures/fn/*.js'];
        var actual = plasma.load(fixture).modules;

        expect(actual.resolved.lowercase('FOO')).to.equal('foo');
        expect(actual.resolved).to.include.keys('convert');
        expect(actual.resolved.convert).to.be.a('function');
        done();
      });
    });
  });


  describe('when local modules are defined as an object:', function () {
    describe('and glob patterns defined in the src property', function () {
      it('should require them and expose the module\'s properties on the modules object', function (done) {
        var fixture = {src: ['test/fixtures/fn/*.js']};
        var actual = plasma.load(fixture).modules;

        expect(actual.resolved.lowercase('FOO')).to.equal('foo');
        expect(actual.resolved).to.include.keys('convert');
        expect(actual.resolved.convert).to.be.a('function');
        done();
      });
    });
  });



  describe('when modules are defined', function () {
    it('should be able to pass in a config object as a second parameter', function (done) {
      var fixture = {src: ['test/fixtures/fn/*.js']};
      var actual = plasma.load(fixture, {config: {a: {b: 'c'}}}).modules;

      expect(actual.resolved.lowercase('FOO')).to.equal('foo');
      expect(actual.resolved).to.include.keys('convert');
      expect(actual.resolved.convert).to.be.a('function');
      done();
    });
  });
});
