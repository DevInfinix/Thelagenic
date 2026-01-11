/**
 * Vendor Image Service
 * Provides reliable image URLs with fallbacks and validation
 * Uses Unsplash API for real food images (free, no auth required)
 */

const VENDOR_IMAGE_URLS: Record<string, string> = {
  // Reliable food images from Unsplash with proper dimensions
  'street-food': 'https://images.unsplash.com/photo-1606787620884-fdf6ea75a504?w=500&h=500&fit=crop',
  'chaat': 'https://images.unsplash.com/photo-1631292784640-e2b9ad66bda4?w=500&h=500&fit=crop',
  'pav-bhaji': 'https://images.unsplash.com/photo-1589301169117-a1852e2f3a64?w=500&h=500&fit=crop',
  'momos': 'https://images.unsplash.com/photo-1624566174325-804a210b8c31?w=500&h=500&fit=crop',
  'samosa': 'https://images.unsplash.com/photo-1630363311868-34cd42d1d39f?w=500&h=500&fit=crop',
  'chinese': 'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=500&h=500&fit=crop',
  'dosa': 'https://images.unsplash.com/photo-1648534158903-bb7c2ae6c82f?w=500&h=500&fit=crop',
  'idli': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop',
  'vada': 'https://images.unsplash.com/photo-1589301169117-a1852e2f3a64?w=500&h=500&fit=crop',
  'noodles': 'https://images.unsplash.com/photo-1565958011504-98d00b2b3d4a?w=500&h=500&fit=crop',
  'biryani': 'https://images.unsplash.com/photo-1631292784640-e2b9ad66bda4?w=500&h=500&fit=crop',
  'tandoori': 'https://images.unsplash.com/photo-1606787620884-fdf6ea75a504?w=500&h=500&fit=crop',
  'kebab': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=500&fit=crop',
  'panipuri': 'https://images.unsplash.com/photo-1631292784640-e2b9ad66bda4?w=500&h=500&fit=crop',
  'golgappa': 'https://images.unsplash.com/photo-1631292784640-e2b9ad66bda4?w=500&h=500&fit=crop',
  'bhelpuri': 'https://images.unsplash.com/photo-1606787620884-fdf6ea75a504?w=500&h=500&fit=crop',
  'aloo-tikki': 'https://images.unsplash.com/photo-1589301169117-a1852e2f3a64?w=500&h=500&fit=crop',
  'jalebi': 'https://images.unsplash.com/photo-1644025155295-00d4597f6c7f?w=500&h=500&fit=crop',
  'rasgulla': 'https://images.unsplash.com/photo-1578519607826-06f8ba9b0c20?w=500&h=500&fit=crop',
  'kheer': 'https://images.unsplash.com/photo-1548365328-fae3296c8944?w=500&h=500&fit=crop',
  'default-food': 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=500&fit=crop',
};

// Vendor profile pictures - Safe, diverse images
const VENDOR_PROFILE_URLS: string[] = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507537362392-86a1f3f8a02e?w=400&h=400&fit=crop',
];

class VendorImageService {
  /**
   * Get vendor stall photo based on food category or use default
   */
  static getVendorStallImage(foodCategories?: string[]): string {
    if (!foodCategories || foodCategories.length === 0) {
      return VENDOR_IMAGE_URLS['default-food'];
    }

    // Try to find matching category
    const category = foodCategories[0].toLowerCase().replace(/\s+/g, '-');
    
    // Direct match
    if (VENDOR_IMAGE_URLS[category]) {
      return VENDOR_IMAGE_URLS[category];
    }

    // Partial match
    for (const [key, url] of Object.entries(VENDOR_IMAGE_URLS)) {
      if (category.includes(key) || key.includes(category)) {
        return url;
      }
    }

    // Default fallback
    return VENDOR_IMAGE_URLS['default-food'];
  }

  /**
   * Get vendor profile picture (returns different pics for variety)
   */
  static getVendorProfileImage(vendorId: string): string {
    // Use vendorId to deterministically pick a profile image
    const index = Math.abs(
      vendorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % VENDOR_PROFILE_URLS.length;
    return VENDOR_PROFILE_URLS[index];
  }

  /**
   * Validate if image URL is accessible
   */
  static async isImageValid(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn(`Image URL validation failed for: ${url}`, error);
      return false;
    }
  }

  /**
   * Get safe image URL with fallback
   */
  static async getSafeImageUrl(
    url: string | undefined,
    fallbackUrl: string = VENDOR_IMAGE_URLS['default-food']
  ): Promise<string> {
    if (!url) return fallbackUrl;

    // Quick validation - if URL looks valid, use it
    if (url.includes('unsplash.com') || url.includes('example.com')) {
      return url;
    }

    // For unknown URLs, check validity
    const isValid = await this.isImageValid(url);
    return isValid ? url : fallbackUrl;
  }

  /**
   * Get all available fallback images
   */
  static getFallbackImages(): string[] {
    return Object.values(VENDOR_IMAGE_URLS);
  }
}

export { VendorImageService };
