if ! command -v curl &> /dev/null; then
    echo "Error: curl is not installed."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed."
    exit 1
fi

SERVER='http://localhost:4200/geonetwork'

curl "$SERVER/srv/api/ui/srv" \
  -H 'Accept: application/json' | jq . > home-api-ui-srv.json

curl "$SERVER/srv/api/i18n/packages/gnui" \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en' | jq . > home-api-i18n-gnui.json

curl "$SERVER/srv/api/search/records/_search" \
  -X 'POST' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d @home-api-search-request.json | jq . > home-api-search-response.json

curl "$SERVER/srv/api/search/records/_search" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -X 'POST' \
  -d @search-api-search-request.json | jq . > search-api-search-response.json
  
curl "$SERVER/srv/api/search/records/_search" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -X 'POST' \
  -d @search-api-search-by-uuid-request.json | jq . > search-api-search-by-uuid-response.json
  
  
curl "$SERVER/srv/api/search/records/_search" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -X 'POST' \
  -d @search-api-search-by-uuid-sort-title-request.json | jq . > search-api-search-by-uuid-sort-title-response.json
  
curl "$SERVER/srv/api/search/records/_search" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -X 'POST' \
  -d @search-api-search-by-q-request.json | jq . > search-api-search-by-q-response.json

curl "$SERVER/srv/api/search/records/_search" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -X 'POST' \
  -d @search-api-search-by-bbox-request.json | jq . > search-api-search-by-bbox-response.json

curl "$SERVER/srv/api/search/records/_search" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -X 'POST' \
  -d @search-api-search-by-resourcetype-request.json | jq . > search-api-search-by-resourcetype-response.json

curl "$SERVER/srv/api/search/records/_search" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -X 'POST' \
  -d @search-api-autocomplete-request.json | jq . > search-api-autocomplete-response.json
  
curl "$SERVER/srv/api/search/records/_search?relatedType=parent&relatedType=children&relatedType=services&relatedType=sources&relatedType=hassources&relatedType=brothersAndSisters&relatedType=datasets&relatedType=siblings&relatedType=fcats&relatedType=hasfeaturecats&relatedType=associated" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -X 'POST' \
  -d @search-api-get-record-request.json | jq . > search-api-get-record-response.json
  