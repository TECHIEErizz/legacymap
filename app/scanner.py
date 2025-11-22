import os, re
from collections import defaultdict

IMPORT_PATTERNS = [
    re.compile(r"^\s*import\s+.*\s+from\s+['\"](.+)['\"]"),
    re.compile(r"^\s*const\s+.*=\s*require\(['\"](.+)['\"]\)"),
    re.compile(r"^\s*require\(['\"](.+)['\"]\)"),
]

def is_source_file(path):
    return path.endswith(('.js','.ts','.py'))

def read_file_lines(path):
    try:
        with open(path, 'r', errors='ignore') as f:
            return f.readlines()
    except:
        return []

def count_loc(lines):
    c = 0
    for ln in lines:
        s = ln.strip()
        if not s: 
            continue
        if s.startswith('//') or s.startswith('/*') or s.startswith('#'):
            continue
        c += 1
    return c

def extract_imports(lines):
    imports = []
    for ln in lines:
        for pat in IMPORT_PATTERNS:
            m = pat.search(ln)
            if m:
                imports.append(m.group(1))
    return imports

def normalize_import_path(import_path, from_file, repo_root):
    if import_path.startswith('.') or import_path.startswith('/'):
        base = os.path.dirname(from_file)
        candidate = os.path.normpath(os.path.join(base, import_path))
        
        # Try with various extensions
        for ext in ['', '.js', '.ts', '.py', '/index.js', '/index.ts', '/index.py']:
            if ext and not candidate.endswith(ext):
                p = candidate + ext
            else:
                p = candidate
            
            if os.path.isfile(p):
                return os.path.relpath(p, repo_root)
        
        # If no file found, try as directory with index
        if os.path.isdir(candidate):
            for idx_name in ['index.js', 'index.ts', 'index.py']:
                idx_path = os.path.join(candidate, idx_name)
                if os.path.isfile(idx_path):
                    return os.path.relpath(idx_path, repo_root)
        
        # Return as-is if not found
        return os.path.relpath(candidate, repo_root)
    else:
        return import_path.split('/')[0]
