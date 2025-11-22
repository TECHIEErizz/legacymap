"""
Function/Class Extractor Module
Extracts function and class definitions with their metadata
"""

import re
import os

def extract_functions_and_classes(file_path):
    """
    Extract function and class definitions from a source file
    Returns: List of dicts with name, type, start_line, end_line, etc.
    """
    try:
        with open(file_path, 'r', errors='ignore') as f:
            lines = f.readlines()
    except:
        return []
    
    functions_classes = []
    
    # Regex patterns
    class_pattern = re.compile(r'^\s*class\s+(\w+)\s*[\(:]')
    func_pattern = re.compile(r'^\s*(async\s+)?def\s+(\w+)\s*\(')
    method_pattern = re.compile(r'^\s*(async\s+)?def\s+(\w+)\s*\(')
    js_class_pattern = re.compile(r'^\s*class\s+(\w+)\s*\{')
    js_func_pattern = re.compile(r'^\s*function\s+(\w+)\s*\(')
    js_method_pattern = re.compile(r'^\s*(\w+)\s*\(\)\s*\{')
    
    current_class = None
    
    for i, line in enumerate(lines, 1):
        # Python class
        match = class_pattern.match(line)
        if match:
            current_class = {
                'name': match.group(1),
                'type': 'class',
                'line_start': i,
                'language': 'python',
                'parent_class': None
            }
            functions_classes.append(current_class)
            current_class = match.group(1)
            continue
        
        # Python function
        match = func_pattern.match(line)
        if match:
            item = {
                'name': match.group(2),
                'type': 'function',
                'line_start': i,
                'language': 'python',
                'parent_class': current_class if isinstance(current_class, str) else None
            }
            functions_classes.append(item)
            continue
        
        # JavaScript class
        match = js_class_pattern.match(line)
        if match:
            current_class = {
                'name': match.group(1),
                'type': 'class',
                'line_start': i,
                'language': 'javascript',
                'parent_class': None
            }
            functions_classes.append(current_class)
            current_class = match.group(1)
            continue
        
        # JavaScript function
        match = js_func_pattern.match(line)
        if match:
            item = {
                'name': match.group(1),
                'type': 'function',
                'line_start': i,
                'language': 'javascript',
                'parent_class': current_class if isinstance(current_class, str) else None
            }
            functions_classes.append(item)
            continue
        
        # JavaScript method (within class)
        if isinstance(current_class, str):
            match = js_method_pattern.match(line)
            if match and line.strip() and not line.strip().startswith('//'):
                item = {
                    'name': match.group(1),
                    'type': 'method',
                    'line_start': i,
                    'language': 'javascript',
                    'parent_class': current_class
                }
                if item['name'] not in ['if', 'for', 'while', 'switch', 'catch']:
                    functions_classes.append(item)
    
    return functions_classes


def find_function_calls(file_path, function_name):
    """
    Find all places where a function is called
    Returns: List of dicts with line_number, code, etc.
    """
    try:
        with open(file_path, 'r', errors='ignore') as f:
            lines = f.readlines()
    except:
        return []
    
    calls = []
    
    # Patterns for function calls
    patterns = [
        rf'\b{function_name}\s*\(',  # function_name(
        rf'\.{function_name}\s*\(',  # .function_name(
        rf'new\s+{function_name}\s*\(',  # new ClassName(
    ]
    
    for i, line in enumerate(lines, 1):
        for pattern in patterns:
            if re.search(pattern, line):
                calls.append({
                    'line': i,
                    'code': line.strip(),
                    'file': file_path
                })
                break
    
    return calls


def find_function_dependencies(file_path, function_name):
    """
    Find what a function depends on (its imports/calls within)
    Returns: List of dependencies
    """
    try:
        with open(file_path, 'r', errors='ignore') as f:
            lines = f.readlines()
    except:
        return []
    
    # Find function definition - for both Python and JavaScript
    # Python: def function_name( or async def function_name(
    # JavaScript: function_name() { or methodName(...) {
    func_patterns = [
        re.compile(rf'^\s*(async\s+)?def\s+{function_name}\s*\('),  # Python
        re.compile(rf'^\s*{function_name}\s*\([^)]*\)\s*\{{'),      # JS method/function
        re.compile(rf'^\s*function\s+{function_name}\s*\('),        # JS function keyword
    ]
    
    start_line = None
    for i, line in enumerate(lines):
        for pattern in func_patterns:
            if pattern.match(line):
                start_line = i
                break
        if start_line is not None:
            break
    
    if start_line is None:
        return []
    
    # Extract function body
    dependencies = []
    indent_level = len(lines[start_line]) - len(lines[start_line].lstrip())
    
    # For JavaScript, find closing brace at same indent level
    in_function = False
    brace_count = 0
    
    for i in range(start_line, len(lines)):
        line = lines[i]
        
        if i == start_line:
            in_function = True
            brace_count = line.count('{') - line.count('}')
            continue
        
        brace_count += line.count('{') - line.count('}')
        
        # Check if we've left the function
        if in_function and brace_count <= 0:
            break
        
        if not line.strip():
            continue
        
        # Find function calls within this function
        for match in re.finditer(r'\b(\w+)\s*\(', line):
            func_name = match.group(1)
            # Filter out keywords and common non-function calls
            if func_name not in ['if', 'for', 'while', 'return', 'print', 'len', 'throw', 'switch', 'catch']:
                dependencies.append({
                    'name': func_name,
                    'line': i + 1,
                    'code': line.strip()
                })
    
    return dependencies

