angular.module('app', []);

angular.module('app').directive('home', require('/library/directiveHome.js'));
angular.module('app').directive('flows', require('/library/directiveFlows.js'));
angular.module('app').directive('newFlow', require('/library/directiveNewFlow.js'));
angular.module('app').directive('focus', require('/library/directiveFocus.js'));