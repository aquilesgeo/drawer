	function ToolWheelMouse(){
		this.x0 = 0;
		this.y0 = 0;
		this.bstatus = false;
		this.onMouseDown = function(evt){
			this.x0 = evt.pageX;
			this.y0 = evt.pageY;
			this.bstatus = true;
		}
		this.onMouseUp = function(evt){
			this.bstatus = false;
		}
		this.onMouseMove = function(evt){
			if (!this.bstatus){
				return;
			}
			var dx = evt.pageX - this.x0;
			var dy = evt.pageY - this.y0;
			data.o.x += dx;
			data.o.y += dy;
			if (hasImage){
				pictureImage.style.left = data.o.x+'px';
				pictureImage.style.top = data.o.y+'px';
			}
			this.x0 = evt.pageX;
			this.y0 = evt.pageY;
			drawCanvas();
		}
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function ToolCursor(){
		this.index = -1;
		this.status = 0;
		this.px = 0;
		this.py = 0;
		this.vb = new Point(0,0);
		this.onMouseDown = function(evt){
			var p = data.fromClient(evt);
			if (evt.button != 0){
				return;
			}
			if (data.curveSelected!=null){
				for(i=0;i<data.curveSelected.points.length;i+=2){
					if (data.curveSelected.points[i].hit(p)){
						this.index = i;
						this.status = 1;	// Point edition
						this.px = evt.pageX;
						this.py = evt.pageY;
						return;
					}
				}
			}
			var umbral = 4/data.scale;
			data.setAllSelected(false);
			for(c=0;c<data.curves.length;c++){
				capture = data.curves[c].hit(p, umbral);
				if(capture.status){
					this.index = capture.index;
					data.curves[c].selected = true;
					data.curveSelected = data.curves[c];
					this.px = evt.pageX;
					this.py = evt.pageY;
					var points = data.curveSelected.points;
					this.vb.x = (points[this.index-1].x + 2*points[this.index].x+points[this.index+1].x)/4;
					this.vb.y = (points[this.index-1].y + 2*points[this.index].y+points[this.index+1].y)/4;
					this.status = 2;	// Curve edition
					break;
				}else{
					this.index = -1;
				}
			}
			drawCanvas();			
		}
		this.onMouseUp = function(evt){
			this.index = -1;
			this.status = 0;
		}
		this.onMouseMove = function(evt){
			if (this.index==-1){
				return;
			}
			var points = data.curveSelected.points;
			var dx = (this.px - evt.pageX)/data.scale;
			var dy = (this.py - evt.pageY)/data.scale;
			if (this.status==1){
				points[this.index].x -= dx;
				points[this.index].y -= dy;
			}else if (this.status == 2){								
				this.vb.x -= dx;
				this.vb.y -= dy;
				points[this.index].x = (4*this.vb.x-points[this.index-1].x-points[this.index+1].x)/2;
				points[this.index].y = (4*this.vb.y-points[this.index-1].y-points[this.index+1].y)/2;
			}
			drawCanvas();
			this.px = evt.pageX;
			this.py = evt.pageY;
		}
		this.onKeyDown = function(evt){
			if (evt.keyCode == 27){
				data.setAllSelected(false);
				data.curveSelected = null;
				drawCanvas();
			}
		}
		return this;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function ToolRefineCurve(){
		this.onMouseDown = function(evt){
			var p = data.fromClient(evt);
			if (evt.button != 0){
				return;
			}
			if (data.curveSelected==null){
				console.log('noselected');
				return;
			}
			var umbral = 4/data.scale;
			var capture = data.curveSelected.hit(p, umbral);
			if (!capture.status){
				console.log('nohit');
				return;
			}
			console.log('refine');
			var i = capture.index;
			var points = data.curveSelected.points;
			var ax = (points[i-1].x + points[i].x)/2;
			var ay = (points[i-1].y + points[i].y)/2;
			var bx = (points[i+1].x + points[i].x)/2;
			var by = (points[i+1].y + points[i].y)/2;
			points[i].x = (points[i-1].x + 2*points[i].x+points[i+1].x)/4;
			points[i].y = (points[i-1].y + 2*points[i].y+points[i+1].y)/4;
			vp = new Point(bx, by);
			points.splice(i+1, 0, vp);
			vp = new Point(ax, ay);
			points.splice(i, 0, vp);
			drawCanvas();
		}
		return this;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function ToolZoom(){
		this.status = false;
		this.x0 = 0;
		this.y0 = 0;
		this.x1 = 0;
		this.y1 = 0;
		this.onMouseUp = function(evt){
			if (this.status==0){
				return;
			}
			this.status = false;
			
			var dx = Math.abs(this.x0-this.x1);
			var dy = Math.abs(this.y0-this.y1);
			if (dx<10) { 
				dx = 10; 
			}
			if (dy<10){
				dy = 10;
			}
			var sx = dx/app.cx;
			var sy = dy/app.cy;
			
			if (sx>sy){
				scale = data.scale / sx;
			}else{
				scale = data.scale / sy;
			}
			
			mx = (this.x0+this.x1)/2 - ph.x;
			my = (this.y0+this.y1)/2 - ph.y;
			
			data.setScaleXY(scale, mx, my);
		}
		this.onMouseDown = function(evt){
			this.status = true;
			this.x0 = evt.pageX;
			this.y0 = evt.pageY;
			this.x1 = evt.pageX;
			this.y1 = evt.pageY;
		}
		this.onMouseMove = function(evt){
			if (this.status==0){
				return;
			}
			this.x1 = evt.pageX;
			this.y1 = evt.pageY;
			drawCanvas();
		}
		this.drawCursor = function(){
			if (this.status==0){
				return;
			}
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "red";
			ctx.rect(this.x0-ph.x, this.y0-ph.y, this.x1-this.x0, this.y1-this.y0);
			ctx.stroke();
		}
	}