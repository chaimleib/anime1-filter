// ==UserScript==
// @name        Anime1 filter
// @version     0.3.1
// @description Removes links to objectionable adult content.
// @match       *.anime1.com/*
// @copyright   2012-2014, Chaim-Leib Halbert
// ==/UserScript==

// Documentation: https://github.com/chaimleib/anime1-filter

/* ### Utilities ### */
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var DEBUG = false;

function log() {
    if (DEBUG)
        console.log.apply(this, arguments);
}

function warn() {
    console.warn.appy(this, arguments);
}

function inArray(val, arr) {
    var i = arr.length;
    while(i--) {
        if (val === arr[i]) return true;
    }
    return false;
}

function forEach(arr, func) {
    var i = arr.length;
    while (i--) func(arr[i], i, arr);
}


/* ### Main logic ### */
// Lower-case list of terms to filter
var censor_list = [
    'ecchi',
    'harem',
    'shoujo ai',
    'shonen ai',
    'shounen ai',
    //'romance',
];

// is str in the blacklist?
function should_censor(str) {
    str = str.toLowerCase();
    var censored = '';
    var i = censor_list.length;
    return inArray(str, censor_list);
}

// called when jQ is ready
function main() {
    // watch for dynamically-loaded billboards
    function billboards_were_added(mutations) {
        mutations = mutations.filter(function (el) {
            return el.addedNodes.length;
        });
        if (!mutations.length)
            return;
        forEach(mutations, function (m) {
            forEach(m.addedNodes, checkNode);
        });
    }

    function checkNode(n) {
        if (!n.classList)
            return;
        if (inArray('an-text', n.classList)) {
            check_billboard(n.parentNode);
        }
    }


    function check_billboard(bb) {
        if (should_censor_billboard(bb)) {
            remove_billboard(bb);
        }
    }

    // given a billboard node, return whether it should be censored.
    function should_censor_billboard(bb) {
        var genres = jQ(bb).find('div.dgenres a');
        for (var i=0; i<genres.length; i++) {
            var genre = genres[i].innerHTML;
            if (should_censor(genre)) return true;
        }
        return false;
    }

    function remove_billboard(bb) {
        var name = get_billboard_name(bb);
        bb.parentNode.removeChild(bb);
        log('!!Removed: ' + name);
    }

    function get_billboard_name(bb) {
        var heads = jQ(bb).find('h2');
        var name;
        if (!heads.length) {
            warn('could not read bb name!');
            warn(bb);
            name = "???";
        }
        else {
            name = heads[0].innerHTML;
        }
        return name;
    }

    // filters the list of billboard thumbs on initial document load
    function start_check_billboards() {
        var bbs = jQ('div.an-box');
        if (!bbs.length) {
            log('no bbs found!');
            observer.disconnect();
            return;
        }
        else {
            log('found ' + bbs.length + ' billboards.');
        }
        forEach(bbs, check_billboard);
    }



    /* actually set up the observer to watch for changes */
    var observer = new MutationObserver(billboards_were_added);
    // define what element should be observed by the observer
    // and what types of mutations trigger the callback
    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });


    // filters the genre links list (/content/genre)
    function start_check_genre_links() {
        var genre_ary = jQ('.popularity-by-genre > ul a');
        if (genre_ary.length === 0) {
            log('no genres found!');
            return;
        }

        for (var i=0; i<genre_ary.length; i++) {
            var a = genre_ary[i];
            var li = a.parentNode;
            if (should_censor(a.innerHTML)) {
                li.parentNode.removeChild(li);
            }
        }
    }

    start_check_genre_links();
    start_check_billboards();
}


/* ### Bootstrapper ### */
function addJQuery(callback) {
  var script = document.createElement("script");
  //script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
  document.addEventListener('load', function() {
    var script = document.createElement("script");
      script.textContent = "window.jQ=$;(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
}

// Make sure jQ is loaded before calling main()
var jQ = $;
if (jQ !== undefined) {
    log('Waiting for jQuery...');
    main();
} else {
    addJQuery(main);
}
