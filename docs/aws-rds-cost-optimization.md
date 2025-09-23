# 💰 AWS RDS Cost Optimization Guide

**FonoSaaS Database Cost Optimization Strategy**

---

## 📊 **Current Database Analysis**

### **Schema Optimization Status**
- ✅ **Indexes**: Optimized for query performance
- ✅ **Relationships**: Properly structured with foreign keys
- ✅ **Data Types**: Appropriate PostgreSQL types
- ⚠️ **Connection Pooling**: Needs configuration
- ⚠️ **Query Patterns**: Some optimization opportunities

---

## 🎯 **Cost Optimization Strategies**

### **1. Instance Sizing Recommendations**

#### **Current Usage Estimation**
Based on your schema and expected load:

| Metric | Estimated Value | RDS Recommendation |
|--------|----------------|-------------------|
| **Users** | 100-1,000 | db.t3.micro (1 vCPU, 1GB RAM) |
| **Activities** | 500-5,000 | db.t3.small (2 vCPU, 2GB RAM) |
| **Downloads/Month** | 1,000-10,000 | db.t3.medium (2 vCPU, 4GB RAM) |
| **Concurrent Users** | 10-50 | db.t3.small (2 vCPU, 2GB RAM) |

#### **Recommended Instance Types**

**Phase 1: Soft Launch (0-100 users)**
```yaml
Instance Type: db.t3.micro
vCPUs: 1
Memory: 1 GB
Storage: 20 GB gp2
Estimated Cost: $12-15/month
```

**Phase 2: Growth (100-1,000 users)**
```yaml
Instance Type: db.t3.small
vCPUs: 2
Memory: 2 GB
Storage: 50 GB gp2
Estimated Cost: $25-30/month
```

**Phase 3: Scale (1,000+ users)**
```yaml
Instance Type: db.t3.medium
vCPUs: 2
Memory: 4 GB
Storage: 100 GB gp2
Estimated Cost: $50-60/month
```

### **2. Storage Optimization**

#### **Current Storage Requirements**
```sql
-- Estimated table sizes
Users: ~1KB per user
Activities: ~2KB per activity
ActivityFiles: ~0.5KB per file (metadata only)
Downloads: ~0.1KB per download
ConsentRecords: ~0.5KB per record
```

#### **Storage Optimization Strategies**

**1. Data Archiving**
```typescript
// Archive old download history (keep 90 days)
const archiveOldDownloads = async () => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  await prisma.download.deleteMany({
    where: {
      downloadedAt: {
        lt: ninetyDaysAgo
      }
    }
  });
};
```

**2. Partitioning Strategy**
```sql
-- Partition download_history by month
CREATE TABLE download_history_y2024m01 PARTITION OF download_history
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**3. Compression**
```sql
-- Enable table compression for large tables
ALTER TABLE download_history SET (toast_tuple_target = 128);
```

### **3. Connection Pooling Optimization**

#### **Current Configuration Issues**
- No connection pooling configured
- Potential connection exhaustion
- Higher costs due to connection overhead

#### **Optimized Configuration**

**1. Prisma Connection Pooling**
```typescript
// lib/database/connection-pool.ts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=10&pool_timeout=20"
    }
  }
});
```

**2. PgBouncer Configuration**
```ini
# pgbouncer.ini
[databases]
fonosass = host=your-rds-endpoint port=5432 dbname=fonosass

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 10
reserve_pool_size = 2
```

### **4. Query Optimization**

#### **Current Query Patterns Analysis**

**High-Cost Queries Identified:**
1. `getActivitiesPaginated` - Multiple joins
2. `getUserConsentRecords` - Complex filtering
3. `trackDownload` - Frequent writes

#### **Optimized Query Patterns**

**1. Optimized Activity Queries**
```typescript
// Before: Multiple queries
const activities = await prisma.activity.findMany({
  include: {
    files: true,
    categories: true,
    createdBy: true
  }
});

// After: Single optimized query
const activities = await prisma.activity.findMany({
  select: {
    id: true,
    name: true,
    description: true,
    type: true,
    difficulty: true,
    ageRange: true,
    files: {
      select: {
        id: true,
        s3Url: true,
        fileType: true
      },
      take: 1 // Only first file for thumbnail
    },
    categories: {
      select: {
        name: true
      }
    }
  },
  where: {
    isPublic: true
  },
  take: 10,
  orderBy: {
    createdAt: 'desc'
  }
});
```

**2. Batch Operations**
```typescript
// Batch download tracking
const downloads = [
  { userId: 'user1', exerciseId: 'ex1' },
  { userId: 'user2', exerciseId: 'ex2' }
];

await prisma.download.createMany({
  data: downloads,
  skipDuplicates: true
});
```

### **5. Monitoring and Alerting**

#### **Cost Monitoring Setup**

**1. CloudWatch Metrics**
```yaml
Metrics to Monitor:
  - DatabaseConnections
  - CPUUtilization
  - FreeableMemory
  - ReadIOPS
  - WriteIOPS
  - FreeStorageSpace
```

**2. Cost Alerts**
```typescript
// Set up billing alerts
const costAlerts = {
  monthly: 50,      // Alert if monthly cost > $50
  daily: 2,         // Alert if daily cost > $2
  connection: 80,   // Alert if connections > 80%
  cpu: 70          // Alert if CPU > 70%
};
```

### **6. Backup and Maintenance Optimization**

#### **Backup Strategy**
```yaml
Automated Backups:
  Retention: 7 days (free tier)
  Backup Window: 03:00-04:00 UTC
  Maintenance Window: 04:00-05:00 UTC

Manual Snapshots:
  Before major deployments
  Monthly for compliance
  Before schema changes
```

#### **Maintenance Optimization**
```sql
-- Regular maintenance queries
VACUUM ANALYZE;                    -- Update statistics
REINDEX TABLE download_history;    -- Rebuild indexes
UPDATE pg_stat_user_tables;        -- Update table statistics
```

---

## 📈 **Cost Projections**

### **Monthly Cost Breakdown**

| Component | Phase 1 | Phase 2 | Phase 3 |
|-----------|---------|---------|---------|
| **RDS Instance** | $15 | $30 | $60 |
| **Storage (20GB)** | $2 | $5 | $10 |
| **Backups** | $0 | $2 | $5 |
| **Data Transfer** | $1 | $3 | $8 |
| **Monitoring** | $1 | $2 | $3 |
| **Total** | **$19** | **$42** | **$86** |

### **Cost Optimization Impact**

| Optimization | Monthly Savings | Implementation Effort |
|--------------|----------------|---------------------|
| **Connection Pooling** | $5-10 | Low |
| **Query Optimization** | $3-8 | Medium |
| **Data Archiving** | $2-5 | Low |
| **Instance Right-sizing** | $10-20 | Low |
| **Storage Optimization** | $2-4 | Medium |

---

## 🚀 **Implementation Plan**

### **Phase 1: Immediate (Week 1)**
- [ ] Configure connection pooling
- [ ] Implement query optimization
- [ ] Set up cost monitoring
- [ ] Right-size RDS instance

### **Phase 2: Short-term (Week 2-3)**
- [ ] Implement data archiving
- [ ] Add batch operations
- [ ] Optimize indexes
- [ ] Set up automated cleanup

### **Phase 3: Long-term (Month 2-3)**
- [ ] Implement partitioning
- [ ] Add read replicas (if needed)
- [ ] Advanced monitoring
- [ ] Performance tuning

---

## 📊 **Success Metrics**

### **Cost Metrics**
- Monthly RDS cost < $50 (Phase 1)
- Cost per user < $0.50/month
- Storage growth < 10% per month

### **Performance Metrics**
- Query response time < 100ms (95th percentile)
- Connection pool utilization < 80%
- CPU utilization < 70%

### **Operational Metrics**
- Database uptime > 99.9%
- Backup success rate > 99%
- Monitoring alert response < 5 minutes

---

## 🔧 **Environment Variables**

Add these to your `.env` file:

```bash
# Database URLs
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Connection pooling
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_TIMEOUT=30000

# Cost optimization
ENABLE_QUERY_LOGGING=false
ENABLE_CONNECTION_MONITORING=true
DB_CLEANUP_INTERVAL=86400000  # 24 hours
```

---

## 🎯 **Bottom Line**

**Expected Monthly Savings: $20-40 (40-60% reduction)**
**Implementation Time: 1-2 weeks**
**ROI: Immediate cost reduction**

The optimizations will significantly reduce your AWS RDS costs while improving performance and reliability.
