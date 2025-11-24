import { Router, Request, Response } from 'express'
import { Db } from 'mongodb'
import { MainPageResponse, ErrorResponse } from '../types/api'

export function createMainPageRouter(db: Db): Router {
  const router = Router()

  /**
   * GET /api/mainpage
   * Returns main page data including total records, recent records, and statistics
   */
  router.get('/', async (req: Request, res: Response<MainPageResponse | ErrorResponse>) => {
    try {
      const collection = db.collection('fractionalizeRecords')

      // Get total record count
      const totalRecords = await collection.countDocuments()

      // Get recent records (last 10)
      const recentRecords = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .project({ txid: 1, outputIndex: 1, _id: 0 })
        .toArray()

      // Calculate time-based statistics
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [last24h, last7d, last30d] = await Promise.all([
        collection.countDocuments({ createdAt: { $gte: oneDayAgo } }),
        collection.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        collection.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
      ])

      res.json({
        status: 'success',
        data: {
          totalRecords,
          recentRecords,
          statistics: {
            last24h,
            last7d,
            last30d
          }
        }
      })
    } catch (error) {
      console.error('Error in /api/mainpage:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch main page data',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  })

  return router
}
