app.factory('HomeFactory', function($http){
    var HomeFactory = {};
    HomeFactory.getTracks = function(){
            return $http.get('/api/tracks')
                .then(tracks => {
                    console.log("tracks in factory", tracks);
                   return tracks.data;
                });
        }
    return HomeFactory
});
