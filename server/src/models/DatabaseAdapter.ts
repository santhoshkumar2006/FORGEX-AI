import {
  SessionEvent,
  RuntimeError,
  NetworkEvent,
  DatabaseResult,
  PrivacyReport,
  PerformanceReport,
  AIResult
} from '@safereplay/shared';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount?: number;
  badge?: string;
  primeEligible?: boolean;
  image: string;
  description: string;
  inStock: boolean;
}

export interface SessionRecord {
  sessionId: string;
  page: string;
  browser: string;
  status: 'active' | 'completed' | 'error';
  hasError: boolean;
  dbStatus: 'success' | 'failed' | 'none';
  createdAt: string;
  updatedAt: string;
  privacyReport?: PrivacyReport;
  performanceReport?: PerformanceReport;
}

export class DatabaseAdapter {
  private sessions = new Map<string, SessionRecord>();
  private events = new Map<string, SessionEvent[]>();
  private errors = new Map<string, RuntimeError[]>();
  private networkEvents = new Map<string, NetworkEvent[]>();
  private dbResults = new Map<string, DatabaseResult[]>();
  private aiAnalyses = new Map<string, AIResult>();
  private auditLogs: Array<{ action: string; targetId?: string; timestamp: string; details?: any }> = [];
  private products: Product[] = [];

  constructor() {
    this.seedProducts();
  }

  private seedProducts() {
    this.products = [
      {
        id: 'prod-101',
        name: 'Aura Pro ANC Wireless Over-Ear Headphones, Spatial Audio, 40H Battery Life, Custom EQ',
        category: 'Audio',
        price: 199.99,
        originalPrice: 249.99,
        rating: 4.8,
        reviewsCount: 4892,
        badge: 'Overall Pick',
        primeEligible: true,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        description: 'Industry-leading Active Noise Cancellation with Transparency mode, multi-point Bluetooth 5.3 pairing, and ultra-comfortable memory foam earcups.',
        inStock: true
      },
      {
        id: 'prod-102',
        name: 'Ultra-Wide 34-Inch Curved 4K Display, 144Hz 1ms HDR400 IPS Panel with 90W USB-C Hub',
        category: 'Displays',
        price: 449.00,
        originalPrice: 529.00,
        rating: 4.9,
        reviewsCount: 2314,
        badge: '#1 Best Seller',
        primeEligible: true,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
        description: 'Immersive 1500R curvature with 99% sRGB color accuracy, dual HDMI 2.1 ports, DisplayPort 1.4, and 90W power delivery USB-C charging.',
        inStock: true
      },
      {
        id: 'prod-103',
        name: 'Tactile Custom Hot-Swappable RGB Mechanical Keyboard, Anodized Aluminum Frame, Brown Switches',
        category: 'Keyboards',
        price: 129.50,
        originalPrice: 159.00,
        rating: 4.7,
        reviewsCount: 1875,
        badge: "SafeReplay's Choice",
        primeEligible: true,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
        description: 'Gateron G Pro Brown switches pre-lubed, sound-dampening silicone gaskets, double-shot PBT keycaps, and custom VIA macro configuration support.',
        inStock: true
      },
      {
        id: 'prod-104',
        name: 'Precision Wireless Ergonomic Glass Trackpad, Multi-Touch Haptic Feedback Surface, USB-C',
        category: 'Accessories',
        price: 89.00,
        originalPrice: 99.00,
        rating: 4.6,
        reviewsCount: 942,
        badge: 'Popular Pick',
        primeEligible: true,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
        description: 'Sleek frosted tempered glass surface supporting edge-to-edge multi-touch gestures, wireless rechargeable battery lasting up to 2 months per charge.',
        inStock: true
      },
      {
        id: 'prod-105',
        name: 'SafeReplay Ultra HD 4K Streaming Webcam, 60 FPS, Dual Noise-Canceling Microphones & Privacy Shutter',
        category: 'Electronics',
        price: 119.00,
        originalPrice: 149.00,
        rating: 4.8,
        reviewsCount: 1420,
        badge: 'New Release',
        primeEligible: true,
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
        description: 'Autofocus Sony STARVIS sensor with HDR compensation, wide 90-degree field of view, physical magnetic privacy cover, and plug-and-play USB 3.0.',
        inStock: true
      },
      {
        id: 'prod-106',
        name: 'Heavy-Duty Aluminum Ergonomic Laptop Stand Riser with Integrated Multi-Port 6-in-1 USB-C Hub',
        category: 'Accessories',
        price: 49.99,
        originalPrice: 69.99,
        rating: 4.7,
        reviewsCount: 3120,
        badge: 'Limited time deal',
        primeEligible: true,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
        description: 'Aircraft-grade anodized aluminum frame supporting up to 17-inch laptops with integrated 4K HDMI, 100W PD, and triple USB 3.0 ports.',
        inStock: true
      },
      {
        id: 'prod-107',
        name: 'Cardioid Studio Dynamic Broadcast Microphone with Boom Arm, Shock Mount & Pop Filter',
        category: 'Audio',
        price: 159.99,
        originalPrice: 189.99,
        rating: 4.9,
        reviewsCount: 2045,
        badge: "Amazon's Choice",
        primeEligible: true,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80',
        description: 'Professional XLR and USB dual-mode microphone delivering rich vocal presence with integrated headphone zero-latency monitoring.',
        inStock: true
      },
      {
        id: 'prod-108',
        name: 'Smart Monitor Screen Light Bar with Wireless Rotary Dial Controller & Ambient Backlight',
        category: 'Displays',
        price: 64.99,
        originalPrice: 79.99,
        rating: 4.8,
        reviewsCount: 1580,
        badge: 'Top Rated',
        primeEligible: true,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
        description: 'Asymmetric optical design preventing screen glare with stepless color temperature control (2700K - 6500K) and auto-dimming ambient sensor.',
        inStock: true
      }
    ];
  }

  // Product Operations
  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  // Session Operations
  public upsertSession(session: Partial<SessionRecord> & { sessionId: string }): SessionRecord {
    const existing = this.sessions.get(session.sessionId);
    const updated: SessionRecord = {
      sessionId: session.sessionId,
      page: session.page || existing?.page || '/',
      browser: session.browser || existing?.browser || 'Chrome/Windows',
      status: session.status || existing?.status || 'active',
      hasError: session.hasError !== undefined ? session.hasError : (existing?.hasError || false),
      dbStatus: session.dbStatus || existing?.dbStatus || 'none',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      privacyReport: session.privacyReport || existing?.privacyReport,
      performanceReport: session.performanceReport || existing?.performanceReport
    };
    this.sessions.set(session.sessionId, updated);
    return updated;
  }

  public getSessions(): SessionRecord[] {
    return Array.from(this.sessions.values()).sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getSession(sessionId: string): SessionRecord | undefined {
    return this.sessions.get(sessionId);
  }

  public deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    this.events.delete(sessionId);
    this.errors.delete(sessionId);
    this.networkEvents.delete(sessionId);
    this.dbResults.delete(sessionId);
    this.aiAnalyses.delete(sessionId);
    this.logAudit('DELETE_SESSION', sessionId);
    return deleted;
  }

  // Event Ingestion
  public addEvents(sessionId: string, eventsList: SessionEvent[]) {
    const current = this.events.get(sessionId) || [];
    this.events.set(sessionId, [...current, ...eventsList]);
  }

  public getEvents(sessionId: string): SessionEvent[] {
    return this.events.get(sessionId) || [];
  }

  // Runtime Errors
  public addError(sessionId: string, error: RuntimeError) {
    const current = this.errors.get(sessionId) || [];
    this.errors.set(sessionId, [...current, error]);

    this.upsertSession({
      sessionId,
      hasError: true,
      status: 'error',
      page: error.page
    });
  }

  public getErrors(sessionId: string): RuntimeError[] {
    return this.errors.get(sessionId) || [];
  }

  // Network Events
  public addNetworkEvent(sessionId: string, netEvent: NetworkEvent) {
    const current = this.networkEvents.get(sessionId) || [];
    this.networkEvents.set(sessionId, [...current, netEvent]);
  }

  public getNetworkEvents(sessionId: string): NetworkEvent[] {
    return this.networkEvents.get(sessionId) || [];
  }

  // Database Results
  public addDbResult(sessionId: string, dbResult: DatabaseResult) {
    const current = this.dbResults.get(sessionId) || [];
    this.dbResults.set(sessionId, [...current, dbResult]);

    this.upsertSession({
      sessionId,
      dbStatus: dbResult.status
    });
  }

  public getDbResults(sessionId: string): DatabaseResult[] {
    return this.dbResults.get(sessionId) || [];
  }

  // AI Analysis
  public saveAIAnalysis(sessionId: string, result: AIResult) {
    this.aiAnalyses.set(sessionId, result);
    this.logAudit('AI_ANALYSIS_GENERATED', sessionId);
  }

  public getAIAnalysis(sessionId: string): AIResult | undefined {
    return this.aiAnalyses.get(sessionId);
  }

  // Audit Logs
  public logAudit(action: string, targetId?: string, details?: any) {
    this.auditLogs.push({
      action,
      targetId,
      timestamp: new Date().toISOString(),
      details
    });
  }

  public getAuditLogs() {
    return this.auditLogs;
  }
}

export const db = new DatabaseAdapter();
