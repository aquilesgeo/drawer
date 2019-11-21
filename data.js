	function Point(x, y){
		this.x = x;
		this.y = y;
		this.dx2 = function(p){
			return (this.x-p.x)*(this.x-p.x) + (this.y-p.y)*(this.y-p.y);
		}
		this.d = function(p){
			return Math.sqrt((this.x-p.x)*(this.x-p.x) + (this.y-p.y)*(this.y-p.y));
		}
		this.hit = function(p){
			return this.d(p)<(3/data.scale);
		}
		return this;
	}
		
	function Curve(){
		this.selected = false;
		this.points = new Array();
		this.color = app.curColor;
		
		this.addPoint = function(x, y){
			var p = new Point(x, y);
			this.points.push(p);
			return p;
		}
		this.hit = function(p, u){
			var dump = new Array();
			var da = p.d(this.points[0]);
			var db, dab;
			var m = new Point();
			for(i=1;i<this.points.length;i+=2){
				
				m.x = (this.points[i-1].x + 2*this.points[i].x + this.points[i+1].x)/4;
				m.y = (this.points[i-1].y + 2*this.points[i].y + this.points[i+1].y)/4;
				db = p.d(m);
				dab = m.d(this.points[i-1]);
				
				if ((da+db)<=(dab+u)){
					return {status:true,index:i};
				}
				da = p.d(this.points[i+1]);
				dab = m.d(this.points[i+1]);
				if ((da+db)<=(dab+u)){
					return {status:true,index:i};
				}
			}
			return {status:false};
		}
		
		this.reverse = function(){
			if (this.points==null || this.points.length<=1){
				return;
			}
			var i, n = this.points.length;
			var m = n >> 1;
			n--;
			for(i=0;i<m;i++){
				var t = this.points[i];
				this.points[i] = this.points[n];
				this.points[n] = t;
				n--;
			}
		}
		
		this.draw = function(){
			var i = 0;
			var n = this.points.length;
			ctx.beginPath();
			ctx.lineJoin = "bevel";
			ctx.lineWidth = 2;
			ctx.strokeStyle = this.selected?STROKESELECTCOLOR[this.color]:STROKECOLOR[this.color];
			
			data.moveTo(this.points[0].x, this.points[0].y);
			for(i=1;i<n;i+=2){
				data.quadraticCurveTo(this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y);
			}
			
			ctx.stroke();
			if (this.selected){
				ctx.fillStyle = "#000000";
				ctx.strokeStyle = "#000000";
				for(i=0;i<n;i+=2){
					ctx.fillRect(this.points[i].x*data.scale + data.o.x - 1, this.points[i].y*data.scale + data.o.y - 1, 3, 3);
				}
			}
		}
		return this;
	}
	
	function Data(){
		this.curveSelected = null; 	// Is null when no selected or when have multiple selected
		this.scale = 1.0;
		this.o = new Point(0,0);
		this.curves = new Array();
		this.setAllSelected = function(selected){
			var i, n = this.curves.length;
			for(i=0;i<n;i++){
				this.curves[i].selected = selected;
			}
		}
		this.resetSelection = function(){
			this.setAllSelected(false);
			this.curveSelected = null;
		}
		this.fromClient = function(evt){
			var p = new Point();
			p.x = (evt.clientX-data.o.x-ph.x)/data.scale;
			p.y = (evt.clientY-data.o.y-ph.y)/data.scale;
			return p;
		}
		this.addCurve = function(){
			var curve = new Curve();
			this.setAllSelected(false);
			this.curveSelected = curve;
			this.curveSelected.selected = true;
			this.curves.push(this.curveSelected);
			return curve;
		};
		
		this.removeAllCurves = function(){
			this.curves.length = 0;
		}
		
		this.drawCurves = function(){
			var i, n = this.curves.length;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for(i=0;i<n;i++){
				this.curves[i].draw();
			}
		}
		
		this.lineTo = function(x, y){
			ctx.lineTo(x*this.scale + this.o.x, y*this.scale + this.o.y);
		}
		
		this.quadraticCurveTo = function(x0, y0, x1, y1){
			ctx.quadraticCurveTo(x0*this.scale + this.o.x, y0*this.scale + this.o.y, x1*this.scale + this.o.x, y1*this.scale + this.o.y)
		}
		
		this.moveTo = function(x, y){
			ctx.moveTo(x*this.scale + this.o.x, y*this.scale + this.o.y);
		}
		this.circle = function(x, y, r){
			ctx.arc(x*this.scale + this.o.x, y*this.scale + this.o.y, r, 0, 2*Math.PI);
		}
		this.setScale = function(nscale){
			data.scale = nscale;
			console.log('scale:' + data.scale);
			if (hasImage){
				pictureImage.width = Math.trunc(pictureSize.x*data.scale);
				pictureImage.height = Math.trunc(pictureSize.y*data.scale);
			}
			drawCanvas();
		}
		this.setScaleXY = function(nscale, cx, cy){
			if (nscale<0.1){
				nscale = 0.1;
			}
			if (nscale>100){
				nscale = 100;
			}
			mx = (cx - this.o.x)/this.scale;
			my = (cy - this.o.y)/this.scale;
			
			this.o.x = app.cx/2 - mx*nscale;
			this.o.y = app.cy/2 - my*nscale;
			
			this.scale = nscale;
			
			if (hasImage){
				pictureImage.style.left = this.o.x+'px';
				pictureImage.style.top = this.o.y+'px';
				pictureImage.width = Math.trunc(this.pictureSize.x*this.scale);
				pictureImage.height = Math.trunc(this.pictureSize.y*this.scale);
			}
			drawCanvas();
		}
		this.setScaleCenter = function(nscale){
			this.setScaleXY(nscale, app.cx/2, app.cy/2);
		}
		this.deleteSelectedCurves = function(){
			var l=0,i;
			for(i=0;i<this.curves.length;i++){
				if (!this.curves[i].selected){
					this.curves[l] = this.curves[i];
					l++;
				}
			}
			console.log("l:"+l);
			this.curves.length = l;
			this.curveSelected = null;
			drawCanvas();
		}
		this.setPictureSize = function(x, y){
			this.pictureSize = new Point(x, y);
			pictureImage.style.left = this.o.x+'px';
			pictureImage.style.top = this.o.y+'px';
			pictureImage.width = Math.trunc(this.pictureSize.x*this.scale);
			pictureImage.height = Math.trunc(this.pictureSize.y*this.scale);
		}

		this.transform = function(dx, dy, s){
			
			for(ic = 0;ic<this.curves.length;ic++){
				var curve = this.curves[ic];
				for(ip = 0;ip<curve.points.length;ip++){
					var point = curve.points[ip];
					point.x = point.x * s + dx;
					point.y = point.y * s  + dy;
				}
			}
		}
		return this;
	}