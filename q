[1mdiff --git a/examples/treegrid/js/treegrid-1.js b/examples/treegrid/js/treegrid-1.js[m
[1mindex 789598f5..fb1fd95d 100644[m
[1m--- a/examples/treegrid/js/treegrid-1.js[m
[1m+++ b/examples/treegrid/js/treegrid-1.js[m
[36m@@ -521,3 +521,30 @@[m [mfunction TreeGrid(treegridElem, doAllowRowFocus, doStartRowFocus) {[m
     true[m
   );[m
 }[m
[32m+[m
[32m+[m[32m/* Init Script for TreeGrid */[m
[32m+[m[32m/* Get an object where each field represents a URL parameter */[m
[32m+[m[32m/* global TreeGrid */[m
[32m+[m[32mfunction getQuery () {[m
[32m+[m[32m  if (!getQuery.cached) {[m
[32m+[m[32m    getQuery.cached = {};[m
[32m+[m[32m    const queryStr = window.location.search.substring(1);[m
[32m+[m[32m    const vars = queryStr.split('&');[m
[32m+[m[32m    for (let i = 0; i<vars.length; i++) {[m
[32m+[m[32m      const pair = vars[i].split('=');[m
[32m+[m[32m      // If first entry with this name[m
[32m+[m[32m      getQuery.cached[pair[0]] = pair[1] && decodeURIComponent(pair[1]);[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
[32m+[m[32m  return getQuery.cached;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mdocument.addEventListener('DOMContentLoaded', function () {[m
[32m+[m[32m  // Supports url parameter ?cell=force or ?cell=start (or leave out parameter)[m
[32m+[m[32m  var cellParam = getQuery().cell;[m
[32m+[m[32m  var doAllowRowFocus = cellParam !== 'force';[m
[32m+[m[32m  var doStartRowFocus = doAllowRowFocus && cellParam !== 'start';[m
[32m+[m[32m  TreeGrid(document.getElementById('treegrid'), doAllowRowFocus, doStartRowFocus);[m
[32m+[m[32m  var choiceElem = document.getElementById('option-cell-focus-' + (cellParam || 'allow'));[m
[32m+[m[32m  choiceElem.setAttribute('aria-current', 'true');[m
[32m+[m[32m});[m
[1mdiff --git a/examples/treegrid/treegrid-1.html b/examples/treegrid/treegrid-1.html[m
[1mindex 4eebf280..66e60360 100644[m
[1m--- a/examples/treegrid/treegrid-1.html[m
[1m+++ b/examples/treegrid/treegrid-1.html[m
[36m@@ -36,34 +36,6 @@[m
   }[m
 </style>[m
 <script src="js/treegrid-1.js" type="text/javascript"></script>[m
[31m-<script>[m
[31m-/* Init Script for TreeGrid */[m
[31m-/* Get an object where each field represents a URL parameter */[m
[31m-/* global TreeGrid */[m
[31m-function getQuery () {[m
[31m-  if (!getQuery.cached) {[m
[31m-    getQuery.cached = {};[m
[31m-    const queryStr = window.location.search.substring(1);[m
[31m-    const vars = queryStr.split('&');[m
[31m-    for (let i = 0; i<vars.length; i++) {[m
[31m-      const pair = vars[i].split('=');[m
[31m-      // If first entry with this name[m
[31m-      getQuery.cached[pair[0]] = pair[1] && decodeURIComponent(pair[1]);[m
[31m-    }[m
[31m-  }[m
[31m-  return getQuery.cached;[m
[31m-}[m
[31m-[m
[31m-document.addEventListener('DOMContentLoaded', function () {[m
[31m-  // Supports url parameter ?cell=force or ?cell=start (or leave out parameter)[m
[31m-  var cellParam = getQuery().cell;[m
[31m-  var doAllowRowFocus = cellParam !== 'force';[m
[31m-  var doStartRowFocus = doAllowRowFocus && cellParam !== 'start';[m
[31m-  TreeGrid(document.getElementById('treegrid'), doAllowRowFocus, doStartRowFocus);[m
[31m-  var choiceElem = document.getElementById('option-cell-focus-' + (cellParam || 'allow'));[m
[31m-  choiceElem.setAttribute('aria-current', 'true');[m
[31m-});[m
[31m-</script>[m
 </head>[m
 <body>[m
   <nav aria-label="Related Links" class="feedback">[m
