# Mermaid Diagrams for Dynamic Analysis Chapter

## 1. Fuzzing Orchestrator Architecture

```mermaid
graph TB
    subgraph "Fuzzing Orchestrator"
        subgraph "Top Layer"
            A[Master Fuzzer<br/>AFL++]
            B[Slave Fuzzer<br/>AFL++]
            C[Symbolic Execution<br/>Eclipser]
        end
        
        subgraph "Middle Layer"
            D[Sync Manager]
            E[Queue Manager]
            F[Crash Collector]
        end
        
        subgraph "Bottom Layer"
            G[Binary Compiler]
            H[Input Generator]
            I[Output Processor]
        end
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    E --> G
    H --> I
```

## 2. Workflow Design

```mermaid
graph LR
    A[Compile Phase] --> B[Initialize Phase]
    B --> C[Fuzzing Phase]
    C --> D[Analysis Phase]
    
    subgraph "Phase Details"
        A1[Sanitized Binaries<br/>Generation]
        B1[Directory Structure<br/>Creation]
        C1[Multi-Engine<br/>Execution]
        D1[Crash Collection<br/>& Reporting]
    end
    
    A --> A1
    B --> B1
    C --> C1
    D --> D1
```

## 3. Synchronization Mechanism

```mermaid
graph TB
    subgraph "Fuzzing Engines"
        A[AFL++ Master]
        B[AFL++ Slave]
        C[Eclipser]
    end
    
    subgraph "Sync Manager"
        D[Sync Manager]
    end
    
    subgraph "Storage"
        E[Queue Dir<br/>Master]
        F[Shared Sync<br/>Directory]
        G[Queue Dir<br/>Slave]
        H[Eclipser<br/>Output]
    end
    
    A <--> D
    B <--> D
    C --> D
    
    D --> E
    D --> F
    D --> G
    D --> H
```

## 4. Grey Box Concolic Execution

```mermaid
graph TB
    subgraph "Grey Box Concolic Execution"
        subgraph "Core Components"
            A[Concrete Execution<br/>Eclipser]
            B[Symbolic Analysis]
            C[Constraint Solver]
        end
        
        subgraph "Support Components"
            D[Path Explorer]
            E[Input Generator]
            F[Coverage Tracker]
        end
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> A
```

## 5. Execution Model

```mermaid
graph TD
    A[Initial State] --> B[Concrete Execution<br/>Eclipser]
    B --> C[Symbolic State<br/>Tracking]
    C --> D[Constraint<br/>Collection]
    D --> E[Path<br/>Exploration]
    E --> F[New Input<br/>Generation]
    F --> B
```

## 6. Integration with Fuzzing Engines

```mermaid
graph LR
    A[Eclipser<br/>Symbolic] --> B[Input<br/>Generator]
    B --> C[AFL++<br/>Concrete]
    
    subgraph "Data Flow"
        D[Path<br/>Constraints]
        E[Constraint<br/>Solutions]
        F[Coverage<br/>Information]
    end
    
    A --> D
    B --> E
    C --> F
```

## 7. Sanitizer Integration Architecture

```mermaid
graph TB
    subgraph "Sanitizer Integration"
        subgraph "Sanitizer Layer"
            A[Address Sanitizer<br/>ASAN]
            B[Undefined Behavior<br/>Sanitizer UBSAN]
            C[Memory Sanitizer<br/>MSAN]
        end
        
        subgraph "Processing Layer"
            D[CASR Integration]
            E[Vulnerability Mapper]
            F[Report Processor]
        end
        
        subgraph "Output Layer"
            G[CWE Mapping]
            H[Severity Scoring]
            I[Variable Extraction]
        end
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> E
    D --> F
    
    E --> G
    E --> H
    F --> I
```

## 8. Sanitizer Types and Capabilities

```mermaid
graph LR
    subgraph "ASAN - Address Sanitizer"
        A1[Stack Buffer Overflow]
        A2[Heap Buffer Overflow]
        A3[Use After Free]
        A4[Double Free]
        A5[Memory Leaks]
    end
    
    subgraph "UBSAN - Undefined Behavior"
        B1[Integer Overflow]
        B2[Division by Zero]
        B3[Null Pointer Dereference]
        B4[Array Bounds Violations]
    end
    
    subgraph "MSAN - Memory Sanitizer"
        C1[Uninitialized Memory Reads]
        C2[Uninitialized Variable Usage]
        C3[Memory Initialization Issues]
    end
```

## 9. Integration Workflow

```mermaid
graph LR
    A[Compile with<br/>Sanitizers] --> B[Execute with<br/>Sanitizers]
    B --> C[Analyze<br/>Output]
    C --> D[Report<br/>Results]
    
    subgraph "Process Details"
        A1[Multiple Sanitizer<br/>Binaries]
        B1[Runtime<br/>Detection]
        C1[CASR<br/>Processing]
        D1[CWE<br/>Mapping]
    end
    
    A --> A1
    B --> B1
    C --> C1
    D --> D1
```

## 10. CASR Processing Pipeline

```mermaid
graph LR
    A[Raw Sanitizer<br/>Output] --> B[Input<br/>Processing]
    B --> C[Report<br/>Generation]
    C --> D[Deduplication]
    D --> E[Enrichment]
    E --> F[Structured<br/>Vulnerability Report]
```

## How to Convert These to Images:

### Option 1: Online Mermaid Editor
1. Go to: https://mermaid.live/
2. Copy any diagram code above
3. Paste into the editor
4. Click "Download PNG" or "Download SVG"

### Option 2: Mermaid CLI (Command Line)
```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Convert to PNG
mmdc -i diagram.mmd -o diagram.png

# Convert to SVG
mmdc -i diagram.mmd -o diagram.svg
```

### Option 3: GitHub Integration
- GitHub automatically renders Mermaid diagrams in markdown
- Just paste the code in your markdown file

### Option 4: VS Code Extension
- Install "Mermaid Preview" extension
- Right-click on .mmd file → "Open Preview"
- Export as image 