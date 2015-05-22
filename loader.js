(function() {
    var HTML5_LIVEPASS_LIBRARY_URL = '//livepassdl.conviva.com/ver/2.90.0.24127/LivePass.js',
        SERVICE_URL = 'http://livepass.conviva.com',
        CUSTOMER_KEY = typeof(CONVIVA_CUSTOMER_KEY) !== 'undefined' ? CONVIVA_CUSTOMER_KEY : '',
        session;

    function injectLibrary() {
        var head = document.getElementsByTagName('head')[0],
            script = document.createElement('script');

        script.src = HTML5_LIVEPASS_LIBRARY_URL;
        script.onreadystatechange = function () {
            if (this.readyState === 'complete') {
                initLibrary();
            };
        };
        script.onload = initLibrary;
        head.appendChild(script);
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOMContentLoaded');
            var videoElement = document.getElementsByTagName('video')[0];
            videoElement.addEventListener('loadstart', function() {console.log('loadstart')});
        });
    }

    function initLibrary() {

        // Make sure Conviva's HTML5_LIVEPASS_LIBRARY library has been loaded
        if (typeof Conviva !== 'undefined' && Conviva) {

            Conviva.LivePass.toggleTraces(true); // set to false in production

            // Initialize Conviva's LivePass when DOM is ready
            Conviva.LivePass.init(SERVICE_URL, CUSTOMER_KEY, livePassNotifier);
        }

        function livePassNotifier(convivaNotification) {
            if (convivaNotification.code === 0) {
                console.log('Conviva LivePass initialized successfully.');
                bindOnVideoElement();
            } else {
                if (Conviva.LivePass.ready) { // check if LivePass is already initialized
                    console.log('Conviva LivePass post-initialization feedback. ', convivaNotification.code + ' - ' + convivaNotification.message);
                    bindOnVideoElement();
                } else {
                    console.log('Conviva LivePass failed to initialize! ', convivaNotification.code + ' - ' + convivaNotification.message);
                }
            }
        }

        function bindOnVideoElement() {
            var videoElement = document.getElementsByTagName('video')[0];
            videoElement.addEventListener('loadstart', startSession);
        }

        function startSession() {
            Conviva.LivePass.cleanupMonitoringSession(this);
            session && session.cleanup();

            var convivaMetadata =
                Conviva.ConvivaContentInfo.createInfoForLightSession('Once Upon a Time');
            convivaMetadata.streamUrl = this.src; // required
            convivaMetadata.isLive = false; // required

            convivaMetadata.playerName = 'My Test Player'; // recommended

            // optional
            convivaMetadata.tags = { tag1 : "value1", tag2 : "value2" };

            // convivaMetadata. ... = ... ; // other optional, but recommended properties

            // Create Conviva monitoring session
            session = Conviva.LivePass.createSession(this, convivaMetadata);

            // Set content length in seconds
            session.setContentLength(this.duration);
        }
    }

    // inject livepass library into head
    injectLibrary();

})();