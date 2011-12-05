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

$prefix = strtolower(mysql_real_escape_string($_GET['prefix']));

$results = Array();

foreach($data as $val) {
    $val2 = strtolower($val);
    if (stristr($prefix, $val2))
        $results[] = $val;
}

echo json_encode($results);

?>
