import { handleFunnelCreate, updateFunnelData } from '../funnel-actions'
import { createFunnel, updateFunnel } from '../funnels'
import type { Funnel } from '@/types/funnel'

// Mock the base funnel operations
jest.mock('../funnels', () => ({
  createFunnel: jest.fn(),
  updateFunnel: jest.fn()
}))

describe('Funnel Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handleFunnelCreate', () => {
    it('should create a funnel with required fields', async () => {
      const mockData: Partial<Funnel> = {
        name: 'Test Funnel',
        slug: 'test-funnel',
        products: {
          main: 'product-1',
          upsells: []
        }
      }

      await handleFunnelCreate(mockData)

      expect(createFunnel).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Funnel',
        slug: 'test-funnel',
        products: {
          main: 'product-1',
          upsells: []
        }
      }))
    })

    it('should throw error if required fields are missing', async () => {
      const mockData: Partial<Funnel> = {
        name: 'Test Funnel'
        // Missing required fields
      }

      await expect(handleFunnelCreate(mockData)).rejects.toThrow('Fehler beim Erstellen des Funnels: URL-Pfad ist erforderlich')
    })

    it('should validate countdown dates', async () => {
      const mockData: Partial<Funnel> = {
        name: 'Test Funnel',
        slug: 'test-funnel',
        products: {
          main: 'product-1',
          upsells: []
        },
        settings: {
          checkoutStyle: 'integrated',
          upsellDiscount: 10,
          mainProductDiscount: 0,
          countdown: {
            startDate: new Date('2024-02-20'),
            endDate: new Date('2024-02-19'),
            redirectUrl: 'https://example.com'
          }
        }
      }

      await expect(handleFunnelCreate(mockData)).rejects.toThrow('Fehler beim Erstellen des Funnels: Das Startdatum muss vor dem Enddatum liegen')
    })
  })

  describe('updateFunnelData', () => {
    it('should update funnel with valid data', async () => {
      const mockData: Partial<Funnel> = {
        name: 'Updated Funnel',
        slug: 'updated-funnel',
        products: {
          main: 'product-2',
          upsells: []
        }
      }

      await updateFunnelData('funnel-1', mockData)

      expect(updateFunnel).toHaveBeenCalledWith('funnel-1', expect.objectContaining({
        name: 'Updated Funnel',
        slug: 'updated-funnel'
      }))
    })

    it('should throw error if required fields are missing during update', async () => {
      const mockData: Partial<Funnel> = {
        name: 'Updated Funnel'
        // Missing required fields
      }

      await expect(updateFunnelData('funnel-1', mockData)).rejects.toThrow('Fehler beim Aktualisieren des Funnels: URL-Pfad ist erforderlich')
    })
  })
})
