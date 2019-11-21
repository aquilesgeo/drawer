var gButtonGroup = new Array();

function setupButton(p){
    var obj = document.getElementById(p.id);
    obj.group = p.group;
    obj.action = p.action;
    obj.onclick = function(){
        if (this.group!=null){
            var oldObj = gButtonGroup[this.group];
            gButtonGroup[this.group] = this;
            if (oldObj!=null){
                oldObj.onmouseout();
            }
        }
        this.action();
    };
    obj.x = p.x;
    obj.y = p.y;
    obj.onmouseover = function(){
        this.style.backgroundPositionX=(this.x-32)+'px';
        this.style.backgroundPositionY=this.y+'px';
    }
    obj.onmouseout = function(){
        if (this.group==null || gButtonGroup[this.group]!=this){
            this.style.backgroundPositionX=this.x+'px';
            this.style.backgroundPositionY=this.y+'px';
        }
    }

    if (obj.group!=null && gButtonGroup[obj.group]==null){
        gButtonGroup[obj.group] = obj;
        obj.onmouseover();
        obj.action();
    }else{
        obj.onmouseout();
    }
}

function setupButtons(p){
    p.forEach(function(pi){
        setupButton(pi);
    });
}