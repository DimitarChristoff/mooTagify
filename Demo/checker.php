<?PHP

$data = Array(
    "bar",
    "barman",
    "barmaid",
    "bartender",
    "foobar",
    "gaybar",
    "this",
    "fuck this"
    );	

$prefix = strtolower($_GET['prefix']);

$results = Array();

foreach($data as $val) {
    $val2 = strtolower($val);
    if (stristr($val2, $prefix))
        $results[] = $val;
}

echo json_encode($results);

?>
