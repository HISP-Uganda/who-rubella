curl - X POST "http://213.136.94.124:9200/_reindex?pretty" - H 'Content-Type: application/json' - d'
{
    "source": {
        "index": "mr-rubella"
    },
    "dest": {
        "index": "rubella"
    }
}
'
