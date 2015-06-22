(
    function(){
        var moduleName='set-alarm';
        app.data.alarm={};

        window.AudioContext = (
            window.AudioContext ||
            window.webkitAudioContext
        );

        window.alarm=
        alarm={};
        alarm.context=new AudioContext();
        alarm.mainVolume=alarm.context.createGain();
        alarm.mainVolume.connect(alarm.context.destination);

        alarm.toneLength=1000;
        alarm.toneBreakLength=300;
        alarm.sound={
            low: {
                hertz : 200
            },
            mid: {
                hertz : 500
            },
            high: {
                hertz : 1000
            }
        };

        function render(el){
            var hourOptions=document.getElementById('hourOptions');
            var minOptions=document.getElementById('minOptions');

            el.addEventListener(
              'click',
              function(e){
                if(!e.target.tagName.toLowerCase()=='li')
                  return;

                var currentSelection=e.target.parentElement.querySelector('.selected')

                if(currentSelection)
                  currentSelection.classList.remove('selected');

                e.target.classList.add('selected');

                setAlarm();
              }
            );

            for(var i=0; i<24; i++){
              var hour=i;

              if(hour==0)
                hour=12;

              if(i<12)
                hour+='AM'

              if(i>11){
                if(i>12)
                  hour=i-12;
                hour+='PM'
              }

              var option=app.template(
                'hour-option',
                {
                  hour:i,
                  hourDisplay:hour
                }
              )

              hourOptions.appendChild(
                option
              )
            }

            for(var i=0; i<60; i++){
              var option=app.template(
                'min-option',
                {
                  min:i
                }
              )

              minOptions.appendChild(
                option
              )
            }

            setTimeout(
              initAlarm,
              100
            );
        }

        function loadPrefrences(){
          app.storage.get(
            null,
            function(data){
              app.data.alarm=data;
              app.data.alarm.killed=false;
              if(!app.data.alarm.hour)
                app.data.alarm.hour=7;

              if(!app.data.alarm.min)
                app.data.alarm.min=30;

              //chrome.power.requestKeepAwake("system");
            }
          );
        }
        loadPrefrences();

        function initAlarm(){
          if(
            !!!app.data.alarm.hour ||
            !!!app.data.alarm.min
          ){
            return;
          }

          document.querySelector('[hour="'+app.data.alarm.hour+'"]').classList.add('selected');
          document.querySelector('[min="'+app.data.alarm.min+'"]').classList.add('selected');

          setInterval(
            checkAlarm,
            alarm.toneLength+alarm.toneBreakLength
          );

        }

        function setAlarm(){
          var times=document.querySelectorAll('.selected');
          if(times.length<2)
            return;

          var alarmData={
            hour: times[0].getAttribute('hour'),
            min : times[1].getAttribute('min')
          }

          app.storage.set(
            alarmData
          );

          app.data.alarm.hour=alarmData.hour;
          app.data.alarm.min=alarmData.min;
        }

        function checkAlarm(){
          document.body.style.backgroundColor=app.data.ambient.rgb;
          if(
            (
              !app.data.alarm.waitingToBeKilled &&
              (
                Number(app.data.time.hour)!= Number(app.data.alarm.hour) ||
                Number(app.data.time.min) != Number(app.data.alarm.min)
              )
            ) ||
            app.data.alarm.killed
          ){
            return;
          }

          document.body.style.backgroundColor='rgb(255,255,255)';

          app.data.alarm.waitingToBeKilled=true;
          app.data.alarm.killed=false;

          app.navigate('home');

          win.focus();
          win.enterFullscreen();

          //chrome.power.requestKeepAwake("display");

          for (i in alarm.sound) {
              if(!alarm.oscillators)
                break;
              var oscillator=alarm.oscillators[i];
              if(!oscillator)
                  continue;
              if(!oscillator.tone)
                  continue;
              oscillator.tone.stop(0);
          };

          alarm.oscillators={};

          for (var i in alarm.sound) {
              var oscillator,
              tone=alarm.sound[i];

              alarm.oscillators[i]={};
              oscillator=alarm.oscillators[i];
              oscillator.tone=alarm.context.createOscillator();
              oscillator.volume=alarm.context.createGain();
              oscillator.tone.type=0;
              oscillator.tone.frequency.value=tone.hertz;
              oscillator.tone.connect(oscillator.volume);
              oscillator.volume.connect(alarm.mainVolume);
          }

          for (i in alarm.sound) {
              var oscillator=alarm.oscillators[i];
              oscillator.tone.start(0);
          }

          clearTimeout(alarm.beat);
          alarm.beat=setTimeout(
              function(){
                  for (i in alarm.sound) {
                      var oscillator=alarm.oscillators[i];
                      if(!oscillator)
                          continue;
                      if(!oscillator.tone)
                          continue;
                      oscillator.tone.stop(0);
                  };
                  document.body.style.backgroundColor=app.data.ambient.rgb;
              },
              alarm.toneLength
          );
        }

        function killAlarm(){
          app.data.alarm.killed=true;
          app.data.alarm.waitingToBeKilled=false;
          resetAlarm(true);
        }

        function snoozeAlarm(){
          app.data.alarm.killed=true;
          app.data.alarm.waitingToBeKilled=false;
          app.data.alarm.min=Number(app.data.alarm.min)+5;
          if(app.data.alarm.min>59){
            app.data.alarm.hour=Number(app.data.alarm.hour)+1;
            if(app.data.alarm.hour>23)
              app.data.alarm.hour=0;

            app.data.alarm.min-=60;
          }
          resetAlarm();
        }

        function resetAlarm(hardReset){
          setTimeout(
            function(){
              app.data.alarm.killed=false;
            },
            55000
          );

          if(!hardReset)
            return;

          setTimeout(
            loadPrefrences,
            60000
          );
        }

        app.on(
          'awake',
          killAlarm
        );

        app.on(
          'snooze',
          snoozeAlarm
        )

        exports(moduleName,render);
    }
)();
