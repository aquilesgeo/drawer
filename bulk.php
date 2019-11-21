<?php
$deltax = 0;
$deltay = 0;

function toAiPoint($ai, $p){
	global $scale, $deltax, $deltay;
	$ai->x = ($p->x + $deltax)*$scale;
	$ai->y = ($docy - $p->y - $deltay)*$scale;
}
function showRectangle($x1, $y1, $x2, $y2){
	global $scale;
	$y1 = ($docy-$y1)*$scale;
	$y2 = ($docy-$y2)*$scale;
	$x1 = $x1*$scale;
	$x2 = $x2*$scale;
	echo "$x1 $y1 m\r\n";
	echo "$x2 $y1 l\r\n";
	echo "$x2 $y2 l\r\n";
	echo "$x1 $y2 l\r\n";
	echo "$x1 $y1 l\r\n";
	print ("S\r\n");
}
function showCurves($curves, $color){
	foreach($curves as $curve){
		$ab = new stdClass();
		$bc = new stdClass();
		$a = new stdClass();
		$b = new stdClass();
		$c = new stdClass();
		if ($color!=$curve->color){
			continue;
		}
		$points = $curve->points;
		$i = 0;
		$n = count($points);
		toAiPoint($a, $points[0]);
		echo "{$a->x} {$a->y} m\r\n";
		for($i=1;$i<$n;$i+=2){			
			toAiPoint($b, $points[$i]);
			toAiPoint($c, $points[$i+1]);				
			$ab->x = ($a->x + 2*$b->x)/3;
			$ab->y = ($a->y + 2*$b->y)/3;
			$bc->x = ($c->x + 2*$b->x)/3;
			$bc->y = ($c->y + 2*$b->y)/3;
			echo "{$ab->x} {$ab->y} {$bc->x} {$bc->y} {$c->x} {$c->y} c\r\n";				
			toAiPoint($a, $points[$i+1]);
		}
		print ("S\r\n");
	}
}

if (isset($_POST["send"])){

    $showDocBox = true;
	$showViewBox = true;
	$docx = 2552;
	$docy = 1754;
	$format = "AI";
	$scale = 1.0/3.765625;
	$viewx1 = 30;
	$viewy1 = 276;
	$viewx2 = 2442;
	$viewy2 = 1636;
	$total = count($_FILES["frame"]["name"]);
	
	$names = array();
	$frames = array();
	for($i=0;$i<$total;$i++){
		array_push($names, $_FILES['frame']['name'][$i]);
		array_push($frames, $i);
	}
	array_multisort($names, $frames);

    header("Cache-Control: public");
    header("Content-Type: application/illustrator");
    header("Content-Disposition: attachment; filename=sequence.ai");
    echo <<<AIDOC
%!PS-Adobe-3.0
%%Creator: Adobe Illustrator(TM) 7.0 by Xara.
%%For: (Download version) (None)
%%Title: (Untitled3 *)
%%CreationDate: (29/08/19) (06:24 AM)
%%BoundingBox: 0 0 640 360
%%DocumentProcessColors: Cyan Magenta Yellow Black
%%DocumentNeededResources: procset Adobe_level2_AI5 1.2 0 
%%+ procset Adobe_packedarray 2.0 0
%%+ procset Adobe_ColorImage_AI6 1.1 0
%%+ procset Adobe_cshow 2.0 8
%%+ procset Adobe_cmykcolor 1.1 0
%%+ procset Adobe_customcolor 1.0 0
%%+ procset Adobe_typography_AI5 1.0 1
%%+ procset Adobe_pattern_AI3 1.0 1
%%+ procset Adobe_Illustrator_AI5 1.2 0
%AI3_ColorUsage: Color
%AI5_FileFormat 2.0
%%EndComments
%%BeginProlog
%%IncludeResource: procset Adobe_level2_AI5 1.2 0
%%IncludeResource: procset Adobe_packedarray 2.0 0
%%IncludeResource: procset Adobe_ColorImage_AI6 1.1 0
%%IncludeResource: procset Adobe_cshow 2.0 8
%%IncludeResource: procset Adobe_cmykcolor 1.1 0
%%IncludeResource: procset Adobe_customcolor 1.0 0
%%IncludeResource: procset Adobe_typography_AI5 1.1 0
%%IncludeResource: procset Adobe_pattern_AI3 1.0 1
%%IncludeResource: procset Adobe_Illustrator_AI5 1.2 0
%%EndProlog
%%BeginSetup
Adobe_level2_AI5 /initialize get exec
Adobe_packedarray /initialize get exec
Adobe_ColorImage_AI6  /initialize get exec
Adobe_cshow /initialize get exec
Adobe_cmykcolor /initialize get exec
Adobe_customcolor /initialize get exec
Adobe_Illustrator_AI5_vars Adobe_Illustrator_AI5 Adobe_typography_AI5 /initialize get exec
Adobe_pattern_AI3 /initialize get exec
Adobe_Illustrator_AI5 /initialize get exec
%%EndSetup
%AI5_BeginLayer

AIDOC;
    for($i=0;$i<$total;$i++){
        $content = file_get_contents($_FILES['frame']['tmp_name'][$frames[$i]]);
        $data = json_decode($content);
        $drawName = $_FILES['frame']['name'][$frames[$i]];
        echo <<<AIDOC
1 1 1 1 0 0 0 0 0 0 Lb
($drawName) Ln
1 XR
0.00 0.00 0.00 (_90089704) 0 1 XX
1.00 w
2 j
[ ] 0 d
0 J
0.00 0.00 0.00 (_90088984) 0 1 Xx

AIDOC;
        echo "u\r\n";
        showCurves($data->curves, 0);
        echo "1.00 0.00 0.00 (_155411208) 0 1 XX\r\n";
        showCurves($data->curves, 1);
        echo "0.00 0.74 0.00 (_155412072) 0 1 XX\r\n";
        if ($showViewBox){
            showRectangle($viewx1+$deltax, $viewy1+$deltay, $viewx2+$deltax, $viewy2+$deltay);
        }	
        showCurves($data->curves, 2);
        echo "0.00 0.00 0.74 (_155411496) 0 1 XX\r\n";
        showCurves($data->curves, 3);
        echo "U\r\n";
        echo "u\r\n";
        echo "0.00 0.00 0.00 (_90089704) 0 1 XX\r\n";
        showCurves($data->curves, 0);
        echo "U\r\n";
        echo <<<AIDOC
LB

AIDOC;
    }
    echo <<<AIDOC
%AI5_EndLayer
%%PageTrailer
showpage
%%Trailer
Adobe_Illustrator_AI5 /terminate get exec
Adobe_level2_AI5 /terminate get exec
Adobe_packedarray /terminate get exec
Adobe_ColorImage_AI6 /terminate get exec
Adobe_cshow /terminate get exec
Adobe_cmykcolor /terminate get exec
Adobe_customcolor /terminate get exec
Adobe_typography_AI5 /terminate get exec
Adobe_pattern_AI3 /terminate get exec
%%EOF

AIDOC;
    exit(0);
}

?>


<html>
<body>
    <form name="frames" action="bulk.php" method="POST" enctype="multipart/form-data">
        <input type="file" multiple="multiple" name="frame[]">
        <input type="submit" name="send" value="send">
    </form>
</body>
</html>