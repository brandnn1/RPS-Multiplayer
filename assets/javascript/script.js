
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
      chatRef.on('child_added', function(childSnapshot, prevChildKey) {
        var message_list = childSnapshot.val();
        $('.message_body').append('<p>' + message_list + "</p>")
      });
    },
  };

  chat.sendMessage();