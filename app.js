	function App(){
		this.cx = 100;
		this.cy = 100;
		this.curColor = 0;
		this.curTool = toolCursor;
		this.drawName = "frame.draw";
		this.pictureName = "frame.png";
		this.setPictureName = function(name){
			this.pictureName = name;
			document.getElementById('pictureNameId').innerHTML = '&nbsp;&nbsp; picture = [ '+this.pictureName + ' ] ';
		}
		this.setDrawName = function(name){
			this.drawName = name;
			document.title = 'editor :: '+name;
		}
		this.selectColor = function(color){
			this.curColor = color;
			if (data.curveSelected!=null){
				data.curveSelected.color = color;
				drawCanvas();
			}
		}
		this.selectTool = function (tool){
			if (this.curTool==tool){
				return;
			}
			if (this.curTool.lostFocus!=undefined){
				this.curTool.lostFocus();
			}
			this.curTool = tool;
			if (this.curTool.gotFocus!=undefined){
				this.curTool.gotFocus();
			}
			drawCanvas();
		}
		this.showHidePicture = function(){
			if (!hasImage){
				return;
			}
			pictureVisible = !pictureVisible;
			pictureImage.style.display = pictureVisible?'block':'none';
		}
		this.resizeBody = function(){
			var layoutTop = document.getElementById("layoutTop");
			var layoutLeft = document.getElementById("layoutLeft");
			var panelContainer = document.getElementById("panelContainer");
			var layoutRight = document.getElementById("layoutRight");
			
			var w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0],
			cx = w.innerWidth || e.clientWidth || g.clientWidth,
			cy = w.innerHeight|| e.clientHeight|| g.clientHeight;
			
			layoutTop.style.top=0;
			layoutTop.style.left=0;
			layoutTop.style.width=cx;
			layoutTop.style.height='40px';
			layoutLeft.style.left=0;
			layoutLeft.style.top='40px';
			layoutLeft.style.width='32px';
			layoutLeft.style.height=(cy-40) + 'px';
			panelContainer.style.left='32px';
			panelContainer.style.top='40px';
			panelContainer.style.width=(cx-64) + 'px';
			panelContainer.style.height=(cy-40) + 'px';
			layoutRight.style.left=(cx-32) + 'px';
			layoutRight.style.top='40px';
			layoutRight.style.width='32px';
			layoutRight.style.height=(cy-40) + 'px';
			canvas.setAttribute("width", (cx-64)+'px');
			canvas.setAttribute("height", (cy-40)+'px');
			this.cx = cx-64;
			this.cy = cy-40;
			drawCanvas();
		}


		this.loadFile = function(){
			var form = document.getElementById("saveForm");
			var fileInput = document.getElementById("saveFile");
			fileInput.value = '';
			fileInput.click();		
		}
		this.loadFileEvent = function(){
			var form = document.getElementById("saveForm");
			var fileInput = document.getElementById("saveFile");
			if (fileInput.value == ''){
				return;
			}
			form.action = 'load.php';
			form.submit();
		}
		this.saveFile = function(){
			var content = document.getElementById("saveContent");
			var type = document.getElementById("saveType");
			var form = document.getElementById("saveForm");
			form.action = 'save.php';
			content.value = JSON.stringify({name:this.drawName, width:640, height:360, curves:data.curves});
			type.value = 'JSON';
			form.submit();
		}
		this.saveAIPic = function(){
			var content = document.getElementById("saveContent");
			var type = document.getElementById("saveType");
			var form = document.getElementById("saveForm");
			form.action = 'save.php';
			if (hasImage){
				vx = data.pictureSize.x;
				vy = data.pictureSize.y;
			}else{
				vx = 640;
				vy = 360;
			}
			content.value = JSON.stringify({name:this.drawName, width:vx, height:vy, curves:data.curves});
			type.value = 'PIC';
			form.submit();
		}
		this.saveAIFrame = function(){
			var content = document.getElementById("saveContent");
			var type = document.getElementById("saveType");
			var form = document.getElementById("saveForm");
			form.action = 'save.php';
			content.value = JSON.stringify({name:this.drawName, curves:data.curves});
			type.value = 'FRAME';
			form.submit();
		}
		this.saveAIA5B = function(){
			var content = document.getElementById("saveContent");
			var type = document.getElementById("saveType");
			var form = document.getElementById("saveForm");
			form.action = 'save.php';
			content.value = JSON.stringify({name:this.drawName, curves:data.curves});
			type.value = 'A5B';
			form.submit();
		}
		this.saveAIA5T = function(){
			var content = document.getElementById("saveContent");
			var type = document.getElementById("saveType");
			var form = document.getElementById("saveForm");
			form.action = 'save.php';
			content.value = JSON.stringify({name:this.drawName, curves:data.curves});
			type.value = 'A5T';
			form.submit();
		}
		this.from640x360ToA5 = function(){
			data.transform(36, 276, 3.765625);
			drawCanvas();
		}
		this.fromTopToBottom = function(){
			data.transform(0, 167, 1.0);
			drawCanvas();
		}
		this.fromBottomToTop = function(){
			data.transform(0, -167, 1.0);
			drawCanvas();
		}
		this.newContent = function(){
			data.removeAllCurves();
			drawCanvas();
		}
		this.viewTo = function(nscale){
			data.setScaleCenter(nscale);
		}
		this.viewCenter = function(){
			console.log('viewCenter');
		}
		this.drawProperties = function(){
			drawdialog.showModal();
		}
		this.drawOk = function(){
			drawdialog.close();
		}
		return this;
	}