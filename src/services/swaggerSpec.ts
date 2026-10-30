/**
 * OpenAPI 3.1.0 Specification for APAAR-Verify REST API
 * Defines all backend endpoints, schemas, authentication, and responses.
 */

export const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'AICTE APAAR-Verify National Regulatory API',
    version: '1.0.0',
    description:
      'National Academic Identity, Student Enrolment Compliance, and Digital Credential Verification Gateway for AICTE-approved institutions.',
    contact: {
      name: 'AICTE National Academic Depository Cell',
      email: 'api-support@aicte-india.org',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Production AICTE National Edge Gateway',
    },
  ],
  paths: {
    '/auth/token': {
      post: {
        tags: ['Authentication & SSO'],
        summary: 'OAuth2 / JWT Token Exchange for Institutional ERP and Regulators',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string', example: 'admin@iitd.ac.in' },
                  password: { type: 'string', example: '••••••••' },
                  grant_type: { type: 'string', example: 'password' },
                },
                required: ['username', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'JWT bearer access token issued with role permissions',
          },
        },
      },
    },
    '/apaar/validate': {
      post: {
        tags: ['APAAR Validation Gateway'],
        summary: 'Validate 12-digit APAAR identity against National ABC / DigiLocker Registry',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  apaarId: { type: 'string', example: '712345678901' },
                  studentName: { type: 'string', example: 'Aryan Sharma' },
                  dob: { type: 'string', example: '2004-05-14' },
                },
                required: ['apaarId', 'studentName'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Validation result including match score and verification status',
          },
        },
      },
    },
    '/students': {
      get: {
        tags: ['Student Management'],
        summary: 'Query enrolled student records with institutional filters',
        parameters: [
          { name: 'institutionId', in: 'query', schema: { type: 'string' } },
          { name: 'programId', in: 'query', schema: { type: 'string' } },
          { name: 'academicYear', in: 'query', schema: { type: 'string', example: '2024-25' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'verificationStatus', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 25 } },
        ],
        responses: {
          '200': { description: 'Paginated list of student records' },
        },
      },
      post: {
        tags: ['Student Management'],
        summary: 'Register individual student academic record',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  apaarId: { type: 'string', example: '712345678901' },
                  rollNumber: { type: 'string', example: '2024CS1001' },
                  name: { type: 'string', example: 'Aryan Sharma' },
                  dob: { type: 'string', example: '2004-05-14' },
                  institutionId: { type: 'string', example: 'INST-IITD' },
                  programId: { type: 'string', example: 'PROG-CSE' },
                  academicYear: { type: 'string', example: '2024-25' },
                },
                required: ['apaarId', 'name', 'rollNumber', 'dob', 'institutionId'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Student registered successfully' },
        },
      },
    },
    '/upload/batch': {
      post: {
        tags: ['Bulk Data Ingestion'],
        summary: 'Upload CSV/Excel student admissions for batch validation',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                  institutionId: { type: 'string' },
                  programId: { type: 'string' },
                  academicYear: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Validation summary report and row error matrix' },
        },
      },
    },
    '/compliance/overview': {
      get: {
        tags: ['Compliance & Analytics'],
        summary: 'Get national or institutional compliance KPIs, intake ratios, and duplicate alerts',
        parameters: [
          { name: 'institutionId', in: 'query', schema: { type: 'string' } },
          { name: 'academicYear', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Real-time compliance statistics' },
        },
      },
    },
    '/cases': {
      get: {
        tags: ['Compliance Case Management'],
        summary: 'List regulatory compliance cases (excess intake, cross-enrolments)',
        responses: {
          '200': { description: 'List of compliance cases' },
        },
      },
    },
    '/credentials/verify': {
      get: {
        tags: ['Digital Credentials & QR'],
        summary: 'Public verification of signed cryptographic student credential',
        parameters: [
          { name: 'credentialId', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Verification status, cryptographic authenticity, and student academic facts' },
        },
      },
    },
  },
};
