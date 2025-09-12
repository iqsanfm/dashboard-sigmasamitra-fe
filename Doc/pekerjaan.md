# Dokumentasi Alur Pekerjaan

Dokumen ini menjelaskan alur kerja untuk semua jenis pekerjaan yang dikelola dalam sistem, termasuk detail teknis dan contoh format JSON untuk komunikasi antara backend dan frontend.

## Ringkasan Status

- `overall_status`: Status keseluruhan dari sebuah pekerjaan. Nilai yang mungkin adalah:
  - `Belum Dikerjakan`
  - `Dikerjakan`
  - `Revisi`
  - `Selesai`
  - `Dibatalkan`

## 1. Pekerjaan Bulanan (Monthly Job)

Pekerjaan untuk pelaporan pajak bulanan (SPT Masa). Pekerjaan ini memiliki alur "Pembetulan" yang paling jelas.

### Alur Pembetulan

Ketika ada kesalahan pada laporan yang sudah `Selesai`, sebuah pekerjaan baru dengan tipe `CORRECTION` dibuat.

1.  **Pekerjaan Normal**: Dibuat pertama kali. `job_type` adalah `"NORMAL"`.
2.  **Pekerjaan Pembetulan**: Jika pekerjaan normal perlu dikoreksi, buat entri pekerjaan baru dengan:
    *   `job_type`: `"CORRECTION"`
    *   `correction_type`: Tipe pembetulan (misal: `"P1"`, `"P2"`).
    *   `original_job_id`: `job_id` dari pekerjaan normal yang dikoreksi.

### Contoh JSON: GET `/monthly-jobs/{job_id}`

```json
{
    "job_id": "job_monthly_a8aef2b4-3e5c-4bbf-9c29-4f6d3e6b4e4a",
    "client_id": "client_a1b2c3d4",
    "client_name": "PT Klien Sejahtera",
    "npwp_client": "998877665544332211",
    "job_month": 8,
    "job_year": 2025,
    "assigned_pic_staff_sigma_id": "staff_s_01",
    "assigned_pic_staff_sigma_name": "Budi Staff",
    "overall_status": "Selesai",
    "correction_status": "Ada Pembetulan",
    "job_type": "NORMAL",
    "correction_type": null,
    "original_job_id": null,
    "proof_of_work_url": "https://link.ke/bukti/kerja.pdf",
    "created_at": "2025-09-10T10:00:00Z",
    "updated_at": "2025-09-11T11:00:00Z",
    "tax_reports": [
        {
            "report_id": "report_monthly_b9bdf3c5-4f6d-4ccf-ad3a-5g7e4f7c5f5b",
            "job_id": "job_monthly_a8aef2b4-3e5c-4bbf-9c29-4f6d3e6b4e4a",
            "tax_type": "PPN",
            "billing_code": "820250912345678",
            "payment_date": "2025-09-10",
            "payment_amount": 1500000,
            "report_status": "Sudah Lapor",
            "report_date": "2025-09-11",
            "created_at": "2025-09-10T10:00:00Z",
            "updated_at": "2025-09-11T11:00:00Z"
        }
    ]
}
```

### Contoh JSON: POST `/monthly-jobs` (Pekerjaan Normal)

```json
{
    "client_id": "client_a1b2c3d4",
    "job_month": 9,
    "job_year": 2025,
    "assigned_pic_staff_sigma_id": "staff_s_01",
    "tax_reports": [
        {
            "tax_type": "PPN",
            "billing_code": "820251012345678",
            "payment_date": "2025-10-10",
            "payment_amount": 1600000,
            "report_status": "Belum Lapor",
            "report_date": null
        }
    ]
}
```

### Contoh JSON: POST `/monthly-jobs` (Pekerjaan Pembetulan)

Membuat pembetulan untuk pekerjaan dengan ID `job_monthly_a8aef2b4-3e5c-4bbf-9c29-4f6d3e6b4e4a`.

```json
{
    "client_id": "client_a1b2c3d4",
    "job_month": 8,
    "job_year": 2025,
    "assigned_pic_staff_sigma_id": "staff_s_01",
    "correction_type": "P1",
    "original_job_id": "job_monthly_a8aef2b4-3e5c-4bbf-9c29-4f6d3e6b4e4a",
    "tax_reports": [
        {
            "tax_type": "PPN",
            "billing_code": "820250987654321",
            "payment_date": "2025-09-15",
            "payment_amount": 1550000,
            "report_status": "Belum Lapor",
            "report_date": null
        }
    ]
}
```

---

## 2. Pekerjaan Tahunan (Annual Job)

Pekerjaan untuk pelaporan pajak tahunan (SPT Tahunan). Alur pembetulannya mirip dengan pekerjaan bulanan.

### Alur Pembetulan

Sama seperti `MonthlyJob`, pembetulan ditandai dengan `job_type: "CORRECTION"`, `correction_type`, dan `original_job_id`.

### Contoh JSON: GET `/annual-jobs/{job_id}`

```json
{
    "job_id": "job_annual_c1c2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    "client_id": "client_a1b2c3d4",
    "client_name": "PT Klien Sejahtera",
    "npwp_client": "998877665544332211",
    "job_year": 2024,
    "assigned_pic_staff_sigma_id": "staff_s_02",
    "assigned_pic_staff_sigma_name": "Citra Staff",
    "overall_status": "Selesai",
    "correction_status": "Tidak Ada",
    "job_type": "NORMAL",
    "correction_type": null,
    "original_job_id": null,
    "proof_of_work_url": null,
    "created_at": "2025-04-01T09:00:00Z",
    "updated_at": "2025-04-15T14:00:00Z",
    "tax_reports": [
        {
            "report_id": "report_annual_d1d2d3e4",
            "job_id": "job_annual_c1c2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
            "billing_code": "920250412345678",
            "payment_date": "2025-04-10",
            "payment_amount": 5000000,
            "report_date": "2025-04-12",
            "report_status": "Sudah Lapor",
            "created_at": "2025-04-01T09:00:00Z",
            "updated_at": "2025-04-15T14:00:00Z"
        }
    ]
}
```

### Contoh JSON: POST `/annual-jobs` (Pekerjaan Normal)

```json
{
    "client_id": "client_a1b2c3d4",
    "job_year": 2025,
    "assigned_pic_staff_sigma_id": "staff_s_02",
    "tax_report": {
        "billing_code": "920260411223344",
        "payment_date": null,
        "payment_amount": null,
        "report_status": "Belum Lapor",
        "report_date": null
    }
}
```

### Contoh JSON: POST `/annual-jobs` (Pekerjaan Pembetulan)

```json
{
    "client_id": "client_a1b2c3d4",
    "job_year": 2024,
    "assigned_pic_staff_sigma_id": "staff_s_02",
    "original_job_id": "job_annual_c1c2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    "correction_type": "P1",
    "tax_report": {
        "billing_code": "920250499887766",
        "payment_date": null,
        "payment_amount": 5100000,
        "report_status": "Belum Lapor",
        "report_date": null
    }
}
```

---

## 3. Pekerjaan Pemeriksaan (Pemeriksaan Job)

Pekerjaan yang terkait dengan proses pemeriksaan pajak.

### Contoh JSON: GET `/pemeriksaan-jobs/{job_id}`

```json
{
    "job_id": "job_pemeriksaan_e1e2e3f4",
    "client_id": "client_b2c3d4e5",
    "client_name": "CV Maju Jaya",
    "npwp_client": "112233445566778899",
    "assigned_pic_staff_sigma_id": "staff_s_03",
    "assigned_pic_staff_sigma_name": "Dedi Staff",
    "contract_no": "KTR/PEM/001/2025",
    "contract_date": "2025-01-20",
    "sp2_no": "SP2/001/2025",
    "sp2_date": "2025-02-01",
    "skp_no": "SKP/001/2025",
    "skp_date": "2025-08-15",
    "overall_status": "Selesai",
    "correction_status": "Tidak Ada",
    "proof_of_work_url": "https://link.ke/bukti/pemeriksaan.pdf",
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-08-16T11:00:00Z"
}
```

### Contoh JSON: POST `/pemeriksaan-jobs`

```json
{
    "client_id": "client_b2c3d4e5",
    "assigned_pic_staff_sigma_id": "staff_s_03",
    "contract_no": "KTR/PEM/002/2025",
    "contract_date": "2025-03-10",
    "sp2_no": "SP2/002/2025",
    "sp2_date": "2025-03-20",
    "overall_status": "Dikerjakan"
}
```

---

## 4. Pekerjaan SP2DK (SP2DK Job)

Pekerjaan yang terkait dengan Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK).

### Contoh JSON: GET `/sp2dk-jobs/{job_id}`

```json
{
    "job_id": "job_sp2dk_f1f2f3g4",
    "client_id": "client_c3d4e5f6",
    "client_name": "UD Lancar Abadi",
    "npwp_client": "223344556677889900",
    "assigned_pic_staff_sigma_id": "staff_s_04",
    "assigned_pic_staff_sigma_name": "Eka Staff",
    "contract_no": "KTR/SP2DK/001/2025",
    "contract_date": "2025-05-10",
    "sp2dk_no": "SP2DK/001/2025",
    "sp2dk_date": "2025-05-15",
    "bap2dk_no": "BAP2DK/001/2025",
    "bap2dk_date": "2025-06-20",
    "payment_date": "2025-06-25",
    "report_date": "2025-06-26",
    "overall_status": "Selesai",
    "correction_status": "Tidak Ada",
    "created_at": "2025-05-10T09:00:00Z",
    "updated_at": "2025-06-27T10:00:00Z"
}
```

### Contoh JSON: POST `/sp2dk-jobs`

```json
{
    "client_id": "client_c3d4e5f6",
    "assigned_pic_staff_sigma_id": "staff_s_04",
    "contract_no": "KTR/SP2DK/002/2025",
    "contract_date": "2025-07-01",
    "sp2dk_no": "SP2DK/002/2025",
    "sp2dk_date": "2025-07-05",
    "overall_status": "Dikerjakan"
}
```

---

## 5. Pekerjaan Proyek (Project Job)

Pekerjaan berbasis proyek yang tidak termasuk dalam kategori lain.

### Contoh JSON: GET `/project-jobs/{job_id}`

```json
{
    "job_id": "job_project_g1g2g3h4",
    "client_id": "client_d4e5f6g7",
    "client_name": "Yayasan Cerdas Bangsa",
    "assigned_pic_staff_id": "staff_s_05",
    "assigned_pic_staff_name": "Fani Staff",
    "project_name": "Pendampingan Restitusi PPN",
    "description": "Proses pendampingan dari awal hingga akhir untuk restitusi PPN masa pajak Juni 2025.",
    "tax_year": 2025,
    "tax_period": "Juni",
    "contract_no": "KTR/PRO/001/2025",
    "contract_date": "2025-07-01T00:00:00Z",
    "payment_date": null,
    "report_date": null,
    "overall_status": "Dikerjakan",
    "proof_of_work_url": null,
    "created_at": "2025-07-01T11:00:00Z",
    "updated_at": "2025-07-01T11:00:00Z"
}
```

### Contoh JSON: POST `/project-jobs`

```json
{
    "client_id": "client_d4e5f6g7",
    "assigned_pic_staff_id": "staff_s_05",
    "project_name": "Analisis Laporan Keuangan 2024",
    "description": "Melakukan analisis mendalam terhadap laporan keuangan tahun buku 2024.",
    "tax_year": 2024,
    "overall_status": "Belum Dikerjakan"
}
```

---

## 6. Pekerjaan Dividen (Dividend Job)

Pekerjaan terkait pelaporan investasi atas dividen.

### Contoh JSON: GET `/dividend-jobs/{job_id}`

```json
{
    "job_id": "job_dividend_h1h2h3i4",
    "client_id": "client_e5f6g7h8",
    "client_name": "PT Investor Handal",
    "npwp_client": "334455667788990011",
    "job_year": 2025,
    "assigned_pic_staff_sigma_id": "staff_s_01",
    "assigned_pic_staff_sigma_name": "Budi Staff",
    "overall_status": "Selesai",
    "correction_status": "Tidak Ada",
    "created_at": "2025-01-15T09:00:00Z",
    "updated_at": "2025-01-30T10:00:00Z",
    "reports": [
        {
            "report_id": "report_dividend_i1i2i3j4",
            "job_id": "job_dividend_h1h2h3i4",
            "is_reported": true,
            "report_date": "2025-01-28",
            "report_status": "Sudah Lapor",
            "created_at": "2025-01-15T09:00:00Z",
            "updated_at": "2025-01-30T10:00:00Z"
        }
    ]
}
```

### Contoh JSON: POST `/dividend-jobs`

```json
{
    "client_id": "client_e5f6g7h8",
    "job_year": 2026,
    "assigned_pic_staff_sigma_id": "staff_s_01",
    "overall_status": "Belum Dikerjakan"
}
```
