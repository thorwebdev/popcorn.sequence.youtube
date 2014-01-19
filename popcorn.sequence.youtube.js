/*!
 * Popcorn.sequence.youtube
 *
 * Copyright 2014, Thorsten Schaeff
 * Licensed under MIT license.
 *
 */

// Requires Popcorn.js
(function( global, Popcorn ) {
	var doc = global.document;
	var isPaused = true;
	var currentVideoId = 0;
	var audio, audioDefined=false;
	var videos = [];
    var sequence;
	var fadeTime = 1000;

	function createAudio(src, parent){
		var audioContainer = document.createElement("div");
		audioContainer.setAttribute("id","popcorn_sequence_youtube_audio");
		audioContainer.setAttribute("style","display:none;");
		parent.appendChild(audioContainer);
		return Popcorn.smart(
           '#popcorn_sequence_youtube_audio',
           src);
	}
    function createVideo(src, i, parent){
        var id = 'popcorn_sequence_youtube_video_'+i;
        var pop_id = '#'+id;
        var video = document.createElement("div");
        video.setAttribute('id', id);
        if(i == 0) video.setAttribute('style', 'width: 100%; height: 100%;position:absolute;top:0;left:0;');
        else video.setAttribute('style', 'width: 100%; height: 100%;position:absolute;top:0;left:0;display:none');
        parent.appendChild(video);
        return Popcorn.youtube(
            pop_id,
            src+'&wmode=opaque&controls=0&disablekb=1&controls=0&modestbranding=1&rel=0&showinfo=0');
    }
    function loadNextVideo(i, parent){
            //console.log(parent);
            videos.push(createVideo(sequence[i].src, i, parent));
            videos[i].on( "canplaythrough", function() {
                this.media.currentTime = sequence[i].in;
            });
            videoTransition(i, parent);
    }
    function videoTransition(i, parent){
        videos[i-1].on( "timeupdate", function() {
            //console.log(this.media.currentTime);
            if(this.media.currentTime >= (sequence[i-1].out - (fadeTime/1000))){
                this.off("timeupdate");
                var nextVid = doc.getElementById('popcorn_sequence_youtube_video_'+(i));

                if(audioDefined) videos[i].mute().play();
                else videos[i].play();
                currentVideoId++;
                //console.log(currentVideoId);
                fadeIn(fadeTime, nextVid);
                setTimeout(videos[i-1].pause(), fadeTime);
                try{
                    loadNextVideo(i+1, parent);
                }
                catch (err){
                    console.log('popcorn.sequence.youtube: last video playing');
                    videos[i].on( "timeupdate", function() {
                        //console.log(this.media.currentTime);
                        if(this.media.currentTime >= (sequence[i].out - (fadeTime/1000))){
                            this.off("timeupdate");
                            isPaused = true;
                            if(audioDefined) audio.pause();
                            this.pause();

                            //TODO replay function
                        }
                    });
                }
            }
        });
    }
    function fadeIn(ms, el) {
        var opacity = 0,
            interval = 50,
            gap = interval / ms;

        el.style.display = 'block';
        el.style.opacity = opacity;

        function func() {
            opacity += gap;
            el.style.opacity = opacity;

            if(opacity >= 1) {
                window.clearInterval(fading);
            }
        }

        var fading = window.setInterval(func, interval);

    }


    Popcorn.sequence.youtube = function( parent, list, audio_src ) {
		return new Popcorn.sequence.youtube.init( parent, list, audio_src );
  };

  Popcorn.sequence.youtube.init = function( parent, list, audio_src ) {
	// Video container
    this.parent = doc.getElementById( parent );
    sequence = list;
	
	//create audio if defined
	if(audio_src != undefined){
		audio = createAudio(audio_src, this.parent);
		audioDefined=true;
	}
    //createfirst video
    videos.push(createVideo(sequence[0].src,0,this.parent));
      var self = this;
      videos[0].on( "canplaythrough", function() {
          this.media.currentTime = sequence[0].in;
          try {
              loadNextVideo(1,self.parent);
          }
          catch (err){
              //console.log(err);
              console.log('popcorn.sequence.youtube: last video playing');
          }
      });
	
	this.paused = function(){
		return isPaused;
	};
	//play audio and video
	this.play = function(){
		isPaused = false;
		if(audioDefined){
            audio.play();
            //console.log(videos[currentVideoId]);
            videos[currentVideoId].mute().play();
        }
        else videos[currentVideoId].play();
	};
	//pause audio and video
	this.pause = function() {
		isPaused = true;
        if(audioDefined) audio.pause();
        videos[currentVideoId].pause();
	};
	
  };
})(this, Popcorn);
