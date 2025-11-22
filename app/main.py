# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║                     LEGACYMAP BACKEND - MAIN APPLICATION                        ║
# ║  Code Analysis Engine: Detects dependencies, calculates risk scores              ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

# ============================================================================
# IMPORTS & CLASSES USED
# ============================================================================

from fastapi import FastAPI, File, UploadFile, HTTPException
# CLASS 1: FastAPI - Web framework main class (Line 1)
#   Purpose: Handle HTTP requests and responses
#   Methods used: @app.post() decorator for endpoints
#   Status: External library from 'fastapi' package

# CLASS 2: File - FastAPI upload handler (Line 1)
#   Purpose: Mark file upload parameters
#   Usage: File(...) in function signature

# CLASS 3: UploadFile - Async file upload class (Line 1)
#   Purpose: Handle uploaded files asynchronously
#   Methods: .read(), .write()

# CLASS 4: HTTPException - Error response class (Line 1)
#   Purpose: Return HTTP error responses
#   Usage: raise HTTPException(status_code=400, detail="message")

from fastapi.responses import JSONResponse
# CLASS 5: JSONResponse - JSON response formatter (Line 2)
#   Purpose: Return JSON data to client
#   Usage: JSONResponse(content=dict, status_code=200)

import os
# MODULE: Operating system operations
# Functions: os.walk(), os.path.join(), os.path.relpath(), os.remove()

import uuid
# MODULE: Unique identifier generator
# Functions: uuid.uuid4() - generates random unique IDs

import shutil
# MODULE: File operations (not directly used, imported for potential cleanup)

from .utils import extract_zip_to_temp, cleanup
# FUNCTION 1: extract_zip_to_temp (Source: utils.py:1-10)
#   Parameters: zip_path (str)
#   Returns: temp_directory_path (str)
#   Purpose: Extract ZIP file to temporary location
#   Uses: tempfile.mkdtemp(), ZipFile.extractall()
#   Called at: Line 32

# FUNCTION 2: cleanup (Source: utils.py:12-17)
#   Parameters: path (str)
#   Returns: None
#   Purpose: Delete temporary directory recursively
#   Uses: shutil.rmtree()
#   Called at: Line 120

from .scanner import (
    is_source_file,           # Function: scanner.py:1-8
    read_file_lines,          # Function: scanner.py:10-15
    count_loc,                # Function: scanner.py:17-22
    extract_imports,          # Function: scanner.py:24-35
    normalize_import_path     # Function: scanner.py:37-45
)

# FUNCTION 3: is_source_file (Source: scanner.py:1-8)
#   Parameters: path (str)
#   Returns: bool
#   Purpose: Check if file is .js, .ts, or .py
#   Called at: Line 51

# FUNCTION 4: read_file_lines (Source: scanner.py:10-15)
#   Parameters: path (str)
#   Returns: list of strings (file lines)
#   Purpose: Read file content line by line
#   Called at: Lines 57, 75

# FUNCTION 5: count_loc (Source: scanner.py:17-22)
#   Parameters: lines (list)
#   Returns: int (count of non-empty, non-comment lines)
#   Purpose: Calculate Lines of Code metric
#   Called at: Line 58

# FUNCTION 6: extract_imports (Source: scanner.py:24-35)
#   Parameters: lines (list)
#   Returns: list of import paths
#   Purpose: Extract all require() and import statements
#   Called at: Lines 59, 77

# FUNCTION 7: normalize_import_path (Source: scanner.py:37-45)
#   Parameters: import_path (str), from_file (str), repo_root (str)
#   Returns: normalized_path (str)
#   Purpose: Convert relative paths to actual file paths
#   Called at: Line 78

from collections import defaultdict
# CLASS 6: defaultdict - Dictionary with default values (Line 33)
#   Purpose: Automatically create missing keys with default value
#   Usage: graph = defaultdict(list) creates dict where new keys = []
#   Called at: Line 33, 34

import networkx as nx
# MODULE: Graph analysis library (networkx)
# CLASS 7: nx.DiGraph - Directed Graph class (Line 37)
#   Purpose: Create dependency graph (A→B means A depends on B)
#   Methods: add_node(), add_edge(), strongly_connected_components()
#   Called at: Line 94

# ============================================================================
# APPLICATION INITIALIZATION
# ============================================================================

app = FastAPI(title="LegacyMap AI - Hacker MVP Backend")
# CLASS INSTANCE: FastAPI application instance (Line 61)
# Purpose: Main web application object
# Methods: @app.post() decorator for endpoints
# Attributes: title="LegacyMap AI - Hacker MVP Backend"

# ============================================================================
# ENDPOINT: POST /upload
# ============================================================================
# Location: Line 63-120
# Purpose: Main API endpoint for code analysis
# Input: ZIP file containing source code
# Output: JSON with dependency graph, risk scores, and analysis

@app.post("/upload")
async def upload_zip(file: UploadFile = File(...)):
    """
    MAIN ORCHESTRATION FUNCTION
    Workflow:
    1. Validate and save uploaded ZIP file
    2. Extract ZIP contents to temporary directory
    3. Scan all source files (JS, TS, Python)
    4. Count lines of code (LOC) for each file
    5. Extract import statements and normalize paths
    6. Build dependency graph using networkx
    7. Calculate risk scores for each file
    8. Identify connected components (code clusters)
    9. Return comprehensive JSON response
    10. Cleanup temporary files
    """
    
    # ════════════════════════════════════════════════════════════════════
    # STEP 1: FILE VALIDATION & SAVE
    # ════════════════════════════════════════════════════════════════════
    # Location: Line 73-83
    
    # Validation: Only accept ZIP files
    if not file.filename.endswith('.zip'):
        # CLASS CALL: HTTPException constructor
        #   Status: 400 Bad Request
        #   Reason: File must be .zip format
        raise HTTPException(status_code=400, detail="Upload a zip file")
    
    # Generate unique identifier for this upload
    uid = str(uuid.uuid4())[:8]
    # FUNCTION: uuid.uuid4() generates UUID
    #   Returns: Unique 8-character string
    #   Purpose: Ensure temp files don't conflict
    
    # Create temporary file path
    local_zip = f"/tmp/{uid}.zip"
    # Format: /tmp/[8-char-uuid].zip
    
    # Save uploaded file to disk
    with open(local_zip, "wb") as f:
        # FUNCTION: open() - built-in file handler
        # Mode: "wb" = write binary
        
        content = await file.read()
        # AWAIT: Async operation to read entire file
        # Returns: bytes of file content
        
        f.write(content)
        # METHOD: Write bytes to file

    # ════════════════════════════════════════════════════════════════════
    # STEP 2: EXTRACT ZIP FILE
    # ════════════════════════════════════════════════════════════════════
    # Location: Line 105-108
    
    repo_root = extract_zip_to_temp(local_zip)
    # FUNCTION CALL: extract_zip_to_temp()
    #   Source: utils.py:1-10
    #   Parameter: local_zip = "/tmp/[uuid].zip"
    #   Returns: temp_directory path (e.g., /tmp/legacymap_abc123/)
    #   Actions: Creates temp folder, extracts all ZIP contents
    #   Uses internally: tempfile.mkdtemp(), zipfile.ZipFile.extractall()

    try:
        # ════════════════════════════════════════════════════════════════════
        # STEP 3: INITIALIZE DATA STRUCTURES
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 110-120
        
        # Dictionary to store node metadata
        nodes = {}
        # KEY: file path (e.g., "services/userService.js")
        # VALUE: {"path": str, "loc": int, "imports": list, "risk": float, ...}
        
        # Directed graph for dependencies (file A imports file B)
        graph = defaultdict(list)    # from -> [to,...]
        # CLASS: defaultdict(list)
        # KEY: source file path
        # VALUE: list of target files it imports
        # Example: graph["index.js"] = ["utils/logger.js", "services/user.js"]
        
        # Reverse mapping for quick lookup (which files import me?)
        reverse = defaultdict(list)  # to -> [from,...]
        # CLASS: defaultdict(list)
        # KEY: target file path
        # VALUE: list of files that import this file
        # Example: reverse["utils/logger.js"] = ["index.js", "userService.js"]
        
        total_loc = 0
        # Integer: Sum of all lines of code across all files
        
        file_list = []
        # List: tuples of (full_path, relative_path) for all source files
        
        # ════════════════════════════════════════════════════════════════════
        # STEP 3A: DISCOVER ALL SOURCE FILES
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 121-130
        
        for root, dirs, files in os.walk(repo_root):
            # FUNCTION: os.walk() - recursive directory traversal
            # Yields: (root_path, subdirs, files_in_root)
            # Purpose: Walk through all directories in extracted repo
            
            for fname in files:
                # Loop through each file in current directory
                
                full = os.path.join(root, fname)
                # FUNCTION: os.path.join() - create full path
                # Result: /tmp/legacymap_xyz/services/userService.js
                
                rel = os.path.relpath(full, repo_root)
                # FUNCTION: os.path.relpath() - create relative path
                # Result: services/userService.js (relative to repo root)
                
                if is_source_file(full):
                    # FUNCTION CALL: is_source_file()
                    #   Source: scanner.py:1-8
                    #   Input: full path
                    #   Returns: True if ends with .js, .ts, or .py
                    #   Called: Line 127
                    
                    file_list.append((full, rel))
                    # Store tuple: (full_path, relative_path)

        # ════════════════════════════════════════════════════════════════════
        # STEP 3B: BUILD METADATA FOR EACH FILE
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 131-149
        
        for full, rel in file_list:
            # Loop through each source file
            
            lines = read_file_lines(full)
            # FUNCTION CALL: read_file_lines()
            #   Source: scanner.py:10-15
            #   Input: full path to file
            #   Returns: list of strings (each line)
            #   Called: Line 134
            
            loc = count_loc(lines)
            # FUNCTION CALL: count_loc()
            #   Source: scanner.py:17-22
            #   Input: lines (list of strings)
            #   Returns: integer (non-empty, non-comment lines)
            #   Logic: Filters out blank lines and comments
            #   Example: 15 lines total, 3 are comments → returns 12
            #   Called: Line 135
            
            imps = extract_imports(lines)
            # FUNCTION CALL: extract_imports()
            #   Source: scanner.py:24-35
            #   Input: lines (list of strings)
            #   Returns: list of import paths
            #   Logic: Regex patterns for require() and import statements
            #   Example: ["./utils/logger", "../services/user"]
            #   Called: Line 136
            
            nodes[rel] = {
                # Store metadata in nodes dictionary
                "path": rel,
                # Relative file path
                
                "loc": loc,
                # Lines of code count
                
                "imports_raw": imps,
                # Raw import paths (not yet normalized)
                
                "imports": []
                # Will be filled with normalized paths in Step 4
            }
            
            total_loc += loc
            # Accumulate total LOC across all files

        # ════════════════════════════════════════════════════════════════════
        # STEP 4: NORMALIZE IMPORTS & BUILD DEPENDENCY GRAPH
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 150-170
        # Purpose: Convert relative paths to actual file paths and create edges
        
        for full, rel in file_list:
            # Loop through each source file again
            
            lines = read_file_lines(full)
            # Re-read file lines
            
            imps = extract_imports(lines)
            # Re-extract imports
            
            normalized = []
            # List to store normalized import paths
            
            for imp in imps:
                # Loop through each import statement
                # Example: imp = "./utils/logger"
                
                normalized_path = normalize_import_path(imp, os.path.join(repo_root, rel), repo_root)
                # FUNCTION CALL: normalize_import_path()
                #   Source: scanner.py:37-45
                #   Parameters:
                #     - imp: relative import path (e.g., "./utils/logger")
                #     - from_file: current file's path
                #     - repo_root: project root directory
                #   Returns: actual file path or external package name
                #   Logic: Matches relative path to actual files in project
                #   Example: "./utils/logger" → "utils/logger.js"
                #   Called: Line 159
                
                normalized.append(normalized_path)
                # Add to normalized list
                
                # Add edge to dependency graph if it points to a known file
                if normalized_path in nodes:
                    # Check if normalized path is a file in our project
                    
                    graph[rel].append(normalized_path)
                    # Add edge: rel → normalized_path
                    # Meaning: current file imports normalized_path
                    # Example: graph["index.js"] = ["utils/logger.js", ...]
                    
                    reverse[normalized_path].append(rel)
                    # Add reverse edge: who imports this file?
                    # Meaning: normalized_path is imported by rel
                    # Example: reverse["utils/logger.js"] = ["index.js", ...]
            
            nodes[rel]['imports'] = normalized
            # Store normalized imports in nodes dictionary

        # ════════════════════════════════════════════════════════════════════
        # STEP 5: COMPUTE DEPENDENCY COUNTS
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 171-179
        # Purpose: Calculate how many other files depend on each file
        
        for k in nodes.keys():
            # Loop through all files
            
            nodes[k]['imported_by_count'] = len(reverse.get(k, []))
            # Count: How many files import this file?
            # reverse[k] = list of files that import file k
            # len() = count of importers
            # .get(k, []) = return empty list if not found
            
            nodes[k]['imports_count'] = len(nodes[k]['imports'])
            # Count: How many files does this file import?
            # nodes[k]['imports'] = list of imports from this file
            # len() = count of imports

        # ════════════════════════════════════════════════════════════════════
        # STEP 6: CALCULATE RISK SCORES
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 180-191
        # Purpose: Assign risk score to each file based on complexity & dependencies
        
        for k, meta in nodes.items():
            # Loop through all files with their metadata
            
            # RISK FORMULA (simplified for MVP):
            # risk = (loc/10) + (imported_by_count * 3) + (imports_count * 2)
            #
            # Breakdown:
            # - (loc/10): Larger files are riskier
            #   Example: 100 LOC → 10 points
            #
            # - (imported_by_count * 3): If many files depend on you, breaking you breaks many
            #   Example: 3 files import you → 9 points (HIGH RISK!)
            #   Reason: Single point of failure
            #
            # - (imports_count * 2): If you import many files, you're tightly coupled
            #   Example: 5 imports → 10 points
            #   Reason: Complexity and potential cascading failures
            
            risk = (meta['loc'] / 10.0) + (meta['imported_by_count'] * 3.0) + (meta['imports_count'] * 2.0)
            
            # Round to 2 decimal places
            nodes[k]['risk'] = round(risk, 2)
            
            # Example calculation:
            # File: utils/logger.js
            #   loc = 4 → 4/10 = 0.4
            #   imported_by = 3 → 3*3 = 9
            #   imports = 0 → 0*2 = 0
            #   risk = 0.4 + 9 + 0 = 9.4 ← VERY RISKY!

        # ════════════════════════════════════════════════════════════════════
        # STEP 7: BUILD EDGES LIST & IDENTIFY TOP RISKY FILES
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 192-210
        
        # Build edges list for visualization/analysis
        edges = []
        # List of dictionaries: [{"from": A, "to": B}, ...]
        
        for src, tos in graph.items():
            # Loop through dependency graph
            # src = source file
            # tos = list of target files it imports
            
            for t in tos:
                # For each target file
                
                edges.append({"from": src, "to": t})
                # Add edge to list
                # Meaning: src imports t
        
        # Sort all files by risk score (highest first)
        sorted_nodes = sorted(nodes.values(), key=lambda x: x['risk'], reverse=True)
        # FUNCTION: sorted()
        # Parameter: nodes.values() (all node dictionaries)
        # Key: lambda x: x['risk'] (sort by risk field)
        # reverse=True: highest risk first
        # Returns: list of nodes sorted by risk score
        
        # Get top 5 riskiest files
        top5 = sorted_nodes[:5]
        # Slice: First 5 elements (or fewer if < 5 files)

        # ════════════════════════════════════════════════════════════════════
        # STEP 8: IDENTIFY CONNECTED COMPONENTS
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 211-225
        # Purpose: Find clusters of tightly-coupled code
        
        # Create networkx directed graph for analysis
        G = nx.DiGraph()
        # CLASS: networkx.DiGraph (Directed Graph)
        # Purpose: Represent code dependencies as a graph
        # Properties: Nodes=files, Edges=dependencies
        
        # Add all files as nodes
        for n in nodes.keys():
            G.add_node(n)
            # METHOD: add_node()
            # Adds a node (file) to the graph
        
        # Add all dependencies as edges
        for e in edges:
            G.add_edge(e['from'], e['to'])
            # METHOD: add_edge()
            # Adds directed edge from 'from' to 'to'
            # Meaning: 'from' depends on 'to'
        
        try:
            # Find strongly connected components (circular dependencies)
            comps = list(nx.strongly_connected_components(G))
            # METHOD: nx.strongly_connected_components()
            # Returns: List of sets, each set = strongly connected component
            # Meaning: Files that can reach each other through dependencies
            
            # Build summary of components (size > 1)
            comp_summary = [
                {"size": len(c), "members_sample": list(c)[:5]}
                for c in comps
                if len(c) > 1
            ]
            # List comprehension: Extract meaningful components
            # Filters: Only components with 2+ members (circular deps)
            
        except Exception as ex:
            # If graph analysis fails, return empty
            comp_summary = []

        # ════════════════════════════════════════════════════════════════════
        # STEP 9: BUILD FINAL JSON RESPONSE
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 226-250
        
        result = {
            # Main response object
            
            "summary": {
                # High-level overview of the analysis
                
                "total_files": len(nodes),
                # Count: Total source files analyzed
                
                "total_loc": total_loc,
                # Count: Total lines of code across all files
                
                "top_5_risky": [
                    # List: Top 5 riskiest files
                    
                    {
                        "path": x['path'],
                        # File path relative to project root
                        
                        "risk": x['risk'],
                        # Risk score (0-100+)
                        
                        "loc": x['loc'],
                        # Lines of code
                        
                        "imported_by": x['imported_by_count']
                        # Count of files that import this file
                    }
                    for x in top5
                    # Loop through top 5 files
                ]
            },
            
            "nodes": nodes,
            # Complete data for all files
            # Each node contains: path, loc, imports, imported_by_count, risk, etc.
            
            "edges": edges,
            # List of dependencies: [{"from": A, "to": B}, ...]
            # Represents: Which files depend on which
            
            "components": comp_summary
            # Clusters of circularly-dependent code
            # Indicates: Areas of tight coupling
        }
        
        return JSONResponse(content=result)
        # CLASS: JSONResponse (from fastapi.responses)
        # Purpose: Return JSON data to client
        # Default status: 200 OK
    finally:
        # ════════════════════════════════════════════════════════════════════
        # STEP 10: CLEANUP TEMPORARY FILES
        # ════════════════════════════════════════════════════════════════════
        # Location: Line 251-260
        # Purpose: Free up disk space, remove temporary files
        
        cleanup(repo_root)
        # FUNCTION CALL: cleanup()
        #   Source: utils.py:12-17
        #   Input: repo_root = temporary directory path
        #   Action: Recursively delete directory and all contents
        #   Uses: shutil.rmtree()
        
        try:
            # Attempt to remove temporary ZIP file
            os.remove(local_zip)
            # FUNCTION: os.remove()
            # Removes: The temporary ZIP file we saved earlier
            
        except:
            # Ignore errors if file doesn't exist or can't be deleted
            pass

# ═══════════════════════════════════════════════════════════════════════════════
# END OF APPLICATION
# ═══════════════════════════════════════════════════════════════════════════════
#
# SUMMARY OF FLOW:
#
#  User Upload (ZIP)
#       ↓
#  [Step 1] Validate & Save ZIP
#       ↓
#  [Step 2] Extract to /tmp/legacymap_xyz/
#       ↓
#  [Step 3A] Discover all source files (.js, .ts, .py)
#       ↓
#  [Step 3B] Build metadata (LOC, imports) for each file
#       ↓
#  [Step 4] Normalize imports & build dependency graph
#       ↓
#  [Step 5] Compute dependency counts (imported_by, imports_count)
#       ↓
#  [Step 6] Calculate risk scores (formula: LOC/10 + imported_by*3 + imports*2)
#       ↓
#  [Step 7] Build edges list & identify top 5 risky files
#       ↓
#  [Step 8] Identify connected components (circular dependencies)
#       ↓
#  [Step 9] Build comprehensive JSON response
#       ↓
#  [Step 10] Cleanup temporary files
#       ↓
#  Return JSON to client
#
# ═══════════════════════════════════════════════════════════════════════════════
