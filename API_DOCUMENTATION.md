# API Documentation

This documentation provides details about the API endpoints for the dashboard application.

## Base URL

The base URL for all API endpoints is `/api/v1`.

---

## Authentication

### POST /auth/login

*   **Description**: Authenticates a user and returns a JWT token.
*   **Authorization**: Public.
*   **Request Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "your_password",
        "device_info": "Chrome on Windows"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
        "token": "your_jwt_token",
        "staff_id": "staff_uuid",
        "role": "staff_role",
        "is_admin": true/false,
        "expires_at": "timestamp"
    }
    ```
*   **Error Response (401 Unauthorized)**:
    ```json
    {
        "error": "Invalid credentials"
    }
    ```

### POST /auth/logout

*   **Description**: Logs out the current user by invalidating the session.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    {
        "message": "Successfully logged out"
    }
    ```
*   **Error Response (401 Unauthorized)**:
    ```json
    {
        "error": "User claims not found"
    }
    ```

### GET /auth/session

*   **Description**: Retrieves information about the current user's session.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    {
        "session_info": {
            "session_id": "session_uuid",
            "device_info": "Chrome on Windows",
            "ip_address": "127.0.0.1",
            "created_at": "timestamp",
            "expires_at": "timestamp"
        },
        "user_info": {
            "staff_id": "staff_uuid",
            "nama": "User Name",
            "email": "user@example.com",
            "role": "ADMIN"
        }
    }
    ```
*   **Error Response (401 Unauthorized)**:
    ```json
    {
        "error": "User claims not found"
    }
    ```

---

## Dashboard

### GET /dashboard/jobs

*   **Description**: Retrieves a list of all relevant jobs for the dashboard based on the logged-in user's role. The data is tailored for each role:
    *   **ADMIN**: Gets all jobs from all staff.
    *   **STAFF**: Gets only the jobs assigned to them.
    *   **KEUANGAN**: Gets all jobs from all staff, with an additional `invoice_status` field.
*   **Authorization**: Bearer Token.
*   **Query Parameters**: None.
*   **Success Response (200 OK)**:
    ```json
    {
        "jobs": [
            {
                "job_id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
                "job_type": "Annual",
                "client_name": "PT Sejahtera Abadi",
                "pic_name": "Budi Santoso",
                "status": "Dalam Pengerjaan",
                "invoice_status": "Sudah Ada", // Only for KEUANGAN role
                "job_date": "2024-01-01T00:00:00Z",
                "updated_at": "2025-09-08T10:00:00Z"
            },
            {
                "job_id": "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7",
                "job_type": "Monthly",
                "client_name": "CV Maju Jaya",
                "pic_name": "Citra Lestari",
                "status": "Selesai",
                "invoice_status": "Belum Ada", // Only for KEUANGAN role
                "job_date": "2025-08-01T00:00:00Z",
                "updated_at": "2025-09-05T14:30:00Z"
            }
        ],
        "total_jobs": 2,
        "jobs_by_status": {
            "Dalam Pengerjaan": 1,
            "Selesai": 1
        }
    }
    ```

---

## Staff

### GET /staffs

*   **Description**: Retrieves a list of all staff members.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    [
        {
            "staff_id": "staff_uuid_1",
            "nama": "Budi Santoso",
            "email": "budi.s@example.com",
            "role": "STAFF",
            "created_at": "2024-01-01T10:00:00Z",
            "updated_at": "2024-01-01T10:00:00Z"
        },
        {
            "staff_id": "staff_uuid_2",
            "nama": "Citra Lestari",
            "email": "citra.l@example.com",
            "role": "KEUANGAN",
            "created_at": "2024-01-05T11:00:00Z",
            "updated_at": "2024-01-05T11:00:00Z"
        }
    ]
    ```

### GET /staffs/:id

*   **Description**: Retrieves a single staff member by their ID.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    {
        "staff_id": "staff_uuid_1",
        "nama": "Budi Santoso",
        "email": "budi.s@example.com",
        "role": "STAFF",
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T10:00:00Z"
    }
    ```

### POST /staffs

*   **Description**: Creates a new staff member.
*   **Authorization**: Bearer Token.
*   **Request Body**:
    ```json
    {
        "nama": "New Staff Member",
        "email": "newstaff@sigmasamitra.com",
        "password": "Password123",
        "role": "Staff",
        "is_admin": false
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
        "staff_id": "new_staff_uuid",
        "nama": "New Staff Member",
        "email": "newstaff@sigmasamitra.com",
        "role": "STAFF",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
    ```

### PATCH /staffs/:id

*   **Description**: Updates a staff member's information.
*   **Authorization**: Bearer Token.
*   **Request Body**:
    ```json
    {
        "nama": "Updated Name",
        "email": "updateduser@example.com",
        "role": "ADMIN"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
        "staff_id": "staff_uuid",
        "nama": "Updated Name",
        "email": "updateduser@example.com",
        "role": "ADMIN",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
    ```

### DELETE /staffs/:id

*   **Description**: Deletes a staff member.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    {
        "message": "Staff deleted successfully"
    }
    ```

### PATCH /staffs/:id/password

*   **Description**: Changes a staff member's password.
*   **Authorization**: Bearer Token.
*   **Request Body**:
    ```json
    {
        "new_password": "new_secure_password"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
        "message": "Password changed successfully"
    }
    ```

---

## Clients

### GET /clients

*   **Description**: Retrieves a list of all clients.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    [
        {
            "client_id": "client_uuid_1",
            "client_name": "PT. Example Jaya",
            "npwp_client": "12.345.678.9-000.111",
            "address_client": "Jl. Contoh No. 1, Jakarta",
            "membership_status": "active",
            "phone_client": "081234567890",
            "email_client": "pt.example@example.com",
            "pic_client": "John Doe",
            "djp_online_username": "djp_john",
            "coretax_username": "core_john",
            "coretax_password": "********",
            "pic_staff_sigma_id": "staff_uuid_1",
            "djp_online_password": "********",
            "client_category": "corporate",
            "pph_final_umkm": true,
            "pph_25": false,
            "pph_21": true,
            "pph_unifikasi": false,
            "ppn": true,
            "spt_tahunan": true,
            "pelaporan_deviden": false,
            "laporan_keuangan": true,
            "investasi_deviden": false,
            "tanggal_terdaftar": "2023-01-01",
            "no_sk_terdaftar": "SK-001/2023",
            "tanggal_pengukuhan_pkp": "2023-01-15",
            "no_sk_pengukuhan_pkp": "PKP-001/2023",
            "created_at": "2023-01-01T00:00:00Z",
            "updated_at": "2023-01-01T00:00:00Z"
        },
        {
            "client_id": "client_uuid_2",
            "client_name": "CV. Mandiri Sejahtera",
            "npwp_client": "98.765.432.1-000.222",
            "address_client": "Jl. Raya No. 2, Bandung",
            "membership_status": "inactive",
            "phone_client": "081298765432",
            "email_client": "cv.mandiri@example.com",
            "pic_client": "Jane Smith",
            "djp_online_username": "djp_jane",
            "coretax_username": "core_jane",
            "coretax_password": "********",
            "pic_staff_sigma_id": "staff_uuid_2",
            "djp_online_password": "********",
            "client_category": "umkm",
            "pph_final_umkm": false,
            "pph_25": true,
            "pph_21": false,
            "pph_unifikasi": true,
            "ppn": false,
            "spt_tahunan": false,
            "pelaporan_deviden": true,
            "laporan_keuangan": false,
            "investasi_deviden": true,
            "tanggal_terdaftar": "2023-02-01",
            "no_sk_terdaftar": "SK-002/2023",
            "tanggal_pengukuhan_pkp": "2023-02-10",
            "no_sk_pengukuhan_pkp": "PKP-002/2023",
            "created_at": "2023-02-01T00:00:00Z",
            "updated_at": "2023-02-01T00:00:00Z"
        }
    ]
    ```

### GET /clients/:id

*   **Description**: Retrieves a single client by their ID.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    {
        "client_id": "client_uuid_1",
        "client_name": "PT. Example Jaya",
        "npwp_client": "12.345.678.9-000.111",
        "address_client": "Jl. Contoh No. 1, Jakarta",
        "membership_status": "active",
        "phone_client": "081234567890",
        "email_client": "pt.example@example.com",
        "pic_client": "John Doe",
        "djp_online_username": "djp_john",
        "coretax_username": "core_john",
        "coretax_password": "********",
        "pic_staff_sigma_id": "staff_uuid_1",
        "djp_online_password": "********",
        "client_category": "corporate",
        "pph_final_umkm": true,
        "pph_25": false,
        "pph_21": true,
        "pph_unifikasi": false,
        "ppn": true,
        "spt_tahunan": true,
        "pelaporan_deviden": false,
        "laporan_keuangan": true,
        "investasi_deviden": false,
        "tanggal_terdaftar": "2023-01-01",
        "no_sk_terdaftar": "SK-001/2023",
        "tanggal_pengukuhan_pkp": "2023-01-15",
        "no_sk_pengukuhan_pkp": "PKP-001/2023",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
    }
    ```

### POST /clients

*   **Description**: Creates a new client.
*   **Authorization**: Bearer Token, Role: `ADMIN`.
*   **Request Body**:
    ```json
    {
        "client_name": "New Client",
        "npwp_client": "11.111.111.1-111.000",
        "address_client": "Jl. Test No. 123, Jakarta",
        "membership_status": "active",
        "phone_client": "021-1234567",
        "email_client": "test@testclient.com",
        "pic_client": "Test Person",
        "djp_online_username": "testuser",
        "coretax_username": "testcoretax",
        "coretax_password": "password123",
        "pic_staff_sigma_id": "staff_uuid_example",
        "djp_online_password": "djppassword",
        "client_category": "corporate",
        "pph_final_umkm": false,
        "pph_25": true,
        "pph_21": true,
        "pph_unifikasi": false,
        "ppn": true,
        "spt_tahunan": true,
        "pelaporan_deviden": false,
        "laporan_keuangan": true,
        "investasi_deviden": false,
        "tanggal_terdaftar": "2024-01-01",
        "no_sk_terdaftar": "SK-001/2024",
        "tanggal_pengukuhan_pkp": "2024-01-15",
        "no_sk_pengukuhan_pkp": "PKP-001/2024"
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
        "client_id": "new_client_uuid",
        "client_name": "New Client",
        "npwp_client": "11.111.111.1-111.000",
        "address_client": "Jl. Test No. 123, Jakarta",
        "membership_status": "active",
        "phone_client": "021-1234567",
        "email_client": "test@testclient.com",
        "pic_client": "Test Person",
        "djp_online_username": "testuser",
        "coretax_username": "testcoretax",
        "coretax_password": "********",
        "pic_staff_sigma_id": "staff_uuid_example",
        "djp_online_password": "********",
        "client_category": "corporate",
        "pph_final_umkm": false,
        "pph_25": true,
        "pph_21": true,
        "pph_unifikasi": false,
        "ppn": true,
        "spt_tahunan": true,
        "pelaporan_deviden": false,
        "laporan_keuangan": true,
        "investasi_deviden": false,
        "tanggal_terdaftar": "2024-01-01",
        "no_sk_terdaftar": "SK-001/2024",
        "tanggal_pengukuhan_pkp": "2024-01-15",
        "no_sk_pengukuhan_pkp": "PKP-001/2024",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
    ```

### PATCH /clients/:id

*   **Description**: Updates a client's information.
*   **Authorization**: Bearer Token.
*   **Request Body**:
    ```json
    {
        "client_name": "Updated Client Name",
        "pic_name": "Jane Smith",
        "pic_contact": "081122334455",
        "pic_email": "jane.smith@client.com",
        "staff_id": "new_staff_uuid"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
        "client_id": "client_uuid",
        "client_name": "Updated Client Name",
        "pic_name": "Jane Smith",
        "pic_contact": "081122334455",
        "pic_email": "jane.smith@client.com",
        "staff_id": "new_staff_uuid",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
    ```

### DELETE /clients/:id

*   **Description**: Deletes a client.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    {
        "message": "Client deleted successfully"
    }
    ```

### POST /clients/:id/generate-invoice

*   **Description**: Generates an invoice for a client.
*   **Authorization**: Bearer Token, Roles: `ADMIN`, `KEUANGAN`.
*   **Request Body**:
    ```json
    {
        "items": [
            {
                "job_id": "job_uuid_1",
                "description": "Monthly Tax Report - Jan 2024",
                "price": 1500000
            },
            {
                "job_id": "job_uuid_2",
                "description": "Annual Tax Report - 2023",
                "price": 5000000
            }
        ],
        "invoice_date": "2025-09-04",
        "due_date": "2025-10-04",
        "notes": "Invoice for Q3 2024 services"
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
        "invoice_id": "invoice_uuid",
        "invoice_number": "INV/20250904/001",
        "client_id": "client_uuid",
        "assigned_staff_id": null,
        "invoice_date": "2025-09-04T00:00:00Z",
        "due_date": "2025-10-04T00:00:00Z",
        "total_amount": 6500000,
        "current_paid_amount": 0,
        "status": "Pending",
        "notes": "Invoice for Q3 2024 services",
        "created_at": "2025-09-04T12:00:00Z",
        "updated_at": "2025-09-04T12:00:00Z",
        "client_name": "PT. Example Jaya",
        "npwp_client": "12.345.678.9-000.111",
        "assigned_staff_name": null,
        "line_items": [
            {
                "line_item_id": "line_item_uuid_1",
                "invoice_id": "invoice_uuid",
                "description": "Monthly Tax Report - Jan 2024",
                "quantity": 1,
                "unit_price": 1500000,
                "amount": 1500000,
                "related_job_type": "Monthly",
                "related_job_id": "job_uuid_1",
                "total_paid": 0,
                "payments": [],
                "created_at": "2025-09-04T12:00:00Z",
                "updated_at": "2025-09-04T12:00:00Z"
            },
            {
                "line_item_id": "line_item_uuid_2",
                "invoice_id": "invoice_uuid",
                "description": "Annual Tax Report - 2023",
                "quantity": 1,
                "unit_price": 5000000,
                "amount": 5000000,
                "related_job_type": "Annual",
                "related_job_id": "job_uuid_2",
                "total_paid": 0,
                "payments": [],
                "created_at": "2025-09-04T12:00:00Z",
                "updated_at": "2025-09-04T12:00:00Z"
            }
        ]
    }
    ```

---

## Job Types (Monthly, Annual, SP2DK, etc.)

This section describes the general structure for managing various job types. Replace `{job-type}` with the appropriate endpoint (e.g., `annual`, `monthly`, `sp2dk`, `pemeriksaan`, `project`, `dividend`).

### GET /{job-type}-jobs

*   **Description**: Retrieves a list of all jobs of a specific type.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    [
        {
            "job_id": "job_uuid_1",
            "client_id": "client_uuid_1",
            "client_name": "PT. Example Jaya",
            "npwp_client": "12.345.678.9-000.111",
            "job_month": 1,
            "job_year": 2024,
            "assigned_pic_staff_sigma_id": "staff_uuid_1",
            "assigned_pic_staff_sigma_name": "Budi Santoso",
            "overall_status": "Dalam Pengerjaan",
            "correction_status": "NORMAL",
            "job_type": "NORMAL",
            "correction_type": null,
            "original_job_id": null,
            "proof_of_work_url": null,
            "created_at": "2024-01-01T10:00:00Z",
            "updated_at": "2024-01-01T10:00:00Z",
            "tax_reports": [
                {
                    "report_id": "report_uuid_1",
                    "job_id": "job_uuid_1",
                    "tax_type": "PPN",
                    "billing_code": "PPN-001",
                    "payment_date": "2024-01-31T00:00:00Z",
                    "payment_amount": 1000000,
                    "report_status": "pending",
                    "report_date": "2024-01-31T00:00:00Z",
                    "created_at": "2024-01-01T10:00:00Z",
                    "updated_at": "2024-01-01T10:00:00Z"
                }
            ]
        },
        {
            "job_id": "job_uuid_2",
            "client_id": "client_uuid_2",
            "client_name": "CV. Mandiri Sejahtera",
            "npwp_client": "98.765.432.1-000.222",
            "job_month": 2,
            "job_year": 2024,
            "assigned_pic_staff_sigma_id": "staff_uuid_2",
            "assigned_pic_staff_sigma_name": "Citra Lestari",
            "overall_status": "Selesai",
            "correction_status": "NORMAL",
            "job_type": "NORMAL",
            "correction_type": null,
            "original_job_id": null,
            "proof_of_work_url": "http://example.com/proof/monthly_job_2.pdf",
            "created_at": "2024-02-01T11:00:00Z",
            "updated_at": "2024-02-15T14:00:00Z",
            "tax_reports": [
                {
                    "report_id": "report_uuid_2",
                    "job_id": "job_uuid_2",
                    "tax_type": "PPH21",
                    "billing_code": "PPH21-001",
                    "payment_date": "2024-02-28T00:00:00Z",
                    "payment_amount": 2500000,
                    "report_status": "completed",
                    "report_date": "2024-02-28T00:00:00Z",
                    "created_at": "2024-02-01T11:00:00Z",
                    "updated_at": "2024-02-28T14:00:00Z"
                }
            ]
        }
    ]
    ```

### GET /{job-type}-jobs/:id

*   **Description**: Retrieves a single job by ID.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    {
        "job_id": "job_uuid_1",
        "client_id": "client_uuid_1",
        "client_name": "PT. Example Jaya",
        "npwp_client": "12.345.678.9-000.111",
        "job_month": 1,
        "job_year": 2024,
        "assigned_pic_staff_sigma_id": "staff_uuid_1",
        "assigned_pic_staff_sigma_name": "Budi Santoso",
        "overall_status": "Dalam Pengerjaan",
        "correction_status": "NORMAL",
        "job_type": "NORMAL",
        "correction_type": null,
        "original_job_id": null,
        "proof_of_work_url": null,
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T10:00:00Z",
        "tax_reports": [
            {
                "report_id": "report_uuid_1",
                "job_id": "job_uuid_1",
                "tax_type": "PPN",
                "billing_code": "PPN-001",
                "payment_date": "2024-01-31T00:00:00Z",
                "payment_amount": 1000000,
                "report_status": "pending",
                "report_date": "2024-01-31T00:00:00Z",
                "created_at": "2024-01-01T10:00:00Z",
                "updated_at": "2024-01-01T10:00:00Z"
            }
        ]
    }
    ```

### POST /{job-type}-jobs

*   **Description**: Creates a new job.
*   **Authorization**: Bearer Token.
*   **Request Body**:
    ```json
    {
        "client_id": "client_uuid_example",
        "job_month": 12, // For MonthlyJob
        "job_year": 2024,
        "assigned_pic_staff_sigma_id": "staff_uuid_example",
        "overall_status": "Dalam Pengerjaan", // Optional, default is "Dalam Pengerjaan"
        "correction_status": "NORMAL", // Optional, default is "NORMAL"
        "job_type": "NORMAL", // Optional, default is "NORMAL"
        "correction_type": null, // Required for CORRECTION job_type
        "original_job_id": null, // Required for CORRECTION job_type
        "tax_reports": [
            {
                "tax_type": "PPN",
                "billing_code": "PPN-001",
                "payment_date": "2024-12-31",
                "payment_amount": 1000000,
                "report_status": "pending",
                "report_date": "2024-12-31"
            }
        ] // For MonthlyJob, AnnualJob, DividendJob
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
        "job_id": "new_job_uuid",
        "client_id": "client_uuid_example",
        "job_month": 12,
        "job_year": 2024,
        "assigned_pic_staff_sigma_id": "staff_uuid_example",
        "assigned_pic_staff_sigma_name": "Staff Name Example",
        "overall_status": "Dalam Pengerjaan",
        "correction_status": "NORMAL",
        "job_type": "NORMAL",
        "correction_type": null,
        "original_job_id": null,
        "proof_of_work_url": null,
        "created_at": "2024-12-01T10:00:00Z",
        "updated_at": "2024-12-01T10:00:00Z",
        "tax_reports": [
            {
                "report_id": "new_report_uuid",
                "job_id": "new_job_uuid",
                "tax_type": "PPN",
                "billing_code": "PPN-001",
                "payment_date": "2024-12-31T00:00:00Z",
                "payment_amount": 1000000,
                "report_status": "pending",
                "report_date": "2024-12-31T00:00:00Z",
                "created_at": "2024-12-01T10:00:00Z",
                "updated_at": "2024-12-01T10:00:00Z"
            }
        ]
    }
    ```

### PATCH /{job-type}-jobs/:id

*   **Description**: Updates a job.
*   **Authorization**: Bearer Token.
*   **Request Body**:
    ```json
    {
        "overall_status": "Selesai",
        "assigned_pic_staff_sigma_id": "another_staff_uuid",
        "correction_type": "P1" // For correction jobs
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
        "job_id": "job_uuid_example",
        "client_id": "client_uuid_example",
        "client_name": "PT. Example Jaya",
        "npwp_client": "12.345.678.9-000.111",
        "job_month": 1,
        "job_year": 2024,
        "assigned_pic_staff_sigma_id": "another_staff_uuid",
        "assigned_pic_staff_sigma_name": "Another Staff Name",
        "overall_status": "Selesai",
        "correction_status": "P1",
        "job_type": "CORRECTION",
        "correction_type": "P1",
        "original_job_id": "original_job_uuid",
        "proof_of_work_url": "http://example.com/proof/updated_job.pdf",
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-05T15:00:00Z",
        "tax_reports": []
    }
    ```

### DELETE /{job-type}-jobs/:id

*   **Description**: Deletes a job.
*   **Authorization**: Bearer Token.
*   **Success Response (200 OK)**:
    ```json
    {
        "message": "Job deleted successfully"
    }
    ```

### PATCH /{job-type}-jobs/:id/status

*   **Description**: Updates the status of a job and optionally uploads a proof of work file.
*   **Authorization**: Bearer Token.
*   **Request Body (multipart/form-data)**:
    ```
    overall_status: Selesai
    proof_of_work_pdf: [file]
    ```
*   **Success Response (200 OK)**:
    ```json
    {
        "job_id": "job_uuid_example",
        "client_id": "client_uuid_example",
        "client_name": "PT. Example Jaya",
        "npwp_client": "12.345.678.9-000.111",
        "job_month": 1,
        "job_year": 2024,
        "assigned_pic_staff_sigma_id": "staff_uuid_example",
        "assigned_pic_staff_sigma_name": "Staff Name Example",
        "overall_status": "Selesai",
        "correction_status": "NORMAL",
        "job_type": "NORMAL",
        "correction_type": null,
        "original_job_id": null,
        "proof_of_work_url": "/uploads/PT_Example_Jaya/monthly/2024/01/monthly_2024-01-05_15-00-00_v1.pdf",
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-05T15:00:00Z",
        "tax_reports": []
    }
    ```

---

## Invoices

### GET /invoices

*   **Description**: Retrieves a list of all invoices.
*   **Authorization**: Bearer Token, Roles: `ADMIN`, `KEUANGAN`.
*   **Success Response (200 OK)**:
    ```json
    [
        {
            "invoice_id": "invoice_uuid_1",
            "invoice_number": "INV/20250901/001",
            "client_id": "client_uuid_1",
            "assigned_staff_id": "staff_uuid_1",
            "invoice_date": "2025-09-01T00:00:00Z",
            "due_date": "2025-10-01T00:00:00Z",
            "total_amount": 5000000,
            "current_paid_amount": 2000000,
            "status": "Partially Paid",
            "notes": "Monthly services for August",
            "created_at": "2025-09-01T10:00:00Z",
            "updated_at": "2025-09-05T11:00:00Z",
            "client_name": "PT. Example Jaya",
            "npwp_client": "12.345.678.9-000.111",
            "assigned_staff_name": "Budi Santoso",
            "line_items": []
        },
        {
            "invoice_id": "invoice_uuid_2",
            "invoice_number": "INV/20250902/002",
            "client_id": "client_uuid_2",
            "assigned_staff_id": null,
            "invoice_date": "2025-09-02T00:00:00Z",
            "due_date": "2025-10-02T00:00:00Z",
            "total_amount": 10000000,
            "current_paid_amount": 10000000,
            "status": "Paid",
            "notes": "Annual services for 2025",
            "created_at": "2025-09-02T10:00:00Z",
            "updated_at": "2025-09-02T10:00:00Z",
            "client_name": "CV. Mandiri Sejahtera",
            "npwp_client": "98.765.432.1-000.222",
            "assigned_staff_name": null,
            "line_items": []
        }
    ]
    ```

### GET /invoices/:id

*   **Description**: Retrieves a single invoice by ID.
*   **Authorization**: Bearer Token, Roles: `ADMIN`, `KEUANGAN`.
*   **Success Response (200 OK)**:
    ```json
    {
        "invoice_id": "invoice_uuid_1",
        "invoice_number": "INV/20250901/001",
        "client_id": "client_uuid_1",
        "assigned_staff_id": "staff_uuid_1",
        "invoice_date": "2025-09-01T00:00:00Z",
        "due_date": "2025-10-01T00:00:00Z",
        "total_amount": 5000000,
        "current_paid_amount": 2000000,
        "status": "Partially Paid",
        "notes": "Monthly services for August",
        "created_at": "2025-09-01T10:00:00Z",
        "updated_at": "2025-09-05T11:00:00Z",
        "client_name": "PT. Example Jaya",
        "npwp_client": "12.345.678.9-000.111",
        "assigned_staff_name": "Budi Santoso",
        "line_items": [
            {
                "line_item_id": "line_item_uuid_1",
                "invoice_id": "invoice_uuid_1",
                "description": "Monthly Tax Report - Jan 2024",
                "quantity": 1,
                "unit_price": 1500000,
                "amount": 1500000,
                "related_job_type": "Monthly",
                "related_job_id": "job_uuid_1",
                "total_paid": 0,
                "payments": [
                    {
                        "payment_id": "payment_uuid_1",
                        "invoice_id": "invoice_uuid_1",
                        "payment_date": "2025-09-05T00:00:00Z",
                        "amount_paid": 2000000,
                        "payment_method": "Bank Transfer",
                        "notes": "Partial payment",
                        "recorded_by_staff_id": "staff_uuid_1",
                        "created_at": "2025-09-05T11:00:00Z"
                    }
                ],
                "created_at": "2025-09-01T10:00:00Z",
                "updated_at": "2025-09-01T10:00:00Z"
            }
        ]
    }
    ```

### PATCH /invoices/:id

*   **Description**: Updates an invoice.
*   **Authorization**: Bearer Token, Roles: `ADMIN`, `KEUANGAN`.
*   **Request Body**:
    ```json
    {
        "due_date": "2025-10-15",
        "status": "Paid",
        "notes": "Updated notes for invoice",
        "assigned_staff_id": "staff_uuid_example"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
        "invoice_id": "invoice_uuid_example",
        "invoice_number": "INV/20250901/001",
        "client_id": "client_uuid_example",
        "assigned_staff_id": "staff_uuid_example",
        "invoice_date": "2025-09-01T00:00:00Z",
        "due_date": "2025-10-15T00:00:00Z",
        "total_amount": 5000000,
        "current_paid_amount": 5000000,
        "status": "Paid",
        "notes": "Updated notes for invoice",
        "created_at": "2025-09-01T10:00:00Z",
        "updated_at": "2025-09-05T11:00:00Z",
        "client_name": "PT. Example Jaya",
        "npwp_client": "12.345.678.9-000.111",
        "assigned_staff_name": "Staff Name Example",
        "line_items": []
    }
    ```

### POST /invoices/:id/payments

*   **Description**: Records a payment for an invoice.
*   **Authorization**: Bearer Token, Roles: `ADMIN`, `KEUANGAN`.
*   **Request Body**:
    ```json
    {
        "payment_date": "2025-09-04",
        "amount_paid": 1000000,
        "payment_method": "bank_transfer",
        "notes": "Partial payment for invoice"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
        "payment_id": "new_payment_uuid",
        "invoice_id": "invoice_uuid_example",
        "payment_date": "2025-09-04T00:00:00Z",
        "amount_paid": 1000000,
        "payment_method": "bank_transfer",
        "notes": "Partial payment for invoice",
        "recorded_by_staff_id": "staff_uuid_example",
        "created_at": "2025-09-04T12:00:00Z"
    }
    ```

### GET /payments

*   **Description**: Retrieves a list of all payments.
*   **Authorization**: Bearer Token, Roles: `ADMIN`, `KEUANGAN`.
*   **Query Parameters**:
    *   `client_id` (optional): Filter payments by client ID.
    *   `start_date` (optional): Filter payments from this date (YYYY-MM-DD).
    *   `end_date` (optional): Filter payments up to this date (YYYY-MM-DD).
*   **Success Response (200 OK)**:
    ```json
    [
        {
            "payment_id": "payment_uuid_1",
            "invoice_id": "invoice_uuid_1",
            "payment_date": "2025-09-05T00:00:00Z",
            "amount_paid": 2000000,
            "payment_method": "Bank Transfer",
            "notes": "Partial payment for invoice 001",
            "recorded_by_staff_id": "staff_uuid_1",
            "invoice_number": "INV/20250901/001",
            "client_id": "client_uuid_1",
            "client_name": "PT. Example Jaya"
        },
        {
            "payment_id": "payment_uuid_2",
            "invoice_id": "invoice_uuid_2",
            "payment_date": "2025-09-02T00:00:00Z",
            "amount_paid": 10000000,
            "payment_method": "Bank Transfer",
            "notes": "Full payment for invoice 002",
            "recorded_by_staff_id": "staff_uuid_2",
            "invoice_number": "INV/20250902/002",
            "client_id": "client_uuid_2",
            "client_name": "CV. Mandiri Sejahtera"
        }
    ]
    ```

### GET /invoices/:id/pdf

*   **Description**: Generates and retrieves a PDF version of the invoice.
*   **Authorization**: Bearer Token, Roles: `ADMIN`, `KEUANGAN`.
*   **Success Response (200 OK)**: Binary PDF file.

