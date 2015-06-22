(
    function(){
        var moduleName='news';
        var newsTimer=false;
        var news=false;

        function render(el){
            fetchCNN();
            el.addEventListener(
              'click',
              function(e){
                Window.open(
                    e.target.getAttribute('href'),
                    {
                        frame:true,
                        toolbar:true,
                        focus:true
                    }
                );
              }
            );

            setInterval(
                fetchCNN,
                1200000//20 min
            );
        }

        function fetchCNN(){
            news=document.getElementById('news-module');
            if(!navigator.onLine){
                news.innerHTML='CNN not available in offline mode...';
                return;
            }

            clearInterval(
                newsTimer
            );

            var xhr = new XMLHttpRequest();
            xhr.onload = function(e) {
                var jss = xmlToJson(e.target.responseXML.documentElement);
                news.innerHTML=jss.channel.title['#text'];
                var currentNews=0;

                news.setAttribute('href',jss.channel.item[currentNews].link['#text']);
                news.innerHTML='CNN : '+jss.channel.item[currentNews].title['#text'];
                newsTimer=setInterval(
                    function(){
                        var index=currentNews++ % jss.channel.item.length;
                        news.setAttribute('href',jss.channel.item[index].link['#text']);
                        news.innerHTML='CNN : '+jss.channel.item[index].title['#text'];
                    },
                    25000
                )

            }
            xhr.open("GET", "http://rss.cnn.com/rss/cnn_latest.rss");
            xhr.send();
        }

        function xmlToJson(xml) {

          	var obj = {};

          	if (xml.nodeType == 1) {
          		if (xml.attributes.length > 0) {
          		obj["@attributes"] = {};
          			for (var j = 0; j < xml.attributes.length; j++) {
          				var attribute = xml.attributes.item(j);
          				obj["@attributes"][attribute.nodeName] = attribute.value;
          			}
          		}
          	} else if (xml.nodeType == 3) { // text
          		obj = xml.nodeValue;
          	}

          	if (xml.hasChildNodes()) {
          		for(var i = 0; i < xml.childNodes.length; i++) {
          			var item = xml.childNodes.item(i);
          			var nodeName = item.nodeName;
          			if (typeof(obj[nodeName]) == "undefined") {
          				obj[nodeName] = xmlToJson(item);
          			} else {
          				if (typeof(obj[nodeName].push) == "undefined") {
          					var old = obj[nodeName];
          					obj[nodeName] = [];
          					obj[nodeName].push(old);
          				}
          				obj[nodeName].push(xmlToJson(item));
          			}
          		}
          	}
          	return obj;
          };

        exports(moduleName,render);
    }
)();
