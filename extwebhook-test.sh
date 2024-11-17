curl -X POST https://zet-alert-qwrblrfkm-kirsten-ruges-projects.vercel.app/api/ext-webhook \
-H "Content-Type: application/json" \
-d '{
  "event": "status_updated",
  "component_id": "123",
  "component_name": "ZetaChain Mainnet",
  "new_status": "degraded",
  "incident_id": "INC-1234",
  "timestamp": "2024-01-16T15:30:00Z"
}'