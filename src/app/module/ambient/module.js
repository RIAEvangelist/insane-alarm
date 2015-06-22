(
    function(){
        var moduleName='ambient';

        navigator.getUserMedia = ( navigator.getUserMedia ||
           navigator.webkitGetUserMedia ||
           navigator.mozGetUserMedia ||
           navigator.msGetUserMedia);

        function render(el){
          window.video       = document.createElement('video'),
          window.canvas      = document.createElement('canvas'),
          window.ctx         = canvas.getContext('2d');

          var constraints={
              video: {
                mandatory: {
                  maxHeight   : 1,
                  maxWidth    : 1,
                  maxFrameRate  : 1
                }
              }
          }

          navigator.getUserMedia(
              constraints,
              function(localMediaStream){
                  window.localMediaStream=localMediaStream;
                  video.src = window.URL.createObjectURL(window.localMediaStream);
                  video.play();
              },
              function(err){
                  console.log(err);
              }
          );

          setTimeout(
            renderAmbient,
            100
          );

          setInterval(
            renderAmbient,
            1000
          );
        }

        function renderAmbient(){
          ctx.drawImage(video, 0, 0);

          var frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

          var brightness=Math.floor(
            (
              frame.data[0]+
              frame.data[1]+
              frame.data[2]
            )/3
          );

          var use=240;
          var text=0;

          if(brightness<180){
            use=100;
          }

          if(brightness<110){
            use=0;
            color=130;
          }

          if(brightness<70){
            use=0;
            color=40;
          }

          var rgb='rgb('+(new Array(4).join(use+',').slice(0,-1))+')';
          var rgbText='rgb('+(new Array(4).join(color+',').slice(0,-1))+')';

          app.data.ambient={
            rgb:rgb,
            rgbText:rgbText
          }

          document.querySelector('body').style.backgroundColor=rgb;
          document.querySelector('.clock-module').style.color=
          document.querySelector('.news-module').style.color=rgbText;

          return;
        }


        exports(moduleName,render);
    }
)();
