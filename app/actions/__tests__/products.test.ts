import { getProducts, getProductById, getProductsByIds } from '../products'
import { db } from '@/lib/firebase-admin-server'
import type { Product } from '@/types/product'

// Mock Firebase admin
jest.mock('@/lib/firebase-admin-server', () => ({
  db: {
    collection: jest.fn(() => ({
      get: jest.fn(),
      doc: jest.fn(() => ({
        get: jest.fn()
      })),
      where: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  }
}))

describe('Product Actions', () => {
  const mockProduct: Product = {
    id: 'product-1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product',
    price: 99.99,
    stock: 10,
    images: [],
    isActive: true,
    createdAt: 1234567890000,
    updatedAt: 1234567890000
  }

  const mockFirebaseTimestamp = {
    seconds: 1234567890,
    nanoseconds: 0
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProducts', () => {
    it('should return all products with correct timestamp conversion', async () => {
      const mockDocs = [{
        id: 'product-1',
        data: () => ({
          ...mockProduct,
          createdAt: mockFirebaseTimestamp,
          updatedAt: mockFirebaseTimestamp
        }),
        exists: true
      }]

      const mockSnapshot = {
        docs: mockDocs
      }

      // Setup the mock implementation
      const mockGet = jest.fn().mockResolvedValue(mockSnapshot)
      const mockCollection = jest.fn().mockReturnValue({ get: mockGet })
      ;(db.collection as jest.Mock).mockImplementation(mockCollection)

      const products = await getProducts()

      expect(products).toHaveLength(1)
      expect(products[0]).toEqual(mockProduct)
      expect(db.collection).toHaveBeenCalledWith('products')
    })
  })

  describe('getProductById', () => {
    it('should return a product by id with correct timestamp conversion', async () => {
      const mockDocData = {
        ...mockProduct,
        createdAt: mockFirebaseTimestamp,
        updatedAt: mockFirebaseTimestamp
      }

      const mockDocSnapshot = {
        id: 'product-1',
        exists: true,
        data: () => mockDocData
      }

      // Setup the mock implementation
      const mockGet = jest.fn().mockResolvedValue(mockDocSnapshot)
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet })
      const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc })
      ;(db.collection as jest.Mock).mockImplementation(mockCollection)

      const product = await getProductById('product-1')

      expect(product).toEqual(mockProduct)
      expect(db.collection).toHaveBeenCalledWith('products')
    })

    it('should return null for non-existent product', async () => {
      const mockDocSnapshot = {
        exists: false,
        data: () => null
      }

      // Setup the mock implementation
      const mockGet = jest.fn().mockResolvedValue(mockDocSnapshot)
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet })
      const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc })
      ;(db.collection as jest.Mock).mockImplementation(mockCollection)

      const product = await getProductById('non-existent')

      expect(product).toBeNull()
    })
  })

  describe('getProductsByIds', () => {
    it('should return products for given ids', async () => {
      const mockDocs = [{
        id: 'product-1',
        data: () => ({
          ...mockProduct,
          createdAt: mockFirebaseTimestamp,
          updatedAt: mockFirebaseTimestamp
        }),
        exists: true
      }]

      const mockSnapshot = {
        docs: mockDocs
      }

      // Setup the mock implementation
      const mockGet = jest.fn().mockResolvedValue(mockSnapshot)
      const mockWhere = jest.fn().mockReturnValue({ get: mockGet })
      const mockCollection = jest.fn().mockReturnValue({ where: mockWhere })
      ;(db.collection as jest.Mock).mockImplementation(mockCollection)

      const products = await getProductsByIds(['product-1'])

      expect(products).toHaveLength(1)
      expect(products[0]).toEqual(mockProduct)
      expect(db.collection).toHaveBeenCalledWith('products')
    })

    it('should return empty array for empty ids array', async () => {
      const products = await getProductsByIds([])

      expect(products).toEqual([])
      expect(db.collection).not.toHaveBeenCalled()
    })
  })
})
