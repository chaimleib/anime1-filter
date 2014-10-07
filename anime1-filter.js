// ==UserScript==
// @name       Anime1 filter
// @version    0.2.1
// @description  Removes links to objectionable adult content.
// @match      *.anime1.com/*
// @copyright  2012-2014, Chaim-Leib Halbert
// ==/UserScript==


/* ### Utilities ### */
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    
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
    
    
    /* actually set up the observer to watch for changes */
    var observer = new MutationObserver(billboards_were_added);
    // define what element should be observed by the observer
    // and what types of mutations trigger the callback
    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });

    
    // filters the genre links list (/content/genre)
    function filter_genre_links() {
        var genre_ary = jQ('.popularity-by-genre > ul a');
        if (genre_ary.length === 0) {
            //console.log('no genres found!');
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
        console.log('!!Removed: ' + name);
    }
    
    function get_billboard_name(bb) {
    	var heads = jQ(bb).find('h2');
        var name;
        if (!heads.length) {
            console.log('weird!');
            console.log(bb);
            name = "???";
        }
        else {
            name = heads[0].innerHTML;
        }
        return name;
    }
    
    // filters the list of billboard thumbs
    function start_check_billboards() {
        var bbs = jQ('div.an-box');
        if (!bbs.length) {
            console.log('no bbs found!');
            observer.disconnect();
            return;
        }
        else {
            console.log('found ' + bbs.length + ' billboards.');
        }
		forEach(bbs, check_billboard);
    }

    filter_genre_links();
    start_check_billboards();
}

/* ### Bootstrapper ### */
function addJQuery(callback) {
  var script = document.createElement("script");
  //script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
  script.addEventListener('ready', function() {
    var script = document.createElement("script");
      script.textContent = "window.jQ=$;(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
}

// Make sure jQ is loaded before calling main()
var jQ = $;
if (jQ !== undefined) {
    console.log('Waiting for jQuery...');
    main();
} else {
    addJQuery(main);
}
