TEST INSTRUCTIONS

1) Create a zip of the 'sample_repo' folder:
   cd legacymap-backend
   zip -r sample_repo.zip sample_repo

2) Run server:
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000

3) Open Swagger UI:
   http://localhost:8000/docs

4) Use /upload endpoint:
   - Choose file sample_repo.zip and upload.
   - See JSON output (summary, nodes, edges, top_5_risky).

OR use curl:
   curl -F "file=@sample_repo.zip" http://127.0.0.1:8000/upload
