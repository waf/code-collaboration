var App = {};

// client-side storage api, uses localStorage under the hood
App.Storage = function(sessionId) {
    // expiration date is one month from today.
    var today = new Date(),
        expiration = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    function readFromStorage(key) {
        var store = localStorage[key];
        return store ? JSON.parse(store) : null;
    }

    return {
        // save the provided data under the given key
        save: function(key, data) {
            var store = readFromStorage(key) || {};
            store.expiration = expiration;
            store[key] = data;
            localStorage[sessionId] = JSON.stringify(store);
        },
        // given a key and a callback function, call the 
        // function, passing in the key's associated data 
        restore: function(key, populateFn) {
            var store = readFromStorage(key);
            if(store) {
                populateFn(store[key]);
            }
        },
        expireOldValues: function() {
            Object.keys(localStorage).filter(function(i) { 
                if(i[0] !== "#") return false;
                var store = readFromStorage(i);
                return store && new Date(store.expiration) < today;
            }).map(function(e) { 
                localStorage.removeItem(e);
            });
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
            initLanguageStore(store, languageChooser);
            initContentStore(store, editor);
            store.expireOldValues();
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

    // programming language selectbox can save/restore its value via localStorage
    function initLanguageStore(store, languageChooser) {
        languageChooser.addEventListener("change", function() {
            store.save("language", languageChooser.value);
        });
        store.restore("language", function(data) {
            languageChooser.value = data;
            languageChooser.dispatchEvent(new Event("change"));
        });
    }

    // editor can save/restore its value localStorage 
    function initContentStore(store, editor) {
        var saveHandle;
        editor.addEventListener("change", function() {
            if(saveHandle)
                clearTimeout(saveHandle);

            saveHandle = setTimeout(function() {
                store.save("editor", editor.getSession().getValue());
            }, 3000);
        }, false);
        store.restore("editor", function(data) {
            editor.getSession().setValue(data);
        });
    }
}
