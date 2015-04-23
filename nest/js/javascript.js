var postt;
var id = 80;


//zobrazenie roomlistu
function getRoomList(){
	$.getJSON( "/nest/user/user-info", function( data ) {
			console.log(data);
			console.log(data.nick);
			//$("h1").append(" "+data.nick);
			$(".nick").text(data.nick);
		
			var room_list = $("#room_list");
			room_list.empty();
			room_list.append('<li class="active"><a href="">Dashboard</a></li>');
			
			$(data.rooms).each(function() {	
				room_list.append('<li><a href="#'+this.id+'" onClick="switchRoom('+this.id+')" ">'+this.name+'</a></li>');
			});
				
			room_list.children().first().addClass("active");
		});
}
//nacitanie jedneho postu/comentu, vrati na vystupe
function getMsg(post, postObj, parentId) {
		//console.log(parentId);
			
		if(postObj.creatorAvatarImg != null)
			$(".avatar", post).attr('src', "/nest"+postObj.creatorAvatarImg);
		if(postObj.images != undefined)
			if(postObj.images.length > 0)
				$(".post_image", post).attr('src', "/nest"+postObj.images[0]);
			
		$(".post_owner", post).text(postObj.creatorNick);
		$(".post_modified", post).text(postObj.modified);
		$(".post_text", post).text(postObj.text);
		$(".post_likes", post).text(postObj.likes);
		$(".post_comments", post).text($(postObj.children).length);
		$(".post_like_button", post).click(function(e) {
			$.getJSON("/nest/user/add-like?messageId="+postObj.id, function(data2) {
				$(".post_likes", post).text(data2);
			});
			e.stopPropagation();
		});
		//add coments
		if(parentId == 0) {
			$(".panel-footer textarea", post).attr('id', 'add_coment_text'+postObj.id);
			//console.log("id textarea zmenene na "+postObj.id);
		}
		
		if(parentId == 0) {
			$(".post_comment_button", post).click(function(e) {
				var text = $("#add_coment_text"+postObj.id, post).val();
				var postId = postObj.id;
				
				if((text.length > 0)&&(text.length < 2000)) {
					$.ajax({
						dataType: "json",
						url: "/nest/user/create-comment",
						data: { parentId: postId, comment: text},
						success: function(data) {
							console.log(data);
						
							//$(".", post).text(data2);
							//loadMsgs(data);
						}
					});
					console.log(text);
				}
				e.stopPropagation();
			});
		}
		if(parentId != 0) {
			$(".post_comment_button", post).remove();
			$(".add_coment_text", post).remove();
			
			//console.log("coments removed "+parentId);
		}
		//console.log(post);
		
		return post;
}

//nacitanie vsetkych postov z data
function loadMsgs(data) {
		
		$("#feed").empty();
		
		$(data).each(function(index, postObj) {
			
			var post = $(postt);
			
			//nacitanie postov
			post = getMsg(post, postObj, 0);
			
			post.appendTo(feed);
			
			var parentId = postObj.id;
			
			var comments = $(".post_comment", post);
				$(this.children).each(function(index, postObj){
					var comment = $(postt);
					
					//nacitanie komentarov
					comment = getMsg(comment, postObj, parentId);
					
					comment.appendTo(comments);
				});
		});
}

//nacitanie celeho dashboardu
function getDashboardMsgs() {
	$.getJSON("/nest/user/select-dashboard-messages?last=0", function(data) {
			console.log(data);
			
			postt = '<div class="row feed_post">'+$("div.feed_post").html()+'</div>';
			
			loadMsgs(data);			
		});
}

//onclick listener na roomlist
function switchRoom(id) {
	$.ajax({
		dataType: "json",
		url: "/nest/user/select-room-messages",
		data: { roomId: id, last: 0},
		success: function(data) {
			console.log(data);
		
			loadMsgs(data);
		}
	});
}
//onclick listener na addpost button
function addPost() {
	var text = $("#add_post_text").val();
	
	if((text.length > 0)&&(text.length < 2000)) {
		$.ajax({
			dataType: "json",
			url: "/nest/user/create-post",
			data: { roomId: id, post: text},
			success: function(data) {
				console.log(data);
			
				loadMsgs(data);
			}
		});
		
		console.log(id);
		console.log(text);
	}
}
//hlavna funkcia nacitana s dokumentom
$(document).ready(function() {
		console.log("ready!");
		
		getRoomList();
		
		getDashboardMsgs();
		
	});