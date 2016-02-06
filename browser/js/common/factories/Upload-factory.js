//DEPRICATED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

app.factory('UploadFactory', function($http){
    return {
        data: null,
        add: function() {
            var files = toArray(document.getElementById('file').files);
            console.log(files);
            console.log("F");
            return $http.post('/upload', files);
            //for (var k in files) {
            //    if (Number.isNaN(parseInt(k))) continue;
            //    (function (file) {
            //        var fileReader = new FileReader();
            //        fileReader.onload = function (e) {
            //            // get file content
            //            var text = e.target.result;
            //            console.log("result:", text);
            //        };
            //        fileReader.readAsArrayBuffer(file);
            //    })(files[k]);
            //}
        }
    }
});