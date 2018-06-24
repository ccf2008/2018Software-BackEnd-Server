// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//


exports.countDown = functions.database.ref('/octionitems/{itemkey}/time')
    .onCreate((snapshot, context) => {
		console.log('Function start');
      // Grab the current value of what was written to the Realtime Database.
	var dbref = snapshot.ref; // database.ref('/octionitems/{itemkey}/time')
	var time = snapshot.val();
	  
	var soldout;
	var bidmankey;
	var uid;
	var title;
	var soldmanToken;
	var bidmanToken;
	  
	var titleref;  // database.ref('/octionitems/{itemkey}/title')
	var ref;  // database.ref('/octionitems/{itemkey}/soldout')
	var refb;  // database.ref('/octionitems/{itemkey}/bidmankey')
	var refu;  // database.ref('/octionitems/{itemkey}/uid')
	  
	var db = admin.database();
	var rootref = db.ref('/users');
		
	var tokens;
	var payload;
	
	new Promise(function(resolve, reject){ // mother promise start(then(0))
		console.log('Mother Promise start');
		setTimeout(function() {
			resolve();
		}, 30000);
	})
		.then(function() { // mother promise then(1)
			titleref = dbref.parent.child('title');
			ref = dbref.parent.child('soldout');
			refb = dbref.parent.child('bidmankey');
			refu = dbref.parent.child('uid');
			return 0;
		})
		.then(function() { // mother promise then(2)
			ref.once('value').then(function(snapshot) { // ref start (then(0))
				soldout = snapshot.val();
				return soldout;
			})
			.then(function(soldout) { // ref then(1)
				return console.log('soldout : ', soldout);
			})
			.catch(function(error) { // ref catch
				return console.log('Error sending message:', error);
			}); // ref end
			
			titleref.once('value').then(function(snapshot) { // titleref start
				title = snapshot.val();
				return title;
			})
			.then(function(title) { // titleref then(1)
				return console.log('title : ', title);
			})
			.catch(function(error) { // titleref catch
				return console.log('Error sending message:', error);
			}); // titleref end
			
			refu.once('value').then(function(snapshot) { // refu start
				console.log('refu Start');
				uid = snapshot.val();
				return uid;
			})
			.then(function(uid) { // refu then(1)
				return console.log('uid : ', uid);
			})
			.then(function() { // refu then(2)
				
					
				refb.once('value').then(function(snapshot) { // refb start
					console.log('refb Start');
					bidmankey = snapshot.val();
					return bidmankey;
				})
				.then(function(bidmankey) { // refb then(1)
					return console.log('bidmankey : ', bidmankey);
				})
				.then(function() { // refb then(2)

					rootref.once('value').then(function(snapshot) { // rootref start
						console.log('rootref Start');
						soldmanToken = snapshot.child(uid).child('pushToken').val();
						bidmanToken = snapshot.child(bidmankey).child('pushToken').val();
						tokens = [soldmanToken, bidmanToken];
						return tokens;
					})
						.then(function(tokens) { // rootref then(1)
							if(soldout <= 0){  // if this item is already soldout, then do nothing
								console.log('already soldout');
								reject(new error("Do nothing")) 
							}
							if(bidmanToken === null) {
								payload = {  // payload for messaging
									data: {
										title: title,
										text: '경매가 종료되었습니다'
									}
								};
							} else {
								payload = {  // payload for messaging
									data: {
										title: title,
										text: '상품이 낙찰되었습니다'
									}
								};
							}
							return payload;
						})
						.then(function(payload) { // rootref then(2)
							if(bidmanToken === null) {
								console.log('Send message for soldman');
								admin.messaging().sendToDevice(soldmanToken, payload)
								.then(function(response) {  // admin messaging then(1)
									// See the MessagingDevicesResponse reference documentation for
									// the contents of response.
									return console.log('Successfully sent message:', response);
								})
								.catch(function(error) {
									return console.log('Error sending message:', error);
								}); // admin memssaging end
							} else {
								console.log('Send message for bidman, soldman');
								admin.messaging().sendToDevice(tokens, payload)
									.then(function(response) { // admin messaging then(1)
										// See the MessagingDevicesResponse reference documentation for
										// the contents of response.
										return console.log('Successfully sent message:', response);
									})
									.catch(function(error) { // admin messaging catch
										return console.log('Error sending message:', error);
									}); // admin memssaging end
							}
								
							dbref.parent.child('soldout').set('true');
							console.log('rootref End');
							return 0;
						})
						.catch(function(error) { // rootref catch
							return console.log('Error sending message:', error);
						}); // rootref end
					
					console.log('refb End');
					return 0;
				})
				.catch(function(error) { //refb catch
					return console.log('Error sending message:', error);
				}); //refb end
				
				console.log('refu End');
				return 0;
			})
			.catch(function(error) { // refu catch
				return console.log('Error sending message:', error);
			}); // refu end
			
			console.log('Mother Promis End');
			return 0;
		})
		.catch(function(error) { // mother promise catch
			return console.log('Error sending message:', error);
		}); // mother promise end
			
	console.log('Function End');		
	return 0;
})