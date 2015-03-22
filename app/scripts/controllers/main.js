'use strict';

/**
 * @ngdoc function
 * @name textsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the textsApp
 */
angular.module('textsApp')
  .controller('MainCtrl', function($scope, $http) {


    Transcript.load(
      $http,
      function(trans) {
        $scope.transcript = trans;
      },
      function(data, status) {
        console.error(status);
      }
    );

    $scope.addField = function(type) {
      type = type || 'text';
      $scope.transcript.addField(type, '');
    };

    $scope.submit = function() {
      $scope.transcript.save(
        $http,
        function() {
          console.log('success');
        },
        function() {
          console.log('error');
        }
      );
    };
  });

angular.module('textsApp')
  .directive('textField', function() {
    return {
      restrict: 'E',
      scope: {
        field: '=field'
      },
      templateUrl: 'directives/text-field-directive.html',
      link: function($scope, $timeout, element) {
        $scope.unknownLetter = function() {
          insert_at_cursor('#');
        };

        $scope.unknownWord = function() {
          insert_at_cursor(' {{WORD}} ');
        };
        $scope.unknownRow = function() {
          insert_at_cursor('\n{{ROW}}\n');
        };


        function insert_at_cursor(str) {
          console.log(element);
          var $textarea = $('textarea', element);
          var txt = $scope.field.text;
          var pos = $textarea.prop('selectionStart');
          $scope.field.text = [
            txt.slice(0, pos),
            str,
            txt.slice(pos),
          ].join('');
          $textarea.focus();
        }

        function setCaretPosition(elem, caretPos) {
          if (elem != null) {
            if (elem.createTextRange) {
              var range = elem.createTextRange();
              range.move('character', caretPos);
              range.select();
            } else {
              if (elem.selectionStart) {
                elem.focus();
                console.log(elem);
                elem.setSelectionRange(caretPos, caretPos);
              } else
                elem.focus();
            }
          }
        }
      }
    };
  });

var Transcript = function(data) {

  this.image = data.image;
  this.id = data.id;
  this.name = data.name;

  this.fields = [];
  data.fields.forEach(function(field) {
    this.fields.push(new TextField(field))
  }.bind(this));
};

Transcript.prototype.save = function($http, success, error) {

  $http.post('/data.json', this.toObject())
    .success(success)
    .error(error);
};

Transcript.prototype.addField = function(type, data) {
  this.fields.push(new TextField(data));
};


Transcript.load = function($http, success, error) {
  $http.get('/data.json')
    .success(function(data) {
      return success(new Transcript(data));
    })
    .error(error);
};

Transcript.prototype.toObject = function() {
  var data = {};

  data.name = this.name;
  data.id = this.id;
  data.image = this.image;


  data.fields = this.fields.map(function(field) {
    return field.toObject();
  });
  return data;
};


var TextField = function(data) {
  this.text = data.text;
};

TextField.prototype.toObject = function() {
  var rows = this.text.split('\n');

  rows = rows.map(function(row) {
    return row.split('');
  });

  return rows;
};
