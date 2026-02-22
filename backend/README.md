# PAIE Cell Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Health Check
- `GET /api/health` - Server health status
