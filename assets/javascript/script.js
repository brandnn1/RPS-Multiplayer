
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBg6IyWj3curcfPuAeV8MMy07PgO1WuTjY",
    authDomain: "first-project-acab1.firebaseapp.com",
    databaseURL: "https://first-project-acab1.firebaseio.com",
    projectId: "first-project-acab1",
    storageBucket: "first-project-acab1.appspot.com",
    messagingSenderId: "1027238424289",
    appId: "1:1027238424289:web:0cc4354c688c9a31"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  var database = firebase.database();
  var presenceRef = database.ref(".info/connected");
  var presenceNumRef = database.ref("/presenceNum");
  var partysRef = database.ref("/partysRef");
  var turnRef = database.ref("/turn");
  var chatRef = database.ref("/chat");
  var results = database.ref("/results");
  var winnerRef = database.ref("/winner");
  
  var wins1
  var wins2
  var losses1
  var losses2;
  var party;
  var otherparty;
  var name = {};
  var userRef;


  
  var choices = ['rock','paper','scissors'];
    
    // Remove turn and chat if disconnect
    turnRef.onDisconnect().remove();
    chatRef.onDisconnect().remove();
    winnerRef.onDisconnect().remove();
  
    var game = {
      listeners: function() {
        presenceRef.on('value', function(snapshot){
          if (snapshot.val()) {
            var con = presenceNumRef.push(true);
            con.onDisconnect().remove();
          }
        });

        $('#submit-name').one('click', function() {
          game.setParty();
          return false
        });
        partysRef.on('child_added', function(populateUserInfo) {
          var key = populateUserInfo.key;
          name[key] = populateUserInfo.val().name;
          var party_title = $('.p' + key + '_name');
          party_title.empty();
          var $h1 = $('<h2>').text(name[key]);
          party_title.append($h1);
          var wins = populateUserInfo.val().wins;
          var losses = populateUserInfo.val().losses;
          var _wins = $('<h6>').text('Wins: ' + wins);
          var _losses = $('<h6>').text('Losses: ' + losses);
          $('.score' + key).append(_wins).append(_losses).append('<br><br>');
        });
        partysRef.on('child_removed', function(populateUserInfo) {
          var key = populateUserInfo.key;
          var party_title = $('.p' + key + '_name');
          var party_score = $('.score' + key);
          var $h1 = $('<h2>').text('Waiting for party ' + key + ' to Join');
          party_title.empty();
          party_score.empty();
          party_title.append($h1);
        });
        turnRef.on('value', function(snapshot) {
          var turnNum = snapshot.val();
          if (turnNum == 1) {
            $('.choices1').empty();
            $('.results').empty();
            $('.choices2').empty();
            game.turn1();
          } else if (turnNum == 2) {
            game.turn2();
          } else if (turnNum == 3) {
            game.turn3();
          }
        });
        partysRef.child(1).on('child_changed', function(populateUserInfo) {
          if (populateUserInfo.key == 'wins') {
            wins1 = populateUserInfo.val();
          } else if (populateUserInfo.key == 'losses') {
            losses1 = populateUserInfo.val();
          };
          if (wins1 !== undefined) {
            $('.score1').text('Wins: ' + wins1);
            $('.score1').text('Losses: ' + losses1);
          }
        });
        partysRef.child(2).on('child_changed', function(populateUserInfo) {
          if (populateUserInfo.key == 'wins') {
            wins2 = populateUserInfo.val();
            console.log(wins2);
          } else if (populateUserInfo.key == 'losses') {
            losses2 = populateUserInfo.val();
          };
          $('.score2').text('Wins: ' + wins2);
          $('.score2').text('Losses: ' + losses2);
        });
        winnerRef.on('value', function(snapshot) {
            console.log('Results: ' + snapshot.val());
            $('.results').text(snapshot.val()).css('z-index','1');
          setTimeout(function() {
            // turnRef.set(1);
            $('.results').text('').css('z-index','-1');
          }, 2000);
          });
      },
      
      turnMessage: function(playTurn) {
        console.log('turnMessage function firing');
        otherparty = party == 1 ? 2:1;
        if (playTurn == party) {
          $('h4').text("It's Your Turn!");
        } else if (playTurn == otherparty) {
          $('h4').text("Waiting for " + name[otherparty] + " to choose.");
        } else {
          $('h4').text('');
        }
      },

      setParty: function() {
        console.log('setParty function firing');
        database.ref().once('value', function(snapshot) {
          var partyObj = snapshot.child('partysRef');
          var num = partyObj.numChildren();
          if (num == 0) {
            party = 1;
            game.addParty(party);
          } else if (num == 1 && partyObj.val()[2] !== undefined) {
            party = 1;
            game.addParty(party);
            turnRef.set(1);
          } else if (num == 1) {
            party = 2;
            game.addParty(party);
            turnRef.set(1);
          }
        })
      },
      addParty: function(count) {
        console.log('addParty function firing');
        var partyName = $("#name-input").val();
        var name_form = $(".name-form");
        var name_panel = $(".name-panel>span");
        name_panel.empty();
        name_panel.text("Directions");
        name_form.empty();
        name_form.html("<h4>Time to Play</h4>");
        userRef = partysRef.child(count);
        userRef.onDisconnect().remove();
        userRef.set({
          'name': partyName,
          'wins': 0,
          'losses': 0
        })
      },
      showChoice: function() {
        console.log('showChoice function firing');
        for (i in choices) {
          var $i = $('<img>');
          $i.addClass('img-responsive ' + choices[i] + '_p1');
          $i.attr('data-choice', choices[i]);
          $i.attr('alt', choices[i]);
          $i.attr('src','assets/images/' + choices[i] + '.gif');
          $('.choices' + party).append(`<div class='${choices[i]}-container tablecell'>`);
          $(`.${choices[i]}-container`).append($i);
        };
        $(document).one('click', 'img', game.setChoice);
      },
      setChoice: function() {
        console.log('setChoice function firing');
        var selection = $(this).attr('data-choice');
        userRef.update({
          'choice': selection
        });
        var $i = $("<img>");
        $i.addClass('img-responsive ' + selection + '_p1')
        $i.attr('data-choice', selection);
        $i.attr('alt', selection);
        $i.attr('src','assets/images/' + selection + '.gif');
        $('.choices' + party).empty().append(`<div class='${choices[i]}-container tablecell'>`);
        $(`.${choices[i]}-container`).append($i);
        turnRef.once('value', function(snapshot) {
          var turnNum = snapshot.val();
          turnNum++;
          turnRef.set(turnNum);
        })
  
      },