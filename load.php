<?php

$content = file_get_contents($_FILES['loadContent']['tmp_name']);
$data = json_decode($content);
$drawName = $_FILES['loadContent']['name'];
if (is_array($data)){
	$curves = $data;	
}else{
	$curves = $data->curves;
}


echo "<script>\r\n";
echo "var data = parent.data;\r\n";
echo "var curve;\r\n";
echo "data.curves.length = 0;\r\n";
foreach($curves as $curve){
	echo "curve = data.addCurve();\r\n";
	foreach($curve->points as $point){
		echo "point = curve.addPoint({$point->x}, {$point->y});\r\n";
	}
	echo "curve.color = {$curve->color};\r\n";
}
echo "parent.app.setDrawName('{$drawName}');\r\n";
echo "console.log('loaded $drawName');\r\n";
echo "parent.data.resetSelection();\r\n";
echo "parent.drawCanvas();\r\n";
echo "</script>\r\n";
?>