<?php
$fileName = "";
$picName = "";
if (isset($_FILES["pictureFile"])) {
    $picName = $_FILES["pictureFile"]["name"];
    $fileinfo = @getimagesize($_FILES["pictureFile"]["tmp_name"]);
    $width = $fileinfo[0];
    $height = $fileinfo[1];
}
?>
<html>
<body>
<script>
    parent.data.setPictureSize(<?=$width?>, <?=$height?>);
    parent.app.setPictureName('<?=$picName?>');
    console.log('pictureForm <?=$width?> <?=$height?>::');
</script>
</body>
</html>