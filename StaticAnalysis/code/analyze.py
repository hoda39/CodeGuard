#!/usr/bin/env python3
"""
CodeGuard Static Analysis Entrypoint
This script is called by the Docker container to analyze C/C++ files.
"""

import sys
import json
import re
from pathlib import Path
from deploy import main, main_cwe, main_sev

def extract_functions(code: str) -> list:
    """Extract functions from C/C++ code."""
    functions = []
    
    # Split code into lines for line tracking
    lines = code.split('\n')
    
    # Simple function extraction - look for function definitions
    # This is a basic implementation - you might want to enhance it
    function_pattern = r'(\w+\s+)?(\w+)\s*\([^)]*\)\s*\{'
    
    for i, line in enumerate(lines):
        if re.search(function_pattern, line):
            # Find the function body
            brace_count = 0
            start_line = i
            function_lines = []
            
            for j in range(i, len(lines)):
                function_lines.append(lines[j])
                brace_count += lines[j].count('{') - lines[j].count('}')
                if brace_count == 0:
                    break
            
            if brace_count == 0:  # Complete function found
                function_code = '\n'.join(function_lines)
                functions.append({
                    'code': function_code,
                    'start_line': start_line + 1,  # 1-based line numbers
                    'end_line': start_line + len(function_lines)
                })
    
    # If no functions found, treat the entire code as one function
    if not functions:
        functions.append({
            'code': code,
            'start_line': 1,
            'end_line': len(lines)
        })
    
    return functions

def analyze_file(file_path: str) -> dict:
    """Analyze a C/C++ file for vulnerabilities."""
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        
        # Extract functions
        functions = extract_functions(code)
        
        if not functions:
            return {
                'vulnerabilities': [],
                'errors': ['No functions found in the code']
            }
        
        # Prepare function codes for analysis
        function_codes = [func['code'] for func in functions]
        
        # Run vulnerability analysis
        vuln_result = main(function_codes, gpu=False)
        
        # Run CWE analysis
        cwe_result = main_cwe(function_codes, gpu=False)
        
        # Run severity analysis
        sev_result = main_sev(function_codes, gpu=False)
        
        # Build vulnerability results
        vulnerabilities = []
        
        for i, func in enumerate(functions):
            if vuln_result['batch_vul_pred'][i] == 1:  # Vulnerable function
                # Get line scores for this function
                line_scores = vuln_result['batch_line_scores'][i] if 'batch_line_scores' in vuln_result else []
                
                # Find the line with highest vulnerability score
                if line_scores:
                    max_score = max(line_scores)
                    vuln_line_idx = line_scores.index(max_score)
                    # Map to actual source line
                    vuln_line = func['start_line'] + vuln_line_idx
                else:
                    vuln_line = func['start_line']
                
                # Get CWE and severity info
                cwe_id = cwe_result['cwe_id'][i] if 'cwe_id' in cwe_result else 'CWE-119'
                cwe_prob = cwe_result['cwe_id_prob'][i] if 'cwe_id_prob' in cwe_result else 0.5
                severity = sev_result['batch_sev_class'][i] if 'batch_sev_class' in sev_result else 'Medium'
                severity_score = sev_result['batch_sev_score'][i] if 'batch_sev_score' in sev_result else 5.0
                
                # Create vulnerability object
                vulnerability = {
                    'id': f'STATIC-{i+1}',
                    'type': 'static',
                    'severity': severity,
                    'message': f'Potential {cwe_id} vulnerability detected',
                    'line': vuln_line,
                    'cweId': cwe_id,
                    'cweDescription': f'{cwe_id} vulnerability with {cwe_prob:.2f} confidence',
                    'source': 'CodeGuard Static Analysis',
                    'probability': float(vuln_result['batch_vul_pred_prob'][i]),
                    'severityScore': float(severity_score)
                }
                
                vulnerabilities.append(vulnerability)
        
        return {
            'vulnerabilities': vulnerabilities,
            'errors': []
        }
        
    except Exception as e:
        return {
            'vulnerabilities': [],
            'errors': [f'Analysis failed: {str(e)}']
        }

def main_analyze():
    """Main entry point for the analyzer."""
    if len(sys.argv) != 2:
        print(json.dumps({
            'vulnerabilities': [],
            'errors': ['Usage: python analyze.py <file_path>']
        }))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not Path(file_path).exists():
        print(json.dumps({
            'vulnerabilities': [],
            'errors': [f'File not found: {file_path}']
        }))
        sys.exit(1)
    
    # Run analysis
    result = analyze_file(file_path)
    
    # Output JSON result
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main_analyze() 