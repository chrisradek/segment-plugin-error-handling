import { AnalyticsBrowser, Context, Plugin } from '@segment/analytics-next'
import { AfterPlugin, BeforePlugin, DestinationPlugin, EnrichmentPlugin } from './plugins';

const registeredPluginsContainer = document.getElementById('registeredPlugins') as HTMLDivElement;
const status = document.getElementById('status') as HTMLDivElement;
const contextContainer = document.getElementById('contextContainer') as HTMLDivElement;

const loadButton = document.getElementById("load") as HTMLButtonElement

const nextBtn = document.getElementById("next") as HTMLButtonElement;

const beforeBtn = document.getElementById('registerBefore') as HTMLButtonElement;
const enrichmentBtn = document.getElementById('registerEnrichment') as HTMLButtonElement;
const destinationBtn = document.getElementById('registerDestination') as HTMLButtonElement;
const afterBtn = document.getElementById('registerAfter') as HTMLButtonElement;

const unloadBtn = document.getElementById('unloadPlugins') as HTMLButtonElement;

const toggleableButtons = [nextBtn, beforeBtn, enrichmentBtn, destinationBtn, afterBtn, unloadBtn];

function disableButtons() {
  for (const button of toggleableButtons) {
    button.disabled = true;
  }
}

function enableButtons() {
  for (const button of toggleableButtons) {
    button.disabled = false;
  }
}

function jsonError(err: Error) {
  return {
    name: err.name,
    message: err.message,
    stack: err.stack
  };
}

function displayStatus(didPass: boolean) {
  const color = didPass ? 'green' : 'red';
  const text = didPass ? 'PASS' : 'FAIL';
  status.innerHTML = `<span style="color: ${color}">${text}</span>`
}

function displayContext(ctx: Context) {
  contextContainer.innerHTML = 
`<pre>
  ${ctx.logs().map(m => `[${m.level}]: ${m.message}\n\t${JSON.stringify(m.extras, (key, value) => {
    if (value instanceof Error) {
      return jsonError(value);
    }
    return value;
  })}`).join('\n')}
</pre>`.trim();
  console.log(ctx);
}

let isLoaded = false;
loadButton.addEventListener("click", async () => {
  if (isLoaded) return
  isLoaded = true

  const writeKey = (document.getElementById("writeKey") as HTMLInputElement).value;

  const [ analytics ] = await AnalyticsBrowser.load({ writeKey });
  analytics.reset();
  // analytics.debug(true);

  const registeredPlugins: Plugin[] = [];

  function registerPlugin(plugin: Plugin) {
    registeredPlugins.push(plugin);
    registeredPluginsContainer.textContent = registeredPlugins.map(p => p.name).join(', ');
    return analytics.register(plugin);
  }

  beforeBtn.addEventListener('click', () => {
    disableButtons();
    registerPlugin(new BeforePlugin()).then(enableButtons);
  });

  enrichmentBtn.addEventListener('click', () => {
    disableButtons();
    registerPlugin(new EnrichmentPlugin()).then(enableButtons);
  });

  destinationBtn.addEventListener('click', () => {
    disableButtons();
    registerPlugin(new DestinationPlugin()).then(enableButtons);
  });

  afterBtn.addEventListener('click', () => {
    disableButtons();
    registerPlugin(new AfterPlugin()).then(enableButtons);
  });

  unloadBtn.addEventListener('click', async () => {
    disableButtons();
    while (registeredPlugins.length) {
      const { name } = registeredPlugins.shift()!;
      await analytics.deregister(name);
    }
    
    registeredPluginsContainer.textContent = registeredPlugins.map(p => p.name).join(', ');
    enableButtons();
  });

  nextBtn.addEventListener("click", async () => {
    disableButtons();
    try {
      const context = await analytics.track('test')
      displayStatus(true);
      displayContext(context);
    } catch (err) {
      displayStatus(false);
      if (err instanceof Context) {
        displayContext(err);
      }
      console.error(`Caught error`, err)
    }
    enableButtons();
  });

  console.log('analytics.js is loaded');
  enableButtons();
});
