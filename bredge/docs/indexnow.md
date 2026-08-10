# IndexNow

Key: `21a50df10a9b3dc2837df2b055bc4465`
Key file (public): https://thebredge.com/21a50df10a9b3dc2837df2b055bc4465.txt

## Submit changed/new canonical URLs (run AFTER thebredge.com is live)
Single URL:
curl "https://api.indexnow.org/indexnow?url=https://thebredge.com/insights/<slug>&key=21a50df10a9b3dc2837df2b055bc4465"

Batch (JSON):
curl -X POST https://api.indexnow.org/indexnow -H "Content-Type: application/json" -d '{
  "host": "thebredge.com",
  "key": "21a50df10a9b3dc2837df2b055bc4465",
  "keyLocation": "https://thebredge.com/21a50df10a9b3dc2837df2b055bc4465.txt",
  "urlList": ["https://thebredge.com/", "https://thebredge.com/insights"]
}'

Only submit canonical thebredge.com URLs. Never submit workers.dev URLs.
Use for: new article publication, updated resources, material page changes.
