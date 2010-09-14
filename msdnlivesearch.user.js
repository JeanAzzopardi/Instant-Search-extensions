// ==UserScript==
// @name           MSDN search
// @namespace      test.msdn
// @description    Gives MSDN live search
// @include        http://social.msdn.microsoft.com/*
// @runat		   document-end
// @version 1.05
// ==/UserScript==

function Queue() {

    // the list of elements, initialised to the empty array
    var queue = [];

    // the amount of space at the front of the queue, initialised to zero
    var queueSpace = 0;

    /* Returns the size of this Queue. The size of a Queue is equal to the number
    * of elements that have been enqueued minus the number of elements that have
    * been dequeued.
    */
    this.getSize = function () {

        // return the number of elements in the queue
        return queue.length - queueSpace;

    }

    /* Returns true if this Queue is empty, and false otherwise. A Queue is empty
    * if the number of elements that have been enqueued equals the number of
    * elements that have been dequeued.
    */
    this.isEmpty = function () {

        // return true if the queue is empty, and false otherwise
        return (queue.length == 0);

    }

    /* Enqueues the specified element in this Queue. The parameter is:
    *
    * element - the element to enqueue
    */
    this.enqueue = function (element) {
        queue.push(element);
    }

    /* Dequeues an element from this Queue. The oldest element in this Queue is
    * removed and returned. If this Queue is empty then undefined is returned.
    */
    this.dequeue = function () {

        // initialise the element to return to be undefined
        var element = undefined;

        // check whether the queue is empty
        if (queue.length) {

            // fetch the oldest element in the queue
            element = queue[queueSpace];

            // update the amount of space and check whether a shift should occur
            if (++queueSpace * 2 >= queue.length) {

                // set the queue equal to the non-empty portion of the queue
                queue = queue.slice(queueSpace);

                // reset the amount of space at the front of the queue
                queueSpace = 0;

            }

        }

        // return the removed element
        return element;

    }

    /* Returns the oldest element in this Queue. If this Queue is empty then
    * undefined is returned. This function returns the same value as the dequeue
    * function, but does not remove the returned element from this Queue.
    */
    this.getOldestElement = function () {

        // initialise the element to return to be undefined
        var element = undefined;

        // if the queue is not element then fetch the oldest element in the queue
        if (queue.length) element = queue[queueSpace];

        // return the oldest element
        return element;

    }

}

function Levenshtein(str1, str2) {
    var l1 = str1.length, l2 = str2.length;
    if (Math.min(l1, l2) === 0) {
        return Math.max(l1, l2);
    }
    var i = 0, j = 0, d = [];
    for (i = 0; i <= l1; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (j = 0; j <= l2; j++) {
        d[0][j] = j;
    }
    for (i = 1; i <= l1; i++) {
        for (j = 1; j <= l2; j++) {
            d[i][j] = Math.min(
                d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + (str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1)
            );
        }
    }
    return d[l1][l2];
}


function PerformRequest() {
    if (!cachedQuery[query]) {
        var msdnUrl = "http://social.msdn.microsoft.com/Search/en-US?query=" + encodeURIComponent(searchBox.val());
        x = $.ajax({
            url: msdnUrl,


            success: function (data) {

                var thisQuery = $(data).find(searchBoxName).val();

                if (!window.currentResult || (
                                                Levenshtein(thisQuery, query) <
                                                Levenshtein(window.currentResult, thisQuery))) {
                    window.currentResult = thisQuery;
                    var content = ($(data).find(contentAreaName).html());
                    contentArea.html(content);
                }



                cachedQuery[thisQuery] = content;
                cachedKeys.enqueue(thisQuery);

                if (cachedKeys.getSize() == 10000) {
                    var oldestKey = cachedKeys.dequeue();
                    delete cachedQuery[oldestKey];
                }
            }
        });


    }
    else {
        $(contentAreaName).html(cachedQuery[query]);
        lastQuery = query;
    }
}



function Init() {

    window.cachedQuery = new Array();
    window.cachedKeys = new Queue();

    window.lastQuery = null;
    window.queryInterval = 100;
    window.query = null;
    window.textChanged = false;
    window.currentResult = '';

    window.searchBoxName = '#ctl00_MainContent_MainSearchBox_SearchTextBox';
    window.contentAreaName = '#ctl00_MainContent_resultsView_ResultsContainer';

    window.searchBox = $(searchBoxName);
    window.contentArea = $(contentAreaName);

    //Do the first query
    query = searchBox.val();
    PerformRequest();

    setInterval(function () {
        if (textChanged) {
            textChanged = false;
            PerformRequest();
        }
    },
	queryInterval);

    searchBox.keyup(function (event) {
        query = searchBox.val();
        textChanged = true;

        if (event.keyCode == 32) {
            textChanged = false;
            PerformRequest();
        }
    });
}

var jQuery = document.createElement("script"),
	inject = document.createElement("script");

jQuery.setAttribute("type", "text/javascript");
jQuery.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");

inject.setAttribute("type", "text/javascript");
inject.appendChild(document.createTextNode(Queue));
inject.appendChild(document.createTextNode(PerformRequest));
inject.appendChild(document.createTextNode(Levenshtein));
inject.appendChild(document.createTextNode(Init + "Init();"));

document.body.appendChild(jQuery);
document.body.appendChild(inject);