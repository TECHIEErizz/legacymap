# 🔍 LegacyMap Backend

**Code Analysis Engine** - Detects dependencies, calculates risk scores, identifies spaghetti code

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95.2-green)
![NetworkX](https://img.shields.io/badge/NetworkX-3.1-orange)

---

## 🎯 What Does It Do?

```
ZIP File (Your Code)
       ↓
   UPLOAD to /upload or /upload-analyze endpoint
       ↓
   BACKEND ANALYSIS:
   ├─ Extract files
   ├─ Count lines of code (LOC)
   ├─ Find imports/dependencies
   ├─ Extract functions/classes ⭐ NEW
   ├─ Build dependency graph
   ├─ Calculate risk scores
   └─ Identify circular dependencies
       ↓
   JSON RESPONSE with:
   ├─ Summary (total files, LOC, top risky)
   ├─ Nodes (file-by-file analysis + functions_classes) ⭐ NEW
   ├─ Edges (dependency map)
   ├─ Components (code clusters)
   └─ repo_id for function-level queries ⭐ NEW
```

**NEW FEATURES** ⭐:
- Extract all functions/classes with line numbers
- Query where specific functions are called
- Analyze function dependencies
- Two new endpoints for detailed function analysis


---

## 🏗️ Architecture

### **3 Main Modules**

#### 1. **app/main.py** (605 lines)
**Main Application**
- `POST /upload` endpoint
- Orchestrates entire analysis pipeline
- Returns JSON response

**Classes Used**:
- `FastAPI` - Web framework
- `UploadFile` - File upload handler
- `HTTPException` - Error responses
- `JSONResponse` - JSON formatter
- `defaultdict` - Dependency tracking
- `networkx.DiGraph` - Dependency graph

**Key Steps**:
1. Validate ZIP format
2. Extract to temporary directory
3. Discover source files (.js, .ts, .py)
4. Build metadata (LOC, imports)
5. Normalize import paths
6. Create dependency graph
7. Calculate risk scores
8. Identify connected components
9. Generate response JSON
10. Cleanup temporary files

#### 2. **app/scanner.py** (48 lines)
**Code Analysis Functions**
- `is_source_file()` - Filter by language
- `read_file_lines()` - Read file content
- `count_loc()` - Count lines of code
- `extract_imports()` - Find import statements
- `normalize_import_path()` - Resolve paths

#### 3. **app/utils.py** (14 lines)
**Utility Functions**
- `extract_zip_to_temp()` - Extract ZIP to temp folder
- `cleanup()` - Delete temporary files

---

## 📊 Risk Formula

```
risk = (loc/10) + (imported_by_count * 3) + (imports_count * 2)
```

| Component | Meaning | Example |
|-----------|---------|---------|
| `loc/10` | File complexity | 100 lines = 10 points |
| `imported_by_count * 3` | Critical dependency | 5 files depend = 15 points ⚠️ |
| `imports_count * 2` | Tight coupling | Imports 8 files = 16 points ⚠️ |

**Example**: `logger.js`
- LOC: 4 → 0.4 points
- Imported by: 3 files → 9 points
- Imports: 0 files → 0 points
- **TOTAL RISK: 9.4 ⭐ VERY HIGH**

---

## 🚀 Quick Start

### Prerequisites
```bash
Python 3.11+
pip
```

### Installation
```bash
cd legacymap-backend
pip install -r requirements.txt
```

### Start Backend
```bash
# Using script
bash start.sh

# Or manually
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Test API
```bash
# Upload a ZIP file
curl -X POST -F "file=@myproject.zip" http://localhost:8000/upload

# View API docs
open http://localhost:8000/docs
```

---

## 📤 API Endpoints

### **POST /upload** (Original Analysis)

**Request**:
```bash
curl -X POST \
  -F "file=@myproject.zip" \
  http://localhost:8000/upload
```

**Response** (200 OK):
```json
{
  "summary": {
    "total_files": 25,
    "total_loc": 5420,
    "top_5_risky": [...]
  },
  "nodes": {...},
  "edges": [...],
  "components": [...]
}
```

---

### **POST /upload-analyze** ⭐ NEW

**Enhanced Upload with Function/Class Details**

**Request**:
```bash
curl -X POST \
  -F "file=@myproject.zip" \
  http://localhost:8000/upload-analyze
```

**Response** (200 OK):
```json
{
  "status": "success",
  "repo_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_files": 11,
  "total_edges": 21,
  "total_loc": 649,
  "nodes": {
    "services/userService.js": {
      "loc": 67,
      "imports": ["../utils/logger"],
      "imported_by": ["./app.js"],
      "risk": 12.4,
      "functions_classes": [
        {
          "name": "UserService",
          "type": "class",
          "line_start": 8
        },
        {
          "name": "createUser",
          "type": "method",
          "line_start": 12,
          "parent_class": "UserService"
        }
      ]
    }
  },
  "edges": [...],
  "top_10_risky": [...]
}
```

**Key Features**:
- ✨ Returns all existing analysis (files, LOC, risk)
- ✨ **NEW**: Includes `functions_classes` array with line numbers
- ✨ Returns `repo_id` for querying function details
- ✨ Enables function-level analysis

---

### **GET /function-details/{repo_id}/{file_path}/{function_name}** ⭐ NEW

**Get Function Call Sites and Dependencies**

**Request**:
```bash
curl http://localhost:8000/function-details/550e8400-e29b-41d4-a716-446655440000/services/userService.js/createUser
```

**Response** (200 OK):
```json
{
  "status": "success",
  "function_name": "createUser",
  "file": "services/userService.js",
  "call_sites_table": {
    "title": "Where \"createUser\" is called",
    "columns": ["File", "Line Number", "Code"],
    "rows": [
      {
        "file": "controllers/userController.js",
        "line": 13,
        "code": "const user = this.userService.createUser(email, name, password);"
      },
      {
        "file": "app.js",
        "line": 45,
        "code": "userService.createUser('test@example.com', 'Test', 'pass');"
      }
    ],
    "count": 2
  },
  "dependencies_table": {
    "title": "What \"createUser\" depends on",
    "columns": ["Dependency Name", "Line Number", "Code"],
    "rows": [
      {
        "name": "info",
        "line": 16,
        "code": "logger.info('Creating new user', { email, name });"
      },
      {
        "name": "register",
        "line": 19,
        "code": "const user = this.authService.register(email, name, password);"
      },
      {
        "name": "success",
        "line": 20,
        "code": "logger.success('User created successfully', { userId: user.id });"
      }
    ],
    "count": 3
  }
}
```

**Key Features**:
- 📍 **Table 1**: Shows every file/line where this function is called
- 🔗 **Table 2**: Shows every function this function depends on
- 📝 Includes actual code snippets for context
- 🎯 Enables frontend to show detailed function analysis

**Usage Flow**:
1. Call `POST /upload-analyze` to get repo_id and functions_classes list
2. User clicks on a function in the frontend
3. Call `GET /function-details/{repo_id}/{file}/{function}` 
4. Display two tables with call sites and dependencies

---

## 📁 Project Structure

```
legacymap-backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # Main application (605 lines)
│   ├── scanner.py       # Code analysis functions
│   └── utils.py         # Utility functions
├── sample_repo/         # Sample project for testing
│   ├── index.js
│   ├── services/
│   │   ├── userService.js
│   │   └── billingService.js
│   └── utils/
│       └── logger.js
├── Dockerfile/
│   └── dockerfile       # Docker configuration
├── requirements.txt     # Python dependencies
├── ARCHITECTURE.md      # Complete documentation
├── start.sh            # Quick start script
└── README.md           # This file
```

---

## 🐳 Docker Deployment

### Build
```bash
docker build -f Dockerfile/dockerfile -t legacymap-backend .
```

### Run
```bash
docker run -p 8000:8000 legacymap-backend
```

### Access
```
API: http://localhost:8000
Docs: http://localhost:8000/docs
```

---

## 🧪 Testing

### With Sample Repository
```bash
# Create test ZIP
zip -r test_repo.zip sample_repo/

# Upload and analyze
curl -X POST -F "file=@test_repo.zip" http://localhost:8000/upload | python -m json.tool
```

### Expected Output
```json
{
  "summary": {
    "total_files": 4,
    "total_loc": 35,
    "top_5_risky": [
      {"path": "utils/logger.js", "risk": 9.4, "loc": 4, "imported_by": 3},
      {"path": "services/userService.js", "risk": 9.0, "loc": 10, "imported_by": 2}
    ]
  },
  "nodes": {...},
  "edges": [...],
  "components": []
}
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete technical documentation
  - All classes and functions
  - Data flow examples
  - Function call map
  
- **[main.py](./app/main.py)** - Fully documented code
  - Every step explained in comments
  - All function calls documented
  - Usage examples

---

## 🔧 Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.95.2 | Web framework |
| Uvicorn | 0.22.0 | ASGI server |
| NetworkX | 3.1 | Graph analysis |
| Python-Multipart | 0.0.6 | File upload |
| Aiofiles | 23.1.0 | Async file operations |

---

## 📊 Supported Languages

- ✅ **JavaScript** (.js)
- ✅ **TypeScript** (.ts, .tsx)
- ✅ **Python** (.py)
- 🔜 **Java**, **Go**, **Rust** (planned)

---

## 🎯 Use Cases

### 1. **Legacy Code Assessment**
Understand dependencies in old codebases

### 2. **Refactoring Planning**
Identify which files to refactor first

### 3. **Onboarding New Developers**
Provide code structure overview

### 4. **Technical Debt Analysis**
Find tightly coupled code

### 5. **CI/CD Integration**
Automated code quality checks

---

## ⚠️ Limitations

- ZIP files should be < 100MB
- Analysis time: ~1-2 seconds per 100 files
- Does not execute code
- Regex-based import detection (may miss dynamic imports)
- External package dependencies not analyzed

---

## 🐛 Troubleshooting

### Error: "Only ZIP files allowed"
```
✗ File format must be .zip
✓ Solution: Compress your code as ZIP
```

### Error: "Extract failed"
```
✗ ZIP file corrupted
✓ Solution: Re-create ZIP file
```

### Error: "Module not found"
```
✗ Missing dependencies
✓ Solution: pip install -r requirements.txt
```

---

## 📝 Example Analysis

### Input: Simple Web App
```
myapp.zip
├── index.js          (9 LOC, imports 3 files)
├── services/
│   ├── user.js       (10 LOC, imports 1 file)
│   └── billing.js    (12 LOC, imports 2 files)
└── utils/
    └── logger.js     (4 LOC, imports 0 files)
```

### Analysis Output
```
Total Files: 4
Total LOC: 35

RISK SCORES:
1. utils/logger.js         → 9.4 ⭐ (3 files depend on it!)
2. services/user.js        → 9.0 (2 dependencies)
3. services/billing.js     → 8.2 (tight coupling)
4. index.js                → 6.9 (main entry point)

DEPENDENCY GRAPH:
  index.js → logger.js ✓
  index.js → user.js ✓
  index.js → billing.js ✓
  user.js → logger.js ✓
  billing.js → logger.js ✓
  billing.js → user.js ✓

Total Edges: 6

RECOMMENDATIONS:
✓ logger.js is critical - protect this file
✓ Consider extracting common logic from billing.js
✓ Add comprehensive tests for index.js
```

---

## 👨‍💻 Development

### Running Tests
```bash
python -m pytest tests/
```

### Adding New Scanners
Edit `app/scanner.py` and add patterns for new languages

### Extending Risk Formula
Modify risk calculation in `app/main.py` around line 180

---

## 📄 License

MIT License - See LICENSE file

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing`
5. Open Pull Request

---

## 📧 Support

- **Issues**: GitHub Issues
- **Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Email**: contact@legacymap.io

---

**LegacyMap Backend** | v1.0 MVP | 22 November 2025 | ✅ Production Ready
