<!DOCTYPE html>
<html>
<head>
<style>
	.toolButton{
		width:32px;
		height:32px;
		background: url(buttons.png);
		cursor:pointer;
	}
	.layoutTable{
		position:relative;
		width:100%;
		height:100%;
		border-collapse:collapse;
	}
	.layoutTable td{
		padding:0px;
		margin:0px;
	}
	.dropdown {
	  position: relative;
	  display: inline-block;
	  padding:8px;
	}

	.dropdown-content {
	  display: none;
	  position: absolute;
	  background-color: #404040;
	  color: #ffffff;
	  min-width: 160px;
	  box-shadow: 0px 4px 4px 0px rgba(0,0,0,0.2);
	  padding: 4px;
	  z-index: 1;
	  font:14px Arial;
	}

	.dropdown:hover .dropdown-content {
	  display: block;
	}
	.menuItem {
		cursor:pointer;
		padding:5px;
	}
	dialog{
		border:1px solid #e0e0e0;
		background:#202020;
		color:#f0f0f0;
	}
</style>
</head>
<body style="background:#202020;margin:0px" onresize="app.resizeBody()"  oncontextmenu="return false;">
<div id="layoutTop" style="color:#c0c0c0;font:14px Arial; background:#303030;position:absolute">
	<div class="dropdown">
		<span>File</span>
		<div class="dropdown-content">
			<div class="menuItem" onclick="app.newContent()">New</div>
			<div class="menuItem" onclick="app.loadFile()">Load</div>
			<div class="menuItem" onclick="app.saveFile()">Save</div>
			<u>AI</u><br>
			<div class="menuItem" onclick="app.saveAIPic()">Image Picture</div>
			<div class="menuItem" onclick="app.saveAIFrame()">A5 Frame (640x360)</div>
			<div class="menuItem" onclick="app.saveAIA5B()">A5 Bottom</div>
			<div class="menuItem" onclick="app.saveAIA5T()">A5 Top</div>
			<div class="menuItem" onclick="app.drawProperties()">Properties</div>
		</div>
	</div>
	<div class="dropdown">
		<span>Edit</span>
		<div class="dropdown-content">
			<div class="menuItem" onclick="app.from640x360ToA5()">From 640x360 to A5</div>
			<div class="menuItem" onclick="app.fromTopToBottom()">From Top to Bottom</div>
			<div class="menuItem" onclick="app.fromBottomToTop()">From Bottom to Top</div>
		</div>
	</div>
	<div class="dropdown">
		<span>Picture</span>
		<div class="dropdown-content">
			<div class="menuItem" onclick="loadPicture()">Picture</div>
			<div class="menuItem" onclick="app.showHidePicture()">Show / Hide</div>
		</div>
	</div>
	<div class="dropdown">
		<span>View</span>
		<div class="dropdown-content">
			<div class="menuItem" onclick="app.viewCenter()">Center</div>
			<div class="menuItem" onclick="app.viewTo(1.0)">100%</div>
		</div>
	</div>
	<span id="pictureNameId"></span>
</div>

<div id="layoutLeft" style="position:absolute">
	<div id="buttonCursor" class="toolButton">&nbsp;</div>
	<div id="buttonAddCurve" class="toolButton">&nbsp;</div>
	<div id="buttonSmooth" class="toolButton">&nbsp;</div>
	<div id="buttonRefine" class="toolButton">&nbsp;</div>
	<div id="buttonZoom" class="toolButton">&nbsp;</div>
</div>

<div id="panelContainer" style="position:absolute;width:1200px;height:800px;background:#c0c0c0;overflow:hidden;padding:0px;margin:0px">
	<img id="picture" src="" style="opacity:0.3;position:absolute;top:0px;left:0px">
	<canvas id="panelDraw" style="position:absolute;top:0px;left:0px">
	</canvas>
	<div id="panelEvent" style="position:absolute;top:0px;left:0px;width:100%;height:100%" onmousedown="mouseDown(event)" onmouseup="mouseUp(event)" onmousemove1="mouseMove(event)" onpointerdown="pointerDown(event)" onpointerup="pointerUp(event)" onpointermove="pointerMove(event)">

	</div>
</div>
<form id="pictureForm" target="worker" action="picture.php" method="POST" enctype="multipart/form-data">
	<input type="file" name="pictureFile" id="pictureFile" onchange="loadPictureFile()" style="display:none">
</form>
<form id="saveForm" name="formDraw" target="worker" method="POST" enctype="multipart/form-data">
	<input type="hidden" name="content" id="saveContent">
	<input type="hidden" name="type" id="saveType">
	<input type="file" name="loadContent" id="saveFile" onchange="app.loadFileEvent()" style="display:none">
</form>
</div>
<div id="layoutRight" style="position:absolute;vertical-align:top;width:32px;height:100px">
<div id="buttonInk"   class="toolButton">I</div>
<div id="buttonRed"   class="toolButton">R</div>
<div id="buttonGreen" class="toolButton">G</div>
<div id="buttonBlue"  class="toolButton">B</div>
</div>

<iframe src="blank.php" name="worker"  style="display:none"></iframe>
<script src="app.js?d=1"></script>
<script src="data.js?d=1"></script>
<script src="tools.js?d=1"></script>
<script src="tooladdcurve.js?d=1"></script>
<script src="toolsmoothcurve.js?d=1"></script>
<script src="buttons.js?d=1"></script>
<script>
	const STROKECOLOR=["#000000", "#FF0000", "#00FF00", "#0000FF"];
	const STROKESELECTCOLOR=["#404040", "#FF4040", "#40FF40", "#4040FF"];
	var mouseButton = [false, false, false];
	var canvas = document.getElementById("panelDraw");
	var handler = document.getElementById("panelContainer");
	var ctx = canvas.getContext("2d");
	var px = 0;
	var py = 0;
	var hasImage = false;	// Indicate if an image is selected
	var pictureImage = document.getElementById("picture");
	var pictureSize = null;
	var pictureVisible = true;
	
	var toolCursor = new ToolCursor();
	var toolWheelMouse = new ToolWheelMouse();
	var toolAddCurve = new ToolAddCurve();
	var toolSmothCurve = new ToolSmothCurve();
	var toolRefineCurve = new ToolRefineCurve();
	var toolZoom = new ToolZoom();
	
	var ph = new Point(32, 40);
	
	var app = new App();
	
	document.onkeydown = function(evt){
		if (evt.keyCode==81 && data.scale>0.1){
			data.setScaleCenter(data.scale-(data.scale>2?1:0.1));
		}else if (evt.keyCode==87 && data.scale<10.0){
			data.setScaleCenter(data.scale+(data.scale>1?1:0.1));
		}else if (evt.keyCode==46){ 	// DEL
			data.deleteSelectedCurves();
		}else if (app.curTool.onKeyDown != undefined){
			app.curTool.onKeyDown(evt);
		}
	}
	
	var data = new Data();
	
	drawCanvas();
	
	function drawCanvas(){
		data.drawCurves();
		if (app.curTool.drawCursor!=undefined){
			app.curTool.drawCursor();
		}
	}
	
	function mouseDown(evt){
		mouseButton[evt.button] = true;
		if (evt.button==1){
			toolWheelMouse.onMouseDown(evt);
		} else if (app.curTool.onMouseDown != undefined){
			console.log(evt.button);
			app.curTool.onMouseDown(evt);
		}
	}
	function mouseUp(evt){
		mouseButton[evt.button] = false;
		if (evt.button==1){
			toolWheelMouse.onMouseUp(evt);
		} else if (app.curTool.onMouseUp != undefined){
			console.log(evt.button);
			app.curTool.onMouseUp(evt);
		}
	}
	function mouseMove(evt){
		if (mouseButton[1]){
			toolWheelMouse.onMouseMove(evt);
		}else if (app.curTool.onMouseMove != undefined){
			console.log(evt.button);
			app.curTool.onMouseMove(evt);
		}
	}
	function pointerDown(evt){
		console.log(evt);
		mouseDown({button:0, clientX:evt.clientX, clientY:evt.clientY});
	}
	function pointerMove(evt){
		mouseMove({button:0, clientX:evt.clientX, clientY:evt.clientY});
	}
	function pointerUp(evt){
		console.log('pointerUp');
		mouseUp({button:0, clientX:evt.clientX, clientY:evt.clientY});
	}
	function loadPicture(){
		var pictureFile = document.getElementById('pictureFile');
		pictureFile.click();
	}

	function loadPictureFile() {
		
		var file = document.getElementById('pictureFile').files[0];
		var reader  = new FileReader();

		reader.onloadend = function () {
			pictureImage.src = reader.result;
			hasImage = true;
			pictureVisible = true;
			pictureImage.style.display='block';
			var form = document.getElementById("pictureForm");
			form.submit();
		}
		
		reader.readAsDataURL(file);
	}
	function download(content, fileName, contentType) {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'save.php');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function() {
			if (xhr.status === 200) {
				var userInfo = JSON.parse(xhr.responseText);
			}
		};
		xhr.send(JSON.stringify(data));
	}
	
	app.resizeBody();

	setupButtons([
		{group:'main', id:'buttonCursor', x:0, y:0,	action:function(){
			app.selectTool(toolCursor);
		}},
		{group:'main', id:'buttonAddCurve', x:0, y:-32, action:function(){
			app.selectTool(toolAddCurve);
		}},
		{group:'main', id:'buttonSmooth', x:0, y:-64, action:function(){
			app.selectTool(toolSmothCurve);
		}},
		{group:'main', id:'buttonRefine', x:0, y:-64, action:function(){
			app.selectTool(toolRefineCurve);
		}},
		{group:'main', id:'buttonZoom', x:0, y:-96, action:function(){
			app.selectTool(toolZoom);
		}}
		]);

	setupButtons([
		{group:'colors', id:'buttonInk', x:-64, y:0,	action:function(){
			app.selectColor(0);
		}},
		{group:'colors', id:'buttonRed', x:-64, y:-32, action:function(){
			app.selectColor(1);
		}},
		{group:'colors', id:'buttonGreen', x:-64, y:-64, action:function(){
			app.selectColor(2);
		}},
		{group:'colors', id:'buttonBlue', x:-64, y:-96, action:function(){
			app.selectColor(3)
		}}
		]);
	
</script>
<dialog id="drawdialog">
	Draw : <input type="text" name="drawname"><br>
	Width:<input type="text" name="drawwidth"> Height:<input type="text" name="drawheight">
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Earum, inventore!</p>
    <button id="drawok" onclick="app.drawOk()">Ok</button>
</dialog>
<script>
	var drawdialog = document.getElementById('drawdialog');
	
</script>
</body>
</html>