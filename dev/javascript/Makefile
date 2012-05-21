# vim: ts=2 sw=2 noexpandtab
      PREFIX = ${PWD}
     SRC_DIR = ${PREFIX}/src
    DIST_DIR = ${PREFIX}/dist
   BUILD_DIR = ${PREFIX}/build
      TARGET = ${@}
    JS_FILES = ${SRC_DIR}/Quran.js\
               ${SRC_DIR}/ui/search.js\
               ${SRC_DIR}/ui/nav.js\
               ${SRC_DIR}/ui/dash.js\
               ${SRC_DIR}/ui/scrollAnchor.js\
               ${SRC_DIR}/ui/scrollLoader.js\
               ${SRC_DIR}/ui/scrollReady.js\
               ${SRC_DIR}/ui/scrollKeys.js\
               ${SRC_DIR}/ui/content/wordSystem.js\
               ${SRC_DIR}/ui/content/audioPlayer.js\
               ${SRC_DIR}/inc/json2.js\
               ${SRC_DIR}/inc/script.js\
               ${SRC_DIR}/inc/jquery.misc.js\
               ${SRC_DIR}/inc/jquery.mousewheel.js\
               ${SRC_DIR}/inc/jquery.tmpl.js\
               ${SRC_DIR}/inc/jquery.ui.notification.js\
               ${SRC_DIR}/inc/jquery.ui.resizable.js\
							 src2/Q.js\
							 src2/Q/Util.js\
							 src2/Q/Util/DataStore.js\
							 src2/Q/Util/DataStore/Cookie.js\
							 src2/Q/Controller.js\
							 src2/Q/Widget.js\
							 src2/Q/Widget/Dash/Slider.js
    #${SRC_DIR}/refactor/pre.js\
#               ${SRC_DIR}/ui/foo/resourceTabs.js\
#               ${SRC_DIR}/ui/foo/debug.js
#               ${SRC_DIR}/lib/json2.js\
#               ${SRC_DIR}/lib/script.js\
#               ${SRC_DIR}/lib/jquery.mousewheel.js\
#               ${SRC_DIR}/lib/jquery.tmpl.js\
#               ${SRC_DIR}/lib/jquery.ui.notification.js\
#               ${SRC_DIR}/lib/jquery.ui.resizable.js\
#               ${SRC_DIR}/widget/autocomplete.js\
#               ${SRC_DIR}/widget/dropdown.js\
#               ${SRC_DIR}/widget/modal.js\
#               ${SRC_DIR}/widget/tip.js\
#               ${SRC_DIR}/widget/box.js\
#               ${SRC_DIR}/ui/window/keyboard.js\
#               ${SRC_DIR}/ui/head/signIn.js\
#               ${SRC_DIR}/ui/head/signUp.js\
#               ${SRC_DIR}/ui/body/notificationSystem.js\
#               ${SRC_DIR}/ui/content/ayahTools.js\
#               ${SRC_DIR}/ui/content/ayahTools/tags.js\
#               ${SRC_DIR}/ui/content/ayahTools/bookmark.js\
#               ${SRC_DIR}/ui/content/ayahTools/lastmark.js\
#               ${SRC_DIR}/ui/content/ayahTools/share.js\
#               ${SRC_DIR}/ui/content/changeAyah.js\
#               ${SRC_DIR}/ui/content/orderAyah.js\
#               ${SRC_DIR}/ui/content/scrollAnchor.js\
#               ${SRC_DIR}/ui/content/scrollContent.js\
#               ${SRC_DIR}/ui/content/ready.js\
#               ${SRC_DIR}/ui/content/audioPlayer.js\
#               ${SRC_DIR}/ui/side/navMenu.js\
#               ${SRC_DIR}/ui/side/searchInput.js
   JS_ENGINE = `which node`
 MIN_COMPILE = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe
POST_COMPILE = ${JS_ENGINE} ${BUILD_DIR}/post-compile.js


all: core

core: ${TARGET} | muted

mkdir:
	@@echo ${TARGET};
	@@mkdir -p ${DIST_DIR};

min:
	@@echo ${TARGET};
	@@if test ! -z ${JS_ENGINE}; then \
		${MIN_COMPILE} ${DIST_DIR}/quran.tmp > ${DIST_DIR}/quran.tmp2; \
    mv ${DIST_DIR}/quran.tmp2 ${DIST_DIR}/quran.tmp; \
	fi

post:
	@@echo ${TARGET};
	@@if test ! -z ${JS_ENGINE}; then \
		${POST_COMPILE} ${DIST_DIR}/quran.tmp > ${DIST_DIR}/quran.tmp2; \
    mv ${DIST_DIR}/quran.tmp2 ${DIST_DIR}/quran.tmp; \
	fi

debug:
	@@echo ${TARGET};
	@@echo "window.debug = 1;" > ${DIST_DIR}/quran.tmp2;
	@@cat ${DIST_DIR}/quran.tmp >> ${DIST_DIR}/quran.tmp2;
	@@mv ${DIST_DIR}/quran.tmp2 ${DIST_DIR}/quran.tmp;

no_debug:
	@@echo ${TARGET};
	@@echo "window.debug = 0;" > ${DIST_DIR}/quran.tmp2;
	@@cat ${DIST_DIR}/quran.tmp >> ${DIST_DIR}/quran.tmp2;
	@@mv ${DIST_DIR}/quran.tmp2 ${DIST_DIR}/quran.tmp;

group_expand:
	@@echo ${TARGET};
	@@cat ${DIST_DIR}/quran.tmp | \
		sed 's/q\._\.groupCollapsed/q._.group/g' > ${DIST_DIR}/quran.tmp2;
	@@mv ${DIST_DIR}/quran.tmp2 ${DIST_DIR}/quran.tmp;

group_flat:
	@@echo ${TARGET};
	@@cat ${DIST_DIR}/quran.tmp | \
		sed 's/q\._\.groupCollapsed/q._.warn/g' | \
		sed 's/q\._\.groupEnd/q._.nothing/g' | \
		sed 's/q\._\.group/q._.warn/g' > ${DIST_DIR}/quran.tmp2;
	@@mv ${DIST_DIR}/quran.tmp2 ${DIST_DIR}/quran.tmp;

start: mkdir
	@@echo ${TARGET};
	@@cat ${JS_FILES} | \
		sed 's/^.function..Quran, jQuery...{//' | \
		sed 's/\([^a-zA-Z0-9_.()]\)console\./\1q._./g' | \
		sed 's/^}...Quran, jQuery..;//' > ${DIST_DIR}/quran.tmp

finish:
	@@echo ${TARGET};
	@@mv ${DIST_DIR}/quran.tmp ${DIST_DIR}/quran.js;
	@@ln -sf ${DIST_DIR}/quran.js ${PREFIX}/../../root/static/js/quran.js;

m: muted
mute: muted
muted: start post no_debug finish
	@@echo ${TARGET};

p: production
prod: production
production: start min post no_debug finish
	@@echo ${TARGET};

d: development
dev: development
development: start post debug finish
	@@echo ${TARGET};

f: flat
flat: start group_flat post debug finish
	@@echo ${TARGET};
