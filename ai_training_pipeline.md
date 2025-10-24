# AI Model Training Pipeline Diagram

## Purpose
Visualizes the end-to-end MLOps lifecycle from data gathering to model deployment, ensuring reproducible and automated model training.

## Diagram
```mermaid
flowchart LR
    subgraph DataAcquisition [Data Acquisition]
        A[Collect Market Prices]
        B[Scrape Agri News]
        C[Acquire Soil/Weather Data]
        D[User Interaction Logs<br>PostgreSQL]
    end

    subgraph DataPreparation [Data Preparation]
        E[Data Cleaning & Validation]
        F[Feature Engineering]
        G[Data Labeling]
    end

    subgraph Training [Model Training]
        H[Train Model]
        I[Hyperparameter Tuning]
        J[Model Evaluation]
    end

    subgraph Deployment [Deployment]
        K[Package Model]
        L[Integrate into Django App]
        M[Register Version]
    end

    DataAcquisition --> DataPreparation
    DataPreparation --> Training
    Training --> Deployment

    classDef data fill:#e1f5fe,stroke:#01579b
    classDef processing fill:#c8e6c9,stroke:#388e3c
    classDef training fill:#ffecb3,stroke:#ffa000
    classDef deployment fill:#ffcdd2,stroke:#d32f2f
    class A,B,C,D data
    class E,F,G processing
    class H,I,J training
    class K,L,M deployment
