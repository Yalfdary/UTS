import { Router, Request, Response } from 'express'
import { Db } from 'mongodb'
import { UserQueryResponse, UserQueryRequest, ErrorResponse } from '../types/api'

export function createUserRouter(db: Db): Router {
  const router = Router()

  /**
   * GET /api/user
   * Query fractionalize records with filters
   * Query params:
   *   - txid: Filter by transaction ID (exact match)
   *   - limit: Maximum number of results (default: 50, max: 100)
   *   - skip: Number of results to skip for pagination (default: 0)
   *   - startDate: Filter records created after this date (ISO string)
   *   - endDate: Filter records created before this date (ISO string)
   *   - sortOrder: Sort by creation date, 'asc' or 'desc' (default: 'desc')
   */
  router.get('/', async (req: Request, res: Response<UserQueryResponse | ErrorResponse>) => {
    try {
      const {
        txid,
        limit = '50',
        skip = '0',
        startDate,
        endDate,
        sortOrder = 'desc'
      } = req.query as { [key: string]: string }

      // Validate and parse parameters
      const parsedLimit = Math.min(parseInt(limit) || 50, 100)
      const parsedSkip = Math.max(parseInt(skip) || 0, 0)

      if (parsedLimit < 0 || parsedSkip < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Limit and skip must be non-negative numbers',
          code: 'INVALID_PARAMETERS'
        })
      }

      if (sortOrder !== 'asc' && sortOrder !== 'desc') {
        return res.status(400).json({
          status: 'error',
          message: 'sortOrder must be "asc" or "desc"',
          code: 'INVALID_SORT_ORDER'
        })
      }

      const collection = db.collection('fractionalizeRecords')
      const query: any = {}

      // Filter by txid if provided
      if (txid) {
        query.txid = txid
      }

      // Filter by date range if provided
      if (startDate || endDate) {
        query.createdAt = {}
        if (startDate) {
          const start = new Date(startDate)
          if (isNaN(start.getTime())) {
            return res.status(400).json({
              status: 'error',
              message: 'Invalid startDate format',
              code: 'INVALID_DATE'
            })
          }
          query.createdAt.$gte = start
        }
        if (endDate) {
          const end = new Date(endDate)
          if (isNaN(end.getTime())) {
            return res.status(400).json({
              status: 'error',
              message: 'Invalid endDate format',
              code: 'INVALID_DATE'
            })
          }
          query.createdAt.$lte = end
        }
      }

      // Execute query
      const sortDirection = sortOrder === 'asc' ? 1 : -1
      const records = await collection
        .find(query)
        .sort({ createdAt: sortDirection })
        .skip(parsedSkip)
        .limit(parsedLimit)
        .project({ txid: 1, outputIndex: 1, _id: 0 })
        .toArray()

      const count = records.length

      const queryRequest: UserQueryRequest = {
        ...(txid && { txid }),
        limit: parsedLimit,
        skip: parsedSkip,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        sortOrder
      }

      res.json({
        status: 'success',
        data: {
          records,
          count,
          query: queryRequest
        }
      })
    } catch (error) {
      console.error('Error in /api/user:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to query records',
        code: 'INTERNAL_SERVER_ERROR'
      })
    }
  })

  return router
}
