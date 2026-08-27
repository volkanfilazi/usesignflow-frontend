# SignFlow Frontend

Modern Angular frontend for the SignFlow platform.

This application provides a secure and responsive user interface for managing digital workflows, document approvals, electronic signatures, and customer interactions. It communicates with the SignFlow REST API built with Java Spring Boot.

---

## Overview

The frontend is built using the latest Angular ecosystem and follows a scalable feature-based architecture suitable for enterprise applications.

Key focus areas include:

- Authentication & Authorization
- Workflow Management
- Document Management
- Electronic Signatures
- Dashboard & Analytics
- Responsive UI
- Performance
- Maintainability

---

## Features

### Authentication

- JWT Authentication
- Route Guards
- Token Refresh
- Role-Based Access Control (RBAC)

### Dashboard

- User overview
- Submission statistics
- Recent activities
- Charts using Chart.js

### Workflow Builder

- Multi-step workflows
- Dynamic forms
- Validation
- Conditional logic

### Document Management

- Upload documents
- Preview documents
- Download PDFs
- Version handling

### Rich Text Editor

Powered by TipTap.

Features include:

- Formatting
- Hyperlinks
- Alignment
- Placeholders
- Underline
- Custom toolbar

### Electronic Signature

- Signature Pad integration
- QR Code generation
- Secure signature workflow

### User Management

- User administration
- Role management
- Permissions
- Profile management

### Responsive Design

Optimized for:

- Desktop
- Tablet
- Mobile

---

## Tech Stack

| Technology       | Version |
| ---------------- | ------- |
| Angular          | 21      |
| Angular Material | 21      |
| TypeScript       | 5       |
| Bootstrap        | 5       |
| RxJS             | 7       |
| Chart.js         | 4       |
| ng2-charts       | 10      |
| TipTap           | 3       |
| JWT Decode       | 4       |
| Signature Pad    | 5       |
| Playwright       | Latest  |

---

## Project Structure

```
src/
 ├── app/
 │    ├── core/
 │    ├── shared/
 │    ├── features/
 │    ├── layout/
 │    ├── guards/
 │    ├── interceptors/
 │    ├── services/
 │    └── models/
 │
 ├── assets/
 ├── environments/
 └── styles/
```

---

## Architecture

The application follows a feature-based architecture.

- Standalone Components
- Lazy Loaded Features
- Reusable Shared Components
- Dependency Injection
- Strongly Typed Models
- Separation of Concerns
- Modular Design

---

## Testing

End-to-end testing is implemented using Playwright.

```bash
npm run playwright
```

Run tests in headed mode:

```bash
npm run headed
```

Generate Playwright selectors:

```bash
npm run codeGen
```

---

## Development

Install dependencies

```bash
npm install
```

Start development server

```bash
npm start
```

Build production bundle

```bash
npm run build
```

---

## Author

**Volkan Filazi**

Full Stack Developer

Angular • C# • .NET • MONGODB • Docker
