# WeaveHealth HIMS - UML Class Diagram

This document contains the UML Class Diagram representing the core Entity-Relationship model of the WeaveHealth HIMS backend database architecture.

```mermaid
classDiagram
    %% Core Entities
    class User {
        +ObjectId _id
        +String firstName
        +String lastName
        +String email
        +String password
        +String role
        +ObjectId organizationId
        +String phone
        +Boolean isActive
        +matchPassword()
    }

    class Organization {
        +ObjectId _id
        +String name
        +String type
        +String email
        +String phone
        +Object address
        +Boolean isVerified
        +ObjectId admin
        +Boolean isActive
    }

    %% Clinical Entities
    class Appointment {
        +ObjectId _id
        +ObjectId patient
        +ObjectId doctor
        +ObjectId organizationId
        +Date date
        +String startTime
        +String endTime
        +String type
        +String status
        +String chiefComplaint
    }

    class Prescription {
        +ObjectId _id
        +ObjectId patient
        +ObjectId doctor
        +ObjectId organizationId
        +ObjectId appointment
        +List medications
        +String diagnosis
        +String status
        +Date expiresAt
    }

    class LabReport {
        +ObjectId _id
        +ObjectId patient
        +ObjectId orderedBy
        +ObjectId organizationId
        +ObjectId processedBy
        +String testType
        +String priority
        +String status
        +String results
        +Boolean isCritical
        +Date completedAt
    }

    class Consent {
        +ObjectId _id
        +ObjectId patient
        +ObjectId doctor
        +ObjectId organizationId
        +String status
        +Date expiresAt
    }

    %% Relationships
    Organization "1" -- "1" User : has Admin
    User "*" -- "1" Organization : belongs to
    
    User "1" -- "*" Appointment : booked as Patient
    User "1" -- "*" Appointment : assigned as Doctor
    Appointment "*" -- "1" Organization : belongs to
    
    User "1" -- "*" Prescription : given to Patient
    User "1" -- "*" Prescription : prescribed by Doctor
    Prescription "*" -- "1" Appointment : linked to
    Prescription "*" -- "1" Organization : belongs to
    
    User "1" -- "*" LabReport : belongs to Patient
    User "1" -- "*" LabReport : ordered by Doctor
    User "1" -- "*" LabReport : processed by Lab Tech
    LabReport "*" -- "1" Organization : belongs to

    User "1" -- "*" Consent : granted by Patient
    User "1" -- "*" Consent : granted to Doctor
    Consent "*" -- "1" Organization : applies to
```

## Description of Relationships

1. **User and Organization:** A user belongs to a specific organization (hospital/clinic), unless they are a Super Admin or a global Patient. An organization has exactly one Admin user.
2. **Appointments:** Connect a Patient (User) and a Doctor (User) within the context of a specific Organization.
3. **Prescriptions:** Issued by a Doctor to a Patient. It is often linked directly to an existing Appointment.
4. **Lab Reports:** Ordered by a Doctor for a Patient, and eventually processed by a Lab Technician (User). Always scoped to an Organization.
5. **Consent:** Represents data privacy and sharing agreements, where a Patient grants access to their medical records to a specific Doctor or Organization.
