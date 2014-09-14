chrome.extension.sendRequest({cmd: "read_file"}, function(response){
    $(document.body).prepend(response.html);
    $("#brocast_draw_button").css({"background-image": "url(" + response.drawImageURL + ")"});

    var canvas, ctx, isDrawing;
    var barShouldSlide = true;
    var shouldDraw = false;
	r=0; g=0; b=0; a=255;

	function setupCanvas() {
	    canvas = document.getElementById("brocast_sketchpad");
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;
		ctx = canvas.getContext('2d');
	}

	setupCanvas();

    $(document).on("mousedown", "canvas", function(e) {
    	if (shouldDraw) {
			isDrawing = true;
			ctx.lineWidth = $("#brocast_stroke_weight[type=range]").val();
			ctx.lineJoin = ctx.lineCap = 'round';
			ctx.moveTo(e.clientX, e.clientY);
		}

	}).on("mousemove", "canvas", function(e) {
	  if (isDrawing) {
	    ctx.lineTo(e.clientX, e.clientY);
	    ctx.stroke();
	  }

	}).on("mouseup", "canvas", function(e) {
  		isDrawing = false;	

	});

	$("#brocast_color").click(function() {
		barShouldSlide = false;
	}).change(function() {
		ctx.strokeStyle = document.getElementById("brocast_color").value;
		barShouldSlide = true;
	});

	$("#brocast_draw_button").click(function() {
		shouldDraw = !shouldDraw;
		isDrawing = false;

		if (shouldDraw) {
			setupCanvas();
			$(canvas).show();
			$(this).addClass("active");
		} else {
			$(canvas).remove();
			$("body").prepend("<canvas id='brocast_sketchpad' style='display:none'></canvas>");
			$(this).removeClass("active");
		}
    });

	$(document).mousemove(function(event) {
		var annotations = $("#brocast_annotations");

		if (event.clientY <= 1) {
			annotations.slideDown();
		} else {
			if (event.clientY > (parseInt(annotations.css("height")) + 20) && barShouldSlide) {
					$("#brocast_annotations").slideUp();
			}
			
		}
	}); 
});

$(document).ready(function() {
});	