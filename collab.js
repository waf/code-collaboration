var App = {};

App.Storage = function(sessionId) {
    return {
        restore: function(topic, populateFn) {
            var store = JSON.parse(localStorage[sessionId]);
            if(store) {
                populateFn(store[topic]);
            }
        },
        save: function(data) {
            var store = JSON.parse(localStorage[sessionId]) || {};
            store[data.topic] = data.content;
            localStorage[sessionId] = JSON.stringify(store);
        }
    }
};

App.run = function() {
    (function init() {
        var languageChooser = document.getElementById("language"),
            shareBtn = document.getElementById("share"),
            editor = configureEditor("editor", {
                Theme: "ace/theme/monokai",
                FontSize: 16,
                HighlightActiveLine: false,
                ShowPrintMargin: false
            });

        // set language mode on selectbox change
        languageChooser.addEventListener("change", function(e) {
            editor.getSession().setMode("ace/mode/" + languageChooser.value);
            editor.focus();
        }, false);

        // share button should trigger TogetherJS
        shareBtn.addEventListener("click", function(e) {
            e.preventDefault();
            TogetherJS(this);
        }, false);

        // save app state to local storage
        if(window.localStorage) {
            if(!document.location.hash)
                document.location.hash = "#" + Math.random().toString(36).substring(7);
            var store = new App.Storage(document.location.hash);
            storeLanguage(store, languageChooser);
            storeContent(store, editor);
        }
    })();

    function configureEditor(element, cfg) {
        // little bit of a hack, but i'd rather have my 
        // config be an obvious datastructure
        var editor = ace.edit(element);
        for(var key in cfg) {
            editor["set" + key](cfg[key]);
        }
        return editor;
    }

    function storeLanguage(store, languageChooser) {
        languageChooser.addEventListener("change", function() {
            store.save({
                topic:"language",
                content: languageChooser.value
            });
        });
        store.restore("language", function(data) {
            languageChooser.value = data;
            languageChooser.dispatchEvent(new Event("change"));
        });
    }

    function storeContent(store, editor) {
        var saveHandle;
        editor.addEventListener("change", function() {
            if(saveHandle)
                clearTimeout(saveHandle);

            saveHandle = setTimeout(function() {
                store.save({
                    topic:"editor",
                    content: editor.getSession().getValue()
                });
            }, 3000);
        }, false);
        store.restore("editor", function(data) {
            editor.getSession().setValue(data);
        });
    }
}
