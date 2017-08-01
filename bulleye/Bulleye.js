var svg = document.querySelector("svg");
var cursor = svg.createSVGPoint();
var arrows = document.querySelector(".arrows");
var target={x:902,y:247};
var line={x1:875,y1:280,x2:925,y2:220};
window.addEventListener("mousedown", knock);
window.addEventListener("touchstart", knock);

function knock(e) {
	TweenMax.to(".arrow-angle use", 0.3, {
		opacity: 1
	});
	window.addEventListener("mousemove", aim);
	window.addEventListener('touchmove', aim);
	window.addEventListener("mouseup", loose);
	window.addEventListener('touchend', loose);
	aim(e);

	TweenMax.to("#arc", 0.3, {
		opacity: 1
	});
}

function loose() {
	window.removeEventListener("mousemove", aim);
	window.addEventListener('touchmove', aim);
	window.removeEventListener("mouseup", loose);
	window.addEventListener('touchend', loose);

	TweenMax.to("#bow", 0.4, {
		scaleX: 1,
		transformOrigin: "right center",
		ease: Elastic.easeOut
	});
	TweenMax.to("#bow polyline", 0.4, {
		attr: {
			points: "88,200 88,250 88,300"
		},
		ease: Elastic.easeOut
	});

	var newArrow = document.createElementNS("http://www.w3.org/2000/svg", "use");
	newArrow.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "#arrow");
	arrows.appendChild(newArrow);
	var path = MorphSVGPlugin.pathDataToBezier("#arc");
	TweenMax.to([newArrow], 0.5, {
		force3D: true,
		bezier: {
			type: "cubic",
			values: path,
			autoRotate: ["x", "y", "rotation"]
		},
		onUpdate: hitTest,
		onUpdateParams: ["{self}"],
		ease: Linear.easeNone
	});
	TweenMax.to("#arc", 0.3, {
		opacity: 0
	});
	TweenMax.set(".arrow-angle use", {
		opacity: 0
	});
}

function hitTest(tween) {
	var arrow = tween.target[0];
 	var transform = arrow._gsTransform;
 	var radians = transform.rotation * Math.PI / 180;
	var x1 = transform.x;
	var y1 = transform.y;
	var x2 = (Math.cos(radians) * 60) + x1;
	var y2 = (Math.sin(radians) * 60) + y1;
	
	var intersection = getIntersection(x1,y1,x2,y2,line.x1,line.y1,line.x2,line.y2);
	if(intersection=="intersect"){
		 tween.pause();
		var dx = x - target.x;
		var dy = y - target.y;
		var distance = Math.sqrt((dx * dx) + (dy * dy));
		var selector = ".hit";
		if(distance<5){
			selector=".bullseye"
		}
		TweenMax.killTweensOf(selector);
		TweenMax.killChildTweensOf(selector);
		TweenMax.set(selector,{autoAlpha:1});
		TweenMax.staggerFromTo(selector+" path",.5,{rotation:-5,scale:0,transformOrigin:"center"},{scale:1,ease:Back.easeOut},.05);
		TweenMax.staggerTo(selector+" path",.3,{delay:2,rotation:20,scale:0,ease:Back.easeIn},.03);
	}
	
	
	
}

var pivot = {
	x: 100,
	y: 250
};
aim({
	clientX: 100,
	clientY: 400
});

TweenMax.set(".arc", {
	opacity: 0
});

function aim(e) {
	var point = getMouseSVG(e);
	point.x = Math.min(point.x, pivot.x - 7);
	point.y = Math.max(point.y, pivot.y + 7);
	var dx = point.x - pivot.x;
	var dy = point.y - pivot.y;
	var angle = Math.atan2(dy, dx);
	var bowAngle = angle - Math.PI;
	var distance = Math.min(Math.sqrt((dx * dx) + (dy * dy)), 50);
	var scale = Math.min(Math.max(distance / 30, 1), 2);
	TweenMax.to("#bow", 0.3, {
		scaleX: scale,
		rotation: bowAngle + "rad",
		transformOrigin: "right center"
	});
	var arrowX = Math.min(pivot.x - ((1 / scale) * distance), 88);
	TweenMax.to(".arrow-angle", 0.3, {
		rotation: bowAngle + "rad",
		svgOrigin: "100 250"
	});
	TweenMax.to(".arrow-angle use", 0.3, {
		x: -distance
	});
	TweenMax.to("#bow polyline", 0.3, {
		attr: {
			points: "88,200 " + Math.min(pivot.x - ((1 / scale) * distance), 88) + ",250 88,300"
		}
	});

	var radius = distance * 9;
	var offset = {
		x: (Math.cos(bowAngle) * radius),
		y: (Math.sin(bowAngle) * radius)
	};
	var arcWidth = offset.x * 3;

	TweenMax.to("#arc", 0.3, {
		attr: {
			opacity: 1.4 - (arcWidth / 800),
			d: "M100,250c" + offset.x + "," + offset.y + "," + (arcWidth - offset.x) + "," + (offset.y+50) + "," + arcWidth + ",50"
		}
	});
	/*
	
	
	*/
}

function getMouseSVG(e) {
	cursor.x = e.clientX;
	cursor.y = e.clientY;
	if(!cursor.x || !cursor.y){
    	cursor.x = e.changedTouches[0].clientX
    	cursor.y = e.changedTouches[0].clientY
	}
	return cursor.matrixTransform(svg.getScreenCTM().inverse());
}


function getIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    var a1, a2, b1, b2, c1, c2;
    var r1, r2, r3, r4;
    var denom, offset, num;
    a1 = y2 - y1;
    b1 = x1 - x2;
    c1 = (x2 * y1) - (x1 * y2);
    r3 = ((a1 * x3) + (b1 * y3) + c1);
    r4 = ((a1 * x4) + (b1 * y4) + c1);
    if ((r3 != 0) && (r4 != 0) && sameSign(r3, r4)) {
        return "dont intersect";
    }
    a2 = y4 - y3;
    b2 = x3 - x4;
    c2 = (x4 * y3) - (x3 * y4);
    r1 = (a2 * x1) + (b2 * y1) + c2;
    r2 = (a2 * x2) + (b2 * y2) + c2;
    if ((r1 != 0) && (r2 != 0) && (sameSign(r1, r2))) {
        return "dont intersect";
    }
    denom = (a1 * b2) - (a2 * b1);
    if (denom == 0) {
        return "collinear";
    }
    if (denom < 0) {
        offset = -denom / 2;
    } else {
        offset = denom / 2;
    }
    num = (b1 * c2) - (b2 * c1);
    if (num < 0) {
        x = (num - offset) / denom;
    } else {
        x = (num + offset) / denom;
    }
    num = (a2 * c1) - (a1 * c2);
    if (num < 0) {
        y = (num - offset) / denom;
    } else {
        y = (num + offset) / denom;
    }
    return "intersect";
}


function sameSign(a, b) {
    return (a * b) >= 0;
}