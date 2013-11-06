var windowURL = window.URL || window.webkitURL;

ko.bindingHandlers.file = {
    init: function (element, valueAccessor) {
        $(element).change(function () {
            var file = this.files[0];
            if (ko.isObservable(valueAccessor())) {
                valueAccessor()(file);
            }
        });
    },

    update: function (element, valueAccessor, allBindingsAccessor) {
        var file = ko.utils.unwrapObservable(valueAccessor());
        var bindings = allBindingsAccessor();

        if (bindings.imageBase64 && ko.isObservable(bindings.imageBase64)) {
            if (!file) {
                bindings.imageBase64(null);
                bindings.imageType(null);
            } else {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var result = e.target.result || {};
                    var resultParts = result.split(",");
                    if (resultParts.length === 2) {
                        bindings.imageBase64(resultParts[1]);
                        bindings.imageType(resultParts[0]);
                    }

                    //Now update fileObjet, we do this last thing as implementation detail, it triggers post
                    if (bindings.fileObjectURL && ko.isObservable(bindings.fileObjectURL)) {
                        var oldUrl = bindings.fileObjectURL();
                        if (oldUrl) {
                            windowURL.revokeObjectURL(oldUrl);
                        }
                        bindings.fileObjectURL(file && windowURL.createObjectURL(file));
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }
};

var imageListModel = function () {
    var self = {};

    var slotModel = function () {
        var that = {};

        that.imageFile = ko.observable();
        that.imageObjectURL = ko.observable();
        that.imageBinary = ko.observable();
        that.image = ko.observable();
        that.imageType = ko.observable();

        that.imageObjectURL.subscribe(function () {
            var img = {
                Image: that.image(),
                ImageType: that.imageType()
            };
            self.salvarImagem(img).done(function (result) {
                var img = result.ImageType + ',' + result.Image;
                cosole.log(img);
                that.imageSrcRetorno(img);
            });
        });

        that.imageSrcRetorno = ko.observable();

        that.fileSize = ko.computed(function () {
            var file = this.imageFile();
            return file ? file.size / 1024 : 0;
        }, that);

        that.firstBytes = ko.computed(function () {
            if (that.imageBinary()) {
                var buf = new Uint8Array(that.imageBinary());
                var bytes = [];
                for (var i = 0; i < Math.min(10, buf.length) ; ++i) {
                    bytes.push(buf[i]);
                }
                return '[' + bytes.join(', ') + ']';
            } else {
                return '';
            }
        }, that);

        return that;
    };

    self.salvarImagem = function (expense) {
        return ajaxRequest("put", '/api/Values/3', ko.toJSON(expense))
            .fail(function (e) {
                console.log(e);
            });
    };

    function ajaxRequest(type, url, data, dataType) { // Ajax helper
        var options = {
            dataType: dataType || "json",
            contentType: "application/json",
            cache: false,
            type: type,
            data: data ? data : null
        };
        return $.ajax(url, options);
    }

    self.beforeRemoveSlot = function (element, index, data) {
        if (data.imageObjectURL()) {
            windowURL.revokeObjectURL(data.imageObjectURL());
        }
        $(element).remove();
    };

    self.images = ko.observableArray([slotModel()]);

    self.addSlot = function () {
        self.images.push(slotModel());
    };

    self.removeSlot = function (data) {
        self.images.remove(data);
    };

    return self;
}();