app.directive('checklistInput', ['$rootScope', '$timeout', 'Upload', 'api', 'images', function($rootScope, $timeout, Upload, api) {
    return {
        restrict: 'EA',
        scope: {
            item: '=',
            cols: '=',

        },
        link: function (scope, iElement, iAttrs) 
        {
          scope.lang   = $rootScope.lang;
          scope.locale = $rootScope.locale;
          scope.hive   = $rootScope.hive;
          scope.hives  = $rootScope.hives;
          scope.user   = $rootScope.user;
          scope.locations = $rootScope.hives;
          scope.beeraces  = $rootScope.beeraces;
          scope.hivetypes = $rootScope.hivetypes;
          scope.inspection= $rootScope.inspection;

          scope.setActiveImage = function(imageUrl)
          {
            $rootScope.setActiveImage(imageUrl);
          }

          scope.$watch('item.value', function(newValue, oldValue) 
          {
            if (scope.item.input == 'image')
            {
              if (typeof newValue == 'object' && newValue !== null) // new image
              {
                // value is filled
                var file = newValue;
                //console.log('image', file);
                if (!file.$error) {
                  Upload.upload({
                      headers : 
                      {
                          'Authorization'  : 'Bearer '+api.getApiToken()+'',
                      },
                      url: API_URL + 'images',
                      data: {
                        user_id:     scope.user.id,
                        hive_id:     scope.hive != null ? scope.hive.id : '',
                        category_id: scope.item.id,
                        inspection:  scope.inspection != null ? scope.inspection.id : '',
                        file:        file  
                      }
                  }).then(
                  function (resp) {
                      $timeout(function() {
                          if (typeof resp.data != 'undefined' && typeof resp.data.thumb_url)
                            $rootScope.changeChecklistItem(scope.item.input, scope.item.id, resp.data.thumb_url, true);
                      });
                  }, 
                  function (resp) {
                    console.error('Image upload error: ' + resp.status, resp.data);
                  }
                  ,function (evt) {
                      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                      scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + scope.log;
                  });
                }
              }
              else if (newValue == null && typeof oldValue == 'object' && oldValue !== null)// newValue == null, 
              {
                // image is removed
                api.deleteApiRequest('imageRemove', 'images', scope.item.value);
                $rootScope.changeChecklistItem(scope.item.input, scope.item.id, null, true);
              }
            }
            else
            {
              if (oldValue != newValue) 
              {
                //console.log(scope.item.input, scope.item.id, newValue);
                if (scope.item.input == 'list' && (newValue === true || newValue === false)) // boolean list
                {
                  // only carry out addRemoveFromList (from item html)
                }
                else
                {
                  $rootScope.changeChecklistItem(scope.item.input, scope.item.id, newValue, true);
                }
              }
            }
          });

          scope.addRemoveFromList = function(listItem)
          { 
            var id = listItem.id;
            var add= typeof listItem.value == 'undefined' ? true : listItem.value;

            console.log('ar', scope.item.id, id, add, scope.item.value);

            var selected_array = typeof scope.item.value != 'undefined' ? scope.item.value.split(',') : [];
            var i = selected_array.indexOf(id+'');
            if (add && i == -1) // add -> listItem.value == true
            {
              selected_array.push(id+'');
            }
            else if (i > -1)
            {
              selected_array.splice(i, 1);
            }

            var value = selected_array.join(',');
            scope.item.value = value;

            $rootScope.changeChecklistItem(scope.item.input, scope.item.id, value, true);
          };

          scope.gradeOptions = {
            showTicksValues:true,
            floor:0,
            ceil:10,
            stepsArray:[
              {value: 0, legend: '-'},
              {value: 1, legend: scope.lang.Poor},
              {value: 2, legend: ''},
              {value: 3, legend: ''},
              {value: 4, legend: ''},
              {value: 5, legend: scope.lang.Average},
              {value: 6, legend: ''},
              {value: 7, legend: ''},
              {value: 8, legend: ''},
              {value: 9, legend: ''},
              {value: 10, legend: scope.lang.Excellent}
            ],
            getPointerColor: function(value) {
                if (value == 0)
                    return '#CCC';
                if (value < 4)
                    return '#8F1619';
                if (value < 6)
                    return '#5F3F90';
                if (value < 8)
                    return '#243D80';
                if (value < 11)
                    return '#069518';

                return '#F29100';
            },
            getTickColor: function(value) {
                if (value == 0)
                    return '#CCC';
                if (value < 4)
                    return '#8F1619';
                if (value < 6)
                    return '#5F3F90';
                if (value < 8)
                    return '#243D80';
                if (value < 11)
                    return '#069518';

                return '#F29100';
            },
          };

          scope.scoreQualityOptions = {
            showTicksValues:true,
            floor:0,
            ceil:4,
            stepsArray:[
              {value: 0, legend: '-'},
              {value: 1, legend: scope.lang.Poor},
              {value: 2, legend: scope.lang.Fair},
              {value: 3, legend: scope.lang.Good},
              {value: 4, legend: scope.lang.Excellent}
            ],
            getPointerColor: function(value) {
                if (value == 0)
                    return '#CCC';
                if (value == 1)
                    return '#8F1619';
                if (value == 2)
                    return '#5F3F90';
                if (value == 3)
                    return '#243D80';
                if (value == 4)
                    return '#069518';

                return '#F29100';
            },
            getTickColor: function(value) {
                if (value == 0)
                    return '#CCC';
                if (value == 1)
                    return '#8F1619';
                if (value == 2)
                    return '#5F3F90';
                if (value == 3)
                    return '#243D80';
                if (value == 4)
                    return '#069518';

                return '#F29100';
            },
          };

          scope.scoreAmountOptions = {
            showTicksValues:true, 
            floor:0,
            ceil:4,
            stepsArray:[
              {value: 0, legend: '-'},
              {value: 1, legend: scope.lang.Low},
              {value: 2, legend: scope.lang.Medium},
              {value: 3, legend: scope.lang.High},
              {value: 4, legend: scope.lang.Extreme}
            ],
            getPointerColor: function(value) {
                if (value == 0)
                    return '#CCC';
                if (value == 1)
                    return '#069518';
                if (value == 2)
                    return '#243D80';
                if (value == 3)
                    return '#5F3F90';
                if (value == 4)
                    return '#8F1619';

                return '#F29100';
            },
            getTickColor: function(value) {
                if (value == 0)
                    return '#CCC';
                if (value == 1)
                    return '#069518';
                if (value == 2)
                    return '#243D80';
                if (value == 3)
                    return '#5F3F90';
                if (value == 4)
                    return '#8F1619';

                return '#F29100';
            },
          };

          scope.scorePercentageOptions = {
            ticksArray: [0, 25, 50, 75, 100], 
            floor:-1, 
            ceil:100,
            translate: function(value) {
                if (value == -1 || isNaN(value))
                    return '-';
                
                return value + '%';
            },
            getPointerColor: function(value) {
                if (value == -1 || isNaN(value))
                    return '#CCC';

                return '#F29100';
            },
          };
        },
        templateUrl: '/app/views/forms/checklist_input.html?v=3'
    };
}]);

