import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private readonly requests = new Map<string, RateLimitInfo>();
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100; // Max 100 requests per window
  private readonly searchMaxRequests = 30; // More restrictive for search

  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const clientId = this.getClientId(req);
    const isSearchEndpoint = req.url.includes('/search');
    const maxAllowed = isSearchEndpoint ? this.searchMaxRequests : this.maxRequests;

    const now = Date.now();
    const rateLimitInfo = this.requests.get(clientId);

    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      // New window or expired window
      this.requests.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      // Within current window
      rateLimitInfo.count++;
      
      if (rateLimitInfo.count > maxAllowed) {
        const resetTime = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        
        res.header('X-RateLimit-Limit', maxAllowed.toString());
        res.header('X-RateLimit-Remaining', '0');
        res.header('X-RateLimit-Reset', resetTime.toString());
        
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            retryAfter: resetTime
          },
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }

    // Set rate limit headers
    const remaining = Math.max(0, maxAllowed - (rateLimitInfo?.count || 1));
    const resetTime = Math.ceil(((rateLimitInfo?.resetTime || now + this.windowMs) - now) / 1000);
    
    res.header('X-RateLimit-Limit', maxAllowed.toString());
    res.header('X-RateLimit-Remaining', remaining.toString());
    res.header('X-RateLimit-Reset', resetTime.toString());

    next();
  }

  private getClientId(req: FastifyRequest): string {
    // Use IP address as client identifier
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.ip;
    return ip || 'unknown';
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [clientId, info] of this.requests.entries()) {
      if (now > info.resetTime) {
        this.requests.delete(clientId);
      }
    }
  }
}
