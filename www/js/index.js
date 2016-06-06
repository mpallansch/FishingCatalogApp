var app = {
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        if(window.cordova){
            document.addEventListener('deviceready', this.onDeviceReady, false);
        } else {
            $(document).ready(this.onDeviceReady);
        }
    },
    onDeviceReady: function() {
        app.$pages = $('.page');
        app.$loading = $('#loading-modal');
        app.$home = $('#catalog-page');
        app.$listing = $('#fish-listing');
        app.$editForm = $('#edit-form-container');
        app.$entryMap = $('#entry-map');
        app.$newForm = $('#new-form-container');
        app.$formPage = $('#form-page');
        app.$titleInput = $('#title-input');
        app.$dateInput = $('#date-input');
        app.$typeInput = $('#type-input');
        app.$weightInput = $('#weight-input');
        app.$sizeInput = $('#size-input');
        app.$notesInput = $('#notes-input');
        app.$locationInput = $('#location-input');
        app.$latitudeInput = $('#latitude-input');
        app.$longitudeInput = $('#longitude-input');
        app.$zoomInput = $('#zoom-input');
        app.$inputMap = $('#input-map');
        app.$imageInput = $('#image-input');
        app.$imageCapture = $('#image-capture');
        app.$imageInputList = $('#image-input-list');
        app.$useGPS = $('#use-gps');
        app.$useMap = $('#use-map');
        app.$formSuccess = $('#form-success');
        app.$submit = $('#form-submit');
        app.$cancel = $('#form-cancel');
        app.$form = $('#entry-form').detach();
        app.$edit = $('#edit-button');
        app.$remove = $('#remove-button');
        app.$entryTitle = $('#entry-title');
        app.$title = $('#title');
        app.$date = $('#date');
        app.$type = $('#type');
        app.$weight = $('#weight');
        app.$size = $('#size');
        app.$notes = $('#notes');
        app.$location = $('#location');
        app.$coordinates = $('#coordinates');
        app.$getDirections = $('#get-directions');
        app.$imageList = $('#image-list');
        app.$entryInfo = $('#entry-info');
        app.$verifyHome = $('.verify-home');
        app.$imageEnlarge = $('#image-enlarge');
        app.$imageEnlargeModal = $('#image-enlarge-modal');
        app.entries = localStorage.getItem('entries');
        app.entries = (app.entries) ? JSON.parse(app.entries) : [];

        $(window).on('hashchange', app.navigate);
        $('.link-in-app').on('click', app.linkInApp);
        app.$form.find('.link-in-app').on('click', app.linkInApp);
        app.$form.on('submit', app.entryFormSubmit);
        app.$form.on('change', app.removeSuccessText);
        app.$edit.on('click', app.editEntry);
        app.$cancel.on('click', app.cancelEdit);
        app.$remove.on('click', app.removeEntry);
        app.$latitudeInput.on('change', app.updateInputMap);
        app.$longitudeInput.on('change', app.updateInputMap);
        app.$useGPS.on('click', app.useGPS);
        app.$useMap.on('click', app.useMap);
        app.$imageInput.on('click', app.imageInput);
        app.$imageCapture.on('click', app.imageInput);
        app.$verifyHome.on('click', app.verifyHome);
        app.$getDirections.on('click', app.getDirections);
        app.$imageEnlargeModal.on('click swipe', app.shrinkImage);
        document.addEventListener('onAdFailLoad', function(e){
            console.log('adFailLoad');
            console.log(e);
        });
        
        app.setupAds();
        
        app.navigate();
    },
    setupAds: function(){
        app.admobid = {};
        if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon-fireos
          console.log('using Android ads');
          app.admobid = {
            banner: 'ca-app-pub-6476005934752723/6129027694', // or DFP format "/6253334/dfp_example_ad"
            interstitial: 'ca-app-pub-6476005934752723/6408229295'
          };
        } else {//if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
          console.log('using iOS ads');
          app.admobid = {
            banner: 'ca-app-pub-6476005934752723/3175561295', // or DFP format "/6253334/dfp_example_ad"
            interstitial: 'ca-app-pub-6476005934752723/3315162094'
          };
        } 
        /*if(typeof AdMob !== 'undefined'){
            AdMob.createBanner({
                adId: app.admobid.banner,
                position: AdMob.AD_POSITION.TOP_CENTER,
                autoShow: true 
            });
        }*/
    },
    prepareAd: function(){
        if(typeof AdMob !== 'undefined') {
            AdMob.prepareInterstitial({
                adId: app.admobid.interstitial, 
                autoShow: false
            }, function(success){
                //
            }, function(error){
                console.log('error preparing interstitial');
                console.log(error);
            });
        }
    },
    showAd: function(){
        if(typeof AdMob !== 'undefined') {
            AdMob.isInterstitialReady(function(ready){
                if(ready){
                    AdMob.showInterstitial();
                } 
            });
        }
    },
    updateQueryString: function(){
        app.qs = {};
        var array = window.location.search.substr(1).split('&');
        var keyVal;
        array.forEach(function(el, index){
            keyVal = el.split('=', 2);
            if(keyVal.length === 1){
                app.qs[keyVal[0]] = "";
            } else {
                app.qs[keyVal[0]] = keyVal[1];
            }
        });
    },
    navigate: function(e) {
        app.$loading.show();
        app.updateQueryString();
        switch(window.location.hash){
            case '#catalog-page':
                app.loadCatalogPage();
                break;
            case '#new-entry-page':
                app.loadNewEntryPage();
                break;
            case '#entry-page':
                app.loadEntryPage();
                break;
            default:
                app.viewPage(window.location.hash);
                break;
        }
        
    },
    viewPage: function(id) {
        app.$loading.hide();
        app.$pages.css('display','none');
        if(id !== '') {
            $(id).css('display','block');
        } else {
            window.location.hash = "#catalog-page";
        }
    },
    linkInApp: function(e){
        e.preventDefault();
        if(typeof cordova !== 'undefined' && cordova.InAppBrowser){
            cordova.InAppBrowser.open(e.target.href, '_blank');
        } else {
            window.open(e.target.href, '_blank');
        }
    },
    loadCatalogPage: function(){
        var li, anchor, content;
        app.$listing.empty();
        if(app.entries === undefined || app.entries.length === 0){
            app.$listing.append('<li>No entries, click the button above to add a new entry</li>');
        } else {
            app.entries.forEach(function(entry, index){
                li = $('<li class="fish-entry"></li>');
                anchor = $('<a href="?entry=' + index + '#entry-page"></a>');
                content = $('<div class="content-container"></div>');
                 
                if(entry.title){
                    content.append('<span>' + entry.title  + '</span>');
                    
                } else if(entry.type){
                    content.append('<span>' + entry.type + '</span>');
                } 
                if(entry.location){
                    content.append('<span>' + entry.location + '</span>');
                }
                content.append('<span>' + entry.date + '</span>');

                anchor.append('<div class="image-container"><div><img src="' + (entry.pictures.length > 0 ? entry.pictures[0] : 'img/fish.png') + '" /></div></div>');
                anchor.append(content);
                li.append(anchor);
                app.$listing.append(li);
            });
        }
        app.viewPage('#catalog-page');
    },
    loadNewEntryPage: function(){
        app.prepareAd();
        app.$formSuccess.hide();
        app.$form.detach();
        app.$cancel.hide();
        app.$newForm.append(app.$form);
        app.clearForm();
        app.$formPage.val('new');
        app.$submit.val('Add Entry');
        app.viewPage('#new-entry-page');
    },
    loadEntryPage: function(){
        var entry = app.entries[app.qs['entry']];

        app.$entryTitle.text(entry.title);
        app.$title.text(entry.title);
        app.$date.text(entry.date);
        app.$type.text(entry.type);
        app.$weight.text(entry.weight);
        app.$size.text(entry.size);
        app.$notes.val(entry.notes);
        app.$location.text(entry.location);
        if(entry.latitude && entry.longitude){
            app.$coordinates.text(entry.latitude + ' ' + entry.longitude);
            app.showMap(app.$entryMap, entry.latitude, entry.longitude, entry.zoom);
            app.$getDirections.show();
        } else {
            app.$getDirections.hide();
            app.$entryMap.hide();
        }
        app.$imageList.empty();
        entry.pictures.forEach(function(url){
            app.$imageList.append($('<li></li>').append(app.fishImage(url)));
        });

        app.viewPage('#entry-page');
    },
    entryFormSubmit: function(e){
        e.preventDefault();

        var entry = {};
        entry.title = app.$titleInput.val();
        entry.date = app.$dateInput.val();
        entry.type = app.$typeInput.val();
        entry.weight = app.$weightInput.val();
        entry.size = app.$sizeInput.val();
        entry.notes = app.$notesInput.val();
        entry.location = app.$locationInput.val();
        entry.latitude = app.$latitudeInput.val();
        entry.longitude = app.$longitudeInput.val();
        entry.zoom = app.$zoomInput.val();
        entry.pictures = [];
        app.$imageInputList.find('img').each(function(){
            entry.pictures.push(this.src);
        });

        if(!entry.date){
            alert('must enter a valid date');
            return;
        }
        
        if(entry.latitude && !entry.longitude || entry.longitude && !entry.latitude){
            alert('partial coordinates entered');
            return;
        }
        
        if(entry.latitude){
            entry.latitude = parseFloat(entry.latitude);
            entry.longitude = parseFloat(entry.longitude);
            if(isNaN(entry.latitude) || isNaN(entry.longitude)){
                alert('coordinates must be numbers');
                return;
            }
        }

        app.showAd();

        if(app.$formPage.val() === 'new'){      
            app.entries.push(entry);
            localStorage.setItem('entries', JSON.stringify(app.entries));

            app.$formSuccess.show();
            app.$formSuccess[0].scrollIntoView();
        } else {
            app.entries.splice(app.qs['entry'], 1, entry);
            localStorage.setItem('entries', JSON.stringify(app.entries));

            location.reload();
        }

        app.clearForm();
    },
    verifyHome: function(e){
        e.preventDefault();
        var type, response = true;
        app.$form.find('input').each(function(index, el){
            type = $(el).attr('type');
            if(type !== 'hidden' && type !== 'button' && type !== 'submit' && $(el).val()){
                response = confirm('Are you sure you want to leave this entry? All data will be lost.');
                if(response){
                    window.location.hash = "#home-page";
                }
                return false;
            }
        });
        if(response){
            window.location.hash = "#home-page";
        }
    },
    editEntry: function(e){
        e.preventDefault();
        app.prepareAd();
        
        var entry = app.entries[app.qs['entry']];

        app.$entryInfo.hide();
        app.$form.detach();
        app.$editForm.append(app.$form);
        app.$entryMap.hide();
        app.$submit.val('Confirm Edits');
        app.$cancel.show();

        app.$titleInput.val(entry.title);
        app.$dateInput.val(entry.date);
        app.$typeInput.val(entry.type);
        app.$weightInput.val(entry.weight);
        app.$sizeInput.val(entry.size);
        app.$notesInput.val(entry.notes);
        app.$locationInput.val(entry.location);
        app.$latitudeInput.val(entry.latitude);
        app.$longitudeInput.val(entry.longitude);
        app.updateInputMap();
        app.$imageInputList.empty();
        entry.pictures.forEach(function(url){
            app.$imageInputList.append($('<li></li>').append(app.deleteLink()).append(app.fishImage(url)));
        });

        app.$formPage.val('edit');
    },
    cancelEdit: function(e){
        e.preventDefault();
        window.location.reload();
    },
    removeEntry: function(e){
        e.preventDefault();
        var response = confirm('Are you sure you wish to delete this entry?');
        if(response){
            app.entries[app.qs['entry']].pictures.forEach(app.removeImage);
            app.entries.splice(app.qs['entry'], 1);
            localStorage.setItem('entries', JSON.stringify(app.entries));
            window.location.hash = '#catalog-page';
        }
    },
    clearForm: function(){
        app.$titleInput.val(null);
        app.$dateInput.val(null);
        app.$typeInput.val(null);
        app.$weightInput.val(null);
        app.$sizeInput.val(null);
        app.$notesInput.val(null);
        app.$locationInput.val(null);
        app.$latitudeInput.val(null);
        app.$longitudeInput.val(null);
        app.$inputMap.hide();
        app.$imageInputList.empty();
    },
    getDirections: function(e){
        e.preventDefault();
        app.getLocation(function(loc){
            app.showDirections(loc);
        }, function(){
            alert('Unable to get your location, check your network connection and try again, or entry your latitude and longitude below');
        });
    },
    showMap: function($el, lat, long, zoom){
        $el.attr('src', 'https://www.google.com/maps/embed/v1/place?key=AIzaSyD8Kt2igKzIU3RFhhnAaYsQgQuFT7nzEFE&q=' + lat + ',' + long + ((zoom)?('&zoom=' + zoom):('')));
        $el.show();
    },
    showDirections: function(loc){
        var entry = app.entries[app.qs['entry']];
        app.$entryMap.attr('src', 'https://www.google.com/maps/embed/v1/directions?key=AIzaSyD8Kt2igKzIU3RFhhnAaYsQgQuFT7nzEFE&origin=' + entry.latitude + ',' + entry.longitude + '&destination=' + loc[0] + ',' + loc[1]);
    },
    getLocation: function(callback, err){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                function(pos){
                    var loc = [];
                    loc.push(pos.coords.latitude);
                    loc.push(pos.coords.longitude);
                    if(callback){
                        callback(loc);
                    }
                },
                function(error){
                    console.log(error);
                    if(err){
                        err();
                    }
                },
                {
                    timeout: 3000
                }
            );
        } else {
            err();
        }
    },
    useGPS: function(e){
        e.preventDefault();
        app.getLocation(function(loc){
            app.setLocation(loc);
        }, function(){
            alert('Unable to get your location, check your location settings and network connection and try again, or select location on the map below.');
        });
    },
    useMap: function(e) {
        e.preventDefault();
        if(typeof cordova !== 'undefined' && cordova.InAppBrowser){
            if(!localStorage.getItem('mapsInstructions')){
                if(confirm('Center the map on the location where you caught the fish, then exit the browser to save the location. Press OK to not show this message again.')){
                    localStorage.setItem('mapsInstructions', true);
                }
            }
            var exited = false;
            var loc = 'https://www.google.com/maps/place/' + ((app.$locationInput.val())?(encodeURIComponent(app.$locationInput.val())):('United+States'));
            var ref = cordova.InAppBrowser.open(loc, '_blank');
            var interval = setInterval(function(){
                if(!exited){
                    ref.executeScript({
                        code: 'window.location.href'
                    }, function(values) {
                        if(values[0] !== loc){
                            loc = values[0];
                        }
                    });
                } else {
                    clearInterval(interval);
                    try{
                        loc = loc.split("@")[1];
                        loc = loc.split("/")[0];
                        loc = loc.split(",");
                        loc[2] = loc[2].substr(0, loc[2].length - 1);
                        app.setLocation(loc);
                    } catch(e) {
                        console.log(e);
                        alert('Unable to get location from map. Please check your network connectivity and try again.');
                    }
                }
            }, 100);
            ref.addEventListener('exit', function(){
                exited = true;
            });
        } else {
            alert('Unable to access browser plugin');
        }
    },
    setLocation: function(loc){
        app.$latitudeInput.val(loc[0]);
        app.$longitudeInput.val(loc[1]);
        if(loc.length > 2){
            app.$zoomInput.val(loc[2]);
        }
        app.updateInputMap();
    },
    updateInputMap: function(){
        if(!app.$latitudeInput.val() || !app.$longitudeInput.val()){
            app.$inputMap.hide();
        } else {
            app.showMap(app.$inputMap, app.$latitudeInput.val(), app.$longitudeInput.val());
        }
    },
    imageInput: function(e){
        if(!navigator.camera){
            console.log('navigator.camera is not defined');
            alert('Unable to access device camera.');
            app.$imageInputList.append($('<li></li>').append(app.deleteLink()).append(app.fishImage('/iisstart.png')));
        } else {
            var source;
            switch(e.target.id){
                case 'image-input':
                    source = navigator.camera.PictureSourceType.PHOTOLIBRARY;
                    break;
                case 'image-capture':
                    source = navigator.camera.PictureSourceType.CAMERA;
                    break;
            };
            navigator.camera.getPicture(
                function(url){
                    console.log(url);
                    app.$imageInputList.append($('<li></li>').append(app.deleteLink()).append(app.fishImage(url)));
                },
                function(error){
                    if(error !== 'Camera cancelled.'){
                        alert('Unable to access device camera.');
                    }
                    console.log(error);
                },
                {
                    sourceType: source
                }
            );
        }
    },
    removeImage: function(url){
        if(url.substring(0,10) !== 'content://'){
            window.resolveLocalFileSystemURL(url, function(fileEntry){
                fileEntry.remove();
            }, function(error){
                console.log('Unable to delete image from local storage');
                console.log(error);
            });
        }
    },
    deleteLink: function(){
        return $('<a class="delete-image-button" href="#">X</a>').click(app.deleteImageClick);
    },
    fishImage: function(url){
        return $('<img class="fish-image" src="' + url + '" />').on('click swipe', app.enlargeImage);
    },
    deleteImageClick: function(e){
        e.preventDefault();
        if(confirm('Are you sure you want to delete this image?')){
            app.removeImage(e.target.nextSibling.src);
            $(e.target.parentElement).remove();
        }
    },
    enlargeImage: function(e){
        var $img = $(e.target);
        var offset = $img.offset();
        
        app.$imageEnlargeModal.css('display','table');
        app.$imageEnlarge.attr('src', $img.attr('src'));
        app.$imageEnlarge.css({
            transform: 'none',
            position: 'relative',
            top: 'auto',
            left: 'auto',
            width: 'auto',
            height: 'auto'
        });
        
        var widthScale = app.$imageEnlarge[0].offsetWidth / $img[0].offsetWidth;
        var heightScale = app.$imageEnlarge[0].offsetHeight / $img[0].offsetHeight;
        
        var enlargeOffset = app.$imageEnlarge.offset();
        var leftOffset = (enlargeOffset.left - offset.left) / widthScale;
        var topOffset = (enlargeOffset.top - offset.top) / heightScale;
        
        app.$imageEnlarge.css({
            position: 'absolute',
            width: $img.width(),
            height: $img.height(),
            top: offset.top + 'px',
            left: offset.left + 'px'
        });
        setTimeout(function(){
            app.$imageEnlarge.css('transform', 'scale(' + widthScale + ', ' + heightScale + ') translate(' + leftOffset + 'px, ' + topOffset + 'px)');
        }, 50);
    },
    shrinkImage: function(){
        app.$imageEnlarge.css('transform', 'none');
        setTimeout(function(){
            app.$imageEnlargeModal.css('display','none');
        }, 500);
    },
    removeSuccessText: function(){
        app.$formSuccess.hide();
    }
};

app.initialize();