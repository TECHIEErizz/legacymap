
import httpx
import os
import pytest

BASE_URL = "http://localhost:8000"

def test_read_main():
    try:
        response = httpx.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert response.json() == {"message": "FastAPI is working!"}
    except httpx.ConnectError:
        pytest.fail("Could not connect to server. Make sure it is running on port 8000.")

def test_upload_zip():
    file_path = "test_repo.zip"
    if not os.path.exists(file_path):
        pytest.skip(f"{file_path} not found")

    with open(file_path, "rb") as f:
        files = {"file": ("test_repo.zip", f, "application/zip")}
        response = httpx.post(f"{BASE_URL}/upload", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "nodes" in data
    assert "edges" in data

def test_upload_analyze_zip():
    file_path = "test_repo.zip"
    if not os.path.exists(file_path):
        pytest.skip(f"{file_path} not found")

    with open(file_path, "rb") as f:
        files = {"file": ("test_repo.zip", f, "application/zip")}
        response = httpx.post(f"{BASE_URL}/upload-analyze", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "success"
    assert "repo_id" in data
    assert "nodes" in data
