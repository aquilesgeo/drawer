function ToolSmothCurve(){
    this.status = 0;
    this.point = new Point();
    
    this.onMouseDown = function(evt){
        if (data.curveSelected!=null){
            for(i=0;i<data.curveSelected.points.length;i+=2){					
                data.curveSelected.points[i].work = false;					
            }
            this.status = 1;
        }
    }
    this.onMouseUp = function(evt){
        if (this.status==1){
            this.status = 0;
            var curve = data.curveSelected;
            var points = new Array();
            var ab, bc;
            var n;
            
            points.push(curve.points[0]);
            
            for(i=1;i<curve.points.length;i+=2){
                ab = new Point();
                bc = new Point();
                ab.x = (2*curve.points[i].x + curve.points[i-1].x)/3;
                ab.y = (2*curve.points[i].y + curve.points[i-1].y)/3;
                bc.x = (2*curve.points[i].x + curve.points[i+1].x)/3;
                bc.y = (2*curve.points[i].y + curve.points[i+1].y)/3;
                points.push(ab);
                points.push(curve.points[i]);
                points.push(bc);
                points.push(curve.points[i+1]);
            }
            n = points.length-1;	// Ignore the first and the last points
            
            for(i=4;i<n;i+=4){
                if (!points[i].work){
                    continue;
                }
                var db = points[i].d(points[i-1]);
                var da = points[i].d(points[i+1]);
                var dt = da + db;
                var dx = points[i].x - (points[i-1].x * da + points[i+1].x*db)/dt;
                var dy = points[i].y - (points[i-1].y * da + points[i+1].y*db)/dt;
                points[i-1].x += dx;
                points[i-1].y += dy;
                points[i+1].x += dx;
                points[i+1].y += dy;
            }
            console.log(points);
            curve.points = new Array();
            for(i=0;i<n;i+=4){
                curve.points.push(points[i]);
                if (points[i].work || points[i+4].work){
                    points[i+1].x = (points[i].x + 3*points[i+1].x)/4;
                    points[i+1].y = (points[i].y + 3*points[i+1].y)/4;
                    points[i+3].x = (points[i+4].x + 3*points[i+3].x)/4;
                    points[i+3].y = (points[i+4].y + 3*points[i+3].y)/4;
                    points[i+2].x = (points[i+1].x + points[i+3].x)/2;
                    points[i+2].y = (points[i+1].y + points[i+3].y)/2;
                    curve.points.push(points[i+1]);
                    curve.points.push(points[i+2]);
                    curve.points.push(points[i+3]);
                }else{						
                    curve.points.push(points[i+2]);
                }
            }
            curve.points.push(points[points.length-1]);
            
            drawCanvas();
        }
    }
    this.onMouseMove = function(evt){
        if (this.status == 1){
            var p = data.fromClient(evt);
            var umbral = 6/data.scale;
            for(i=0;i<data.curveSelected.points.length;i+=2){
                if (!data.curveSelected.points[i].work && p.d(data.curveSelected.points[i])<=umbral){
                    data.curveSelected.points[i].work = true;
                }
            }
            this.p = data.fromClient(evt);
            drawCanvas();
        }
    }
    this.drawCursor = function(){
        if (this.status == 1){
            ctx.beginPath();
            
            
            ctx.fillStyle = "#c00000";
            ctx.strokeStyle = "#c00000";
            ctx.lineWidth = 2;
            for(i=0;i<data.curveSelected.points.length;i+=2){
                if (data.curveSelected.points[i].work){
                    ctx.fillRect(data.curveSelected.points[i].x*data.scale + data.o.x - 1, data.curveSelected.points[i].y*data.scale + data.o.y - 1, 3, 3);
                }
            }
            ctx.strokeStyle = "#c00000";
            data.circle(this.p.x, this.p.y, 6);
            ctx.stroke();
        }
    }
    return this;
}