<?php
/**
 * Created by PhpStorm.
 * User: Alexander
 * Date: 10/29/13
 * Time: 3:38 PM
 */

$array1 = array(
    2 => array(1, 2, 3)
);
$array2 = array(
    2 => array(3, 4, 5),
    3 => array(3, 4, 5)
);

var_dump(array_uintersect_assoc($array1, $array2, function($a, $b) {
    return count(array_intersect($a, $b));
}));