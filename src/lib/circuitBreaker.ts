/**
 * Circuit Breaker pattern for external service calls.
 * Prevents cascading failures when external services (Bitrix24, etc.) are down.
 *
 * States:
 * - CLOSED: normal operation, requests pass through
 * - OPEN: service is down, requests fail fast without calling the service
 * - HALF_OPEN: testing if service recovered, allows limited requests through
 */

export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit (default: 5) */
  failureThreshold?: number;
  /** Time in ms before attempting recovery (default: 30000 = 30s) */
  resetTimeout?: number;
  /** Number of successful calls in half-open to close circuit (default: 2) */
  successThreshold?: number;
  /** Optional name for logging */
  name?: string;
}

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  lastError: Error | null;
}

export class CircuitBreaker {
  private readonly options: Required<CircuitBreakerOptions>;
  private circuitState: CircuitBreakerState;
  private listeners: Array<(state: CircuitState) => void> = [];

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeout: options.resetTimeout ?? 30_000,
      successThreshold: options.successThreshold ?? 2,
      name: options.name ?? 'default',
    };

    this.circuitState = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      lastError: null,
    };
  }

  get state(): CircuitState {
    // Check if open circuit should transition to half-open
    if (this.circuitState.state === 'open' && this.circuitState.lastFailureTime) {
      const elapsed = Date.now() - this.circuitState.lastFailureTime;
      if (elapsed >= this.options.resetTimeout) {
        this.transition('half_open');
      }
    }
    return this.circuitState.state;
  }

  get lastError(): Error | null {
    return this.circuitState.lastError;
  }

  get failureCount(): number {
    return this.circuitState.failureCount;
  }

  /**
   * Execute a function through the circuit breaker.
   * If the circuit is open, fails immediately without calling fn.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = this.state; // triggers auto half-open check

    if (currentState === 'open') {
      throw new CircuitOpenError(
        `Circuit breaker [${this.options.name}] is OPEN. Service unavailable.`,
        this.circuitState.lastError
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /** Subscribe to state changes */
  onStateChange(listener: (state: CircuitState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /** Manually reset the circuit to closed state */
  reset(): void {
    this.circuitState = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      lastError: null,
    };
    this.notify('closed');
  }

  private onSuccess(): void {
    if (this.circuitState.state === 'half_open') {
      this.circuitState.successCount++;
      if (this.circuitState.successCount >= this.options.successThreshold) {
        this.transition('closed');
        this.circuitState.failureCount = 0;
        this.circuitState.successCount = 0;
        this.circuitState.lastError = null;
      }
    } else {
      // Reset failure count on success in closed state
      this.circuitState.failureCount = 0;
    }
  }

  private onFailure(error: Error): void {
    this.circuitState.lastError = error;
    this.circuitState.failureCount++;
    this.circuitState.lastFailureTime = Date.now();

    if (this.circuitState.state === 'half_open') {
      // Any failure in half-open goes back to open
      this.transition('open');
      this.circuitState.successCount = 0;
    } else if (this.circuitState.failureCount >= this.options.failureThreshold) {
      this.transition('open');
    }
  }

  private transition(newState: CircuitState): void {
    if (this.circuitState.state !== newState) {
      this.circuitState.state = newState;
      this.notify(newState);
    }
  }

  private notify(state: CircuitState): void {
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch {
        // don't let listener errors break the breaker
      }
    }
  }
}

export class CircuitOpenError extends Error {
  public readonly cause: Error | null;

  constructor(message: string, cause: Error | null) {
    super(message);
    this.name = 'CircuitOpenError';
    this.cause = cause;
  }
}

// ── Pre-configured instances ────────────────────────────────

/** Circuit breaker for Bitrix24 API calls */
export const bitrix24Circuit = new CircuitBreaker({
  name: 'bitrix24',
  failureThreshold: 3,
  resetTimeout: 60_000, // 1 minute
  successThreshold: 2,
});

/** Circuit breaker for external API calls (generic) */
export const externalApiCircuit = new CircuitBreaker({
  name: 'external-api',
  failureThreshold: 5,
  resetTimeout: 30_000,
  successThreshold: 2,
});
