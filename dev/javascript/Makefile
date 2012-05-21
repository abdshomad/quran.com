# vim: ts=2 sw=2 noexpandtab
      PREFIX = .
     SRC_DIR = ${PREFIX}/src
    DIST_DIR = ${PREFIX}/dist
   BUILD_DIR = ${PREFIX}/build
      TARGET = ${@}
    JS_FILES = ${SRC_DIR}/lib/json2.js\
               ${SRC_DIR}/lib/script.js\
               ${SRC_DIR}/lib/jquery.mousewheel.js\
               ${SRC_DIR}/lib/jquery.tmpl.js\
               ${SRC_DIR}/lib/jquery.ui.notification.js\
               ${SRC_DIR}/lib/jquery.ui.resizable.js\
               ${SRC_DIR}/refactor/pre.js\
               ${SRC_DIR}/Quran.js\
               ${SRC_DIR}/Quran/prototype.js\
							 ${SRC_DIR}/ui/screen/widget/dropdown.js\
							 ${SRC_DIR}/ui/screen/widget/modal.js\
							 ${SRC_DIR}/ui/screen/widget/tip.js\
               ${SRC_DIR}/ui/screen/head/signIn.js\
               ${SRC_DIR}/ui/screen/head/signUp.js\
               ${SRC_DIR}/ui/screen/head/quickHack.js\
               ${SRC_DIR}/ui/screen/body/notificationSystem.js\
							 ${SRC_DIR}/ui/screen/side/navMenu.js\
               ${SRC_DIR}/ui/screen/side/searchInput.js\
               ${SRC_DIR}/ui/screen/content/noFOUT.js\
               ${SRC_DIR}/ui/screen/content/ayahTools.js\
               ${SRC_DIR}/ui/screen/content/changeAyah.js\
               ${SRC_DIR}/ui/screen/content/orderAyah.js\
               ${SRC_DIR}/ui/screen/content/scrollAnchor.js\
               ${SRC_DIR}/ui/screen/content/audioPlayer.js\
               ${SRC_DIR}/ui/screen/content/wordSystem.js
   JS_ENGINE = `which node`
  JS_COMPILE = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe
POST_COMPILE = ${JS_ENGINE} ${BUILD_DIR}/post-compile.js

all: core

core: ${TARGET} | dev
	@@echo "Complete"

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

dev: ${DIST_DIR}
	@@echo "Building ${TARGET} JS"

	@@cat ${JS_FILES} | \
		sed 's/^.function..Quran, jQuery...{//' | \
		sed 's/\/\/console\./console./g' | \
		sed 's/^}...Quran, jQuery..;//' > ${DIST_DIR}/screen.js

	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying ${TARGET} JS"; \
		${JS_COMPILE} ${DIST_DIR}/screen.js > screen.tmp; \
		${POST_COMPILE} screen.tmp > ${DIST_DIR}/screen.min.js; \
		rm -f screen.tmp; \
	fi

	@@ln -sf `pwd`/dist/screen.js ../../root/static/js/screen.js

prod: ${DIST_DIR}
	@@echo "Building ${TARGET} JS"

	@@cat ${JS_FILES} | \
		sed 's/^.function..Quran, jQuery...{//' | \
		sed 's/\([\s\t]\)console\./\/\/console./g' | \
		sed 's/^}...Quran, jQuery..;//' > ${DIST_DIR}/screen.js

	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying ${TARGET} JS"; \
		${JS_COMPILE} ${DIST_DIR}/screen.js > screen.tmp; \
		${POST_COMPILE} screen.tmp > ${DIST_DIR}/screen.min.js; \
		rm -f screen.tmp; \
	fi

	@@ln -sf `pwd`/dist/screen.min.js ../../root/static/js/screen.js


# TODO: 'handheld' ?
