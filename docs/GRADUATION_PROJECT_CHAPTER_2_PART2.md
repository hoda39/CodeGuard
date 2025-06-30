# Chapter 2: Analysis and Requirements (Part 2)

## 2.3 Functional Requirements Specification

### 2.3.1 Stakeholders

#### Primary Stakeholders
1. **Software Developers**: End users who will use the extension for code analysis
2. **Development Teams**: Groups of developers working on C/C++ projects
3. **Project Managers**: Oversee development processes and quality assurance
4. **Security Engineers**: Review and validate security analysis results
5. **Quality Assurance Teams**: Ensure code quality and security standards

#### Secondary Stakeholders
6. **VS Code Extension Marketplace**: Platform for distribution and updates
7. **Docker Community**: Container technology providers and maintainers
8. **Security Research Community**: Contributors to vulnerability databases
9. **Academic Institutions**: Educational users and researchers
10. **Open Source Community**: Contributors and maintainers

#### Tertiary Stakeholders
11. **End Users**: Consumers of software developed using the tool
12. **Regulatory Bodies**: Organizations requiring security compliance
13. **Software Vendors**: Companies providing development tools and services

### 2.3.2 Actors and Goals

#### Primary Actors (Initiating)

| Actor | Type | Goals |
|-------|------|-------|
| **Developer** | Human | - Analyze code for security vulnerabilities<br>- Get quick feedback on code quality<br>- Apply automatic fixes to issues<br>- Monitor analysis progress |
| **Security Engineer** | Human | - Review comprehensive security reports<br>- Validate analysis results<br>- Configure analysis parameters<br>- Integrate with security workflows |

#### Secondary Actors (Participating)

| Actor | Type | Goals |
|-------|------|-------|
| **VS Code IDE** | System | - Provide extension hosting environment<br>- Display analysis results<br>- Handle user interactions |
| **Docker Engine** | System | - Provide containerized execution environment<br>- Manage resource allocation<br>- Ensure isolation |
| **ML/AI Models** | System | - Perform vulnerability detection<br>- Classify security issues<br>- Generate fix suggestions |
| **CWE Database** | System | - Provide vulnerability classification standards<br>- Supply metadata for issues |

### 2.3.3 Use Cases

#### Use Case 1: Run Static Analysis

**Use Case ID**: UC-1  
**Use Case Name**: Run Static Analysis  
**Primary Actor**: Developer  
**Secondary Actors**: VS Code IDE, Docker Engine, ML/AI Models, CWE Database  
**Preconditions**: 
- VS Code is running with CodeGuard extension installed
- A C/C++ file is open in the editor
- Docker is running and accessible

**Main Success Scenario**:
1. Developer opens a C/C++ file in VS Code
2. Developer triggers static analysis (Ctrl+Shift+S or Command Palette)
3. System validates file type and Docker availability
4. System starts Docker container for static analysis
5. System uploads source code to container
6. ML/AI models analyze code for vulnerabilities
7. System processes analysis results and CWE classifications
8. System displays results in Problems panel and Output panel
9. System provides fix suggestions for detected issues

**Extensions**:
- 2a. If Docker is not available, system shows error message
- 2b. If file is not C/C++, system shows warning
- 6a. If analysis fails, system shows error and logs details

**Requirements**: REQ-1, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7, REQ-8, REQ-9, REQ-21, REQ-24, REQ-27

#### Use Case 2: Run Dynamic Analysis

**Use Case ID**: UC-2  
**Use Case Name**: Run Dynamic Analysis  
**Primary Actor**: Developer  
**Secondary Actors**: VS Code IDE, Docker Engine, CASR Tools  
**Preconditions**: 
- VS Code is running with CodeGuard extension installed
- A C/C++ file is open in the editor
- Docker is running and accessible

**Main Success Scenario**:
1. Developer opens a C/C++ file in VS Code
2. Developer triggers dynamic analysis (Ctrl+Shift+D or Command Palette)
3. System validates file type and Docker availability
4. System starts Docker container for dynamic analysis
5. System compiles source code in container
6. System runs executable with various test scenarios
7. System monitors memory usage and detects leaks
8. System integrates with CASR for crash analysis
9. System displays results in Problems panel and Output panel
10. System provides performance metrics and recommendations

**Extensions**:
- 2a. If Docker is not available, system shows error message
- 2b. If file is not C/C++, system shows warning
- 5a. If compilation fails, system shows error and logs details
- 6a. If execution crashes, system captures crash report

**Requirements**: REQ-2, REQ-3, REQ-4, REQ-16, REQ-17, REQ-18, REQ-8, REQ-21, REQ-24, REQ-27

#### Use Case 3: Run Combined Analysis

**Use Case ID**: UC-3  
**Use Case Name**: Run Combined Analysis  
**Primary Actor**: Developer  
**Secondary Actors**: VS Code IDE, Docker Engine, ML/AI Models, CASR Tools  
**Preconditions**: 
- VS Code is running with CodeGuard extension installed
- A C/C++ file is open in the editor
- Docker is running and accessible

**Main Success Scenario**:
1. Developer opens a C/C++ file in VS Code
2. Developer triggers combined analysis (Ctrl+Shift+A or Command Palette)
3. System validates file type and Docker availability
4. System starts both static and dynamic analysis containers
5. System runs static analysis in parallel with dynamic analysis
6. System aggregates results from both analysis types
7. System provides comprehensive security assessment
8. System displays unified results in Problems panel and Output panel
9. System generates combined report with all findings

**Extensions**:
- 2a. If Docker is not available, system shows error message
- 2b. If file is not C/C++, system shows warning
- 4a. If one container fails, system continues with available analysis
- 6a. If aggregation fails, system shows partial results

**Requirements**: REQ-1, REQ-2, REQ-3, REQ-4, REQ-10, REQ-11, REQ-15, REQ-21, REQ-24, REQ-27

#### Use Case 4: Cancel Analysis

**Use Case ID**: UC-4  
**Use Case Name**: Cancel Analysis  
**Primary Actor**: Developer  
**Secondary Actors**: VS Code IDE, Docker Engine  
**Preconditions**: 
- An analysis is currently running

**Main Success Scenario**:
1. Developer triggers cancel analysis (Ctrl+Shift+X or Command Palette)
2. System stops progress tracking
3. System terminates running Docker containers
4. System cleans up temporary resources
5. System updates status bar to "Ready"
6. System shows cancellation confirmation

**Extensions**:
- 2a. If containers are stuck, system forces termination
- 3a. If cleanup fails, system logs error and continues

**Requirements**: REQ-12, REQ-27, REQ-29

#### Use Case 5: Apply Automatic Fix

**Use Case ID**: UC-5  
**Use Case Name**: Apply Automatic Fix  
**Primary Actor**: Developer  
**Secondary Actors**: VS Code IDE, ML/AI Models  
**Preconditions**: 
- Analysis has completed and found vulnerabilities
- Fix suggestions are available

**Main Success Scenario**:
1. Developer views vulnerability in Problems panel
2. Developer clicks on fix suggestion (lightbulb icon)
3. System shows available fix options
4. Developer selects desired fix
5. System applies fix to source code
6. System validates fix application
7. System updates Problems panel
8. System shows confirmation message

**Extensions**:
- 2a. If no fix is available, system shows message
- 5a. If fix application fails, system shows error
- 6a. If validation fails, system reverts changes

**Requirements**: REQ-9, REQ-8, REQ-29, REQ-30

### 2.3.4 Use Case Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CodeGuard Use Case Diagram               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐                                           │
│  │  Developer  │                                           │
│  └─────┬───────┘                                           │
│        │                                                   │
│        │ ┌─────────────────────────────────────────────┐   │
│        │ │              <<include>>                   │   │
│        ├─┤         Run Static Analysis                │   │
│        │ └─────────────────────────────────────────────┘   │
│        │                                                   │
│        │ ┌─────────────────────────────────────────────┐   │
│        │ │              <<include>>                   │   │
│        ├─┤         Run Dynamic Analysis               │   │
│        │ └─────────────────────────────────────────────┘   │
│        │                                                   │
│        │ ┌─────────────────────────────────────────────┐   │
│        │ │              <<include>>                   │   │
│        ├─┤         Run Combined Analysis              │   │
│        │ └─────────────────────────────────────────────┘   │
│        │                                                   │
│        │ ┌─────────────────────────────────────────────┐   │
│        │ │              <<extend>>                    │   │
│        ├─┤         Cancel Analysis                    │   │
│        │ └─────────────────────────────────────────────┘   │
│        │                                                   │
│        │ ┌─────────────────────────────────────────────┐   │
│        │ │              <<include>>                   │   │
│        ├─┤         Apply Automatic Fix                │   │
│        │ └─────────────────────────────────────────────┘   │
│        │                                                   │
│        │ ┌─────────────────────────────────────────────┐   │
│        │ │              <<include>>                   │   │
│        ├─┤         Configure Settings                 │   │
│        │ └─────────────────────────────────────────────┘   │
│        │                                                   │
│  ┌─────┴───────┐                                           │
│  │Security Eng.│                                           │
│  └─────┬───────┘                                           │
│        │                                                   │
│        │ ┌─────────────────────────────────────────────┐   │
│        │ │              <<include>>                   │   │
│        ├─┤         Review Security Report             │   │
│        │ └─────────────────────────────────────────────┘   │
│        │                                                   │
│        │ ┌─────────────────────────────────────────────┐   │
│        │ │              <<include>>                   │   │
│        ├─┤         Validate Analysis Results          │   │
│        │ └─────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   VS Code   │  │   Docker    │  │   ML/AI     │         │
│  │     IDE     │  │   Engine    │  │   Models    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
``` 