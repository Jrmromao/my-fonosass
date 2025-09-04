# 🔌 FonoSaaS API Standards

**Purpose**: Standardized patterns and conventions for API development  
**Status**: Active - Use for all API route development

---

## 📋 **API Route Structure**

### **File Organization**
```
app/api/
├── feature-name/
│   ├── route.ts              # GET, POST, PUT, DELETE
│   ├── [id]/
│   │   └── route.ts          # GET, PUT, DELETE by ID
│   └── action/
│       └── route.ts          # Custom actions
├── admin/
│   └── feature-name/
│       └── route.ts          # Admin-only endpoints
└── webhooks/
    ├── clerk/
    └── stripe/
```

---

## 🏗️ **Standard API Patterns**

### **Basic Route Template**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { prisma } from '@/app/db'

// Validation schema
const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

const updateSchema = createSchema.partial()

// GET - List resources
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const features = await prisma.feature.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: features,
      pagination: {
        page,
        limit,
        total: features.length,
      },
    })
  } catch (error) {
    console.error('GET /api/features error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create resource
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSchema.parse(body)

    const feature = await prisma.feature.create({
      data: {
        ...validatedData,
        userId,
      },
    })

    return NextResponse.json({
      success: true,
      data: feature,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 422 }
      )
    }

    console.error('POST /api/features error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Resource by ID Template**
```typescript
// app/api/features/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { prisma } from '@/app/db'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

// GET - Get single resource
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feature = await prisma.feature.findFirst({
      where: {
        id: params.id,
        userId, // Ensure user owns the resource
      },
    })

    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: feature,
    })
  } catch (error) {
    console.error('GET /api/features/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    const feature = await prisma.feature.updateMany({
      where: {
        id: params.id,
        userId, // Ensure user owns the resource
      },
      data: validatedData,
    })

    if (feature.count === 0) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Feature updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 422 }
      )
    }

    console.error('PUT /api/features/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feature = await prisma.feature.deleteMany({
      where: {
        id: params.id,
        userId, // Ensure user owns the resource
      },
    })

    if (feature.count === 0) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Feature deleted successfully',
    })
  } catch (error) {
    console.error('DELETE /api/features/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 🔒 **Security Patterns**

### **Authentication Middleware**
```typescript
async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

// Usage
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()
    // ... rest of the logic
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ... handle other errors
  }
}
```

### **Role-Based Access Control**
```typescript
async function requireRole(requiredRole: 'ADMIN' | 'USER') {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  })

  if (!user || user.role !== requiredRole) {
    throw new Error('Forbidden')
  }

  return userId
}

// Usage
export async function POST(request: NextRequest) {
  try {
    const userId = await requireRole('ADMIN')
    // ... admin-only logic
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // ... handle other errors
  }
}
```

### **Input Validation**
```typescript
// Comprehensive validation schema
const createFeatureSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Invalid characters'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  type: z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE']),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).max(10, 'Too many tags').optional(),
})

// Sanitization
const sanitizeInput = (input: any) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '')
  }
  return input
}
```

---

## 📊 **Response Standards**

### **Success Response Format**
```typescript
// Single resource
{
  success: true,
  data: {
    id: "clx123...",
    name: "Feature Name",
    createdAt: "2024-01-01T00:00:00.000Z"
  }
}

// List of resources
{
  success: true,
  data: [
    { id: "clx123...", name: "Feature 1" },
    { id: "clx456...", name: "Feature 2" }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3
  }
}

// Action result
{
  success: true,
  message: "Feature created successfully",
  data: {
    id: "clx123...",
    name: "Feature Name"
  }
}
```

### **Error Response Format**
```typescript
// Validation error
{
  success: false,
  error: "Validation error",
  details: [
    {
      field: "name",
      message: "Name is required",
      code: "too_small"
    }
  ]
}

// Not found error
{
  success: false,
  error: "Feature not found"
}

// Server error
{
  success: false,
  error: "Internal server error"
}
```

---

## 🚀 **Performance Patterns**

### **Pagination**
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const skip = (page - 1) * limit

  const [features, total] = await Promise.all([
    prisma.feature.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feature.count({ where: { userId } }),
  ])

  return NextResponse.json({
    success: true,
    data: features,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
```

### **Caching**
```typescript
import { unstable_cache } from 'next/cache'

const getCachedFeatures = unstable_cache(
  async (userId: string) => {
    return await prisma.feature.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },
  ['features'],
  {
    tags: ['features'],
    revalidate: 60, // 1 minute
  }
)

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const features = await getCachedFeatures(userId)
  return NextResponse.json({ success: true, data: features })
}
```

---

## 🧪 **Testing Patterns**

### **API Route Testing**
```typescript
// __tests__/integration/api/features.test.ts
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/features/route'

describe('/api/features', () => {
  describe('GET', () => {
    it('returns features for authenticated user', async () => {
      // Mock auth
      jest.mock('@clerk/nextjs', () => ({
        auth: () => ({ userId: 'user_123' }),
      }))

      const request = new NextRequest('http://localhost:3000/api/features')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('returns 401 for unauthenticated user', async () => {
      // Mock auth to return null
      jest.mock('@clerk/nextjs', () => ({
        auth: () => ({ userId: null }),
      }))

      const request = new NextRequest('http://localhost:3000/api/features')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('POST', () => {
    it('creates feature with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/features', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Feature',
          description: 'Test Description',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Test Feature')
    })

    it('returns validation error for invalid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/features', {
        method: 'POST',
        body: JSON.stringify({
          name: '', // Invalid: empty name
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(422)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Validation error')
    })
  })
})
```

---

## 📝 **Documentation Standards**

### **API Documentation Template**
```typescript
/**
 * @api {get} /api/features Get Features
 * @apiName GetFeatures
 * @apiGroup Features
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieve a paginated list of features for the authenticated user
 * 
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Items per page (max 100)
 * @apiQuery {String} [search] Search term for filtering
 * 
 * @apiSuccess {Boolean} success True if request was successful
 * @apiSuccess {Object[]} data Array of feature objects
 * @apiSuccess {String} data.id Feature ID
 * @apiSuccess {String} data.name Feature name
 * @apiSuccess {String} data.description Feature description
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {Object} pagination Pagination information
 * @apiSuccess {Number} pagination.page Current page
 * @apiSuccess {Number} pagination.limit Items per page
 * @apiSuccess {Number} pagination.total Total number of items
 * 
 * @apiError {String} error Error message
 * @apiError {Number} status HTTP status code
 * 
 * @apiExample {curl} Example request:
 * curl -X GET "http://localhost:3000/api/features?page=1&limit=10" \
 *   -H "Authorization: Bearer your-token"
 * 
 * @apiExample {json} Example response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "clx123...",
 *       "name": "Feature 1",
 *       "description": "Description 1",
 *       "createdAt": "2024-01-01T00:00:00.000Z"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 25,
 *     "totalPages": 3
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  // Implementation
}
```

---

## 🔧 **Common Utilities**

### **Error Handler**
```typescript
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.errors },
      { status: 422 }
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### **Request Validator**
```typescript
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError('Validation error', 422, 'VALIDATION_ERROR')
    }
    throw new APIError('Invalid request body', 400, 'INVALID_BODY')
  }
}
```

---

## 📊 **Monitoring & Logging**

### **Request Logging**
```typescript
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const { userId } = await auth()
  
  try {
    // ... implementation
    
    console.log(`GET /api/features - ${Date.now() - startTime}ms - User: ${userId}`)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error(`GET /api/features - ERROR - ${Date.now() - startTime}ms - User: ${userId}`, error)
    return handleAPIError(error)
  }
}
```

### **Performance Metrics**
```typescript
// Add to your API routes
const metrics = {
  requestCount: 0,
  totalResponseTime: 0,
  errorCount: 0,
}

// Log metrics periodically
setInterval(() => {
  console.log('API Metrics:', {
    avgResponseTime: metrics.totalResponseTime / metrics.requestCount,
    requestCount: metrics.requestCount,
    errorRate: metrics.errorCount / metrics.requestCount,
  })
}, 60000) // Every minute
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
