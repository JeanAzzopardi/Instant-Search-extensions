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

function AbsLengthDifference(str1, str2) {
	
}

function PerformRequest() {
	if (!cachedQuery[query]) {
		var msdnUrl = "http://social.msdn.microsoft.com/Search/en-US?query=" + encodeURIComponent(searchBox.val());
		x = $.ajax({
			url: msdnUrl,


			success: function (data) {

				var thisQuery = $(data).find(searchBoxName).val();
				cachedQuery[thisQuery] = content;
				cachedKeys.enqueue(thisQuery);

				if (cachedKeys.getSize() == 10000) {
					var oldestKey = cachedKeys.dequeue();
					delete cachedQuery[oldestKey];
				}

				if (thisQuery == query) {
					var content = ($(data).find(contentAreaName).html());
					contentArea.html(content);
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
	alert('hello');
	window.cachedQuery = new Array();
	window.cachedKeys = new Queue();

	window.lastQuery = null;
	window.queryInterval = 100;
	window.query = null;
	window.textChanged = false;

	window.searchBoxName = '#ctl00_MainContent_MainSearchBox_SearchTextBox';
	window.contentAreaName = '#ctl00_MainContent_resultsView_ResultsContainer';

	window.searchBox = $(searchBoxName);
	window.contentArea = $(contentAreaName);

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
inject.appendChild(document.createTextNode(Init + "Init();"));

document.body.appendChild(jQuery);
document.body.appendChild(inject);