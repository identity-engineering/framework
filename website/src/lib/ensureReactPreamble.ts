/**
 * Vite + @vitejs/plugin-react require a preamble before any transformed .tsx
 * loads in dev. Our client-only mounts import .tsx dynamically outside Astro
 * islands, so we install it ourselves.
 *
 * Important: never write a static `import('/@react-refresh')` — Vite resolves
 * that at transform time inside Astro <script> and throws if the virtual path
 * is not visible in that graph. Use a runtime path + @vite-ignore instead.
 */
export async function ensureReactPreamble(): Promise<void> {
	if (!import.meta.env.DEV) return;

	const w = window as Window & {
		__vite_plugin_react_preamble_installed__?: boolean;
		$RefreshReg$?: (...args: unknown[]) => void;
		$RefreshSig$?: () => (type: unknown) => unknown;
	};

	if (w.__vite_plugin_react_preamble_installed__) return;

	const installStubs = () => {
		w.$RefreshReg$ = () => {};
		w.$RefreshSig$ = () => (type) => type;
		w.__vite_plugin_react_preamble_installed__ = true;
	};

	try {
		// Build path at runtime so Vite does not statically resolve the virtual module
		const refreshUrl = '/@' + 'react-refresh';
		const mod = await import(/* @vite-ignore */ refreshUrl);
		const RefreshRuntime = (mod as { default: { injectIntoGlobalHook: (g: Window) => void } })
			.default;
		RefreshRuntime.injectIntoGlobalHook(window);
		installStubs();
	} catch {
		// Runtime unavailable (or path not registered) — stubs still let transformed modules load
		installStubs();
	}
}
