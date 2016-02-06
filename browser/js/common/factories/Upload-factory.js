app.factory('UploadFactory', function(){
    return {
        data: null,
        add: function() {
            var files = document.getElementById('file').files;
            for (var k in files) {
                if (Number.isNaN(parseInt(k))) continue;
                (function (file) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        // get file content
                        var text = e.target.result;
                        console.log("result:", text);
                    };
                    fileReader.readAsArrayBuffer(file);
                })(files[k]);
            }
        }
    }
});