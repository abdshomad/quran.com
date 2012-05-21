#!/usr/bin/env bash
         PRE=$PWD
         SRC=$PRE/src
        DIST=$PRE/dist
       BUILD=$PRE/build
      TARGET=$@
     INCLUDE="$SRC/Quran.js $SRC/ui/search.js $SRC/ui/nav.js $SRC/ui/dash.js $SRC/ui/scrollAnchor.js $SRC/ui/scrollLoader.js $SRC/ui/scrollReady.js $SRC/ui/scrollKeys.js $SRC/inc/json2.js $SRC/inc/script.js $SRC/inc/jquery.misc.js $SRC/inc/jquery.mousewheel.js $SRC/inc/jquery.tmpl.js $SRC/inc/jquery.ui.notification.js $SRC/inc/jquery.ui.resizable.js"

echo "window.steal={ env: 'production' };" > $DIST/.tmp.1.js
cp steal/steal.production.js $DIST/.tmp.2.js
./steal/js steal/pluginifyjs build/jquery-mx.js -nojquery -exclude mxui/data/* */*/*/*.css -out $DIST/.tmp.3.js
cat $DIST/.tmp.1.js $DIST/.tmp.2.js $DIST/.tmp.3.js > $DIST/.tmp.js
mv $DIST/.tmp.js $DIST/jquery-mx.js
ln -sf $DIST/jquery-mx.js $PRE/../../root/static/js/libs/jquery-mx.js;
rm $DIST/.tmp.*
make
