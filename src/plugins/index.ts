import { Context, ContextCancelation, Plugin } from '@segment/analytics-next'

class BasePlugin implements Partial<Plugin> {
  public version = '1.0.0';
  protected shouldCancel: boolean;

  constructor(shouldCancel: boolean = true) {
    this.shouldCancel = shouldCancel;
  }

  isLoaded() { 
    return true;
  }

  load() {
    return Promise.resolve();
  }

  alias(ctx: Context): Context {
    return this.task(ctx);
  }

  group(ctx: Context): Context {
    return this.task(ctx);
  }

  identify(ctx: Context): Context {
    return this.task(ctx);
  }

  page(ctx: Context): Context {
    return this.task(ctx);
  }

  screen(ctx: Context): Context {
    return this.task(ctx);
  }

  track(ctx: Context): Context {
    return this.task(ctx);
  }

  private task(ctx: Context): never {
    if (this.shouldCancel) {
      ctx.cancel(new ContextCancelation({
        retry: false
      }));
    }

    throw new Error(`Error thrown in task`);
  }
}


export class BeforePlugin extends BasePlugin implements Plugin {
  public name = 'Test Before Error';
  public type = 'before' as const;
}

export class EnrichmentPlugin extends BasePlugin implements Plugin {
  public name = 'Test Enrichment Error';
  public type = 'enrichment' as const;
}

export class DestinationPlugin extends BasePlugin implements Plugin {
  public name = 'Test Destination Error';
  public type = 'destination' as const;

  public ready() {
    return Promise.resolve(true);
  }
}

export class AfterPlugin extends BasePlugin implements Plugin {
  public name = 'Test After Error';
  public type = 'after' as const;
}