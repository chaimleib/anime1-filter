// ==UserScript==
// @name       Anime1 filter
// @version    0.2.1
// @description  Removes links to objectionable adult content.
// @match      *.anime1.com/*
// @copyright  2012-2014, Chaim-Leib Halbert
// ==/UserScript==


// a function that loads jQuery and calls a callback function when jQuery has finished loading
function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

// the guts of this userscript
function main() {
    // Lower-case list of terms to filter
    var censor_list = [
        'ecchi',
        'harem',
        'shoujo ai',
        'shonen ai',
        'shounen ai',
    ]
    
    function should_censor(str) {
        str = str.toLowerCase();
        var censored = '';
        
        for (var i=0; i<censor_list.length; i++) {
            if (censor_list[i] === str) {
                console.log('should_censor(\'' + str + '\')');
                return true;
            }
        }
        return false;
    }

    function nodes_to_string(nodes) {
        var result = '[';
        for (var i=0; i<nodes.length; i++) {
            var node = nodes[i];
            result += node.innerHTML + ', ';
        }
        result += ']';
        return result;
    }    

    // filters the genre links list
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

    // given a billboard node, return whether it should be censored.
    function should_censor_billboard(bb) {
        var genres = jQ(bb).find('div.dgenres a');
        for (var i=0; i<genres.length; i++) {
            var genre = genres[i].innerHTML;
            if (should_censor(genre)) return true;
        }
        return false;
    }

    // filters the list of billboard thumbs
    function filter_billboards() {
        var bbs = jQ('div.an-box');
        if (bbs.length === 0) {
            console.log('no bbs found!');
            return;
        }
        else {
            console.log('found ' + bbs.length + ' billboards.');
        }
        
        for (var i=0; i<bbs.length; i++) {
            var bb = bbs[i];
            var name = jQ(bb).find('h2')[0].innerHTML;
            if (should_censor_billboard(bb)) {
                console.log('!!Removed: ' + name);
                bb.parentNode.removeChild(bb);
            }
        }           
    }

    filter_genre_links();
    filter_billboards();
}
// load jQuery and execute the main function
addJQuery(main);
