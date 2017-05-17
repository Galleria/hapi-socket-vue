var socket = io();

var vm = new Vue({
  el: '#app',
  data: {
    pages: {},
    referrers: {},
		activeUsers: 0,
    message: 'Hello Vue!'
  },
  created: function() {
    socket.on('updated-stats', function(data) {
			this.pages = data.pages;
			this.referrers = data.referrers;
			this.activeUsers = data.activeUsers;
      console.log( 'updated-stats !!', data.pages , data.referrers , data.activeUsers )
    }.bind(this));
  }
});