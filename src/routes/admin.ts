import { Router, Request, Response } from 'express'
import { Db } from 'mongodb'
import { AdminStatsResponse, ErrorResponse } from '../types/api'

/**
 * Middleware to verify admin token
 */
function verifyAdminToken(req: Request, res: Response, next: Function) {
  const adminToken = process.env.ADMIN_TOKEN
  const providedToken = req.headers.authorization?.replace('Bearer ', '')

  if (!adminToken) {
    return res.status(500).json({
      status: 'error',
      message: 'Admin token not configured',
      code: 'ADMIN_TOKEN_NOT_CONFIGURED'
    })
  }

  if (!providedToken || providedToken !== adminToken) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid or missing admin token',
      code: 'UNAUTHORIZED'
    })
  }

  next()
}

export function createAdminRouter(db: Db): Router {
  const router = Router()

  // Apply admin token verification to all routes
  router.use(verifyAdminToken)

  /**
   * GET /api/admin/stats
   * Returns comprehensive statistics for administrators
   * Requires Authorization header with admin token
   */
  router.get('/stats', async (req: Request, res: Response<AdminStatsResponse | ErrorResponse>) => {
    try {
      const collection = db.collection('fractionalizeRecords')

      // Get total record count
      const totalRecords = await collection.countDocuments()

      // Get database statistics
      const collections = await db.listCollections().toArray()
      const collectionCount = collections.length

      // Get index information
      const indexes = await collection.indexes()
      const indexCount = indexes.length

      // Calculate time-based activity
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [last1h, last24h, last7d, last30d] = await Promise.all([
        collection.countDocuments({ createdAt: { $gte: oneHourAgo } }),
        collection.countDocuments({ createdAt: { $gte: oneDayAgo } }),
        collection.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        collection.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
      ])

      // Get database stats (optional, may not be available in all MongoDB deployments)
      let storageSize: number | undefined
      try {
        const dbStats = await db.stats()
        storageSize = dbStats.storageSize
      } catch (err) {
        console.warn('Could not retrieve database storage stats:', err)
      }

      res.json({
        status: 'success',
        data: {
          totalRecords,
          databaseStats: {
            collections: collectionCount,
            indexes: indexCount,
            ...(storageSize !== undefined && { storageSize })
          },
          recentActivity: {
            last1h,
            last24h,
            last7d,
            last30d
          }
        }
      })
    } catch (error) {
      console.error('Error in /api/admin/stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch admin statistics',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  })

  /**
   * GET /api/admin/health
   * Health check endpoint for monitoring
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      // Test database connection
      await db.admin().ping()

      res.json({
        status: 'success',
        data: {
          database: 'connected',
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: 'Database connection failed',
        code: 'DATABASE_UNAVAILABLE'
      })
    }
  })

  return router
}
