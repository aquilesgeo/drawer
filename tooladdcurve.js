function ToolAddCurve(){
    this.status = 0;
    this.a = new Point(0,0);
    this.b = new Point(0,0);
    this.c = new Point(0,0);
    
    this.addPoint = function(x, y){
        if (data.curveSelected==null){
            data.addCurve();
        }
        data.curveSelected.addPoint(x, y);
    }
    this.gotFocus = function(){
        if (data.curveSelected!=null){
            this.status = 1;
            this.a.x = data.curveSelected.points[data.curveSelected.points.length-1].x;
            this.a.y = data.curveSelected.points[data.curveSelected.points.length-1].y;
        }
    }
    this.lostFocus = function(){
        this.status = 0;
    }
    this.onMouseDown = function(evt){
        if (evt.button==2){
            var p = data.fromClient(evt);
            var umbral = 4/data.scale;
            this.status = 0;
            data.setAllSelected(false);
            data.curveSelected = null;
            for(c=0;c<data.curves.length;c++){
                capture = data.curves[c].hit(p, umbral);
                if(capture.status){
                    data.curves[c].selected = true;
                    data.curveSelected = data.curves[c];
                    break;
                }
            }
            this.gotFocus();
            drawCanvas();
            return;
        }
        if (evt.button != 0){
            return;
        }
        if (this.status == 0){
            this.a.x = (evt.clientX-data.o.x-ph.x)/data.scale;
            this.a.y = (evt.clientY-data.o.y-ph.y)/data.scale;
            this.c.x = this.a.x;
            this.c.y = this.a.y;
            this.addPoint(this.a.x, this.a.y);
            this.status = 1;
        }else{
            this.c.x = (evt.clientX-data.o.x-ph.x)/data.scale;
            this.c.y = (evt.clientY-data.o.y-ph.y)/data.scale;
            this.b.x = this.a.x;
            this.b.y = this.a.y;
            this.status = 2;
        }
    }
    this.onMouseUp = function(evt){
        if (evt.button != 0){
            return;
        }
        if (this.status == 2){
            
            this.b.x = (evt.clientX-data.o.x-ph.x)/data.scale;
            this.b.y = (evt.clientY-data.o.y-ph.y)/data.scale;
            if (this.b.x==this.c.x && this.b.y==this.c.y){
                this.b.x = (this.a.x + this.c.x)/2;
                this.b.y = (this.a.y + this.c.y)/2;
            }
            this.addPoint(this.b.x, this.b.y);
            this.addPoint(this.c.x, this.c.y);
            this.a.x = this.c.x;
            this.a.y = this.c.y;
            this.status = 1;
        }
        drawCanvas();
    }
    this.onMouseMove = function(evt){
        if (this.status==1){
            this.c.x = (evt.clientX-data.o.x-ph.x)/data.scale;
            this.c.y = (evt.clientY-data.o.y-ph.y)/data.scale;
            drawCanvas();
        }
        if (this.status==2){
            this.b.x = (evt.clientX-data.o.x-ph.x)/data.scale;
            this.b.y = (evt.clientY-data.o.y-ph.y)/data.scale;
            drawCanvas();
        }
    }
    this.onKeyDown = function(evt){
        console.log(evt.keyCode);
        if (evt.keyCode == 27){
            data.setAllSelected(false);
            this.status = 0;
            data.curveSelected = null;
            drawCanvas();
        }else if (evt.keyCode == 32){
            if (data.curveSelected!=null){
                this.a.x = data.curveSelected.points[0].x;
                this.a.y = data.curveSelected.points[0].y;
                data.curveSelected.reverse();
                
                drawCanvas();
            }
        }
    }
    this.drawCursor = function(){
        if (this.status==0){
            return;
        }
        if (data.curveSelected==null){
            this.status = 0;
            return;
        }
        if (this.status == 1){
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#c00000";
            data.moveTo(this.a.x, this.a.y);
            data.lineTo(this.c.x, this.c.y);
            ctx.stroke();
        }
        if (mouseButton[0] && this.status==2){
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#c00000";
            data.moveTo(this.a.x, this.a.y);
            data.quadraticCurveTo(this.b.x, this.b.y, this.c.x, this.c.y);
            ctx.stroke();
        }
    }
    return this;
}