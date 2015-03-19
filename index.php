<?php

# setting correct response header is required for jQuery to correctly parse JSON
# when doing AJAX calls.
header('Content-Type', 'application/json');

$query = isset($_GET['path']) ? $_GET['path'] : '/';
$query = trim($query, '/');
$segments = explode('/', $query);

$method = strtolower($_SERVER['REQUEST_METHOD']);

$records = [
	'notes' => [
		['id' => 0, 'text' => 'lorem ipsum'],
		['id' => 1, 'text' => 'two!'],
		['id' => 2, 'text' => 'dolor sit amet!'],
		['id' => 3, 'text' => 'lorem ipsum'],
		['id' => 4, 'text' => 'two!'],
		['id' => 5, 'text' => 'dolor sit amet!'],
		['id' => 6, 'text' => 'lorem ipsum'],
		['id' => 7, 'text' => 'two!'],
		['id' => 8, 'text' => 'dolor sit amet!'],
		['id' => 9, 'text' => 'lorem ipsum'],
		['id' => 10, 'text' => 'two!'],
		['id' => 11, 'text' => 'dolor sit amet!'],
		['id' => 12, 'text' => 'lorem ipsum'],
		['id' => 13, 'text' => 'two!'],
		['id' => 14, 'text' => 'dolor sit amet!'],
		['id' => 15, 'text' => 'lorem ipsum'],
	]
];

$get = function() use ($query, $records) {
	if (preg_match("/^note$/", $query)) {
		return $records['notes'];
	}
	else if (preg_match("/^note\/delete\/([0-9]+)$/", $query, $matches)) {
		die(json_encode(['success' => true]));
	}else if (preg_match("/note\/page\/([0-9]+)/", $query, $matches)) {
		$page = (int) $matches[1];
		$page--;
		if ($page < 0) $page = 0;

		$offset = 5 * $page;
		$return = [];

		for($i = $offset; $i < $offset + 5; $i++) {
			if (isset($records['notes'][$i])) {
				$return[] = $records['notes'][$i];
			}else {
				die(json_encode(['records' => $return]));
			}
		}
		die(json_encode(['records' => $return]));
	}else if (preg_match("/note\/([0-9]+)/", $query, $matches)) {
		$id = (int) $matches[1];

		foreach($records['notes'] as $record)
			if ($record['id'] == $id) {
				die(json_encode(['records' => [$record]]));
			}
	}
	return [];
};

if ($method == 'get') {
	$get();
}else {
	echo json_encode(['id' => 16]);
}