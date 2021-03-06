'use strict'

/*global describe beforeEach it*/

var angular = require('angular')
require('angular-mocks/ngMock')
var expect = require('chai').use(require('sinon-chai')).expect
var sinon = require('sinon')

module.exports = function () {
  var $compile, $timeout, $exceptionHandler, scope, element, controller
  beforeEach(angular.mock.inject(function ($injector) {
    $compile = $injector.get('$compile')
    $timeout = $injector.get('$timeout')
    $exceptionHandler = $injector.get('$exceptionHandler')
    scope = $injector.get('$rootScope').$new()
    element = $compile('<form bd-submit="submitHandler()" />')(scope)
    controller = element.controller('bdSubmit')
  }))

  beforeEach(function () {
    scope.submitHandler = sinon.stub()
  })

  it('attaches submission state to FormController', function () {
    expect(element.controller('form'))
      .to.have.a.property('submission', controller)
  })

  it('starts with clean state', function () {
    expect(controller).to.contain({
      succeeded: false,
      failed: false,
      attempted: false,
      pending: false,
      attempts: 0,
      error: null
    })
  })

  it('tracks attempts', function () {
    sinon.spy(controller, 'setPending')
    element.triggerHandler('submit')
    expect(controller.setPending).to.have.been.called
    expect(controller.pending).to.be.true
    expect(controller.attempts).to.equal(1)
  })

  it('succeeds when the expression does not return a promise', function () {
    sinon.spy(controller, 'setSuccess')
    element.triggerHandler('submit')
    expect(controller.setSuccess).to.not.have.been.called
    $timeout.flush()
    expect(controller.setSuccess).to.have.been.called
  })

  it('succeeds when the expression returns a fulfilled promise', function () {
    scope.submitHandler.resolves()
    sinon.spy(controller, 'setSuccess')
    element.triggerHandler('submit')
    expect(controller.setSuccess).to.not.have.been.called
    $timeout.flush()
    expect(controller.setSuccess).to.have.been.called
  })

  it('fails when the expression returns a rejected promise', function () {
    var err = new Error()
    scope.submitHandler.rejects(err)
    sinon.spy(controller, 'setFailure')
    element.triggerHandler('submit')
    $timeout.flush()
    expect(controller.setFailure).to.have.been.calledWith(err)
    expect(controller.error).to.equal(err)
    expect($exceptionHandler.errors).to.deep.equal([err])
  })

  describe('Replicating ngSubmit behavior', function () {
    // Tests adapted from Angular's own suite
    // https://github.com/angular/angular.js/blob/master/test/ng/directive/ngEventDirsSpec.js#L12-L41

    it('is called on form submit', function () {
      expect(scope.submitHandler).to.not.have.been.called
      element.triggerHandler('submit')
      expect(scope.submitHandler).to.have.been.called
    })

    it('exposes $event on form submit', function () {
      element = $compile('<form bd-submit="submitHandler($event)" />')(scope)
      expect(scope.submitHandler).to.not.have.been.called
      element.triggerHandler('submit')
      expect(scope.submitHandler).to.have.been.calledWith(sinon.match.has('preventDefault'))
    })

  })

}
