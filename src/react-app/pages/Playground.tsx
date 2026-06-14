import { useEffect, useState } from "react";
import { ChatForm } from "../components/ChatForm";
import { RequestStats } from "../components/RequestStats";
import { ResponsePanel } from "../components/ResponsePanel";
import { ApiError, api } from "../lib/api";
import type {
	ChatData,
	ModelInfo,
	PublicConfig,
	RequestRecord,
} from "../lib/types";

export function Playground() {
	const [models, setModels] = useState<ModelInfo[]>([]);
	const [config, setConfig] = useState<PublicConfig | null>(null);
	const [bootError, setBootError] = useState<string | null>(null);

	const [model, setModel] = useState("");
	const [systemPrompt, setSystemPrompt] = useState("");
	const [message, setMessage] = useState("");
	const [temperature, setTemperature] = useState(0.4);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<ChatData | null>(null);
	const [records, setRecords] = useState<RequestRecord[]>([]);

	// Load models + public config once on mount.
	useEffect(() => {
		let active = true;
		Promise.all([api.models(), api.config()])
			.then(([m, c]) => {
				if (!active) return;
				setModels(m.data!.models);
				setConfig(c.data!);
				setModel(c.data!.defaultModel);
				setTemperature(c.data!.temperature.default);
			})
			.catch(
				() => active && setBootError("Could not load gateway configuration."),
			);
		return () => {
			active = false;
		};
	}, []);

	async function submit() {
		setLoading(true);
		setError(null);
		setData(null);
		try {
			const res = await api.chat({
				model,
				systemPrompt: systemPrompt || undefined,
				message,
				temperature,
			});
			setData(res.data);
			setRecords((prev) => [
				{
					requestId: res.requestId,
					model: res.data!.model,
					ok: true,
					durationMs: res.data!.durationMs,
					at: new Date().toISOString(),
				},
				...prev,
			]);
		} catch (err) {
			const isApi = err instanceof ApiError;
			setError(isApi ? err.message : "Something went wrong.");
			setRecords((prev) => [
				{
					requestId: isApi
						? err.requestId || crypto.randomUUID()
						: crypto.randomUUID(),
					model,
					ok: false,
					durationMs: 0,
					at: new Date().toISOString(),
					errorCode: isApi ? err.code : "network_error",
				},
				...prev,
			]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="page playground">
			<div className="playground-head">
				<h1>Playground</h1>
				<p className="lede">
					Send a prompt through the gateway and inspect the call.
				</p>
			</div>

			{bootError && (
				<p className="state state-error" role="alert">
					{bootError}
				</p>
			)}

			<div className="playground-grid">
				<ChatForm
					models={models}
					config={config}
					model={model}
					systemPrompt={systemPrompt}
					message={message}
					temperature={temperature}
					loading={loading}
					onModel={setModel}
					onSystemPrompt={setSystemPrompt}
					onMessage={setMessage}
					onTemperature={setTemperature}
					onSubmit={submit}
				/>
				<div className="playground-output">
					<ResponsePanel loading={loading} error={error} data={data} />
					<RequestStats records={records} />
				</div>
			</div>
		</div>
	);
}
