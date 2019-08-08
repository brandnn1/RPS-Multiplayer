
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
          } else if (populateUserInfo.key == 'losses') {
            losses2 = populateUserInfo.val();
          };
          $('.score2').text('Wins: ' + wins2);
          $('.score2').text('Losses: ' + losses2);
        });
        winnerRef.on('value', function(snapshot) {
            $('.results').text(snapshot.val()).css('z-index','1');
          setTimeout(function() {
            // turnRef.set(1);
            $('.results').text('').css('z-index','-1');
          }, 2000);
          });
      },
      
      turnMessage: function(playTurn) {
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
      
      turn1: function() {
        game.turnMessage(1);
        if (party == 1) {
          game.showChoice();
        }
      },
      turn2: function() {
        game.turnMessage(2);
        if (party == 2) {
          game.showChoice();
        }
      },
      turn3: function() {
        game.turnMessage(3);
        game.outcome();
      },
      outcome: function() {
        partysRef.once('value', function(snapshot) {
          var snap1 = snapshot.val()[1];
          var snap2 = snapshot.val()[2];
          choice1 = snap1.choice;
          wins1 = snap1.wins;
          losses1 = snap1.losses;
          choice2 = snap2.choice;
          wins2 = snap2.wins;
          losses2 = snap2.losses;
          var textChoice = otherparty == 1 ? choice1:choice2;
          var $i = $('<img>');
          $i.addClass(textChoice + '_p1');
          $i.attr('data-choice', textChoice);
          $i.attr('alt', textChoice);
          $i.attr('src', 'assets/images/' + textChoice + '.gif');
          $('.choices' + otherparty).append($i);
          game.choiceCheck();
        })
      },
      logic: function() {
        if (choice1 == 'paper') {
            if (choice2 == 'paper'){
              game.winner(0)
            } else if (choice2 == 'rock') {
              game.winner(1);
            } else if (choice2 == 'scissors') {
              game.winner(2);
            }
        } else if (choice1 == 'rock') {
            if (choice2 == 'rock'){
              game.winner(0)
           } else if (choice2 == 'paper') {
             game.winner(2);
           } else if (choice2 == 'scissors') {
             game.winner(1);
           }
        } else if (choice1 == 'scissors') {
          if (choice2 == 'scissors'){
            game.winner(0)
          } else if (choice2 == 'rock') {
            game.winner(2);
          } else if (choice2 == 'paper') {
            game.winner(1);
          }
        }  
      },
      winner: function(partyNum) {
        console.log('winner function firing');
        console.log(partyNum)
        if (partyNum == 0) {
          results = 'Tie!'
          wins = wins
          losses = losses
          console.log(results)

          var otherpartyNum = partyNum == 1 ? 2:1;
          $('.choices' + otherpartyNum + ' > img').css('opacity','0.5');
          partysRef.child(partyNum).update({
            'wins': wins
          });
          partysRef.child(otherpartyNum).update({
            'losses': losses
          });
          winnerRef.set(results);
          setTimeout(function() {
            turnRef.set(1);
          },1000);
        } else {
          results = name[partyNum] + ' Wins!';
          if (partyNum == 1)  {
            wins = wins1;
            losses = losses2;
          } else if (partyNum == 2) {
            wins = wins2;
            losses = losses1;
          } 
          console.log(results)
          wins++;
          losses++;
          // showResults(results);
          var otherpartyNum = partyNum == 1 ? 2:1;
          var nobodyWins = partyNum == 1 ? 0:0;
          console.log(otherpartyNum)
          console.log(nobodyWins)
          $('.choices' + otherpartyNum + ' > img').css('opacity','0.5');
          partysRef.child(partyNum).update({
            'wins': wins
          });
          partysRef.child(otherpartyNum).update({
            'losses': losses
          });
          winnerRef.set(results);
          setTimeout(function() {
            turnRef.set(1);
          },1000);

        };
  
      },

      choiceCheck:function() {

        game.logic();
      }
    };
  
    game.checkers();



      var chat = {
        message:"",
        getMessage:"",
        sendMessage: function() {
          $('.message_submit').on('click', function(event) {
            event.preventDefault();
            var username = name[party];
            var message = $('.message_input').val();
            chatRef.push(username + ": " + message);
            $('.message_input').val('');
          });
          chat.showMessage();
        },
        sendDisconnect: function() {
          chatRef.on('child_disconnect', function(snapshot) {
            $('.message-body').append(name[party] + ' has disconnected.');
          });
        },
        showMessage: function() {
          chatRef.on('child_added', function(populateUserInfo, prevChildKey) {
            var message_list = populateUserInfo.val();
            $('.message_body').append('<p>' + message_list + "</p>")
          });
        },
      };
    
      chat.sendMessage();
    })