angular.module('app', []);

angular.module('app').directive('home', require('/library/directiveHome.js'));
angular.module('app').directive('flows', require('/library/directiveFlows.js'));
angular.module('app').directive('newFlow', require('/library/directiveNewFlow.js'));
angular.module('app').directive('focus', require('/library/directiveFocus.js'));
angular.module('app').directive('editFlow', require('/library/directiveEditFlow.js'));
angular.module('app').directive('editFlowStatement', require('/library/directiveEditFlowStatement.js'));
angular.module('app').directive('editFlowSteps', require('/library/directiveEditFlowSteps.js'));
angular.module('app').directive('editFlowBlock', require('/library/directiveEditFlowBlock.js'));
angular.module('app').directive('editFlowExecute', require('/library/directiveEditFlowExecute.js'));
angular.module('app').directive('editFlowEvaluate', require('/library/directiveEditFlowEvaluate.js'));
angular.module('app').directive('editFlowSet', require('/library/directiveEditFlowSet.js'));
angular.module('app').directive('tests', require('/library/directiveTests.js'));
