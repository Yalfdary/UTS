export interface UTXOReference {
  txid: string
  outputIndex: number
}

export interface FractionalizeRecord {
  txid: string
  outputIndex: number
  createdAt: Date
  spendingTxid?: string
}

export interface MainPageResponse {
  status: 'success'
  data: {
    totalRecords: number
    recentRecords: UTXOReference[]
    statistics: {
      last24h: number
      last7d: number
      last30d: number
    }
  }
}

export interface UserQueryRequest {
  txid?: string
  limit?: number
  skip?: number
  startDate?: string
  endDate?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserQueryResponse {
  status: 'success'
  data: {
    records: UTXOReference[]
    count: number
    query: UserQueryRequest
  }
}

export interface AdminStatsResponse {
  status: 'success'
  data: {
    totalRecords: number
    databaseStats: {
      collections: number
      indexes: number
      storageSize?: number
    }
    recentActivity: {
      last1h: number
      last24h: number
      last7d: number
      last30d: number
    }
  }
}

export interface ErrorResponse {
  status: 'error'
  message: string
  code?: string
}
