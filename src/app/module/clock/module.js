(
    function(){
        var moduleName='clock';

        function render(el){
            setInterval(
              showTime,
              1000
            );

            showTime();

            setTimeout(
              function(){
                Object.observe(
                  app.data.alarm,
                  function(data){
                    for(var val of data){
                      var clock=document.getElementById('clock-module');
                      if(!val.object.waitingToBeKilled){
                        clock.classList.remove('waitingToBeKilled');
                        return;
                      }
                      clock.classList.add('waitingToBeKilled');
                    }
                  }
                );
              },
              100
            )

            el.addEventListener(
              'click',
              function(e){
                switch(e.target.id){
                  case 'snooze' :
                    app.trigger('snooze');
                    break;
                  case 'awake' :
                    app.trigger('awake');
                    break;
                  default :
                    return;
                }
              }
            );
        }

        function showTime(){
          var date=new Date();
          var hour=date.getHours();
          var min=date.getMinutes();

          app.data.time={
            hour: hour,
            min : min
          }

          if(hour>12 && !app.data.military)
            hour=hour-12;

          document.getElementById('hour').innerHTML=hour;
          document.getElementById('minute').innerHTML=('0'+min).slice(-2);
        }

        exports(moduleName,render);
    }
)();
