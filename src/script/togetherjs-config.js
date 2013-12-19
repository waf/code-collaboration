// togetherjs uses global config values
var TogetherJSConfig_toolName = "X by 2 Code Share";
var TogetherJSConfig_siteName = "X by 2";
var TogetherJSConfig_dontShowClicks = true;
var TogetherJSConfig_suppressJoinConfirmation = true;
var TogetherJSConfig_disableWebRTC = true;
var TogetherJSConfig_includeHashInUrl = true;
var TogetherJSConfig_youtube = false;
var TogetherJSConfig_getUserName = function () {return 'Fellow Coder';};
if(window.localStorage) {
    window.localStorage["togetherjs.settings.seenIntroDialog"] = true;
}
var TogetherJSConfig_on = {
    ready: function () {
        var share = document.getElementById("share");
        share.style.display = "none";
    },
    close: function() {
        var share = document.getElementById("share");
        share.style.display = "inline-block";
    }
};
