var bindIO = function(socket,window,appspace) {
    console.log("engine test");

    socket.on(appspace+'charinfo-return', function(msg){
        console.log("Info Received");
        console.log(msg);


        var clearCharPanel = function() {
            $('div#displaypanel').empty();
        };
        var createCharDataPanel = function(chardata,paneldata) {
          var textstr = '<div class="chardatapanel">';
              textstr += '<div class="namechar"><h2>';
              textstr += chardata.data.charname;
              textstr += '</h2></div>';
              textstr += '<div class="panelbody">';
              textstr += '</div>';
              textstr += '<div class="panelfooter">';
              textstr += '</div>';

          textstr += '</div>';
          return textstr;
        };
        clearCharPanel();

        var charDisplayDiv = $('div#bodycenter');
        var divstr = createCharDataPanel({'type':"char","data":msg.char},{});
        if(divstr != null)           charDisplayDiv.append( divstr );

    }.bind(this));

    socket.on(appspace+'redirect_signin', function(msg){
      window.location.href = "/login";
    }.bind(this));
    socket.on(appspace+'heartbeat', function(msg){
      socket.emit(appspace+'heartbeat', {} );
    }.bind(this));
    socket.on(appspace+'game-zonedata-return', function(msg){
      console.log("game zonedata received!");
      console.log(msg);
    }.bind(this));
    socket.on(appspace+'game-starting-begin', function(msg){
      console.log("game start received!");
      console.log(msg);
    }.bind(this));


    socket.emit(appspace+'connection',{});

    socket.emit(appspace+'game-starting-request',{});
};
