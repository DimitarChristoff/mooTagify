<?PHP

$data = Array(
    "bar",
    "barman",
    "barmaid",
    "bartender",
    "FooBar",
    "Gay Bar",
    "crowbar",
    "this",
    "I like this"
);

$prefix = strtolower($_GET['prefix']);

$results = Array();

foreach($data as $val) {
    $val2 = strtolower($val);
    if (stristr($val2, $prefix))
        $results[] = $val;
}

echo json_encode(sort($results));

?>
