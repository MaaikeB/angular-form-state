'use strict'

module.exports = function ($interpolate, $parse) {
  return {
    require: '^bdSubmit',
    restrict: 'A',
    compile: function (element, attributes) {
      if (!attributes.type) {
        attributes.$set('type', 'submit')
      }
      return function (scope, element, attributes, controller) {
        var original = element.text()
        function ngDisabled () {
          return attributes.ngDisabled && !!$parse(attributes.ngDisabled)(scope)
        }
        scope.$watch(function () {
          return controller.pending
        }, function (pending) {
          attributes.$set('disabled', pending || ngDisabled())
          element.text($interpolate(pending ? attributes.pending : original)(scope))
        })
      }
    }
  }
}
module.exports.$inject = ['$interpolate', '$parse']
