(
    function(){
        var moduleName='header';

        function render(el){
            el.addEventListener(
              'click',
              function(e){
                if(
                  !win[e.target.id] &&
                  e.target.id != 'setAlarm' &&
                  e.target.id != 'settings' &&
                  e.target.id != 'home'
                ){
                  return;
                }

                switch(e.target.id){
                  case 'setAlarm' :
                  case 'settings' :
                  case 'home' :
                    app.navigate(e.target.id);
                    break;
                  default :
                    win[e.target.id]();
                }
              }
            );
        }

        exports(moduleName,render);
    }
)();
