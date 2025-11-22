# 📖 Frontend Integration Guide

## 🎯 Complete Step-by-Step Guide for Frontend

This guide shows exactly how to integrate the new function/class analysis features into your frontend.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                               │
│  1. Upload Interface          2. Function List View           │
│  ┌────────────────────┐      ┌──────────────────────┐        │
│  │ ZIP File Upload    │────→ │ Functions/Classes    │        │
│  │ [Choose File]      │      │ - User (class)       │        │
│  │ [Upload]           │      │ - validate (method)  │        │
│  │                    │      │ - create (method)    │        │
│  └────────────────────┘      └──────────────────────┘        │
│         ↓                              ↓                       │
│     POST /upload-analyze          Click on function          │
│         ↓                              ↓                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                                │
│                                                               │
│  POST /upload-analyze              GET /function-details    │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │ 1. Extract ZIP       │         │ 1. Find call sites   │  │
│  │ 2. Parse all files   │         │ 2. Find dependencies │  │
│  │ 3. Extract functions │         │ 3. Return 2 tables   │  │
│  │ 4. Calculate risk    │         └──────────────────────┘  │
│  │ 5. Return JSON       │                                    │
│  └──────────────────────┘                                    │
│         ↓                              ↓                       │
│    repo_id + functions          call_sites_table +           │
│                                  dependencies_table           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Display)                     │
│                                                               │
│  3. Function Details                                         │
│  ┌────────────────────────────────────────────────┐         │
│  │ Function: createUser()                         │         │
│  │ File: services/userService.js                 │         │
│  │                                                 │         │
│  │ TABLE 1: Where it's called (2 places)         │         │
│  │ ┌──────────────────────────────────────────┐  │         │
│  │ │ File                      │ Line │ Code  │  │         │
│  │ ├──────────────────────────────────────────┤  │         │
│  │ │ controllers/userController.js│  13 │ ...│  │         │
│  │ │ app.js                    │  45 │ ...│  │         │
│  │ └──────────────────────────────────────────┘  │         │
│  │                                                 │         │
│  │ TABLE 2: What it depends on (4 functions)     │         │
│  │ ┌──────────────────────────────────────────┐  │         │
│  │ │ Function│ Line │ Code                   │  │         │
│  │ ├──────────────────────────────────────────┤  │         │
│  │ │ info    │ 16  │ logger.info(...)        │  │         │
│  │ │ register│ 19  │ authService.register(..)│  │         │
│  │ │ success │ 20  │ logger.success(...)     │  │         │
│  │ │ error   │ 23  │ logger.error(...)       │  │         │
│  │ └──────────────────────────────────────────┘  │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Integration Code

### 1️⃣ Upload Repository

```javascript
// Frontend code to upload ZIP and get function list

async function uploadRepository(zipFile) {
  const formData = new FormData();
  formData.append('file', zipFile);
  
  try {
    const response = await fetch('/upload-analyze', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    return {
      repoId: data.repo_id,
      totalFiles: data.total_files,
      totalLoc: data.total_loc,
      functions: extractFunctionsFromNodes(data.nodes)
    };
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// Extract all functions/classes from the nodes
function extractFunctionsFromNodes(nodes) {
  const functionsList = [];
  
  for (const [filePath, metadata] of Object.entries(nodes)) {
    if (metadata.functions_classes) {
      for (const func of metadata.functions_classes) {
        functionsList.push({
          name: func.name,
          type: func.type,              // 'class' or 'method' or 'function'
          line: func.line_start,
          file: filePath,
          parentClass: func.parent_class,
          risk: metadata.risk
        });
      }
    }
  }
  
  return functionsList;
}
```

### 2️⃣ Display Function List

```javascript
// Display extracted functions in a UI list/table

function displayFunctionsList(functionsList) {
  const container = document.getElementById('functions-list');
  
  functionsList.forEach(func => {
    const item = document.createElement('div');
    item.className = 'function-item';
    item.innerHTML = `
      <div class="function-header">
        <span class="function-type ${func.type}">[${func.type}]</span>
        <span class="function-name">${func.name}</span>
        <span class="function-line">Line ${func.line}</span>
        <span class="function-file">${func.file}</span>
      </div>
    `;
    
    // Add click handler to show details
    item.addEventListener('click', () => {
      showFunctionDetails(repoId, func.file, func.name);
    });
    
    container.appendChild(item);
  });
}
```

### 3️⃣ Get Function Details

```javascript
// Fetch details when user clicks on a function

async function showFunctionDetails(repoId, filePath, functionName) {
  try {
    const response = await fetch(
      `/function-details/${repoId}/${encodeURIComponent(filePath)}/${functionName}`
    );
    
    const details = await response.json();
    
    // Display both tables
    displayCallSitesTable(details.call_sites_table);
    displayDependenciesTable(details.dependencies_table);
    
  } catch (error) {
    console.error('Failed to fetch function details:', error);
  }
}
```

### 4️⃣ Display Call Sites Table

```javascript
// Display TABLE 1: Where the function is called

function displayCallSitesTable(callSitesTable) {
  const container = document.getElementById('call-sites-table');
  
  // Create table header
  let html = `
    <div class="table-header">
      <h3>${callSitesTable.title}</h3>
      <span class="count">Found in ${callSitesTable.count} places</span>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          ${callSitesTable.columns.map(col => `<th>${col}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  // Add table rows
  callSitesTable.rows.forEach(row => {
    html += `
      <tr>
        <td><code>${row.file}</code></td>
        <td><span class="line-number">${row.line}</span></td>
        <td><code class="code-snippet">${row.code}</code></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}
```

### 5️⃣ Display Dependencies Table

```javascript
// Display TABLE 2: What the function depends on

function displayDependenciesTable(dependenciesTable) {
  const container = document.getElementById('dependencies-table');
  
  // Create table header
  let html = `
    <div class="table-header">
      <h3>${dependenciesTable.title}</h3>
      <span class="count">${dependenciesTable.count} dependencies</span>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          ${dependenciesTable.columns.map(col => `<th>${col}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  // Add table rows
  dependenciesTable.rows.forEach(row => {
    html += `
      <tr>
        <td><code>${row.name}</code></td>
        <td><span class="line-number">${row.line}</span></td>
        <td><code class="code-snippet">${row.code}</code></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}
```

---

## 🎨 HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
  <title>LegacyMap - Function Analysis</title>
  <style>
    .function-item {
      padding: 10px;
      margin: 5px 0;
      border: 1px solid #ddd;
      cursor: pointer;
      border-radius: 4px;
    }
    
    .function-item:hover {
      background-color: #f5f5f5;
      border-color: #0066cc;
    }
    
    .function-type {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 12px;
    }
    
    .function-type.class {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .function-type.method {
      background-color: #f3e5f5;
      color: #6a1b9a;
    }
    
    .function-type.function {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    .data-table th {
      background-color: #f0f0f0;
      padding: 10px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #ddd;
    }
    
    .data-table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    
    .data-table code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
    
    .line-number {
      background-color: #ffebee;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
      color: #c62828;
    }
  </style>
</head>
<body>
  <div id="app">
    <!-- Upload Section -->
    <div id="upload-section">
      <h1>LegacyMap - Code Analysis</h1>
      <input type="file" id="zip-file" accept=".zip" />
      <button onclick="handleUpload()">Upload Repository</button>
    </div>
    
    <!-- Functions List Section -->
    <div id="functions-section" style="display:none;">
      <h2>Functions & Classes</h2>
      <div id="functions-list"></div>
    </div>
    
    <!-- Details Section -->
    <div id="details-section" style="display:none;">
      <h2>Function Details</h2>
      <div id="call-sites-table"></div>
      <div id="dependencies-table"></div>
    </div>
  </div>

  <script>
    let currentRepoId = null;
    
    async function handleUpload() {
      const file = document.getElementById('zip-file').files[0];
      if (!file) return;
      
      const result = await uploadRepository(file);
      currentRepoId = result.repoId;
      
      displayFunctionsList(result.functions);
      document.getElementById('functions-section').style.display = 'block';
    }
  </script>
</body>
</html>
```

---

## 📱 React Component Example

```jsx
import React, { useState } from 'react';

export function FunctionAnalyzer() {
  const [repoId, setRepoId] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [details, setDetails] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/upload-analyze', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    setRepoId(data.repo_id);
    
    // Extract functions
    const funcList = [];
    for (const [file, meta] of Object.entries(data.nodes)) {
      meta.functions_classes?.forEach(func => {
        funcList.push({
          ...func,
          file,
          risk: meta.risk
        });
      });
    }
    setFunctions(funcList);
  };

  const handleFunctionClick = async (func) => {
    const response = await fetch(
      `/function-details/${repoId}/${encodeURIComponent(func.file)}/${func.name}`
    );
    const data = await response.json();
    setDetails(data);
    setSelectedFunction(func);
  };

  return (
    <div>
      <h1>Function Analysis</h1>
      
      <input type="file" onChange={handleUpload} accept=".zip" />
      
      {functions.length > 0 && (
        <div>
          <h2>Functions ({functions.length})</h2>
          {functions.map((func, idx) => (
            <div
              key={idx}
              onClick={() => handleFunctionClick(func)}
              style={{ 
                padding: '10px', 
                margin: '5px 0', 
                border: '1px solid #ddd',
                cursor: 'pointer'
              }}
            >
              <span style={{ 
                background: func.type === 'class' ? '#e3f2fd' : '#f3e5f5',
                padding: '2px 8px',
                borderRadius: '3px',
                marginRight: '10px'
              }}>
                {func.type}
              </span>
              {func.name} - {func.file}:{func.line_start}
            </div>
          ))}
        </div>
      )}
      
      {details && (
        <div>
          <h2>Details: {selectedFunction.name}</h2>
          
          <h3>Call Sites ({details.call_sites_table.count})</h3>
          <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
            <thead>
              <tr>
                {details.call_sites_table.columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {details.call_sites_table.rows.map((row, idx) => (
                <tr key={idx}>
                  <td><code>{row.file}</code></td>
                  <td>{row.line}</td>
                  <td><code>{row.code}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h3>Dependencies ({details.dependencies_table.count})</h3>
          <table border="1" style={{ width: '100%' }}>
            <thead>
              <tr>
                {details.dependencies_table.columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {details.dependencies_table.rows.map((row, idx) => (
                <tr key={idx}>
                  <td><code>{row.name}</code></td>
                  <td>{row.line}</td>
                  <td><code>{row.code}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## 🔗 Complete Integration Flow

```
┌─────────────────────────────────────────┐
│ User uploads ZIP file                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ POST /upload-analyze                     │
│ - Extract files                          │
│ - Parse code                             │
│ - Extract functions with line #s        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Response:                                 │
│ {                                         │
│   "repo_id": "uuid-123",                 │
│   "nodes": {                             │
│     "file.js": {                         │
│       "functions_classes": [             │
│         {name, type, line_start, ...}    │
│       ]                                   │
│     }                                     │
│   }                                       │
│ }                                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Display: List of functions/classes       │
│ - User class @ line 4                    │
│ - createUser @ line 12                   │
│ - validate @ line 25                     │
└──────────────┬──────────────────────────┘
               │
               ▼ (User clicks on a function)
┌─────────────────────────────────────────┐
│ GET /function-details/uuid-123/.../name │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Response:                                 │
│ {                                         │
│   "call_sites_table": {                  │
│     "rows": [                            │
│       {file, line, code},                │
│       {file, line, code}                 │
│     ]                                     │
│   },                                      │
│   "dependencies_table": {                │
│     "rows": [                            │
│       {name, line, code},                │
│       {name, line, code}                 │
│     ]                                     │
│   }                                       │
│ }                                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Display: Two tables                      │
│ ┌─────────────────────────────────────┐ │
│ │ Where function is called (2 places) │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ File  │ Line │ Code             │ │ │
│ │ ├─────────────────────────────────┤ │ │
│ │ │ a.js  │ 13  │ foo()            │ │ │
│ │ │ b.js  │ 27  │ bar.foo()        │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ What function depends on (4 calls)  │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ Name  │ Line │ Code             │ │ │
│ │ ├─────────────────────────────────┤ │ │
│ │ │ log   │ 15  │ log()            │ │ │
│ │ │ fetch │ 18  │ fetch(url)       │ │ │
│ │ │ parse │ 22  │ JSON.parse()     │ │ │
│ │ │ save  │ 25  │ db.save()        │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 📊 Data Formats Reference

### Upload Response
```json
{
  "status": "success",
  "repo_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_files": 11,
  "nodes": {
    "services/userService.js": {
      "loc": 67,
      "functions_classes": [
        {
          "name": "UserService",
          "type": "class",
          "line_start": 8,
          "parent_class": null
        },
        {
          "name": "createUser",
          "type": "method",
          "line_start": 12,
          "parent_class": "UserService"
        }
      ]
    }
  }
}
```

### Function Details Response
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
      }
    ],
    "count": 1
  },
  "dependencies_table": {
    "title": "What \"createUser\" depends on",
    "columns": ["Dependency Name", "Line Number", "Code"],
    "rows": [
      {
        "name": "info",
        "line": 16,
        "code": "logger.info('Creating new user', { email, name });"
      }
    ],
    "count": 1
  }
}
```

---

## ✅ Checklist for Frontend Integration

- [ ] Create ZIP file upload input
- [ ] Implement `uploadRepository()` function
- [ ] Extract and store `repo_id` from response
- [ ] Build functions list from `functions_classes`
- [ ] Display functions in clickable list
- [ ] Implement `showFunctionDetails()` on click
- [ ] Create two tables for call sites and dependencies
- [ ] Add syntax highlighting for code snippets
- [ ] Link line numbers to source code (optional)
- [ ] Add error handling for 404s
- [ ] Test with sample_repo.zip

---

**Ready to build? All backend APIs are working and waiting for your frontend!** 🚀
