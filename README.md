Anime1 Filter
=============
This userscript scrubs objectionable adult content from anime1.com. It does not handle advertisements; for these, I recommend AdBlock Plus.


Disclaimer
----------
This software is provided for free without any guarantees or warranties. It is a work in progress, and while somewhat functional, it is not perfect or complete. This software was not produced in cooperation with Anime1.com, and functionality may break unexpectedly when Anime1.com changes their web site.


Compatibility
-------------
This userscript has been fully tested on:
* Google Chrome

Current filters
---------------
* Billboard lists (grids of Anime pictures tagged with genres)
* Genres list (on the Browse by Genre page)


Hacking
-------
The filter works by blacklisting the genres in `censor_list`, defined in the "Main logic" section.

Filtering happens when the page is loaded, and whenever more billboards are dynamically loaded.

### Page load
The following filter functions are executed on page load:
* `start_check_genre_links()`
* `start_check_billboards()`

These functions depend on jQuery, so their invocation must be deferred until we know jQuery is ready. I would rather wait for anime1 to load jQuery for me to avoid loading it twice, but this also delays filtering the images; see the TODO section.

### Dynamic billboard load
Whenever the user scrolls, new billboards are loaded. These are not filtered by `start_check_billboards`, and a special `observer` object is used to react to the changing DOM. For details about this object, see [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).


TODO
----
* Links without genre labels are not filtered. This would require loading other pages that contain the genre and/or rating information.
* Images may briefly appear before being removed. This will require fixing the bootstrapper.
