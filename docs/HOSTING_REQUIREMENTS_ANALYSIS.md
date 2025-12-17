# 🚀 Hosting Requirements Analysis - Project Management System

**Analysis Date:** December 9, 2025  
**Project:** Proxima/Sartthi Project Management Suite  
**Comparison:** KVM 2 vs KVM 4 VPS Plans

---

## 📋 Executive Summary

**Recommendation: KVM 4 (16 GB RAM, 4 vCPU, 200 GB NVMe) - ₹749/mo**

The KVM 4 plan is **strongly recommended** for production deployment, especially when hosting multiple client instances. The additional ₹250/month investment provides critical stability, performance headroom, and future-proofing that KVM 2 cannot offer.

---

## 🏗️ Application Architecture Analysis

### Technology Stack

#### Backend (Node.js/Express)
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Process Manager:** PM2
- **Key Dependencies:**
  - `@google/generative-ai` - AI features
  - `googleapis` - Google Drive integration
  - `nodemailer` - Email notifications
  - `aws-sdk` - AWS S3 (configured but not actively used)
  - `passport` - Authentication
  - `helmet`, `express-rate-limit` - Security

#### Frontend Applications (4 React Apps)
1. **Main Client** (`client/`) - React 18 with Create React App
2. **Sartthi Mail** (`sartthi-mail-ui/`) - Vite + React
3. **Sartthi Calendar** (`sartthi-calendar-ui/`) - Vite + React
4. **Sartthi Vault** (`sartthi-vault-ui/`) - Vite + React

#### Web Server
- **Nginx** - Reverse proxy, static file serving, SSL termination

### Critical Architectural Findings

#### ⚠️ No Native Multi-Tenancy
The codebase uses **workspace-based isolation**, NOT domain-based multi-tenancy:
- Each "site" for a different client requires a **separate deployment**
- Cannot serve multiple clients from a single running instance
- **Impact:** Resource usage multiplies linearly (3 sites = 3× resources)

#### 💾 Local File Storage
Files are stored on the **local filesystem** (`/uploads` directory):
- Task attachments
- Vault documents
- User profile photos
- Desktop release binaries (can be 100-500MB each)
- **Impact:** Disk space is a critical constraint

#### 🔄 Background Processing
- **Reminder Scheduler:** Database-driven (no cron jobs)
- **Email Notifications:** Triggered by events (not scheduled)
- **No heavy background workers** detected
- **Impact:** Minimal additional CPU/RAM overhead

---

## 💻 Resource Requirements Breakdown

### Per-Instance Resource Footprint

| Component | Idle RAM | Active RAM | Peak RAM | CPU Usage | Notes |
|-----------|----------|------------|----------|-----------|-------|
| **Node.js Server** | 150 MB | 400-600 MB | 800 MB | 0.2-0.5 vCPU | Spikes during API requests |
| **MongoDB** | 256 MB | 1-2 GB | 3 GB | 0.1-0.3 vCPU | Aggressive caching, RAM-hungry |
| **Nginx** | 10 MB | 20-40 MB | 50 MB | 0.05 vCPU | Very efficient |
| **PM2** | 30 MB | 50 MB | 80 MB | 0.05 vCPU | Process manager overhead |
| **React Build** | N/A | **1.5-2 GB** | **2.5 GB** | **1-2 vCPU** | ⚠️ CRITICAL: Temporary during deployment |
| **OS (Ubuntu/Debian)** | 400 MB | 600 MB | 800 MB | 0.1 vCPU | Base system |

### Build Process Analysis (Critical)

The **build process is the most dangerous operation**:

```bash
# Each React app build consumes:
npm run build (Main Client)     → 1.5-2 GB RAM, 60-120 seconds
npm run build (Sartthi Mail)     → 800 MB RAM, 30-60 seconds
npm run build (Sartthi Calendar) → 900 MB RAM, 40-70 seconds
npm run build (Sartthi Vault)    → 800 MB RAM, 30-60 seconds
```

**Total build memory spike:** 4-5 GB if building all apps simultaneously

**Risk on KVM 2 (8 GB):**
- Building while 2-3 sites are running = **OOM (Out of Memory) crash**
- Server becomes unresponsive
- Active user sessions lost
- Database corruption risk

---

## 📊 Plan Comparison

### KVM 2 - ₹499/mo (₹999/mo renewal)
```
Specifications:
├─ 2 vCPU cores
├─ 8 GB RAM
├─ 100 GB NVMe SSD
└─ 8 TB bandwidth
```

**Capacity Analysis:**
- **Maximum Safe Sites:** 2-3 independent instances
- **Concurrent Users:** 50-100 total across all sites
- **Database Size:** Up to 20 GB comfortably
- **File Storage:** ~70 GB available after OS/apps

**Limitations:**
- ❌ **Build Risk:** High chance of OOM during deployment
- ❌ **No Headroom:** Running at 70-80% capacity normally
- ❌ **Storage Constraints:** 100 GB fills quickly with file uploads
- ❌ **Slow Builds:** 2 vCPU struggles with TypeScript compilation
- ⚠️ **Single Point of Failure:** One site's spike affects all others

**Use Cases:**
- ✅ Single client deployment
- ✅ Development/staging environment
- ✅ Low-traffic testing (< 20 concurrent users)

---

### KVM 4 - ₹749/mo (₹1,999/mo renewal)
```
Specifications:
├─ 4 vCPU cores
├─ 16 GB RAM
├─ 200 GB NVMe SSD
└─ 16 TB bandwidth
```

**Capacity Analysis:**
- **Maximum Safe Sites:** 8-10 independent instances
- **Concurrent Users:** 200-400 total across all sites
- **Database Size:** Up to 50 GB comfortably
- **File Storage:** ~170 GB available after OS/apps

**Advantages:**
- ✅ **Build Safety:** Can build 2-3 sites simultaneously without issues
- ✅ **Performance Headroom:** Running at 40-50% capacity normally
- ✅ **Future-Proof:** Room for Redis, Docker, monitoring tools
- ✅ **Fast Builds:** 4 vCPU = 40-50% faster compilation
- ✅ **Isolation:** One site's spike doesn't affect others
- ✅ **Database Performance:** MongoDB can cache more data in RAM

**Use Cases:**
- ✅ **Production multi-client hosting** (PRIMARY USE CASE)
- ✅ High-traffic applications (100+ concurrent users)
- ✅ Multiple workspace deployments
- ✅ Room for growth and additional services

---

## 🎯 Deployment Scenarios

### Scenario 1: Single Client Production
**Recommended:** KVM 2 (acceptable) or KVM 4 (preferred)

| Metric | KVM 2 | KVM 4 |
|--------|-------|-------|
| RAM Usage | 3-4 GB (50%) | 3-4 GB (25%) |
| Build Safety | ⚠️ Risky | ✅ Safe |
| Growth Potential | Limited | Excellent |
| Cost Efficiency | ✅ Better | Good |

### Scenario 2: 3-5 Client Sites
**Recommended:** KVM 4 (REQUIRED)

| Metric | KVM 2 | KVM 4 |
|--------|-------|-------|
| RAM Usage | ❌ 9-12 GB (OVER) | 6-8 GB (50%) |
| Build Safety | ❌ Will Crash | ✅ Safe |
| Feasibility | ❌ Not Possible | ✅ Comfortable |

### Scenario 3: 6-10 Client Sites
**Recommended:** KVM 4 (MINIMUM) or Higher

| Metric | KVM 4 |
|--------|-------|
| RAM Usage | 10-14 GB (75-85%) |
| Build Safety | ⚠️ Sequential builds only |
| Feasibility | ✅ Possible with careful management |

**Note:** For 10+ sites, consider:
- Upgrading to KVM 8 (32 GB RAM)
- Using separate database server
- Implementing load balancing

---

## 💾 Storage Capacity Planning

### Disk Usage Breakdown (Per Site)

```
Operating System (Ubuntu 22.04)    : 8-10 GB
Node.js + Dependencies             : 1.5 GB
MongoDB Data (initial)             : 500 MB
React Build Artifacts (4 apps)     : 800 MB
Uploads Directory (variable)       : 5-50 GB
Logs                               : 500 MB - 2 GB
──────────────────────────────────────────────
Total per site                     : 16-65 GB
```

### Storage Scenarios

**KVM 2 (100 GB):**
- 1 site with heavy uploads: ✅ 50-70 GB available
- 2 sites with moderate uploads: ✅ 25-35 GB each
- 3 sites: ⚠️ 20-25 GB each (tight)

**KVM 4 (200 GB):**
- 1 site with heavy uploads: ✅ 120-150 GB available
- 5 sites with moderate uploads: ✅ 30-35 GB each
- 10 sites: ⚠️ 15-18 GB each (minimal)

**Recommendation:** Monitor disk usage and implement:
- File upload limits per workspace
- Automatic cleanup of old files
- Consider S3/cloud storage for large files

---

## ⚡ Performance Considerations

### Database Performance

MongoDB performance is **heavily RAM-dependent**:

**KVM 2 (8 GB):**
- MongoDB gets ~2-3 GB for caching
- Frequent disk I/O for queries
- Slower aggregation pipelines
- Index operations may be slow

**KVM 4 (16 GB):**
- MongoDB gets ~6-8 GB for caching
- Most queries served from RAM
- Fast aggregation and sorting
- Better concurrent query handling

### Build Performance

**TypeScript + React Build Times:**

| Operation | KVM 2 (2 vCPU) | KVM 4 (4 vCPU) |
|-----------|----------------|----------------|
| Server Build | 45-60 sec | 25-35 sec |
| Main Client Build | 90-120 sec | 50-70 sec |
| Sartthi Apps (each) | 40-60 sec | 25-35 sec |
| **Total Deployment** | **5-7 minutes** | **3-4 minutes** |

---

## 🔒 Security & Stability

### KVM 2 Risks
- ❌ **OOM Killer:** May terminate critical processes during memory pressure
- ❌ **Swap Thrashing:** Severe performance degradation when RAM is full
- ❌ **Service Interruption:** Deployments may crash running sites
- ⚠️ **No Monitoring Overhead:** Can't run monitoring tools (Prometheus, etc.)

### KVM 4 Benefits
- ✅ **Stable Under Load:** Sufficient headroom for traffic spikes
- ✅ **Safe Deployments:** Can deploy without affecting running services
- ✅ **Monitoring Capable:** Room for APM tools, logging, metrics
- ✅ **Recovery Buffer:** Can handle unexpected memory leaks gracefully

---

## 💰 Cost-Benefit Analysis

### 3-Year Total Cost of Ownership

**KVM 2:**
```
Year 1: ₹749/mo × 12 = ₹8,988 (promotional)
Year 2-3: ₹999/mo × 24 = ₹23,976
──────────────────────────────────
Total 3 Years: ₹32,964
```

**KVM 4:**
```
Year 1: ₹749/mo × 12 = ₹8,988 (promotional)
Year 2-3: ₹1,999/mo × 24 = ₹47,976
──────────────────────────────────
Total 3 Years: ₹56,964
```

**Difference:** ₹24,000 over 3 years (₹667/month average)

### Hidden Costs of KVM 2
- ⏱️ **Developer Time:** Troubleshooting OOM crashes, slow builds
- 📉 **Downtime:** Revenue loss during crashes
- 🔄 **Migration Cost:** Upgrading later requires full migration
- 😤 **Client Dissatisfaction:** Poor performance affects reputation

**ROI Calculation:**
- If you save **2 hours/month** in troubleshooting (₹2,000 value)
- KVM 4 pays for itself in saved time alone

---

## 🎯 Final Recommendation

### For Your Use Case: "Multiple Sites on Same Machine"

**✅ CHOOSE KVM 4** - Here's why:

1. **Safety First:** You cannot afford production crashes during deployments
2. **Scalability:** Start with 3-5 sites, grow to 8-10 without migration
3. **Performance:** 2× faster builds = faster deployments = happier clients
4. **Future-Proof:** Room for Redis caching, Elasticsearch, monitoring
5. **Peace of Mind:** Sleep well knowing your server won't crash at 2 AM

### Migration Path (If Starting with KVM 2)

If budget is extremely tight, you can start with KVM 2 for a **single client** and:

1. ⚠️ **Never deploy during business hours**
2. ⚠️ **Build apps sequentially, not in parallel**
3. ⚠️ **Monitor RAM usage constantly**
4. ⚠️ **Plan to upgrade within 3-6 months**

**However:** Migration is painful. Better to start with KVM 4.

---

## 📈 Scaling Beyond KVM 4

When you outgrow KVM 4 (10+ sites or 500+ concurrent users):

### Option 1: Vertical Scaling
- **KVM 8:** 8 vCPU, 32 GB RAM, 400 GB NVMe
- Supports 20-25 independent sites

### Option 2: Horizontal Scaling
- **Separate Database Server:** Dedicated MongoDB instance
- **Load Balancer:** Distribute traffic across multiple app servers
- **CDN:** Offload static assets to Cloudflare/AWS CloudFront

### Option 3: Containerization
- **Docker + Kubernetes:** Better resource isolation
- **Auto-scaling:** Spin up instances based on demand

---

## 🛠️ Optimization Recommendations

Regardless of which plan you choose:

### Immediate Optimizations
1. **Enable Gzip Compression** (already configured in nginx)
2. **Implement Redis Caching** for session storage and API responses
3. **Set up PM2 Clustering** to utilize all CPU cores
4. **Configure MongoDB Indexes** properly (already done)
5. **Implement CDN** for static assets

### Code-Level Optimizations
1. **Lazy Load React Components** to reduce initial bundle size
2. **Implement Pagination** for large data sets
3. **Add Database Query Caching** for frequently accessed data
4. **Optimize Images** before upload (client-side compression)
5. **Implement File Upload Limits** (currently 1GB, consider reducing)

### Monitoring Setup
1. **PM2 Plus** for process monitoring
2. **MongoDB Atlas** for database monitoring (or self-hosted Mongo Express)
3. **Nginx Access Logs** analysis with GoAccess
4. **Disk Space Alerts** when usage exceeds 80%

---

## 📞 Support & Next Steps

### Immediate Actions
1. ✅ **Choose KVM 4** for production
2. ✅ Set up automated backups (database + uploads)
3. ✅ Configure monitoring and alerting
4. ✅ Document deployment procedures
5. ✅ Set up staging environment (can use KVM 2)

### Questions to Consider
- How many clients do you plan to onboard in Year 1?
- What is your average file upload volume per client?
- Do you need 99.9% uptime SLA?
- Will you offer different pricing tiers (affecting resource usage)?

---

## 📝 Conclusion

**The KVM 4 plan at ₹749/mo is the clear winner for your multi-site hosting needs.**

The additional ₹250/month (₹8.33/day) provides:
- 2× RAM (8 GB → 16 GB)
- 2× CPU (2 cores → 4 cores)
- 2× Storage (100 GB → 200 GB)
- 2× Bandwidth (8 TB → 16 TB)
- **10× Peace of Mind** (priceless)

Don't compromise on infrastructure for a production application serving multiple paying clients. The cost difference is negligible compared to the risks and limitations of KVM 2.

**Start with KVM 4. Scale confidently. Sleep peacefully.** 🚀

---

*Analysis performed by examining codebase structure, dependencies, deployment scripts, and resource usage patterns. Estimates based on typical Node.js + MongoDB + React application behavior under production load.*
